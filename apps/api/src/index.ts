import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from '@jobpilot/shared';
import { prisma } from '@jobpilot/database';

// Load Env variables
dotenv.config();

// Imports Routers
import authRouter from './routes/auth.js';
import resumeRouter from './routes/resume.js';
import jobsRouter from './routes/jobs.js';
import roadmapRouter from './routes/roadmap.js';
import coachRouter from './routes/coach.js';
import billingRouter from './routes/billing.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Configure CORS to allow frontend connections
app.use(cors({
  origin: '*', // For local dev compatibility
  credentials: true,
}));

app.use(express.json());

// Request logger middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health Check
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Register routers
app.use('/api/auth', authRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/roadmap', roadmapRouter);
app.use('/api/coach', coachRouter);
app.use('/api/billing', billingRouter);

// Notification routes registered directly in entry point for efficiency
app.get('/api/notifications', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ notifications });
  } catch (error) {
    logger.error('Error fetching notifications: ' + error);
    return res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

app.post('/api/notifications/:id/read', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return res.status(200).json({ success: true, notification });
  } catch (error) {
    logger.error('Error marking notification as read: ' + error);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Profile route
app.get('/api/profile', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resumes: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    return res.status(200).json({ profile: user });
  } catch (error) {
    logger.error('Error fetching user profile: ' + error);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
});

app.put('/api/profile', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const {
    name,
    email,
    phone,
    location,
    summary,
    skills,
    githubUrl,
    linkedinUrl,
    portfolioUrl,
    headline,
    twitterUrl,
    agentActive,
    agentTargetRoles,
    agentTargetLocations,
    agentMinSalary,
    agentJobTypes,
    agentMatchThreshold,
    agentScanFrequency,
    agentAutoApply,
    notifyOnMatches,
    notifyOnApplications,
    notifyOnInterviews,
  } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
        phone: phone || null,
        location: location || null,
        summary: summary || null,
        skills: skills || [],
        githubUrl: githubUrl || null,
        linkedinUrl: linkedinUrl || null,
        portfolioUrl: portfolioUrl || null,
        headline: headline || null,
        twitterUrl: twitterUrl || null,
        agentActive: agentActive !== undefined ? Boolean(agentActive) : undefined,
        agentTargetRoles: agentTargetRoles || [],
        agentTargetLocations: agentTargetLocations || [],
        agentMinSalary: agentMinSalary || null,
        agentJobTypes: agentJobTypes || [],
        agentMatchThreshold: agentMatchThreshold !== undefined ? Number(agentMatchThreshold) : undefined,
        agentScanFrequency: agentScanFrequency || undefined,
        agentAutoApply: agentAutoApply !== undefined ? Boolean(agentAutoApply) : undefined,
        notifyOnMatches: notifyOnMatches !== undefined ? Boolean(notifyOnMatches) : undefined,
        notifyOnApplications: notifyOnApplications !== undefined ? Boolean(notifyOnApplications) : undefined,
        notifyOnInterviews: notifyOnInterviews !== undefined ? Boolean(notifyOnInterviews) : undefined,
      },
    });
    return res.status(200).json({ success: true, profile: updatedUser });
  } catch (error) {
    logger.error('Error updating user profile: ' + error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled Application Error: ' + err.stack || err.message || err);
  res.status(500).json({ error: 'An unexpected error occurred on the server.' });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`JobPilot AI backend API is running on port ${PORT}`);
});
