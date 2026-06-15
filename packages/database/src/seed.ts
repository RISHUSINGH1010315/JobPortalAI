import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

const roles = [
  "Senior Frontend Engineer",
  "Staff Software Engineer (Infra)",
  "Product Designer (Design Systems)",
  "Full Stack Developer (React/Node)",
  "Backend Engineer (Go)",
  "DevOps Cloud Architect",
  "Python AI Researcher",
  "Data Scientist (Machine Learning)",
  "Quality Assurance Engineer",
  "Principal Security Specialist",
  "Engineering Manager",
  "VP of Engineering",
  "Mobile Engineer (React Native)",
  "Android Specialist (Kotlin)",
  "iOS Swift Developer",
  "Technical Program Manager",
  "UX/UI Researcher",
  "Cloud Native Developer (Rust)",
  "Solutions Architect (AWS)",
  "Site Reliability Engineer (SRE)",
  "Lead Database Administrator",
  "Product Manager (Core Platform)",
  "Growth Product Manager",
  "Frontend Engineer (Next.js)",
  "Backend Developer (Java/Spring)",
  "Security Operations Center Analyst",
  "Blockchain Smart Contract Auditor",
  "Embedded Systems Engineer",
  "Machine Learning Operations (MLOps) Engineer",
  "Director of Product Management",
  "Junior Developer (Support/Web)",
  "Scada Systems Engineer",
  "API Platform Engineer",
  "Salesforce Solutions Consultant",
  "ERP Functional Lead",
  "Technical Writer (Developer Docs)",
  "Customer Success Engineer",
  "Developer Advocate",
  "BI Developer (Tableau/SQL)",
  "Game Engine Developer (C++)"
];

const companies = [
  "Linear Dynamics",
  "Nexus Cloud",
  "Quantum FinTech",
  "Stripe",
  "Slack Technologies",
  "HashiCorp",
  "Vercel",
  "Datadog",
  "Cloudflare",
  "Retool",
  "Snowflake",
  "Atlassian",
  "Figma",
  "Notion",
  "Canva",
  "OpenAI",
  "Anthropic",
  "Hugging Face",
  "Scale AI",
  "Pinecone",
  "Supabase",
  "PlanetScale",
  "Cockroach Labs",
  "Confluent",
  "Elastic",
  "MongoDB Inc.",
  "Prisma",
  "Sentry",
  "Postman",
  "Gitlab",
  "GitHub",
  "Docker",
  "Airbnb",
  "Uber",
  "Lyft",
  "Pinterest",
  "Spotify",
  "Netflix",
  "Coinbase",
  "Robinhood"
];

const locations = ["Remote", "San Francisco, CA", "New York, NY", "Austin, TX", "London, UK", "Berlin, Germany", "Hybrid", "Seattle, WA"];
const jobTypes = ["Full-time", "Contract", "Part-time", "Internship"];
const salaries = ["$120k – $150k", "$140k – $180k", "$160k – $220k", "$190k – $250k", "$90k – $120k"];

async function main() {
  console.log('Starting database seeding...');

  // Get all users in the database
  let users = await prisma.user.findMany();
  
  if (users.length === 0) {
    console.log('No users found. Creating a default seed user...');
    const defaultUser = await prisma.user.create({
      data: {
        email: 'seed.user@jobpilot.ai',
        name: 'Seed User',
        clerkUserId: 'local_seed_user_123',
      }
    });
    users = [defaultUser];
  }

  console.log(`Found ${users.length} user(s) to attach jobs to.`);

  for (const user of users) {
    console.log(`Seeding jobs for user: ${user.email} (${user.id})`);
    
    // Clear existing jobs for this user to avoid duplicates
    const deleteCount = await prisma.job.deleteMany({
      where: { userId: user.id }
    });
    console.log(`Cleared ${deleteCount.count} existing jobs for ${user.email}`);

    // Create 40 jobs
    const jobsCreated = [];
    for (let i = 0; i < 40; i++) {
      const role = roles[i];
      const company = companies[i];
      const location = locations[i % locations.length];
      const jobType = jobTypes[i % jobTypes.length];
      const salaryRange = salaries[i % salaries.length];
      const matchedScore = Math.floor(Math.random() * 25) + 75; // 75 to 99
      const url = `https://careers.${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/jobs/${i}`;
      const description = `We are seeking a talented and motivated ${role} to join our team at ${company}. In this role, you will help design, build, and optimize core features for our platform. You'll collaborate with design, product, and engineering teams to deliver high-quality software, ensure operational reliability, and scale our products to meet growing user demands. Requirements include proficiency in modern software engineering principles, great communication skills, and a desire to learn.`;

      const job = await prisma.job.create({
        data: {
          userId: user.id,
          title: role,
          company,
          description,
          location,
          salaryRange,
          jobType,
          matchedScore,
          url
        }
      });
      jobsCreated.push(job);
    }
    console.log(`Successfully created ${jobsCreated.length} jobs for ${user.email}`);
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
