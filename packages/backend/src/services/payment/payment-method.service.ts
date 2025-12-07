import Stripe from 'stripe';
import { prisma } from '../../server';
import { NotFoundError, ValidationError } from '../../utils/errors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export class PaymentMethodService {
  async addPaymentMethod(userId: string, paymentMethodId: string) {
    // Get or create Stripe customer
    let subscription = await prisma.subscription.findFirst({
      where: { userId },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });

      customerId = customer.id;
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // Save to database
    const saved = await prisma.paymentMethod.create({
      data: {
        userId,
        stripePaymentMethodId: paymentMethodId,
        type: paymentMethod.type,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        expiryMonth: paymentMethod.card?.exp_month,
        expiryYear: paymentMethod.card?.exp_year,
        billingDetails: paymentMethod.billing_details as any,
        isDefault: false,
      },
    });

    return saved;
  }

  async listPaymentMethods(userId: string) {
    const methods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return methods;
  }

  async setDefaultPaymentMethod(userId: string, paymentMethodId: string) {
    const method = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!method || method.userId !== userId) {
      throw new NotFoundError('Payment method not found');
    }

    // Unset other defaults
    await prisma.paymentMethod.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set new default
    const updated = await prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: { isDefault: true },
    });

    return updated;
  }

  async removePaymentMethod(userId: string, paymentMethodId: string) {
    const method = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!method || method.userId !== userId) {
      throw new NotFoundError('Payment method not found');
    }

    // Detach from Stripe
    await stripe.paymentMethods.detach(method.stripePaymentMethodId);

    // Delete from database
    await prisma.paymentMethod.delete({
      where: { id: paymentMethodId },
    });

    return { message: 'Payment method removed successfully' };
  }
}

export default new PaymentMethodService();