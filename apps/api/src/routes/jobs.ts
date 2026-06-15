import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '@jobpilot/database';
import { matchJobs, generateInterviewPrep } from '@jobpilot/ai';
import { logger } from '@jobpilot/shared';

const router = Router();

// In-memory static jobs that the agent can "find" during scans
const MOCK_JOBS_LIBRARY = [
  {
    title: 'Senior Frontend Engineer',
    company: 'Linear Dynamics',
    description: "We're looking for an engineer to lead our product dashboard initiative. You'll be working closely with design to build ultra-responsive, accessible interfaces using React, Next.js, and Tailwind.",
    location: 'Remote',
    salaryRange: '$160k – $220k',
    jobType: 'Full-time',
    url: 'https://linear.app/careers',
  },
  {
    title: 'Staff Software Engineer (Infra)',
    company: 'Nexus Cloud',
    description: 'Scale our global edge network to handle millions of concurrent requests. Expertise in Node.js, Go, Kubernetes, Docker, and distributed systems is required. Join an elite team of infra experts.',
    location: 'San Francisco, CA',
    salaryRange: '$190k – $250k',
    jobType: 'Full-time',
    url: 'https://nexus.cloud/careers',
  },
  {
    title: 'Product Designer (Design Systems)',
    company: 'Quantum FinTech',
    description: 'Drive visual consistency across our web and mobile applications. You will be responsible for maturing our component library and establishing cross-functional standards with React and CSS/Tailwind.',
    location: 'Hybrid',
    salaryRange: '$140k – $185k',
    jobType: 'Contract',
    url: 'https://quantum.finance/careers',
  },
  {
    title: 'Full Stack Engineer',
    company: 'Stripe',
    description: 'Build robust payment APIs and client dashboards. Experience in Ruby, TypeScript, React, PostgreSQL, and API design. Help us build the economic infrastructure of the internet.',
    location: 'Remote',
    salaryRange: '$150k – $210k',
    jobType: 'Full-time',
    url: 'https://stripe.com/careers',
  },
];

/**
 * GET /api/jobs/matched
 * Returns user matched jobs, optionally triggering a scan first if none exist
 */
router.get('/matched', requireAuth, async (req, res) => {
  const userId = req.user!.id;

  try {
    let jobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { matchedScore: 'desc' },
    });

    // If database has no scanned jobs, trigger an auto scan
    if (jobs.length === 0) {
      logger.info(`No jobs found for user: ${userId}. Triggering auto-scan.`);
      const resume = await prisma.resume.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      const parsedResume = resume?.parsedContent 
        ? (resume.parsedContent as any)
        : { skills: ['React', 'TypeScript', 'Node.js'] };

      const scores = await matchJobs(parsedResume, MOCK_JOBS_LIBRARY);

      const createdJobs = [];
      for (let i = 0; i < MOCK_JOBS_LIBRARY.length; i++) {
        const item = MOCK_JOBS_LIBRARY[i];
        const job = await prisma.job.create({
          data: {
            userId,
            title: item.title,
            company: item.company,
            description: item.description,
            location: item.location,
            salaryRange: item.salaryRange,
            jobType: item.jobType,
            url: item.url,
            matchedScore: scores[i],
          },
        });
        createdJobs.push(job);
      }
      jobs = createdJobs;
    }

    return res.status(200).json({ jobs });
  } catch (error) {
    logger.error('Error fetching matched jobs: ' + error);
    return res.status(500).json({ error: 'Failed to fetch matched jobs' });
  }
});

/**
 * POST /api/jobs/scan
 * Force runs the AI match scanner
 */
router.post('/scan', requireAuth, async (req, res) => {
  const userId = req.user!.id;

  try {
    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const parsedResume = resume?.parsedContent 
      ? (resume.parsedContent as any)
      : { skills: ['React', 'TypeScript', 'Node.js'] };

    const scores = await matchJobs(parsedResume, MOCK_JOBS_LIBRARY);

    // Delete existing matches to keep dashboard clean
    await prisma.job.deleteMany({
      where: { userId },
    });

    const jobs = [];
    for (let i = 0; i < MOCK_JOBS_LIBRARY.length; i++) {
      const item = MOCK_JOBS_LIBRARY[i];
      const job = await prisma.job.create({
        data: {
          userId,
          title: item.title,
          company: item.company,
          description: item.description,
          location: item.location,
          salaryRange: item.salaryRange,
          jobType: item.jobType,
          url: item.url,
          matchedScore: scores[i],
        },
      });
      jobs.push(job);
    }

    // Notify user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Job Scan Complete',
        message: `Found ${jobs.length} new opportunities matching your skills.`,
      },
    });

    return res.status(200).json({ success: true, jobs });
  } catch (error) {
    logger.error('Error triggering job scan: ' + error);
    return res.status(500).json({ error: 'Failed to complete job scan' });
  }
});

