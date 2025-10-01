import express from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/checkout', authenticate, subscriptionController.createCheckoutSession);
router.post('/cancel', authenticate, subscriptionController.cancelSubscription);
router.post('/resume', authenticate, subscriptionController.resumeSubscription);
router.get('/status', authenticate, subscriptionController.getSubscriptionStatus);

// Webhook (no auth, validated by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

export default router;