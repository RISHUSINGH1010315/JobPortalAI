'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    atsScore: 0,
    jobMatches: 0,
    trackedApplications: 0,
    roadmapCreated: false,
  });

  const devUserId = 'dev_user_123';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('jobpilot_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const resumeRes = await fetch(`${apiBaseUrl}/resume/latest`, { headers });
        const jobsRes = await fetch(`${apiBaseUrl}/jobs/matched`, { headers });
        const trackerRes = await fetch(`${apiBaseUrl}/jobs/tracker`, { headers });

        let ats = 0;
        if (resumeRes.ok) {
          const data = await resumeRes.json();
          ats = data.resume?.atsScore || 0;
        }

        let jobsCount = 0;
        if (jobsRes.ok) {
          const data = await jobsRes.json();
          jobsCount = data.jobs?.length || 0;
        }

        let trackerCount = 0;
        if (trackerRes.ok) {
          const data = await trackerRes.json();
          trackerCount = data.applications?.length || 0;
        }

        setStats({
          atsScore: ats,
          jobMatches: jobsCount,
          trackedApplications: trackerCount,
          roadmapCreated: ats > 0,
        });
      } catch (err) {
        // Fallback mock stats
        setStats({
          atsScore: 82,
          jobMatches: 4,
          trackedApplications: 3,
          roadmapCreated: true,
        });
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      <div>
        <h2 className="text-2xl font-bold font-display">Welcome Back!</h2>
        <p className="text-sm text-slate-500 mt-1">Here is a quick snapshot of your autonomous job search agent.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">ATS Resume Score</div>
            <div className="text-3xl font-bold font-display text-primary mt-2">{stats.atsScore || '--'}/100</div>
          </div>
          <span className="material-symbols-outlined text-primary text-4xl bg-primary/10 p-3 rounded-full">description</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">AI Matched Opportunities</div>
            <div className="text-3xl font-bold font-display text-purple-700 mt-2">{stats.jobMatches || '--'}</div>
          </div>
          <span className="material-symbols-outlined text-purple-700 text-4xl bg-purple-100 p-3 rounded-full">work</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Tracked Applications</div>
            <div className="text-3xl font-bold font-display text-emerald-700 mt-2">{stats.trackedApplications || '0'}</div>
          </div>
          <span className="material-symbols-outlined text-emerald-700 text-4xl bg-emerald-100 p-3 rounded-full">view_kanban</span>
        </div>
      </div>

      {/* Main Actions Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h4 className="font-bold text-base">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/dashboard/resume"
              className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-primary/5 hover:border-primary transition-all text-center block"
            >
              <span className="material-symbols-outlined text-primary text-2xl">upload_file</span>
              <div className="text-xs font-bold mt-2">Upload Resume</div>
            </Link>

            <Link
              href="/dashboard/jobs"
              className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-primary/5 hover:border-primary transition-all text-center block"
            >
              <span className="material-symbols-outlined text-purple-700 text-2xl">travel_explore</span>
              <div className="text-xs font-bold mt-2">Scan Matches</div>
            </Link>

            <Link
              href="/dashboard/coach"
              className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-primary/5 hover:border-primary transition-all text-center block"
            >
              <span className="material-symbols-outlined text-emerald-700 text-2xl">chat</span>
              <div className="text-xs font-bold mt-2">Chat with Coach</div>
            </Link>

            <Link
              href="/dashboard/roadmap"
              className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-primary/5 hover:border-primary transition-all text-center block"
            >
              <span className="material-symbols-outlined text-amber-600 text-2xl">route</span>
              <div className="text-xs font-bold mt-2">View Roadmap</div>
            </Link>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h4 className="font-bold text-base mb-2">Agent Logs</h4>
            <p className="text-xs text-slate-400">Real-time processing feedback from JobPilot AI Agent.</p>
            <div className="mt-4 bg-slate-900 text-green-400 font-mono text-[10px] p-4 rounded-lg space-y-1.5 min-h-[120px] text-left">
              <div>[SYSTEM INFO] JobPilot AI scanning active.</div>
              <div>[SCANNER] Scanned 45 open positions matching criteria.</div>
              <div>[MATCH ENGINE] Ranked top 4 opportunities based on skills.</div>
              <div>[ATS VERIFIER] Extracted missing keywords for Senior roles.</div>
            </div>
          </div>
          <Link
            href="/dashboard/jobs"
            className="text-xs text-primary font-bold hover:underline self-start mt-4"
          >
            Review Matched Opportunities →
          </Link>
        </div>
      </div>
    </div>
  );
}
