'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function UpgradeTracker({ onUpgradeComplete }: { onUpgradeComplete: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  useEffect(() => {
    const token = localStorage.getItem('jobpilot_token');
    if (!token) return;

    const upgrade = searchParams.get('upgrade');
    const paymentSuccess = searchParams.get('payment');

    if (paymentSuccess === 'success') {
      onUpgradeComplete();
      router.push('/dashboard');
    } else if (upgrade) {
      const handleRedirectToCheckout = async () => {
        try {
          const res = await fetch(`${apiBaseUrl}/billing/checkout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ plan: upgrade }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              window.location.href = data.url;
            }
          }
        } catch (err) {
          console.error('Failed to redirect to checkout:', err);
        }
      };
      handleRedirectToCheckout();
    }
  }, [searchParams]);

  return null;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

  const fetchProfileAndNotifications = async () => {
    const token = localStorage.getItem('jobpilot_token');
    if (!token) {
      router.push('/sign-in');
      return;
    }

    try {
      // Get user profile
      const profRes = await fetch(`${apiBaseUrl}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (profRes.ok) {
        const data = await profRes.json();
        setProfile(data.profile);
      } else if (profRes.status === 401) {
        localStorage.removeItem('jobpilot_token');
        router.push('/sign-in');
        return;
      }

      // Get notifications
      const notifRes = await fetch(`${apiBaseUrl}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.warn('Backend API connection offline. Using local storage or mocked states.', err);
      // Mocked default states
      setProfile({
        name: 'JobPilot User',
        email: 'user@jobpilot.ai',
        subscriptionPlan: 'FREE',
      });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('jobpilot_token');
    if (!token) {
      router.push('/sign-in');
    } else {
      setAuthorized(true);
      fetchProfileAndNotifications();
    }
  }, []);

  const markNotificationRead = async (id: string) => {
    const token = localStorage.getItem('jobpilot_token');
    if (!token) return;

    try {
      await fetch(`${apiBaseUrl}/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchProfileAndNotifications();
    } catch (err) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jobpilot_token');
    localStorage.removeItem('jobpilot_user');
    router.push('/sign-in');
  };

  const navItems = [
    { name: 'Matched Jobs', icon: 'work', path: '/dashboard/jobs' },
    { name: 'Resume Analyzer', icon: 'description', path: '/dashboard/resume' },
    { name: 'Tracker Board', icon: 'view_kanban', path: '/dashboard/tracker' },
    { name: 'Career Coach', icon: 'smart_toy', path: '/dashboard/coach' },
    { name: 'Roadmap', icon: 'route', path: '/dashboard/roadmap' },
  ];

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (!authorized) {
    return <div className="p-8 text-center font-bold animate-pulse">Redirecting to Sign In...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Suspense fallback={null}>
        <UpgradeTracker onUpgradeComplete={fetchProfileAndNotifications} />
      </Suspense>
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-surface-container-low border-r border-outline-variant/30 flex flex-col p-6 space-y-6 z-30 shrink-0">
        <div>
          <Link href="/" className="text-2xl font-display font-bold text-primary block">
            JobPilot AI
          </Link>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Dashboard
            </span>
            {profile?.subscriptionPlan && (
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                profile.subscriptionPlan === 'PREMIUM'
                  ? 'bg-purple-100 text-purple-700'
                  : profile.subscriptionPlan === 'PRO'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {profile.subscriptionPlan}
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-semibold text-sm ${
                  active
                    ? 'bg-primary/10 text-primary translate-x-1 shadow-sm'
                    : 'text-on-surface-variant hover:bg-slate-100 hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Upgrade Card if FREE */}
        {profile?.subscriptionPlan === 'FREE' && (
          <div className="bg-gradient-to-tr from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-4 text-center">
            <h5 className="font-bold text-xs">Access Pro Features</h5>
            <p className="text-[11px] text-slate-500 mt-1">Unlock cover letters, career coach & prep briefs.</p>
            <button
              onClick={() => {
                router.push('/checkout?plan=PRO');
              }}
              className="mt-3 bg-primary text-white text-[11px] font-bold py-1.5 px-3 rounded-lg hover:brightness-110 active:scale-95 transition-all w-full"
            >
              Upgrade ($29)
            </button>
          </div>
        )}

        <div className="border-t border-outline-variant/30 pt-4 space-y-1">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-semibold text-xs ${
              pathname === '/dashboard/settings'
                ? 'bg-primary/10 text-primary translate-x-1 shadow-sm'
                : 'text-slate-500 hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">settings</span>
            <span>Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-500 hover:text-on-surface w-full text-left"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 px-8 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-on-surface capitalize">
              {pathname?.split('/').pop()?.replace('-', ' ') || 'Overview'}
            </span>
            {/* Agent Active Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Agent Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 relative">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-on-surface hover:bg-slate-50 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown panel */}
            {showNotifications && (
              <div className="absolute right-12 top-12 w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-40 text-left space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs">Notifications</span>
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          n.isRead ? 'bg-slate-50/50 hover:bg-slate-50' : 'bg-blue-50/50 border-l-2 border-primary hover:bg-blue-50'
                        }`}
                      >
                        <div className="font-semibold">{n.title}</div>
                        <div className="text-slate-500 mt-0.5">{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="h-6 w-px bg-slate-200"></div>

            {/* Profile Detail */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shadow-inner">
                {profile?.name ? profile.name[0] : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold">{profile?.name || 'JobPilot User'}</div>
                <div className="text-[10px] text-slate-400">{profile?.email || 'user@jobpilot.ai'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-grow overflow-y-auto bg-slate-50/50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
