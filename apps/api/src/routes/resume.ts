import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '@jobpilot/database';
import { parseResume, calculateATSAndFeedback, generateCoverLetter } from '@jobpilot/ai';
import { logger } from '@jobpilot/shared';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

/**
 * POST /api/resume/upload
 * Accepts resume upload, uploads to mock/live Cloudinary, parses with LLMs, calculates ATS score, and stores
 */
router.post('/upload', requireAuth, upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No resume file provided' });
  }

  const userId = req.user!.id;
  const fileName = req.file.originalname;

  try {
    logger.info(`Processing resume upload for user: ${userId}, filename: ${fileName}`);
    
    // Simulate file upload to Cloudinary (return mock URLs)
    const fileUrl = `https://res.cloudinary.com/jobpilot/image/upload/v12345/${Date.now()}_${fileName}`;
    const cloudinaryPublicId = `resumes/${Date.now()}_${fileName}`;

    // Extract text (for testing/mocking, convert buffer to string or extract keywords)
    const rawText = req.file.buffer.toString('utf-8') || 'Developer Experience in React, Node, SQL';

    // Parse resume using AI agent
    const parsedContent = await parseResume(rawText);

    // Calculate initial general ATS score against a default software engineer role
    const { atsScore, feedback } = await calculateATSAndFeedback(parsedContent, 'Software Engineer');

    // Save to Database
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName,
        fileUrl,
        cloudinaryPublicId,
        parsedContent: parsedContent as any,
        atsScore,
        feedback: feedback as any,
      },
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Resume Analyzed!',
        message: `Your resume "${fileName}" was successfully parsed. General ATS Score: ${atsScore}/100.`,
      },
    });

    return res.status(201).json({ success: true, resume });
  } catch (error) {
    logger.error('Error processing resume upload: ' + error);
    return res.status(500).json({ error: 'Failed to process resume upload and analysis' });
  }
});

/**
 * GET /api/resume/latest
 * Get the latest resume analysis for the authenticated user
 */
router.get('/latest', requireAuth, async (req, res) => {
  const userId = req.user!.id;

  try {
    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!resume) {
      return res.status(404).json({ error: 'No resume found' });
    }

    return res.status(200).json({ resume });
  } catch (error) {
    logger.error('Error fetching latest resume: ' + error);
    return res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

/**
 * POST /api/resume/optimize
 * Evaluate current resume against a specific target role
 */
router.post('/optimize', requireAuth, async (req, res) => {
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

    if (!resume || !resume.parsedContent) {
      return res.status(400).json({ error: 'Please upload a resume first' });
    }

    // Call AI to compute score against specific role
    const parsed = resume.parsedContent as any;
    const { atsScore, feedback } = await calculateATSAndFeedback(parsed, targetRole);

    return res.status(200).json({ atsScore, feedback });
  } catch (error) {
    logger.error('Error optimizing resume: ' + error);
    return res.status(500).json({ error: 'Failed to optimize resume' });
  }
});

/**
 * POST /api/resume/cover-letter
 * Generate target cover letter
 */
router.post('/cover-letter', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { jobDescription } = req.body;

  if (!jobDescription) {
    return res.status(400).json({ error: 'Missing jobDescription field' });
  }

  try {
    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!resume || !resume.parsedContent) {
      return res.status(400).json({ error: 'Please upload a resume first' });
    }

    const coverLetter = await generateCoverLetter(resume.parsedContent as any, jobDescription);
    return res.status(200).json({ coverLetter });
  } catch (error) {
    logger.error('Error generating cover letter: ' + error);
    return res.status(500).json({ error: 'Failed to generate cover letter' });
  }
});

export default router;
