import { hasAIConfig, openai, gemini } from './config.js';
import { ParsedResumeContent, ResumeQuickFix, Job, InterviewBrief, Roadmap, ChatMessage } from '@jobpilot/types';

/**
 * Clean and parse resume text into structured JSON.
 */
export async function parseResume(resumeText: string): Promise<ParsedResumeContent> {
  if (hasAIConfig) {
    try {
      if (gemini) {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Parse the following resume text into a JSON object matching this schema:
        {
          "summary": "Short professional summary",
          "skills": ["skill1", "skill2"],
          "experience": [{"role": "title", "company": "company", "duration": "period", "highlights": ["achievement1"]}],
          "education": [{"degree": "degree", "institution": "school", "year": "grad year"}]
        }
        Resume Text: ${resumeText}`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as ParsedResumeContent;
        }
      } else if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are an expert resume parser. Output JSON matching the schema: { summary: string, skills: string[], experience: { role, company, duration, highlights[] }[], education: { degree, institution, year }[] }',
            },
            {
              role: 'user',
              content: resumeText,
            },
          ],
        });
        const content = response.choices[0].message.content;
        if (content) {
          return JSON.parse(content) as ParsedResumeContent;
        }
      }
    } catch (error) {
      console.error('Error during AI resume parsing, falling back to mock:', error);
    }
  }

  // Fallback realistic parsing mock
  return mockParseResume(resumeText);
}

/**
 * Analyze parsed resume against a target role to generate ATS Score & line-by-line feedback.
 */
export async function calculateATSAndFeedback(
  resumeContent: ParsedResumeContent,
  targetRole: string
): Promise<{ atsScore: number; feedback: ResumeQuickFix[] }> {
  if (hasAIConfig) {
    try {
      const prompt = `Evaluate this resume parsed JSON against the target role: "${targetRole}".
      Resume JSON: ${JSON.stringify(resumeContent)}
      Output a JSON object with:
      - atsScore: number (0-100)
      - feedback: array of { title: string, description: string, type: 'impact' | 'structure' | 'keywords' | 'style' }
      Keep suggestions extremely concrete and relevant to the target role.`;

      if (gemini) {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as { atsScore: number; feedback: ResumeQuickFix[] };
        }
      } else if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        });
        const content = response.choices[0].message.content;
        if (content) {
          return JSON.parse(content) as { atsScore: number; feedback: ResumeQuickFix[] };
        }
      }
    } catch (error) {
      console.error('Error in AI ATS Score calculation, falling back to mock:', error);
    }
  }

  // Fallback mock
  return mockATSAndFeedback(resumeContent, targetRole);
}

/**
 * Score jobs against resume content.
 */
export async function matchJobs(
  resumeContent: ParsedResumeContent,
  jobs: { title: string; company: string; description: string }[]
): Promise<number[]> {
  // Return matching scores for each job (0-100)
  return jobs.map((job) => {
    const jobText = `${job.title} ${job.description}`.toLowerCase();
    let matches = 0;
    const skills = resumeContent.skills || [];
    skills.forEach((skill) => {
      if (jobText.includes(skill.toLowerCase())) {
        matches++;
      }
    });

    const score = skills.length > 0 ? Math.round((matches / skills.length) * 100) : 50;
    // Cap score between 40 and 99 for realistic feel
    return Math.max(40, Math.min(99, score));
  });
}

/**
 * Generate highly targeted Cover Letter.
 */
export async function generateCoverLetter(
  resumeContent: ParsedResumeContent,
  jobDescription: string
): Promise<string> {
  if (hasAIConfig) {
    try {
      const prompt = `Write a professional, compelling cover letter for a job description.
      Resume Content: ${JSON.stringify(resumeContent)}
      Job Description: ${jobDescription}
      Format the output as clean markdown paragraphs. Keep it engaging, concise, and focused on specific achievements in the resume that match the job.`;

      if (gemini) {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } else if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [{ role: 'user', content: prompt }],
        });
        return response.choices[0].message.content || '';
      }
    } catch (error) {
      console.error('Error generating cover letter via AI:', error);
    }
  }

  return mockCoverLetter(resumeContent, jobDescription);
}

/**
 * Generate Career Roadmap steps.
 */
export async function generateCareerRoadmap(
  resumeContent: ParsedResumeContent,
  targetRole: string
): Promise<{ steps: any[]; skillsToAcquire: string[] }> {
  if (hasAIConfig) {
    try {
      const prompt = `Create a step-by-step career transition and upskilling roadmap for a user transitioning to: "${targetRole}".
      Current Skills and Profile: ${JSON.stringify(resumeContent)}
      Output a JSON object with:
      - steps: array of { title: string, description: string, resources: string[], duration: string }
      - skillsToAcquire: array of strings (skills missing from resume that are required for targetRole)`;

      if (gemini) {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } else if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        });
        const content = response.choices[0].message.content;
        if (content) {
          return JSON.parse(content);
        }
      }
    } catch (error) {
      console.error('Error generating career roadmap via AI:', error);
    }
  }

  return mockCareerRoadmap(resumeContent, targetRole);
}

/**
 * Generate Interview Prep questions & tips.
 */
export async function generateInterviewPrep(
  resumeContent: ParsedResumeContent,
  jobTitle: string,
  jobDescription: string
): Promise<{ roleSummary: string; prepQuestions: any[]; tips: string[] }> {
  if (hasAIConfig) {
    try {
      const prompt = `Prepare a full interview prep guide for: "${jobTitle}" based on the job description and user's profile.
      Resume Content: ${JSON.stringify(resumeContent)}
      Job Description: ${jobDescription}
      Output a JSON object with:
      - roleSummary: string (concise explanation of what the interviewer is looking for)
      - prepQuestions: array of { question: string, type: 'behavioral' | 'technical' | 'situational', context: string, sampleAnswer: string }
      - tips: array of strings (general interview strategy tips)`;

      if (gemini) {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } else if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        });
        const content = response.choices[0].message.content;
        if (content) {
          return JSON.parse(content);
        }
      }
    } catch (error) {
      console.error('Error generating interview prep guide:', error);
    }
  }

  return mockInterviewPrep(resumeContent, jobTitle, jobDescription);
}

/**
 * Career Coach Chat.
 */
export async function chatWithCoach(
  chatHistory: ChatMessage[],
  newMessage: string,
  resumeContent: ParsedResumeContent | null
): Promise<string> {
  if (hasAIConfig) {
    try {
      const messages = chatHistory.map((msg) => ({
        role: msg.sender === 'USER' ? ('user' as const) : ('assistant' as const),
        content: msg.message,
      }));

      const contextPrompt = resumeContent
        ? `You are JobPilot AI, an autonomous career coach. You have access to the user's resume content: ${JSON.stringify(resumeContent)}. Help them navigate their career goals, practice interviews, negotiate salaries, and improve their skills.`
        : `You are JobPilot AI, an autonomous career coach. Help the user clarify their career goals, build a resume, find jobs, and prepare for interviews.`;

      if (gemini) {
        const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const chat = model.startChat({
          history: [
            {
              role: 'user',
              parts: [{ text: `${contextPrompt}\n\nPlease acknowledge your instructions.` }],
            },
            {
              role: 'model',
              parts: [{ text: 'Understood. I will act as the user\'s career coach using the provided details.' }],
            },
            ...messages.map((m) => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }],
            })),
          ],
        });
        const result = await chat.sendMessage(newMessage);
        return result.response.text();
      } else if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4-turbo',
          messages: [
            { role: 'system', content: contextPrompt },
            ...messages,
            { role: 'user', content: newMessage },
          ],
        });
        return response.choices[0].message.content || '';
      }
    } catch (error) {
      console.error('Error in AI Coach chat response:', error);
    }
  }

  return mockCoachChatResponse(newMessage, resumeContent);
}

