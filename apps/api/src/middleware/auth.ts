import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '@jobpilot/shared';
import { prisma } from '@jobpilot/database';

const JWT_SECRET = process.env.JWT_SECRET || 'jobpilot-super-secret-key-123';

// Extend Express Request object to hold user details
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string; // Database User ID
        clerkUserId: string;
        email: string;
        role: string;
      };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const devUserId = req.headers['x-user-id'] as string; // Developer local manual testing fallback

  let userId: string | null = null;
  let clerkUserId: string | null = null;
  let email: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      // Verify custom JWT token issued by our credentials routes
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && decoded.userId) {
        userId = decoded.userId;
        clerkUserId = decoded.clerkUserId;
        email = decoded.email;
      }
    } catch (err) {
      logger.error('Failed to verify custom credentials JWT: ' + err);
      return res.status(401).json({ error: 'Unauthorized. Token verification failed.' });
    }
  } else if (devUserId) {
    // Development mode header verification
    clerkUserId = devUserId;
    email = req.headers['x-user-email'] as string || 'dev@jobpilot.ai';
  }

  if (!userId && !clerkUserId) {
    return res.status(401).json({ error: 'Unauthorized. Missing valid Bearer token or x-user-id header.' });
  }

  try {
    // Look up user by ID (prefer database userId if decoded from JWT)
    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else if (clerkUserId) {
      user = await prisma.user.findUnique({
        where: { clerkUserId },
      });
    }

    if (!user) {
      if (clerkUserId) {
        // Auto-provision user record for local developer mock headers
        user = await prisma.user.create({
          data: {
            clerkUserId,
            email: email || `${clerkUserId}@placeholder.com`,
            name: (req.headers['x-user-name'] as string) || 'JobPilot User',
          },
        });
        logger.info(`Auto-created local user record for ID: ${clerkUserId}`);
      } else {
        return res.status(401).json({ error: 'Unauthorized. User record not found.' });
      }
    }

    req.user = {
      id: user.id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error('Authentication synchronization failed: ' + error);
    return res.status(500).json({ error: 'Internal server authentication error' });
  }
}
