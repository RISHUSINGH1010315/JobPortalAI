'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function InterviewContent() {
  const searchParams = useSearchParams();
  const appId = searchParams.get('appId');

  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const apiBaseUrl = 'http://localhost:4000/api';

  const fetchPrepBrief = async () => {
    if (!appId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/jobs/interview/prep/${appId}`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setBrief(data.brief);
      } else {
        setBrief(null);
      }
    } catch (err) {
      console.warn('Backend connection failed or no brief generated yet. Offering generation.');
      setBrief(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrepBrief();
  }, [appId]);

  const generateBrief = async () => {
    if (!appId) return;
    setGenerating(true);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/jobs/interview/prep`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ applicationId: appId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBrief(data.brief);
      }
    } catch (err) {
      // Mock generated brief
      setBrief({
        roleSummary: 'The role requires high proficiency in system scalability, frontend design consistency, and Node.js microservices.',
        prepQuestions: [
          {
            question: 'Can you describe a challenging technical problem you solved, and how you decided on the architecture?',
            type: 'technical',
            context: 'Be prepared to explain database replicas and sharding concepts.',
            sampleAnswer: 'I resolved a write database bottleneck by splitting operations into read/write replicas, improving query latency by 40%.',
          },
        ],
        tips: [
          'Use the STAR method for behavioral answers.',
          'State database replication tradeoffs clearly.',
        ],
      });
    } finally {
      setGenerating(false);
    }
  };

  if (!appId) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center border border-dashed border-slate-200 rounded-xl bg-white text-slate-400 font-semibold shadow-sm text-left">
        Please access this page by clicking &quot;Prep Brief&quot; on an application card inside the Kanban Tracker Board.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div>
        <h3 className="font-bold text-lg">AI Interview Intelligence</h3>
        <p className="text-xs text-slate-500 mt-0.5">Custom brief and mock interview prep guide for this role</p>
      </div>

      {loading ? (
        <div className="py-20 text-center font-bold text-slate-400 animate-pulse bg-white rounded-xl border border-slate-200 shadow-sm">
          Fetching interview prep guide details...
        </div>
      ) : !brief ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 shadow-sm">
          <span className="material-symbols-outlined text-primary text-5xl">psychology</span>
          <h4 className="font-bold text-sm">No Interview Brief Generated Yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Let the JobPilot agent evaluate the job requirements against your profile to generate specialized mock questions and strategy tips.
          </p>
          <button
            onClick={generateBrief}
            disabled={generating}
            className="bg-primary text-white text-xs font-bold py-2.5 px-6 rounded-lg hover:brightness-110 active:scale-95 transition-all inline-block"
          >
            {generating ? 'Compiling Intel...' : 'Generate Prep Brief'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left: Summary and Questions */}
          <div className="col-span-12 md:col-span-8 space-y-6">
            {/* Role Summary */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
              <h5 className="text-xs font-bold text-slate-400 uppercase">Role Evaluation Summary</h5>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {brief.roleSummary}
              </p>
            </div>

            {/* Questions list */}
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-slate-400 uppercase pl-2">Mock Interview Practice Questions</h5>
              {brief.prepQuestions?.map((q: any, i: number) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded capitalize shrink-0">
                      {q.type}
                    </span>
                    <h5 className="font-bold text-sm flex-grow text-left leading-relaxed">
                      {q.question}
                    </h5>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200 text-xs">
                    <div className="font-bold text-slate-400 uppercase text-[9px]">Interviewer Context / Lookouts</div>
                    <p className="text-on-surface-variant italic leading-relaxed">{q.context}</p>
                  </div>

                  <div className="bg-blue-50/50 rounded-lg p-4 space-y-2 border border-blue-100 text-xs">
                    <div className="font-bold text-blue-600 uppercase text-[9px]">Suggested Response Blueprint</div>
                    <p className="text-on-surface-variant leading-relaxed">{q.sampleAnswer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Strategy Tips */}
          <div className="col-span-12 md:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm">Strategic Advice</h4>
            <ul className="space-y-3">
              {brief.tips?.map((tip: string, i: number) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span className="material-symbols-outlined text-primary text-[16px] shrink-0">
                    check_circle
                  </span>
                  <span className="text-slate-600 leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center animate-pulse">Loading Search Parameters...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
