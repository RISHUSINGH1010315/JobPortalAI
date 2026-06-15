'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TrackerPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const columns = [
    { label: 'Bookmarked', status: 'BOOKMARKED' },
    { label: 'Applied', status: 'APPLIED' },
    { label: 'Interviewing', status: 'INTERVIEWING' },
    { label: 'Offered', status: 'OFFERED' },
    { label: 'Rejected', status: 'REJECTED' },
  ];

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/jobs/tracker`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.warn('Backend connection failed. Displaying mock application board.');
      // Mocked application items
      setApplications([
        {
          id: 'app_1',
          status: 'BOOKMARKED',
          job: { id: 'job_1', title: 'Senior Frontend Engineer', company: 'Linear Dynamics', location: 'Remote', salaryRange: '$160k – $220k' },
          notes: 'Prepare cover letter tailor changes.'
        },
        {
          id: 'app_2',
          status: 'INTERVIEWING',
          job: { id: 'job_2', title: 'Staff Software Engineer (Infra)', company: 'Nexus Cloud', location: 'San Francisco, CA', salaryRange: '$190k – $250k' },
          notes: 'Technical panel scheduled for tomorrow!'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const moveApplication = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/jobs/tracker/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
      }
    } catch (err) {
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
      );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      <div>
        <h3 className="font-bold text-lg">Application Tracker</h3>
        <p className="text-xs text-slate-500 mt-0.5">Manage and track your pipeline steps</p>
      </div>

      {loading ? (
        <div className="py-20 text-center font-bold text-slate-400 animate-pulse">
          Loading application pipelines...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
          {columns.map((col) => {
            const colApps = applications.filter((app) => app.status === col.status);
            return (
              <div key={col.status} className="bg-slate-100/60 rounded-xl p-4 flex flex-col space-y-4 min-h-[500px]">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-xs text-slate-600 uppercase tracking-wider">{col.label}</span>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {colApps.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3">
                  {colApps.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[10px] text-slate-400 font-semibold py-8">
                      No applications
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 relative group hover:border-primary transition-all"
                      >
                        <div>
                          <h4 className="font-bold text-xs line-clamp-1">{app.job?.title}</h4>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{app.job?.company}</p>
                        </div>

                        {app.notes && (
                          <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-50 pt-2 line-clamp-2">
                            {app.notes}
                          </p>
                        )}

                        <div className="flex justify-between items-center pt-2 text-[10px]">
                          <span className="text-slate-400 font-bold">{app.job?.salaryRange}</span>
                          <Link
                            href={`/dashboard/interview?appId=${app.id}`}
                            className="bg-primary/10 text-primary font-bold px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                          >
                            Prep Brief
                          </Link>
                        </div>

                        {/* Move state action controls */}
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white shadow-md p-1 border border-slate-100 rounded-lg">
                          {columns
                            .filter((c) => c.status !== app.status)
                            .map((c) => (
                              <button
                                key={c.status}
                                title={`Move to ${c.label}`}
                                onClick={() => moveApplication(app.id, c.status)}
                                className="text-[8px] bg-slate-50 hover:bg-primary hover:text-white px-1.5 py-0.5 rounded border border-slate-200"
                              >
                                {c.label.substring(0, 2)}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
