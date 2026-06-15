export type Role = 'USER' | 'ADMIN';
export type SubscriptionPlan = 'FREE' | 'PRO' | 'PREMIUM';
export type ApplicationStatus = 'BOOKMARKED' | 'APPLIED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  clerkUserId: string;
  role: Role;
  subscriptionPlan: SubscriptionPlan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ParsedResumeContent {
  summary?: string;
  skills: string[];
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    highlights: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

export interface ResumeQuickFix {
  title: string;
  description: string;
  type: 'impact' | 'structure' | 'keywords' | 'style';
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  cloudinaryPublicId: string;
  parsedContent: ParsedResumeContent | null;
  atsScore: number | null;
  feedback: ResumeQuickFix[] | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  description: string;
  location: string;
  salaryRange: string | null;
  jobType: string | null;
  matchedScore: number;
  url: string | null;
  createdAt: Date | string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  resumeId: string | null;
  resume?: Resume;
  status: ApplicationStatus;
  coverLetterText: string | null;
  notes: string | null;
  appliedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface InterviewBriefQuestion {
  question: string;
  type: 'behavioral' | 'technical' | 'situational';
  context: string;
  sampleAnswer: string;
}

export interface InterviewBrief {
  id: string;
  applicationId: string;
  roleSummary: string;
  prepQuestions: InterviewBriefQuestion[];
  tips: string[];
  createdAt: Date | string;
}

export interface RoadmapStep {
  title: string;
  description: string;
  resources: string[];
  duration: string;
}

export interface Roadmap {
  id: string;
  userId: string;
  targetRole: string;
  steps: RoadmapStep[];
  skillsToAcquire: string[];
  createdAt: Date | string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  sender: 'USER' | 'COACH';
  createdAt: Date | string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date | string;
}

// API Payloads
export interface CreateUserPayload {
  email: string;
  name?: string;
  clerkUserId: string;
}

export interface UpdateUserSubscriptionPayload {
  clerkUserId: string;
  plan: SubscriptionPlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}
