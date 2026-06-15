import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '@jobpilot/database';
import { logger } from '@jobpilot/shared';

const router = Router();

/**
 * POST /api/billing/checkout
 * Initiate checkout session (Mock or Stripe)
 */
router.post('/checkout', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { plan } = req.body; // 'PRO' | 'PREMIUM' | 'FREE'

  if (!plan || !['PRO', 'PREMIUM', 'FREE'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan level specified' });
  }

  try {
    const webUrl = process.env.WEB_URL || 'http://localhost:3000';
    
    // If user downgrades to FREE, handle it directly in checkout endpoint
    if (plan === 'FREE') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: 'FREE',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
      });

      await prisma.notification.create({
        data: {
          userId,
          title: 'Subscription Cancelled',
          message: 'Your subscription has been cancelled. You are now on the Free plan.',
        },
      });

      return res.status(200).json({
        success: true,
        url: `${webUrl}/dashboard/settings?plan=FREE`,
        message: 'Plan downgraded successfully.',
      });
    }

    // Return the frontend mock checkout URL
    return res.status(200).json({
      success: true,
      url: `${webUrl}/checkout?plan=${plan}`,
      message: 'Simulated checkout URL generated.',
    });
  } catch (error) {
    logger.error('Error during checkout redirection: ' + error);
    return res.status(500).json({ error: 'Failed to initiate billing transaction' });
  }
});

/**
 * POST /api/billing/confirm
 * Verify mock payment details and upgrade plan in database
 */
router.post('/confirm', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { plan, cardNumber } = req.body;

  if (!plan || !['PRO', 'PREMIUM'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan specified for payment' });
  }

  if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
    return res.status(400).json({ error: 'Invalid card details' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionPlan: plan,
        stripeCustomerId: `cus_mock_${Date.now()}`,
        stripeSubscriptionId: `sub_mock_${Date.now()}`,
      },
    });

    // Create a notification for successful subscription
    await prisma.notification.create({
      data: {
        userId,
        title: 'Subscription Upgraded!',
        message: `Thank you for subscribing to JobPilot ${plan}! All corresponding features are now unlocked.`,
      },
    });

    return res.status(200).json({
      success: true,
      profile: updatedUser,
      message: `Subscription to ${plan} confirmed successfully.`,
    });
  } catch (error) {
    logger.error('Error confirming billing upgrade: ' + error);
    return res.status(500).json({ error: 'Failed to confirm plan upgrade' });
  }
});

/**
 * GET /api/billing/status
 * Get subscription plan
 */
router.get('/status', requireAuth, async (req, res) => {
  const userId = req.user!.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        subscriptionPlan: true,
        stripeSubscriptionId: true,
      },
    });

    return res.status(200).json({ subscription: user });
  } catch (error) {
    logger.error('Error fetching subscription status: ' + error);
    return res.status(500).json({ error: 'Failed to retrieve subscription data' });
  }
});

export default router;