// ----------------------------------------------------
// Mock fallbacks for realistic application rendering
// ----------------------------------------------------

function mockParseResume(text: string): ParsedResumeContent {
  const words = text.toLowerCase();
  const skillsList = [
    'react', 'next.js', 'typescript', 'javascript', 'node.js', 'express',
    'python', 'django', 'fastapi', 'postgresql', 'mongodb', 'docker',
    'kubernetes', 'aws', 'gcp', 'cicd', 'tailwind', 'graphql'
  ];
  
  const foundSkills = skillsList.filter(skill => words.includes(skill));
  if (foundSkills.length === 0) {
    foundSkills.push('JavaScript', 'HTML5', 'CSS3', 'Project Management');
  }

  // Format skills nicely
  const formattedSkills = foundSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1));

  return {
    summary: 'A highly motivated Software Engineer with experience building responsive web applications, robust backend services, and cloud integrations. Passionate about design systems, performance optimization, and artificial intelligence.',
    skills: formattedSkills,
    experience: [
      {
        role: 'Senior Software Engineer',
        company: 'TechCorp Solutions',
        duration: '2022 - Present',
        highlights: [
          'Led migration of monolithic application to a microservices architecture, reducing latency by 35%.',
          'Spearheaded the development of a internal UI library using React and Tailwind, improving design consistency across 4 separate products.',
          'Mentored 5 junior developers, conducting weekly code reviews and architecture workshops.'
        ]
      },
      {
        role: 'Full Stack Developer',
        company: 'Innovate Labs',
        duration: '2020 - 2022',
        highlights: [
          'Built and maintained Express.js API servers connected to PostgreSQL databases, processing over 10k daily active users.',
          'Implemented OAuth2 security standards and integrated multi-factor authentication.',
          'Collaborated with product designers to design and implement interactive data visualization panels.'
        ]
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'State University',
        year: '2020'
      }
    ]
  };
}

