import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '@jobpilot/database';
import { generateCareerRoadmap } from '@jobpilot/ai';
import { logger } from '@jobpilot/shared';

const router = Router();

/**
 * POST /api/roadmap
 * Generate step-by-step career path roadmap to transition to targetRole
 */
router.post('/', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { targetRole } = req.body;

  if (!targetRole) {
    return res.status(400).json({ error: 'Missing targetRole field' });
  }

  try {
    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const parsedContent = resume?.parsedContent
      ? (resume.parsedContent as any)
      : { skills: ['React', 'Node.js'], experience: [] };

    // Call AI to design career milestones
    const roadmapData = await generateCareerRoadmap(parsedContent, targetRole);

    // Save to DB
    const roadmap = await prisma.roadmap.create({
      data: {
        userId,
        targetRole,
        steps: roadmapData.steps,
        skillsToAcquire: roadmapData.skillsToAcquire,
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Career Roadmap Generated',
        message: `Your roadmap to transition to "${targetRole}" is ready.`,
      },
    });

    return res.status(201).json({ success: true, roadmap });
  } catch (error) {
    logger.error('Error generating career roadmap: ' + error);
    return res.status(500).json({ error: 'Failed to generate career roadmap' });
  }
});

/**
 * GET /api/roadmap
 * Fetch all roadmaps for the user
 */
router.get('/', requireAuth, async (req, res) => {
  const userId = req.user!.id;

  try {
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ roadmaps });
  } catch (error) {
    logger.error('Error fetching roadmaps: ' + error);
    return res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
});

export default router;
