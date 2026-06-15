'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function ResumePage() {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<any>(null);
  
  // Target Role & Optimization
  const [targetRole, setTargetRole] = useState('');
  const [optScore, setOptScore] = useState<number | null>(null);
  const [optFeedback, setOptFeedback] = useState<any[]>([]);
  const [optimizing, setOptimizing] = useState(false);

  // Cover Letter states
  const [jobDesc, setJobDesc] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const devUserId = 'dev_user_123';
  const apiBaseUrl = 'http://localhost:4000/api';

  const fetchLatestResume = async () => {
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/resume/latest`, { headers });
      if (res.ok) {
        const data = await res.json();
        setResume(data.resume);
      }
    } catch (err) {
      console.warn('Backend offline, using fallback mock resume.');
      // Mock resume
      setResume({
        fileName: 'resume_developer_2026.pdf',
        atsScore: 82,
        parsedContent: {
          summary: 'A highly motivated Software Engineer with experience building responsive web applications, robust backend services, and cloud integrations.',
          skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
          experience: [
            {
              role: 'Senior Software Engineer',
              company: 'TechCorp Solutions',
              duration: '2022 - Present',
              highlights: [
                'Led migration of monolithic application to a microservices architecture, reducing latency by 35%.',
                'Spearheaded the development of a internal UI library using React and Tailwind.',
              ]
            }
          ]
        },
        feedback: [
          { title: 'Quantify Achievements', description: 'Add metrics to your experience milestones (e.g. increase performance by X%).', type: 'impact' },
          { title: 'Add CI/CD keywords', description: 'Introduce keywords like GitHub Actions or Jenkins.', type: 'keywords' }
        ]
      });
    }
  };

  useEffect(() => {
    fetchLatestResume();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const fileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/resume/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResume(data.resume);
      } else {
        alert('Failed to parse uploaded resume.');
      }
    } catch (err) {
      alert('Mock file uploaded and processed.');
      fetchLatestResume();
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole) return;
    setOptimizing(true);

    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/resume/optimize`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ targetRole }),
      });

      if (res.ok) {
        const data = await res.json();
        setOptScore(data.atsScore);
        setOptFeedback(data.feedback || []);
      }
    } catch (err) {
      setOptScore(88);
      setOptFeedback([
        { title: 'Skills Align', description: 'Your frontend skills match, but add Kubernetes.', type: 'keywords' }
      ]);
    } finally {
      setOptimizing(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!jobDesc) return;
    setGeneratingLetter(true);

    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/resume/cover-letter`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jobDescription: jobDesc }),
      });

      if (res.ok) {
        const data = await res.json();
        setCoverLetter(data.coverLetter);
      }
    } catch (err) {
      setCoverLetter('Dear Hiring Manager,\n\nI am thrilled to apply for this role...');
    } finally {
      setGeneratingLetter(false);
    }
  };

  const circumference = 2 * Math.PI * 54; // r=54 for radius matching dashboard markup
  const displayScore = optScore !== null ? optScore : resume?.atsScore || 0;
  const strokeOffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8 text-left items-stretch">
      {/* Left: Upload and Parser details */}
      <section className="col-span-12 md:col-span-8 space-y-6">
        {/* Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive ? 'border-primary bg-primary/5' : 'border-slate-300 bg-white hover:border-primary'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={fileSelected}
            className="hidden"
            accept=".pdf,.docx"
          />
          <span className="material-symbols-outlined text-primary text-5xl mb-3">upload_file</span>
          <h4 className="font-bold text-sm">Drag & drop your resume here</h4>
          <p className="text-xs text-slate-400 mt-1">PDF or DOCX (Max 10MB)</p>
          {loading && <div className="text-xs font-bold text-primary animate-pulse mt-3">Analyzing Resume...</div>}
        </div>

        {/* Parsed Resume Details */}
        {resume && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
            <div>
              <h4 className="font-bold text-lg">{resume.fileName}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Parsed content representation</p>
            </div>

            {resume.parsedContent?.summary && (
              <div className="space-y-1.5">
                <h5 className="text-xs font-bold text-slate-400 uppercase">Professional Summary</h5>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {resume.parsedContent.summary}
                </p>
              </div>
            )}

            {resume.parsedContent?.skills && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase">Core Competencies</h5>
                <div className="flex flex-wrap gap-2">
                  {resume.parsedContent.skills.map((skill: string, i: number) => (
                    <span key={i} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs px-2.5 py-1 rounded-md font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {resume.parsedContent?.experience && (
              <div className="space-y-4">
                <h5 className="text-xs font-bold text-slate-400 uppercase">Experience</h5>
                <div className="space-y-4">
                  {resume.parsedContent.experience.map((exp: any, i: number) => (
                    <div key={i} className="border-l-2 border-slate-100 pl-4 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-sm">{exp.role}</span>
                        <span className="text-slate-400 font-semibold">{exp.duration}</span>
                      </div>
                      <div className="text-xs font-bold text-primary">{exp.company}</div>
                      <ul className="list-disc list-inside text-xs text-on-surface-variant space-y-1 mt-1.5">
                        {exp.highlights?.map((hl: string, j: number) => (
                          <li key={j}>{hl}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Right: ATS Score & Optimization */}
      <section className="col-span-12 md:col-span-4 space-y-6">
        {/* Score Card */}
        {resume && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center shadow-sm">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-6">ATS Score</h3>
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  className="text-slate-100"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                ></circle>
                <circle
                  className="text-primary ats-ring"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="54"
                  stroke="currentColor"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-display text-primary">{displayScore}</span>
                <span className="text-[10px] font-bold text-slate-400">EXCELLENT</span>
              </div>
            </div>
            <p className="mt-6 text-xs text-center text-slate-500">
              {optScore !== null 
                ? `Updated scoring matching: "${targetRole}"`
                : 'Your resume parsed successfully. Target specialized roles below.'}
            </p>
          </div>
        )}

        {/* Specific Role Optimizer */}
        {resume && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h4 className="font-bold text-sm">Optimize for a Job Role</h4>
            <form onSubmit={handleOptimize} className="space-y-3">
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={optimizing}
                className="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all"
              >
                {optimizing ? 'Calculating...' : 'Run Optimization'}
              </button>
            </form>

            {/* Recommendations Output */}
            {(optFeedback.length > 0 || (optScore === null && resume?.feedback)) && (
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase">Quick Fixes</h5>
                <ul className="space-y-3">
                  {(optScore !== null ? optFeedback : resume.feedback || []).map((fb: any, i: number) => (
                    <li key={i} className="flex gap-3 text-xs">
                      <span className="material-symbols-outlined text-amber-500 shrink-0 text-[18px]">
                        info
                      </span>
                      <div>
                        <div className="font-bold">{fb.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{fb.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Cover Letter Panel */}
        {resume && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            <h4 className="font-bold text-sm">Generate Cover Letter</h4>
            <textarea
              rows={4}
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste target Job Description here..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary resize-none"
            ></textarea>
            <button
              onClick={handleGenerateLetter}
              disabled={generatingLetter}
              className="w-full bg-secondary text-white text-xs font-bold py-2 rounded-lg hover:brightness-110 active:scale-95 transition-all"
            >
              {generatingLetter ? 'Generating Letter...' : 'Build Cover Letter'}
            </button>

            {coverLetter && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-60 overflow-y-auto text-xs whitespace-pre-wrap leading-relaxed mt-4 font-mono select-all">
                {coverLetter}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
