import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '@jobpilot/database';
import { logger } from '@jobpilot/shared';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jobpilot-super-secret-key-123';

/**
 * POST /api/auth/signup
 * Register a new user using email & password
 */
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email address' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const clerkUserId = `local_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const user = await prisma.user.create({
      data: {
        email,
        name: name || 'JobPilot User',
        password: hashedPassword,
        clerkUserId,
      },
    });

    logger.info(`Credentials user signed up: ${user.email}`);

    const token = jwt.sign(
      { userId: user.id, clerkUserId: user.clerkUserId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
      },
    });
  } catch (error) {
    logger.error('Error during credential signup: ' + error);
    return res.status(500).json({ error: 'Failed to create user account' });
  }
});

/**
 * POST /api/auth/login
 * Log in a user using email & password
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    logger.info(`Credentials user logged in: ${user.email}`);

    const token = jwt.sign(
      { userId: user.id, clerkUserId: user.clerkUserId, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
      },
    });
  } catch (error) {
    logger.error('Error during credential login: ' + error);
    return res.status(500).json({ error: 'Failed to log in' });
  }
});

/**
 * POST /api/auth/webhook
 * Clerk webhook receiver to sync database user accounts
 */
router.post('/webhook', async (req, res) => {
  const { data, type } = req.body;

  if (!type || !data) {
    return res.status(400).json({ error: 'Missing type or data payload' });
  }

  logger.info(`Received Clerk webhook event: ${type}`);

  try {
    if (type === 'user.created' || type === 'user.updated') {
      const clerkUserId = data.id;
      const primaryEmailObj = data.email_addresses?.find(
        (email: any) => email.id === data.primary_email_address_id
      );
      const email = primaryEmailObj?.email_address || '';
      const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'JobPilot User';

      const user = await prisma.user.upsert({
        where: { clerkUserId },
        update: {
          email,
          name,
        },
        create: {
          clerkUserId,
          email,
          name,
        },
      });

      return res.status(200).json({ success: true, userId: user.id });
    }

    if (type === 'user.deleted') {
      const clerkUserId = data.id;
      await prisma.user.deleteMany({
        where: { clerkUserId },
      });
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    }

    return res.status(200).json({ received: true, message: `Event ${type} unhandled` });
  } catch (error) {
    logger.error('Error handling Clerk Webhook: ' + error);
    return res.status(500).json({ error: 'Failed to process webhook sync' });
  }
});

/**
 * POST /api/auth/change-password
 * Change password of authenticated user
 */
router.post('/change-password', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'User not found or password login not configured' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    logger.info(`Password updated for user: ${user.email}`);
    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Error changing password: ' + error);
    return res.status(500).json({ error: 'Failed to update password' });
  }
});

export default router;
