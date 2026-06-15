'use client';

import React, { useState, useEffect } from 'react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [salaryFilter, setSalaryFilter] = useState(150);
  const [loading, setLoading] = useState(false);
  const [trackerMap, setTrackerMap] = useState<Record<string, boolean>>({});
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const devUserId = 'dev_user_123';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/jobs/matched`, { headers });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }

      // Check tracker status
      const trackRes = await fetch(`${apiBaseUrl}/jobs/tracker`, { headers });
      if (trackRes.ok) {
        const data = await trackRes.json();
        const map: Record<string, boolean> = {};
        data.applications?.forEach((app: any) => {
          map[app.jobId] = true;
        });
        setTrackerMap(map);
      }
    } catch (err) {
      console.error('Failed to load matched jobs: ' + err);
      // Mocked opportunities
      setJobs([
        {
          id: '1',
          title: 'Senior Frontend Engineer',
          company: 'Linear Dynamics',
          description: "We're looking for an engineer to lead our product dashboard initiative. You'll be working closely with design to build ultra-responsive, accessible interfaces using React, Next.js, and Tailwind.",
          location: 'Remote',
          salaryRange: '$160k – $220k',
          jobType: 'Full-time',
          matchedScore: 98,
        },
        {
          id: '2',
          title: 'Staff Software Engineer (Infra)',
          company: 'Nexus Cloud',
          description: 'Scale our global edge network to handle millions of concurrent requests. Expertise in Node.js, Go, Kubernetes, Docker, and distributed systems is required.',
          location: 'San Francisco, CA',
          salaryRange: '$190k – $250k',
          jobType: 'Full-time',
          matchedScore: 92,
        },
        {
          id: '3',
          title: 'Product Designer (Design Systems)',
          company: 'Quantum FinTech',
          description: 'Drive visual consistency across our web and mobile applications. Component libraries and design tokens with React and Tailwind.',
          location: 'Hybrid',
          salaryRange: '$140k – $185k',
          jobType: 'Contract',
          matchedScore: 85,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const triggerScan = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/jobs/scan`, {
        method: 'POST',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      alert('Mock scan completed.');
    } finally {
      setLoading(false);
    }
  };

  const trackJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/jobs/tracker`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jobId, status: 'BOOKMARKED' }),
      });
      if (res.ok) {
        setTrackerMap((prev) => ({ ...prev, [jobId]: true }));
      }
    } catch (err) {
      setTrackerMap((prev) => ({ ...prev, [jobId]: true }));
    }
  };

  const applyJobDirectly = async (jobId: string) => {
    setIsApplying(true);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/jobs/tracker`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ jobId, status: 'APPLIED' }),
      });
      if (res.ok) {
        setTrackerMap((prev) => ({ ...prev, [jobId]: true }));
      }
    } catch (err) {
      console.error('Failed to apply directly:', err);
      setTrackerMap((prev) => ({ ...prev, [jobId]: true }));
    } finally {
      setIsApplying(false);
    }
  };

  // Client-side filtering logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRemote = !remoteOnly || job.location.toLowerCase().includes('remote');

    // Parse salary number (e.g. "$160k" -> 160)
    const salMatch = job.salaryRange?.match(/\$(\d+)/);
    const salValue = salMatch ? parseInt(salMatch[1]) : 100;
    const matchesSalary = salValue >= salaryFilter;

    return matchesSearch && matchesRemote && matchesSalary;
  });

  return (
    <div className="flex gap-8 h-full max-w-6xl mx-auto items-stretch">
      {/* Left: Filter Sidebar */}
      <aside className="w-72 bg-white border border-slate-200 rounded-xl p-6 h-fit shrink-0 space-y-6 text-left shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <h3 className="font-bold text-base">Filters</h3>
          <button
            onClick={() => {
              setSearchTerm('');
              setRemoteOnly(false);
              setSalaryFilter(100);
            }}
            className="text-xs text-primary font-bold hover:underline"
          >
            Clear all
          </button>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Search Keywords</label>
          <div className="relative">
            <input
              type="text"
              placeholder="React, Lead, Stripe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <span className="material-symbols-outlined text-[16px] text-slate-400 absolute left-3 top-2.5">
              search
            </span>
          </div>
        </div>

        {/* Location Toggle */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase">Location Type</label>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(e) => setRemoteOnly(e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
            />
            <span>Remote Only</span>
          </label>
        </div>

        {/* Salary Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase">
            <span>Minimum Salary</span>
            <span className="text-primary font-semibold">${salaryFilter}k+</span>
          </div>
          <input
            type="range"
            min="100"
            max="200"
            step="10"
            value={salaryFilter}
            onChange={(e) => setSalaryFilter(parseInt(e.target.value))}
            className="w-full accent-primary bg-slate-200 h-1 rounded-lg cursor-pointer"
          />
        </div>
      </aside>

      {/* Right: Job List Feed */}
      <section className="flex-grow space-y-6 text-left">
        <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div>
            <h3 className="font-bold text-lg">AI Matches</h3>
            <p className="text-xs text-slate-500 mt-0.5">Opportunities matched with your skills</p>
          </div>
          <button
            onClick={triggerScan}
            disabled={loading}
            className="bg-primary text-white text-xs font-bold py-2.5 px-5 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm animate-spin-slow">sync</span>
            {loading ? 'Scanning...' : 'Scan Jobs'}
          </button>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="py-20 text-center font-bold text-slate-400 animate-pulse">
              Scanning database for matches...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white text-slate-400 font-semibold">
              No jobs match current filter options.
            </div>
          ) : (
            filteredJobs.map((job) => {
              const alreadyTracked = trackerMap[job.id];
              return (
                <div
                  key={job.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row gap-6 shadow-sm hover:border-primary transition-all relative overflow-hidden group"
                >
                  {/* Left Logo */}
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-primary shrink-0 border border-slate-200/50">
                    {job.company.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Body */}
                  <div className="flex-grow space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 
                          onClick={() => setSelectedJob(job)}
                          className="font-bold text-base group-hover:text-primary cursor-pointer hover:underline transition-colors"
                        >
                          {job.title}
                        </h4>
                        <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{job.company}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.jobType}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0">
                        <span className="bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">bolt</span>
                          {job.matchedScore}% Match
                        </span>
                        <span className="text-xs font-semibold text-slate-500 mt-1.5">
                          {job.salaryRange}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                      <div className="flex gap-2">
                        {/* Fake tags */}
                        <span className="bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded">
                          React
                        </span>
                        <span className="bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-semibold px-2 py-0.5 rounded">
                          TypeScript
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          View JD
                        </button>
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="bg-primary text-white text-xs font-bold py-1.5 px-4 rounded-lg hover:brightness-110 active:scale-95 transition-all block"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Details & Application Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-8 duration-350">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start gap-4 bg-slate-50/50">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center font-bold text-primary shrink-0 border border-slate-200/50 text-base shadow-sm">
                  {selectedJob.company.substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg text-slate-900 leading-snug">{selectedJob.title}</h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{selectedJob.company} &bull; {selectedJob.location}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] block">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              
              {/* Key Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Match Score</span>
                  <div className="text-xs font-bold text-primary flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    {selectedJob.matchedScore}% Match
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Salary Range</span>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{selectedJob.salaryRange || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Job Type</span>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{selectedJob.jobType || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Location Type</span>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{selectedJob.location || 'N/A'}</div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Job Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/20 p-4 rounded-lg border border-slate-100">
                  {selectedJob.description}
                </p>
              </div>

              {/* Skills Tags */}
              <div className="space-y-2">
                <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Required Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-md">React</span>
                  <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-md">TypeScript</span>
                  <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-md">Node.js</span>
                  <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-md">PostgreSQL</span>
                  <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-md">MongoDB</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button
                onClick={async () => {
                  await trackJob(selectedJob.id);
                  setSelectedJob(null);
                }}
                disabled={trackerMap[selectedJob.id]}
                className={`text-xs font-bold py-2.5 px-4 rounded-xl border transition-all ${
                  trackerMap[selectedJob.id]
                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 active:scale-[0.98]'
                }`}
              >
                {trackerMap[selectedJob.id] ? 'Already Tracked' : 'Save to Bookmarks'}
              </button>
              
              <button
                onClick={async () => {
                  await applyJobDirectly(selectedJob.id);
                  if (selectedJob.url) {
                    window.open(selectedJob.url, '_blank', 'noopener,noreferrer');
                  }
                  setSelectedJob(null);
                }}
                disabled={isApplying}
                className="bg-primary text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                {isApplying ? 'Applying...' : 'Confirm Application & Apply'}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
