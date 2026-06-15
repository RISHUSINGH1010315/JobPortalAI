import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '@jobpilot/database';
import { chatWithCoach } from '@jobpilot/ai';
import { logger } from '@jobpilot/shared';

const router = Router();

/**
 * POST /api/coach/chat
 * Send a new chat message to the AI Career Coach
 */
router.post('/chat', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Missing message body' });
  }

  try {
    // 1. Fetch previous chat history (limit to last 15 messages for context efficiency)
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 15,
    });

    // 2. Fetch latest parsed resume for coach context
    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const parsedContent = resume?.parsedContent ? (resume.parsedContent as any) : null;

    // 3. Save User Message to DB
    const userMessage = await prisma.chatMessage.create({
      data: {
        userId,
        message,
        sender: 'USER',
      },
    });

    // 4. Invoke LangGraph agent for response
    const coachResponseText = await chatWithCoach(history as any, message, parsedContent);

    // 5. Save Coach Message to DB
    const coachMessage = await prisma.chatMessage.create({
      data: {
        userId,
        message: coachResponseText,
        sender: 'COACH',
      },
    });

    return res.status(200).json({
      userMessage,
      coachMessage,
    });
  } catch (error) {
    logger.error('Error in AI Coach session: ' + error);
    return res.status(500).json({ error: 'Failed to communicate with Career Coach' });
  }
});

/**
 * GET /api/coach/history
 * Fetch the user's career coach chat history
 */
router.get('/history', requireAuth, async (req, res) => {
  const userId = req.user!.id;

  try {
    const history = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return res.status(200).json({ history });
  } catch (error) {
    logger.error('Error fetching chat history: ' + error);
    return res.status(500).json({ error: 'Failed to fetch coach chat history' });
  }
});

export default router;