/**
 * GET /api/jobs/tracker
 * Fetch user's Application Board (Kanban pipeline)
 */
router.get('/tracker', requireAuth, async (req, res) => {
  const userId = req.user!.id;

  try {
    const applications = await prisma.application.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { updatedAt: 'desc' },
    });

    return res.status(200).json({ applications });
  } catch (error) {
    logger.error('Error fetching tracker board: ' + error);
    return res.status(500).json({ error: 'Failed to fetch application board' });
  }
});

/**
 * POST /api/jobs/tracker
 * Track an application (moving from matched opportunities to Bookmark stage)
 */
router.post('/tracker', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { jobId, status } = req.body;

  if (!jobId) {
    return res.status(400).json({ error: 'Missing jobId field' });
  }

  try {
    // Check if already tracking
    const existing = await prisma.application.findFirst({
      where: { userId, jobId },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already tracking this job' });
    }

    // Find latest resume to associate (optional)
    const latestResume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        status: status || 'BOOKMARKED',
        resumeId: latestResume?.id || null,
        appliedAt: status === 'APPLIED' ? new Date() : null,
      },
      include: { job: true },
    });

    return res.status(201).json({ success: true, application });
  } catch (error) {
    logger.error('Error adding application to tracker: ' + error);
    return res.status(500).json({ error: 'Failed to track application' });
  }
});

/**
 * PUT /api/jobs/tracker/:id
 * Update Application status (e.g. stage transition in Kanban board)
 */
router.put('/tracker/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  try {
    const app = await prisma.application.findUnique({
      where: { id },
    });

    if (!app || app.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const application = await prisma.application.update({
      where: { id },
      data: {
        status: status || app.status,
        notes: notes !== undefined ? notes : app.notes,
        appliedAt: status === 'APPLIED' ? new Date() : app.appliedAt,
      },
      include: { job: true },
    });

    return res.status(200).json({ success: true, application });
  } catch (error) {
    logger.error('Error updating application tracker: ' + error);
    return res.status(500).json({ error: 'Failed to update application' });
  }
});

/**
 * POST /api/jobs/interview/prep
 * Trigger AI Agent to generate interview prep brief for an application
 */
router.post('/interview/prep', requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { applicationId } = req.body;

  if (!applicationId) {
    return res.status(400).json({ error: 'Missing applicationId' });
  }

  try {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true, resume: true },
    });

    if (!app || app.userId !== userId) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if brief already exists
    const existingBrief = await prisma.interviewBrief.findUnique({
      where: { applicationId },
    });

    if (existingBrief) {
      return res.status(200).json({ brief: existingBrief });
    }

    const resumeContent = app.resume?.parsedContent
      ? (app.resume.parsedContent as any)
      : { skills: ['React', 'TypeScript', 'Node.js'], experience: [] };

    // Generate Interview Prep Guide
    const prepData = await generateInterviewPrep(
      resumeContent,
      app.job.title,
      app.job.description
    );

    const brief = await prisma.interviewBrief.create({
      data: {
        applicationId,
        roleSummary: prepData.roleSummary,
        prepQuestions: prepData.prepQuestions,
        tips: prepData.tips,
      },
    });

    return res.status(201).json({ success: true, brief });
  } catch (error) {
    logger.error('Error generating interview brief: ' + error);
    return res.status(500).json({ error: 'Failed to generate interview brief' });
  }
});

/**
 * GET /api/jobs/interview/prep/:applicationId
 * Retrieve generated interview prep brief
 */
router.get('/interview/prep/:applicationId', requireAuth, async (req, res) => {
  const { applicationId } = req.params;

  try {
    const brief = await prisma.interviewBrief.findUnique({
      where: { applicationId },
    });

    if (!brief) {
      return res.status(404).json({ error: 'Prep brief not generated yet' });
    }

    return res.status(200).json({ brief });
  } catch (error) {
    logger.error('Error fetching interview brief: ' + error);
    return res.status(500).json({ error: 'Failed to fetch interview brief' });
  }
});

export default router;
