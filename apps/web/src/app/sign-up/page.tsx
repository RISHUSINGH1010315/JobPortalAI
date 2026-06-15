'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${apiBaseUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create account.');
      } else {
        // Save JWT to localStorage
        localStorage.setItem('jobpilot_token', data.token);
        localStorage.setItem('jobpilot_user', JSON.stringify(data.user));
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Connection to backend API failed. Ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden select-none font-sans">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-200 to-blue-100 rounded-full blur-3xl opacity-40 z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-purple-200 to-purple-100 rounded-full blur-3xl opacity-40 z-0 animate-pulse"></div>

      <main className="w-full max-w-[440px] z-10 space-y-6 text-left">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="text-3xl font-display font-bold text-primary tracking-tight block">
            JobPilot AI
          </Link>
          <p className="text-xs text-on-surface-variant mt-1.5 font-semibold">
            Your autonomous career growth partner
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-2xl p-8 bg-white/80 border border-slate-200 shadow-xl backdrop-blur-md">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-center">Create Your Account</h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg font-semibold text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-primary-container transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs"
              >
                {loading ? 'Creating Account...' : 'Get Started'}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center">
          <p className="text-xs text-on-surface-variant font-medium">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
