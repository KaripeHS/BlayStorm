import Stripe from 'stripe';
import { prisma } from '../../server';
import { NotFoundError } from '../../utils/errors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

export class InvoiceService {
  async syncInvoice(stripeInvoiceId: string) {
    const stripeInvoice = await stripe.invoices.retrieve(stripeInvoiceId);

    const invoice = await prisma.invoice.upsert({
      where: { stripeInvoiceId },
      create: {
        userId: stripeInvoice.metadata?.userId || '',
        subscriptionId: stripeInvoice.subscription as string,
        stripeInvoiceId: stripeInvoice.id,
        stripeCustomerId: stripeInvoice.customer as string,
        amountDue: stripeInvoice.amount_due,
        amountPaid: stripeInvoice.amount_paid,
        currency: stripeInvoice.currency,
        status: this.mapInvoiceStatus(stripeInvoice.status),
        dueDate: stripeInvoice.due_date ? new Date(stripeInvoice.due_date * 1000) : null,
        paidAt: stripeInvoice.status_transitions.paid_at
          ? new Date(stripeInvoice.status_transitions.paid_at * 1000)
          : null,
        invoiceUrl: stripeInvoice.hosted_invoice_url,
        invoicePdf: stripeInvoice.invoice_pdf,
        description: stripeInvoice.description,
      },
      update: {
        amountPaid: stripeInvoice.amount_paid,
        status: this.mapInvoiceStatus(stripeInvoice.status),
        paidAt: stripeInvoice.status_transitions.paid_at
          ? new Date(stripeInvoice.status_transitions.paid_at * 1000)
          : null,
        invoiceUrl: stripeInvoice.hosted_invoice_url,
        invoicePdf: stripeInvoice.invoice_pdf,
      },
    });

    return invoice;
  }

  async getUserInvoices(userId: string) {
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        refunds: true,
      },
    });

    return invoices;
  }

  async getInvoice(invoiceId: string, userId: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        refunds: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    if (invoice.userId !== userId) {
      throw new NotFoundError('Invoice not found');
    }

    return invoice;
  }

  async downloadInvoice(invoiceId: string, userId: string) {
    const invoice = await this.getInvoice(invoiceId, userId);

    if (!invoice.invoicePdf) {
      throw new Error('Invoice PDF not available');
    }

    return {
      url: invoice.invoicePdf,
      filename: `invoice_${invoice.stripeInvoiceId}.pdf`,
    };
  }

  private mapInvoiceStatus(status: string | null): any {
    const statusMap: Record<string, any> = {
      draft: 'DRAFT',
      open: 'OPEN',
      paid: 'PAID',
      uncollectible: 'UNCOLLECTIBLE',
      void: 'VOID',
    };

    return statusMap[status || 'draft'] || 'DRAFT';
  }
}

export default new InvoiceService();