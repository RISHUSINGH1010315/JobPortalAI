'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background min-h-screen text-on-surface">
      {/* TopNavBar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'py-2 bg-white/80 backdrop-blur-md shadow-sm border-b border-outline-variant/30'
            : 'py-4 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold text-primary">JobPilot AI</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
              About
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="bg-primary text-white font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-primary-container transition-all active:scale-95 shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            {/* Agent Status Badge */}
            <div className="inline-flex items-center gap-2 bg-surface-container-low border border-outline-variant/50 px-4 py-1.5 rounded-full mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="agent-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-xs font-semibold text-on-surface-variant tracking-wide uppercase">
                AI SCANNING: SENIOR SOFTWARE ENGINEER ROLES
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 max-w-4xl mx-auto leading-tight">
              Your AI-Powered <span className="text-primary italic">Career Assistant</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              The autonomous job search agent that finds, applies, and prepares you for your dream role while you sleep.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="bg-primary text-white font-semibold px-8 py-4 rounded-xl hover:shadow-lg hover:bg-primary-container transition-all active:scale-95 w-full sm:w-auto"
              >
                Get Started
              </Link>
              <button
                onClick={() => alert('Demo video coming soon!')}
                className="bg-white border border-outline-variant text-on-surface font-semibold px-8 py-4 rounded-xl hover:bg-surface-container-low transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <span className="material-symbols-outlined">play_circle</span> Watch Demo
              </button>
            </div>

            {/* Hero Graphic Area */}
            <div className="mt-20 relative rounded-2xl overflow-hidden border border-outline-variant/30 shadow-2xl bg-white max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
              <div className="p-8 md:p-12 bg-slate-50/50 flex flex-col items-center">
                {/* Mockup Dashboard UI */}
                <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden text-left">
                  <div className="h-12 border-b border-slate-100 px-6 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                      <span className="w-3 h-3 rounded-full bg-green-400"></span>
                      <span className="ml-4 text-xs text-slate-400">JobPilot AI Dashboard</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-600 rounded">Scanning...</span>
                  </div>
                  <div className="p-6 grid grid-cols-12 gap-6">
                    <div className="col-span-3 border-r border-slate-100 pr-6 space-y-2 hidden md:block">
                      <div className="h-8 bg-blue-50 text-blue-700 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-sm">work</span> Jobs
                      </div>
                      <div className="h-8 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-sm">description</span> Resume Analyzer
                      </div>
                      <div className="h-8 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-sm">view_kanban</span> Tracker
                      </div>
                      <div className="h-8 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-sm">smart_toy</span> Career Coach
                      </div>
                    </div>
                    <div className="col-span-12 md:col-span-9 space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-bold">Matched Opportunities</h4>
                        <span className="text-xs text-slate-400">Updated 4 mins ago</span>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-white hover:border-primary transition-all">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center font-bold text-blue-600">LD</div>
                          <div>
                            <h5 className="font-bold text-sm">Senior Frontend Engineer</h5>
                            <p className="text-xs text-slate-500">Linear Dynamics • Remote</p>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">98% Match</span>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-white hover:border-primary transition-all">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center font-bold text-purple-600">NC</div>
                          <div>
                            <h5 className="font-bold text-sm">Staff Software Engineer (Infra)</h5>
                            <p className="text-xs text-slate-500">Nexus Cloud • SF, CA</p>
                          </div>
                        </div>
                        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">92% Match</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 bg-white border-y border-outline-variant/30" id="features">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Supercharge your search</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                Precision tools designed for high-performance job seekers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Feature 1: AI Job Matching */}
              <div className="md:col-span-8 bg-slate-50 border border-slate-200 p-8 rounded-2xl flex flex-col justify-between gap-8 hover:border-primary transition-all">
                <div>
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">AI Job Matching</h3>
                  <p className="text-on-surface-variant max-w-lg">
                    Our system scans job boards daily to find roles that perfectly match your skills, values, and compensation requirements.
                  </p>
                </div>
                <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-inner">
                  AI Matching Algorithm Core Active
                </div>
              </div>

              {/* Feature 2: Resume Optimization */}
              <div className="md:col-span-4 bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-primary transition-all flex flex-col justify-between">
                <div>
                  <div className="bg-emerald-100 text-emerald-700 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">ATS Optimizer</h3>
                  <p className="text-on-surface-variant">
                    Instant, ATS-optimized resume feedback and keywords tailored for every application.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                  <span className="text-sm font-semibold text-emerald-700">Recalculating ATS Score...</span>
                </div>
              </div>

              {/* Feature 3: Tracker */}
              <div className="md:col-span-4 bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-primary transition-all flex flex-col justify-between">
                <div>
                  <div className="bg-purple-100 text-purple-700 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined">view_kanban</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Auto-Tracking</h3>
                  <p className="text-on-surface-variant">
                    Never lose track of an application. Drag and drop, configure notes, and keep tabs on deadlines.
                  </p>
                </div>
                <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-white mt-8 text-center text-xs text-slate-400">
                  Kanban Stages: Bookmarked → Applied → Interviewing
                </div>
              </div>

              {/* Feature 4: Interview Prep */}
              <div className="md:col-span-8 bg-slate-50 border border-slate-200 p-8 rounded-2xl hover:border-primary transition-all flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <div className="bg-blue-100 text-blue-700 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined">record_voice_over</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Interview Intelligence</h3>
                  <p className="text-on-surface-variant">
                    Get custom interview briefs, behavioral questions, and suggested answers based on the specific job requirements.
                  </p>
                </div>
                <div className="flex-1 w-full bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-2">
                  <div className="text-xs font-bold text-slate-400">PREP BRIEF QUESTIONS</div>
                  <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200 font-semibold">Q: Tell me about your microservices experience?</div>
                  <div className="text-xs bg-slate-50 p-2 rounded border border-slate-200 font-semibold">Q: How do you handle database write bottlenecks?</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-slate-50" id="pricing">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Fair pricing for every career stage</h2>
              <p className="text-on-surface-variant">Choose the plan that fits your ambition.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
              {/* Free */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-xl font-bold mb-2">Free</h3>
                  <p className="text-xs text-on-surface-variant mb-6">For casual job hunters.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-on-surface-variant text-sm">/mo</span>
                  </div>
                  <ul className="space-y-4 text-sm text-slate-600 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> 3 AI matches per day
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Manual tracker
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Resume score check
                    </li>
                  </ul>
                </div>
                <Link
                  href="/dashboard"
                  className="w-full py-3 rounded-lg border border-slate-200 text-center font-bold text-slate-700 hover:bg-slate-50 transition-all block"
                >
                  Get Started
                </Link>
              </div>

              {/* Pro */}
              <div className="bg-white p-8 rounded-2xl border-2 border-primary flex flex-col justify-between shadow-lg relative scale-105 z-10">
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Pro</h3>
                  <p className="text-xs text-on-surface-variant mb-6">For active searchers.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-on-surface-variant text-sm">/mo</span>
                  </div>
                  <ul className="space-y-4 text-sm text-slate-600 mb-8">
                    <li className="flex items-center gap-2 font-bold text-slate-700">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Unlimited AI matches
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Cover letter generator
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Career Coach Chatbot
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Interview preparation briefs
                    </li>
                  </ul>
                </div>
                <Link
                  href="/dashboard?upgrade=PRO"
                  className="w-full py-3 bg-primary text-white text-center font-bold rounded-lg hover:bg-primary-container transition-all block"
                >
                  Upgrade to Pro
                </Link>
              </div>

              {/* Premium */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-xl font-bold mb-2">Premium</h3>
                  <p className="text-xs text-on-surface-variant mb-6">For executives.</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-bold">$99</span>
                    <span className="text-on-surface-variant text-sm">/mo</span>
                  </div>
                  <ul className="space-y-4 text-sm text-slate-600 mb-8">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> All Pro features
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Transition roadmaps
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Priority processing
                    </li>
                  </ul>
                </div>
                <Link
                  href="/dashboard?upgrade=PREMIUM"
                  className="w-full py-3 rounded-lg border border-slate-200 text-center font-bold text-slate-700 hover:bg-slate-50 transition-all block"
                >
                  Get Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-3xl font-display font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Is my resume secure?',
                  a: 'Absolutely. We encrypt all uploaded resumes and parse them strictly to matching models. We never sell your personal information or share files with unverified parties.',
                },
                {
                  q: 'How does the job scanning work?',
                  a: 'Our AI agent scans target roles and companies across standard datasets, compares skills matching index scores, and compiles optimized suggestions instantly.',
                },
                {
                  q: 'Can I cancel my subscription anytime?',
                  a: 'Yes! You can downgrade or cancel your subscription easily through your billing dashboard. There are no long-term contracts.',
                },
              ].map((faq, index) => (
                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                    className="w-full p-5 text-left font-bold flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined transition-transform">
                      {faqOpen === index ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {faqOpen === index && (
                    <div className="p-5 pt-0 text-sm text-on-surface-variant border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="text-lg font-bold text-primary">JobPilot AI</span>
            <p className="text-xs text-on-surface-variant mt-1">
              © {new Date().getFullYear()} JobPilot AI. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