function mockATSAndFeedback(resumeContent: ParsedResumeContent, targetRole: string) {
  // Simple deterministic scoring
  let score = 75;
  const target = targetRole.toLowerCase();
  
  if (target.includes('senior') || target.includes('lead') || target.includes('staff')) {
    if (resumeContent.experience.length < 2) score -= 15;
  }
  
  const feedback: ResumeQuickFix[] = [
    {
      title: 'Quantify Achievements',
      description: 'Your highlights at Innovate Labs lack metrics. Try adding quantitative values, e.g. "reduced server response times by 20%".',
      type: 'impact'
    },
    {
      title: 'Incorporate Keywords',
      description: `For a "${targetRole}" role, make sure to explicitly detail your expertise with modern tools like System Design and CI/CD pipelines.`,
      type: 'keywords'
    },
    {
      title: 'Layout Structure',
      description: 'Keep your contact information, technical skills, and work history in a clean single-column format to maximize ATS parsing efficiency.',
      type: 'structure'
    }
  ];

  return {
    atsScore: Math.min(100, Math.max(50, score)),
    feedback
  };
}

function mockCoverLetter(resumeContent: ParsedResumeContent, jobDescription: string): string {
  const companyMatch = jobDescription.match(/at\s+([A-Za-z0-9\s]+)/i);
  const company = companyMatch ? companyMatch[1].trim() : 'your company';
  const skillsSnippet = resumeContent.skills.slice(0, 4).join(', ');

  return `Dear Hiring Manager,

I am writing to express my strong interest in the opportunity to join ${company} as a Software Engineer. With a solid foundation in software development and a proven track record of delivering user-focused solutions at TechCorp Solutions, I am confident in my ability to make an immediate impact on your engineering team.

In my previous roles, I have focused heavily on building scalable applications and streamlining workflows. Specifically, my experience utilizing ${skillsSnippet} aligns perfectly with the technical requirements listed in your job posting. At TechCorp, I led the migration of a monolithic application to a microservices architecture, which successfully reduced API response latency by 35% and improved team velocity. I thrive in collaborative environments where performance, accessibility, and clean design are valued.

I am eager to learn more about the team's goals and discuss how my skills in front-end design systems and backend service integration can support ${company}'s growth. Thank you for your time and consideration.

Sincerely,
JobPilot AI Candidate`;
}

