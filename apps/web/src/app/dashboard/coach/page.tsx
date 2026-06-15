'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function CoachPage() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const apiBaseUrl = 'http://localhost:4000/api';

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`${apiBaseUrl}/profile`, { headers });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/coach/history`, {
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.history || []);
      }
    } catch (err) {
      console.warn('Backend connection failed. Using mock history.');
      setMessages([
        {
          id: 'init',
          sender: 'COACH',
          message: 'Hello! I am your JobPilot Career Coach. I can help you tailor your resume, simulate interviews, or guide you through salary negotiations. What would you like to accomplish today?',
          createdAt: new Date(),
        },
      ]);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setSending(true);

    // Add user message locally
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'USER',
      message: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/coach/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.coachMessage]);
      }
    } catch (err) {
      // Mocked response logic based on input keywords
      setTimeout(() => {
        let reply = 'I am currently processing your inquiry. Tell me more details!';
        const lowercaseText = text.toLowerCase();
        if (lowercaseText.includes('resume') || lowercaseText.includes('cv')) {
          reply = "Let's review your core competencies. Make sure to list achievements in a single-column layout using quantitative metrics (e.g. increase speed by 15%).";
        } else if (lowercaseText.includes('interview') || lowercaseText.includes('mock')) {
          reply = "Excellent. I will act as the interviewer. Tell me, what is a challenging technical problem you solved, and how did you decide on the database architecture?";
        } else if (lowercaseText.includes('salary') || lowercaseText.includes('offer')) {
          reply = 'Always let the recruiter mention the first number. Keep notes on compensation ranges, equity stakes, and work arrangements.';
        }
        setMessages((prev) => [
          ...prev,
          { id: `coach_${Date.now()}`, sender: 'COACH', message: reply, createdAt: new Date() },
        ]);
      }, 800);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage(inputValue);
    }
  };

  const quickActions = [
    { title: 'Simulate Mock Interview', prompt: 'I would like to practice a mock interview.' },
    { title: 'Optimize My Resume', prompt: 'Can you give me tips to optimize my resume for ATS?' },
    { title: 'Draft Salary Response', prompt: 'Help me draft a response to negotiate a salary offer.' },
  ];

  if (loadingProfile) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center font-bold text-slate-400 animate-pulse">
        Checking AI Coach credentials...
      </div>
    );
  }

  const isPremium = profile?.subscriptionPlan === 'PREMIUM';

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)] border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden text-left relative">
      {/* Top Banner */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold">
            JP
          </div>
          <div>
            <h4 className="font-bold text-sm">JobPilot Career Coach</h4>
            <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              AI Ready to Consult
            </p>
          </div>
        </div>
      </div>

      {/* Lock Overlay for non-Premium users */}
      {!isPremium && (
        <div className="absolute inset-x-0 bottom-0 top-16 bg-white/60 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
            <div className="w-16 h-16 bg-purple-50 border border-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-3xl font-bold">lock</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">AI Career Coach is Locked</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Unlock full conversational prep consults, custom resume tailoring critiques, and salary mock negotiation sessions with our Premium AI assistant.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('jobpilot_token');
                    const res = await fetch(`${apiBaseUrl}/billing/checkout`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({ plan: 'PREMIUM' })
                    });
                    if (res.ok) {
                      const data = await res.json();
                      if (data.url) router.push(data.url);
                    }
                  } catch (e) {
                    router.push('/checkout?plan=PREMIUM');
                  }
                }}
                className="bg-primary text-white text-xs font-bold py-3 px-8 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all w-full flex items-center justify-center gap-2"
              >
                Upgrade to Premium ($49/mo)
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages & Inputs panel */}
      <div className={`flex flex-col flex-grow min-h-0 ${!isPremium ? 'blur-sm select-none pointer-events-none' : ''}`}>
        
        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => {
            const isCoach = msg.sender === 'COACH';
            return (
              <div key={msg.id} className={`flex ${isCoach ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-md p-4 rounded-2xl text-xs leading-relaxed ${
                    isCoach
                      ? 'bg-slate-50 border border-slate-100 text-on-surface'
                      : 'bg-primary text-white'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs text-slate-400 animate-pulse">
                Career Coach is thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Actions Suggestions */}
        {messages.length < 3 && (
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => sendMessage(action.prompt)}
                className="text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all px-3 py-1.5 rounded-full border border-slate-200"
              >
                {action.title}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-200 p-4 flex gap-3 bg-slate-50">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about interviewing, resume rewrites, salary packages..."
            className="flex-grow px-4 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary bg-white shadow-inner"
          />
          <button
            onClick={() => sendMessage(inputValue)}
            disabled={sending || !inputValue.trim()}
            className="bg-primary text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:brightness-110 active:scale-95 transition-all"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
