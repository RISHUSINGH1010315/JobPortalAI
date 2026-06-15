'use client';

import React, { useState, useEffect } from 'react';

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/roadmap`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmaps(data.roadmaps || []);
      }
    } catch (err) {
      console.warn('Backend connection failed. Using mock roadmap.');
      setRoadmaps([
        {
          id: 'road_1',
          targetRole: 'Senior Software Engineer',
          skillsToAcquire: ['System Design', 'Kubernetes', 'CI/CD Pipelines', 'AWS'],
          steps: [
            {
              title: 'Master Advanced System Design',
              description: 'Learn the architectural concepts required for scaling applications to millions of users, including caching layers, load balancers, and sharding.',
              resources: ['System Design Primer (GitHub)', 'Designing Data-Intensive Applications (Book)'],
              duration: '4 weeks',
            },
            {
              title: 'Acquire Infrastructure and Cloud Competency',
              description: 'Gain hands-on familiarity with container orchestration tools and cloud provisioning services.',
              resources: ['Kubernetes Bootcamp', 'AWS Certified Solutions Architect Course'],
              duration: '6 weeks',
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) return;
    setGenerating(true);

    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/roadmap`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ targetRole }),
      });

      if (res.ok) {
        const data = await res.json();
        setRoadmaps((prev) => [data.roadmap, ...prev]);
        setTargetRole('');
      }
    } catch (err) {
      alert('Mock career roadmap generated.');
      fetchRoadmaps();
    } finally {
      setGenerating(false);
    }
  };

  const activeRoadmap = roadmaps[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      <div>
        <h3 className="font-bold text-lg">Career Roadmap Generator</h3>
        <p className="text-xs text-slate-500 mt-0.5">Map your transition milestones to target roles</p>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left: Input Generator */}
        <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
          <h4 className="font-bold text-sm">Design a Career Path</h4>
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Role Title</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Lead React Developer"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={generating}
              className="w-full bg-primary text-white text-xs font-bold py-2.5 rounded-lg hover:brightness-110 active:scale-95 transition-all"
            >
              {generating ? 'Calculating Path...' : 'Build Roadmap'}
            </button>
          </form>
        </div>

        {/* Right: Active Roadmap Steps */}
        <div className="col-span-12 md:col-span-8 space-y-6">
          {loading ? (
            <div className="py-20 text-center font-bold text-slate-400 animate-pulse bg-white rounded-xl border border-slate-200 shadow-sm">
              Analyzing roadmap timelines...
            </div>
          ) : !activeRoadmap ? (
            <div className="py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white text-slate-400 font-semibold shadow-sm">
              Define a target role title on the left to map your career path.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Details */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase">Target Role Transition Plan</div>
                <h4 className="text-xl font-bold font-display text-primary mt-1">
                  {activeRoadmap.targetRole}
                </h4>

                {/* Skills Acquire */}
                {activeRoadmap.skillsToAcquire && (
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Required Technical Gap Skills</div>
                    <div className="flex flex-wrap gap-2">
                      {activeRoadmap.skillsToAcquire.map((skill: string, i: number) => (
                        <span key={i} className="bg-amber-50 border border-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-md font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Steps */}
              <div className="space-y-6 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                {activeRoadmap.steps?.map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-6 relative">
                    {/* Circle Node */}
                    <div className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-md z-10 shrink-0">
                      0{idx + 1}
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-6 flex-grow shadow-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <h5 className="font-bold text-sm">{step.title}</h5>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {step.description}
                      </p>

                      {step.resources && (
                        <div className="border-t border-slate-50 pt-3 space-y-1">
                          <div className="text-[9px] font-bold text-slate-400 uppercase">Suggested Learning Paths</div>
                          <ul className="list-disc list-inside text-[11px] text-primary space-y-1">
                            {step.resources.map((res: string, i: number) => (
                              <li key={i}>{res}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
