import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import stripeService from '../services/payment/stripe.service';

export const createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { tier, successUrl, cancelUrl } = req.body;

    const session = await stripeService.createCheckoutSession(
      userId,
      tier,
      successUrl,
      cancelUrl
    );

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const result = await stripeService.cancelSubscription(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resumeSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const result = await stripeService.resumeSubscription(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const subscription = await stripeService.getSubscriptionStatus(userId);

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: any, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe signature' });
    }

    await stripeService.handleWebhook(req.body, signature);

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};