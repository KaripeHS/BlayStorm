// @ts-nocheck
import Stripe from 'stripe';
import { prisma } from '../../server';
import { NotFoundError } from '../../utils/errors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export class StripeService {
  async createCheckoutSession(userId: string, tier: string, successUrl: string, cancelUrl: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get or create Stripe customer
    let customerId = await this.getOrCreateCustomer(userId, user.email);

    // Get price ID based on tier
    const priceId = this.getPriceId(tier);

    if (!priceId) {
      throw new Error(`Invalid subscription tier: ${tier}`);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          userId,
          tier,
        },
      },
      metadata: {
        userId,
        tier,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  async handleWebhook(payload: string | Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  private async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier;

    if (!userId || !tier) {
      console.error('Missing metadata in checkout session');
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    // Create or update subscription in database
    await prisma.subscription.upsert({
      where: {
        userId_tier: {
          userId,
          tier: tier as any,
        },
      },
      create: {
        userId,
        tier: tier as any,
        status: 'ACTIVE',
        stripeCustomerId: session.customer as string,
        stripeSubId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      update: {
        status: 'ACTIVE',
        stripeCustomerId: session.customer as string,
        stripeSubId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;

    if (!userId) {
      console.error('Missing userId in subscription metadata');
      return;
    }

    await prisma.subscription.updateMany({
      where: {
        stripeSubId: subscription.id,
      },
      data: {
        status: this.mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    await prisma.subscription.updateMany({
      where: {
        stripeSubId: subscription.id,
      },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    // Payment succeeded - subscription remains active
    console.log(`Invoice ${invoice.id} payment succeeded`);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    // Payment failed
    await prisma.subscription.updateMany({
      where: {
        stripeSubId: invoice.subscription as string,
      },
      data: {
        status: 'PAST_DUE',
      },
    });
  }

  async cancelSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (!subscription || !subscription.stripeSubId) {
      throw new NotFoundError('Active subscription not found');
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });

    return { message: 'Subscription will be canceled at the end of the billing period' };
  }

  async resumeSubscription(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        cancelAtPeriodEnd: true,
      },
    });

    if (!subscription || !subscription.stripeSubId) {
      throw new NotFoundError('Subscription not found');
    }

    await stripe.subscriptions.update(subscription.stripeSubId, {
      cancel_at_period_end: false,
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
      },
    });

    return { message: 'Subscription resumed' };
  }

  async getSubscriptionStatus(userId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return subscription;
  }

  private async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    // Check if customer exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId },
      select: { stripeCustomerId: true },
    });

    if (existingSubscription?.stripeCustomerId) {
      return existingSubscription.stripeCustomerId;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    return customer.id;
  }

  private getPriceId(tier: string): string | null {
    const priceIds: Record<string, string> = {
      PREMIUM: process.env.STRIPE_PRICE_ID_PREMIUM!,
      FAMILY: process.env.STRIPE_PRICE_ID_FAMILY!,
      SCHOOL: process.env.STRIPE_PRICE_ID_SCHOOL!,
    };

    return priceIds[tier] || null;
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): any {
    const statusMap: Record<string, any> = {
      active: 'ACTIVE',
      trialing: 'TRIALING',
      past_due: 'PAST_DUE',
      canceled: 'CANCELED',
      unpaid: 'PAUSED',
      incomplete: 'INCOMPLETE',
    };

    return statusMap[status] || 'CANCELED';
  }
}

export default new StripeService();