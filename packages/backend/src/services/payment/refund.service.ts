import Stripe from 'stripe';
import { prisma } from '../../server';
import { NotFoundError, ValidationError } from '../../utils/errors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export class RefundService {
  async requestRefund(userId: string, invoiceId: string, reason: string, amount?: number) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    if (invoice.userId !== userId) {
      throw new NotFoundError('Invoice not found');
    }

    if (invoice.status !== 'PAID') {
      throw new ValidationError('Can only refund paid invoices');
    }

    // Check if already fully refunded
    const existingRefunds = await prisma.refund.findMany({
      where: {
        invoiceId,
        status: 'SUCCEEDED',
      },
    });

    const totalRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);

    if (totalRefunded >= invoice.amountPaid) {
      throw new ValidationError('Invoice has already been fully refunded');
    }

    // Create Stripe refund
    const refundAmount = amount || (invoice.amountPaid - totalRefunded);

    if (refundAmount > (invoice.amountPaid - totalRefunded)) {
      throw new ValidationError('Refund amount exceeds available amount');
    }

    const stripeRefund = await stripe.refunds.create({
      charge: invoice.stripeInvoiceId,
      amount: refundAmount,
      reason: this.mapRefundReason(reason),
      metadata: {
        userId,
        invoiceId,
      },
    });

    // Save refund to database
    const refund = await prisma.refund.create({
      data: {
        invoiceId,
        userId,
        stripeRefundId: stripeRefund.id,
        amount: refundAmount,
        currency: stripeRefund.currency,
        reason: reason as any,
        status: this.mapRefundStatus(stripeRefund.status),
        processedAt: stripeRefund.status === 'succeeded' ? new Date() : null,
      },
    });

    return refund;
  }

  async getRefund(refundId: string, userId: string) {
    const refund = await prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        invoice: true,
      },
    });

    if (!refund) {
      throw new NotFoundError('Refund not found');
    }

    if (refund.userId !== userId) {
      throw new NotFoundError('Refund not found');
    }

    return refund;
  }

  async getUserRefunds(userId: string) {
    const refunds = await prisma.refund.findMany({
      where: { userId },
      include: {
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return refunds;
  }

  async syncRefund(stripeRefundId: string) {
    const stripeRefund = await stripe.refunds.retrieve(stripeRefundId);

    const refund = await prisma.refund.update({
      where: { stripeRefundId },
      data: {
        status: this.mapRefundStatus(stripeRefund.status),
        processedAt: stripeRefund.status === 'succeeded' ? new Date() : null,
      },
    });

    return refund;
  }

  async cancelRefund(refundId: string, userId: string) {
    const refund = await this.getRefund(refundId, userId);

    if (refund.status !== 'PENDING') {
      throw new ValidationError('Can only cancel pending refunds');
    }

    // Cancel in Stripe
    await stripe.refunds.cancel(refund.stripeRefundId);

    // Update database
    const updated = await prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'CANCELED',
      },
    });

    return updated;
  }

  private mapRefundReason(reason: string): any {
    const reasonMap: Record<string, any> = {
      DUPLICATE: 'duplicate',
      FRAUDULENT: 'fraudulent',
      REQUESTED_BY_CUSTOMER: 'requested_by_customer',
    };

    return reasonMap[reason] || 'requested_by_customer';
  }

  private mapRefundStatus(status: string | null): any {
    const statusMap: Record<string, any> = {
      pending: 'PENDING',
      succeeded: 'SUCCEEDED',
      failed: 'FAILED',
      canceled: 'CANCELED',
    };

    return statusMap[status || 'pending'] || 'PENDING';
  }
}

export default new RefundService();