function mockCareerRoadmap(resumeContent: ParsedResumeContent, targetRole: string) {
  const steps = [
    {
      title: 'Master Advanced System Design',
      description: 'Learn the architectural concepts required for scaling applications to millions of users, including caching layers, load balancers, rate limiting, and sharding.',
      resources: ['System Design Primer (GitHub)', 'Designing Data-Intensive Applications (Book)'],
      duration: '4 weeks'
    },
    {
      title: 'Acquire Infrastructure and Cloud Competency',
      description: 'Gain hands-on familiarity with container orchestration tools and cloud provisioning services that are key for senior roles.',
      resources: ['Kubernetes Bootcamp', 'AWS Certified Solutions Architect Course'],
      duration: '6 weeks'
    },
    {
      title: 'Lead Collaborative Projects',
      description: 'Take ownership of architectural decisions in open-source projects or current work, and focus on mentorship of other peers.',
      resources: ['Leading Technical Teams (Reforge)', 'Open Source contribution guides'],
      duration: 'Ongoing'
    }
  ];

  const target = targetRole.toLowerCase();
  const skillsToAcquire = ['System Design', 'Kubernetes', 'CI/CD Pipelines', 'Cloud Architecture (AWS/GCP)'];
  
  if (target.includes('frontend')) {
    skillsToAcquire.unshift('Web Vitals Optimization', 'TailwindCSS / Design Primitives');
  }

  return {
    steps,
    skillsToAcquire
  };
}

function mockInterviewPrep(resumeContent: ParsedResumeContent, jobTitle: string, jobDescription: string) {
  return {
    roleSummary: `The role of ${jobTitle} requires a balance between strong code quality, microservices architecture experience, and cross-functional collaboration. The interviewing team will focus on your system design reasoning and ability to resolve technical trade-offs.`,
    prepQuestions: [
      {
        question: 'Can you describe a challenging technical problem you solved, and how you decided on the architecture?',
        type: 'technical' as const,
        context: 'Be prepared to draw a network topology map and explain why you chose PostgreSQL or Redis, highlighting database normalization or caching decisions.',
        sampleAnswer: 'In my last role, we experienced write bottlenecks. I resolved this by splitting the monolithic database into read/write replicas and implementing Redis caching. This reduced server load by 40% and eliminated locking issues.'
      },
      {
        question: 'How do you handle disagreements on technical direction within a team?',
        type: 'behavioral' as const,
        context: 'Highlight your collaborative communication skills and how you use data or proofs-of-concept to build team consensus.',
        sampleAnswer: 'I advocate for creating quick proofs-of-concept for both options and comparing metrics like bundle sizes or response latency, ensuring technical decisions are driven by objective data rather than opinion.'
      }
    ],
    tips: [
      'Focus your answers using the STAR method (Situation, Task, Action, Result).',
      'Explain your design choices out loud; interviewers value your logical process over getting the exact solution instantly.',
      'Prepare questions to ask the interviewer about their engineering culture, release cycles, and technical debt management.'
    ]
  };
}

function mockCoachChatResponse(message: string, resumeContent: ParsedResumeContent | null): string {
  const msg = message.toLowerCase();
  const skillsSnippet = resumeContent ? resumeContent.skills.slice(0, 3).join(', ') : 'modern tech stacks';

  if (msg.includes('resume') || msg.includes('cv')) {
    return `To optimize your resume for applicant tracking systems, I suggest keeping the layout single-column. Since your skills include **${skillsSnippet}**, we should highlight achievements using the formula: **"Accomplished X, measured by Y, by doing Z."**
    
Would you like me to rewrite a specific section of your work history?`;
  }

  if (msg.includes('interview') || msg.includes('prep') || msg.includes('question')) {
    return `Interview preparation is all about structure. For a software engineering position, they will test you on:
1. **System Design**: Scaling, API designs, databases.
2. **Coding**: Algorithms and clean code structure.
3. **Behavioral**: Team collaboration and ownership.

Let's do a mock interview. I will act as the interviewer. Tell me, **what is a complex technical project you worked on recently?**`;
  }

  if (msg.includes('salary') || msg.includes('negotiat') || msg.includes('offer')) {
    return `Negotiating a job offer is critical! Here is my top advice:
1. **Never give the first number** if possible. Let the recruiter make the initial offer.
2. **Anchor your requirements** on market research and the value you bring.
3. **Consider the total compensation** including equity, sign-on bonuses, and remote flexibility.

What stage of the negotiation are you currently in? I can help you draft a response email.`;
  }

  return `Hello! I am your JobPilot Career Coach. I can help you with:
- Reviewing and tailoring your resume
- Preparing for interviews (we can do a mock run!)
- Constructing a personalized career transition plan
- Drafting salary negotiation messages

What would you like to work on today?`;
}
