'use client';

import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [],
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    subscriptionPlan: 'FREE',
    headline: '',
    twitterUrl: '',
    agentActive: true,
    agentTargetRoles: [],
    agentTargetLocations: [],
    agentMinSalary: '',
    agentJobTypes: [],
    agentMatchThreshold: 70,
    agentScanFrequency: 'DAILY',
    agentAutoApply: false,
    notifyOnMatches: true,
    notifyOnApplications: true,
    notifyOnInterviews: true,
    resumes: [],
  });

  const [activeTab, setActiveTab] = useState<
    'personal' | 'agent' | 'skills' | 'resume' | 'social' | 'notifications' | 'security' | 'subscription'
  >('personal');

  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // Security Form States
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Resume Upload States
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeMsg, setResumeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // General States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const apiBaseUrl = 'http://localhost:4000/api';

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/profile`, { headers });
      if (res.ok) {
        const data = await res.json();
        const prof = data.profile || {};
        setProfile({
          name: prof.name || '',
          email: prof.email || '',
          phone: prof.phone || '',
          location: prof.location || '',
          summary: prof.summary || '',
          skills: prof.skills || [],
          githubUrl: prof.githubUrl || '',
          linkedinUrl: prof.linkedinUrl || '',
          portfolioUrl: prof.portfolioUrl || '',
          subscriptionPlan: prof.subscriptionPlan || 'FREE',
          headline: prof.headline || '',
          twitterUrl: prof.twitterUrl || '',
          agentActive: prof.agentActive !== undefined ? prof.agentActive : true,
          agentTargetRoles: prof.agentTargetRoles || [],
          agentTargetLocations: prof.agentTargetLocations || [],
          agentMinSalary: prof.agentMinSalary || '',
          agentJobTypes: prof.agentJobTypes || [],
          agentMatchThreshold: prof.agentMatchThreshold || 70,
          agentScanFrequency: prof.agentScanFrequency || 'DAILY',
          agentAutoApply: prof.agentAutoApply !== undefined ? prof.agentAutoApply : false,
          notifyOnMatches: prof.notifyOnMatches !== undefined ? prof.notifyOnMatches : true,
          notifyOnApplications: prof.notifyOnApplications !== undefined ? prof.notifyOnApplications : true,
          notifyOnInterviews: prof.notifyOnInterviews !== undefined ? prof.notifyOnInterviews : true,
          resumes: prof.resumes || [],
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  // Helper arrays update
  const addSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSkill.trim()) return;
    if (profile.skills.includes(newSkill.trim())) {
      setNewSkill('');
      return;
    }
    setProfile((prev: any) => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()],
    }));
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((s: string) => s !== skillToRemove),
    }));
  };

  const addRole = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newRole.trim()) return;
    if (profile.agentTargetRoles.includes(newRole.trim())) {
      setNewRole('');
      return;
    }
    setProfile((prev: any) => ({
      ...prev,
      agentTargetRoles: [...prev.agentTargetRoles, newRole.trim()],
    }));
    setNewRole('');
  };

  const removeRole = (roleToRemove: string) => {
    setProfile((prev: any) => ({
      ...prev,
      agentTargetRoles: prev.agentTargetRoles.filter((r: string) => r !== roleToRemove),
    }));
  };

  const addLocation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newLocation.trim()) return;
    if (profile.agentTargetLocations.includes(newLocation.trim())) {
      setNewLocation('');
      return;
    }
    setProfile((prev: any) => ({
      ...prev,
      agentTargetLocations: [...prev.agentTargetLocations, newLocation.trim()],
    }));
    setNewLocation('');
  };

  const removeLocation = (locToRemove: string) => {
    setProfile((prev: any) => ({
      ...prev,
      agentTargetLocations: prev.agentTargetLocations.filter((l: string) => l !== locToRemove),
    }));
  };

  const handleJobTypeToggle = (type: string) => {
    const exists = profile.agentJobTypes.includes(type);
    let updated = [...profile.agentJobTypes];
    if (exists) {
      updated = updated.filter((t) => t !== type);
    } else {
      updated.push(type);
    }
    handleInputChange('agentJobTypes', updated);
  };

  // Submit profile settings
  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
        localStorage.setItem('jobpilot_user', JSON.stringify(data.profile));
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection failed. Ensure the server is online.' });
    } finally {
      setSaving(false);
    }
  };

  // Password reset handler
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/auth/change-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Network request failed. Try again.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  // Upload new resume handler
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setResumeMsg(null);

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

      const data = await res.json();
      if (res.ok) {
        setResumeMsg({ type: 'success', text: 'Resume uploaded and parsed successfully!' });
        fetchProfile(); // Reload user profile settings containing the latest resume details
      } else {
        setResumeMsg({ type: 'error', text: data.error || 'Failed to process resume.' });
      }
    } catch (err) {
      setResumeMsg({ type: 'error', text: 'Upload failed. Check your file format.' });
    } finally {
      setUploadingResume(false);
    }
  };

  // Plan trigger handler
  const triggerCheckout = async (plan: 'PRO' | 'PREMIUM' | 'FREE') => {
    try {
      const token = localStorage.getItem('jobpilot_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiBaseUrl}/billing/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ plan }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (err) {
      console.error('Plan checkout failed:', err);
    }
  };

  const tabs = [
    { id: 'personal', name: 'Personal Profile', icon: 'person' },
    { id: 'agent', name: 'AI Search Agent', icon: 'smart_toy' },
    { id: 'skills', name: 'Skills & Strengths', icon: 'workspace_premium' },
    { id: 'resume', name: 'Resume Manager', icon: 'description' },
    { id: 'social', name: 'Social Links', icon: 'share' },
    { id: 'notifications', name: 'Notifications', icon: 'notifications' },
    { id: 'security', name: 'Security', icon: 'lock' },
    { id: 'subscription', name: 'Subscription Plan', icon: 'credit_card' },
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-20 text-center font-bold text-slate-400 animate-pulse">
        Loading settings portal...
      </div>
    );
  }

  const latestResume = profile.resumes && profile.resumes[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left">
      {/* Header Panel */}
      <header className="flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6 border-b border-slate-100">
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-indigo-50 text-primary font-bold flex items-center justify-center text-4xl shadow-inner border-4 border-white">
            {profile.name ? profile.name[0].toUpperCase() : 'U'}
          </div>
          <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary rounded-full border-4 border-white flex items-center justify-center shadow-md cursor-pointer hover:scale-115 transition-transform">
            <span className="material-symbols-outlined text-white text-[14px]">edit</span>
          </div>
        </div>

        <div className="text-center sm:text-left flex-grow">
          <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2">
            <h2 className="text-xl font-bold text-slate-900 leading-snug">{profile.name || 'JobPilot User'}</h2>
            {profile.subscriptionPlan && (
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                profile.subscriptionPlan === 'PREMIUM'
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : profile.subscriptionPlan === 'PRO'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                {profile.subscriptionPlan} Member
              </span>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-1 max-w-xl">
            {profile.headline || 'Update your profile headline under Personal Profile.'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xl italic line-clamp-1">
            "{profile.summary || 'Describe your expertise in the Professional Summary.'}"
          </p>
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          message.type === 'success'
            ? 'bg-green-50 border-green-100 text-green-700'
            : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Settings Body */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMessage(null);
                  setPasswordMsg(null);
                  setResumeMsg(null);
                }}
                className={`w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-left ${
                  active
                    ? 'bg-primary text-white shadow-md shadow-primary/15'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </aside>

        {/* Settings Panel Content */}
        <div className="md:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[420px] flex flex-col justify-between">
          
          <div className="space-y-6">
            
            {/* 1. PERSONAL PROFILE */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Personal Information</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Edit your generic contact details and professional summary.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="headline">Headline</label>
                    <input
                      type="text"
                      id="headline"
                      value={profile.headline}
                      placeholder="e.g. Senior Full-Stack Engineer"
                      onChange={(e) => handleInputChange('headline', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      value={profile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="summary">Professional Summary</label>
                  <textarea
                    id="summary"
                    rows={4}
                    value={profile.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Describe your goals, experience, and core skills..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold resize-none"
                  ></textarea>
                </div>
              </div>
            )}

            {/* 2. AI SEARCH AGENT */}
            {activeTab === 'agent' && (
              <div className="space-y-6 relative min-h-[300px]">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Autonomous Agent Preferences</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Configure how the AI agent matches and submits applications on your behalf.</p>
                </div>

                {profile.subscriptionPlan === 'FREE' ? (
                  /* Free lock overlay */
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center border border-slate-100 rounded-2xl">
                    <div className="max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
                      <span className="material-symbols-outlined text-3xl text-indigo-600">lock</span>
                      <h3 className="text-xs font-bold text-slate-800 font-display">AI Job Search Agent requires PRO or PREMIUM</h3>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        Unlock autonomous background matching, target role tags, target locations, minimum salary filters, and custom frequency scans.
                      </p>
                      <button
                        type="button"
                        onClick={() => triggerCheckout('PRO')}
                        className="bg-primary text-white text-[10px] font-bold py-2.5 px-6 rounded-xl hover:brightness-110 active:scale-95 transition-all inline-flex items-center gap-1.5 shadow-md"
                      >
                        Upgrade to Pro ($29/mo)
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Agent Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-indigo-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                      Background Agent Matcher
                    </p>
                    <p className="text-[10px] text-slate-500">Autonomous search will run scan queries periodically when active.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInputChange('agentActive', !profile.agentActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      profile.agentActive ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        profile.agentActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Target Job Titles */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Job Titles</label>
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {profile.agentTargetRoles.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No target roles defined.</span>
                    ) : (
                      profile.agentTargetRoles.map((role: string, idx: number) => (
                        <span key={idx} className="bg-primary/5 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/15 flex items-center gap-1">
                          {role}
                          <button type="button" onClick={() => removeRole(role)} className="hover:text-red-500 font-bold">&times;</button>
                        </span>
                      ))
                    )}
                  </div>
                  <form onSubmit={addRole} className="flex gap-2">
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Frontend Engineer, Technical Product Manager"
                      className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                    <button type="button" onClick={() => addRole()} className="bg-primary text-white text-xs font-bold px-4 rounded-xl hover:brightness-110">Add</button>
                  </form>
                </div>

                {/* Target Locations */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Job Locations</label>
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {profile.agentTargetLocations.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No locations added yet.</span>
                    ) : (
                      profile.agentTargetLocations.map((loc: string, idx: number) => (
                        <span key={idx} className="bg-slate-50 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                          {loc}
                          <button type="button" onClick={() => removeLocation(loc)} className="hover:text-red-500 font-bold">&times;</button>
                        </span>
                      ))
                    )}
                  </div>
                  <form onSubmit={addLocation} className="flex gap-2">
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Remote, San Francisco, London"
                      className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                    <button type="button" onClick={() => addLocation()} className="bg-primary text-white text-xs font-bold px-4 rounded-xl hover:brightness-110">Add</button>
                  </form>
                </div>

                {/* Min Salary & Scan Frequency */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="salary">Minimum Target Salary (Annual)</label>
                    <input
                      type="text"
                      id="salary"
                      placeholder="e.g. $120,000"
                      value={profile.agentMinSalary}
                      onChange={(e) => handleInputChange('agentMinSalary', e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="scan">Agent Scan Frequency</label>
                    <select
                      id="scan"
                      value={profile.agentScanFrequency}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'REALTIME' && profile.subscriptionPlan !== 'PREMIUM') {
                          alert('Real-time scans require a Premium subscription.');
                          return;
                        }
                        handleInputChange('agentScanFrequency', val);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-semibold"
                    >
                      <option value="REALTIME">Real-time (PREMIUM Only)</option>
                      <option value="HOURLY">Hourly (PRO/PREMIUM Only)</option>
                      <option value="DAILY">Daily (Free/Pro/Premium)</option>
                      <option value="WEEKLY">Weekly</option>
                    </select>
                  </div>
                </div>

                {/* Match Score Threshold Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>Minimum Match Score Threshold</span>
                    <span className="text-primary font-extrabold text-xs">{profile.agentMatchThreshold}% Match</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={profile.agentMatchThreshold}
                    onChange={(e) => handleInputChange('agentMatchThreshold', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <p className="text-[10px] text-slate-400">Matches below this score will be ignored. Pro members see higher density matching.</p>
                </div>

                {/* Auto-Apply Toggle */}
                <div className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100 relative">
                  <div className="space-y-0.5 pr-20">
                    <p className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                      Autonomous Auto-Apply Submissions
                      {profile.subscriptionPlan !== 'PREMIUM' && (
                        <span className="material-symbols-outlined text-[14px] text-amber-500 font-bold">lock</span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-500">Enable direct application submissions through parsed ATS algorithms when target matches exceed score.</p>
                  </div>
                  <button
                    type="button"
                    disabled={profile.subscriptionPlan !== 'PREMIUM'}
                    onClick={() => handleInputChange('agentAutoApply', !profile.agentAutoApply)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                      profile.agentAutoApply && profile.subscriptionPlan === 'PREMIUM' ? 'bg-emerald-600' : 'bg-slate-200'
                    } ${profile.subscriptionPlan !== 'PREMIUM' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        profile.agentAutoApply && profile.subscriptionPlan === 'PREMIUM' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  {profile.subscriptionPlan !== 'PREMIUM' && (
                    <div className="absolute right-16 top-1/2 -translate-y-1/2">
                      <button
                        type="button"
                        onClick={() => triggerCheckout('PREMIUM')}
                        className="px-2.5 py-1 bg-amber-500 text-white font-extrabold text-[8px] rounded-lg uppercase hover:brightness-110 active:scale-95 transition-all shadow-sm"
                      >
                        Unlock Premium
                      </button>
                    </div>
                  )}
                </div>

                {/* Job Types Preference */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred Employment Types</label>
                  <div className="flex flex-wrap gap-4 py-1">
                    {['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'].map((type) => {
                      const active = profile.agentJobTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleJobTypeToggle(type)}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            active
                              ? 'bg-primary/5 border-primary text-primary'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {active ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 3. RESUME MANAGER */}
            {activeTab === 'resume' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Resume & Credentials Management</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Upload, replace, and review the parsed content of your ATS profile resume.</p>
                </div>

                {resumeMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold border ${
                    resumeMsg.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                  }`}>
                    {resumeMsg.text}
                  </div>
                )}

                {/* Current Active Resume Details */}
                {latestResume ? (
                  <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold">
                          PDF
                        </div>
                        <div>
                          <p className="font-bold text-xs text-slate-800 line-clamp-1">{latestResume.fileName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Uploaded on {new Date(latestResume.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {latestResume.atsScore && (
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            ATS: {latestResume.atsScore}/100
                          </span>
                        </div>
                      )}
                    </div>

                    {latestResume.parsedContent && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                        <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Parsed Resume Summary</h4>
                        <div className="text-xs text-slate-600 space-y-2">
                          <p>
                            <span className="font-semibold text-slate-700">Experience:</span>{' '}
                            {typeof latestResume.parsedContent === 'string'
                              ? latestResume.parsedContent
                              : 'AI extracted profile details matched against core roles.'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2.5">
                      <a
                        href={latestResume.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-[11px] text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Download PDF
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                    <span className="material-symbols-outlined text-[32px] mb-2 text-slate-300">cloud_upload</span>
                    <p className="text-xs font-bold">No active resume uploaded yet</p>
                    <p className="text-[10px] mt-1">Upload a resume to enable AI matching scoring and automatic applications.</p>
                  </div>
                )}

                {/* Upload Section */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Upload / Replace Resume</label>
                  <label className="border-2 border-dashed border-slate-200 hover:border-primary hover:bg-primary/[0.01] rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                    />
                    <span className="material-symbols-outlined text-[32px] text-primary">upload_file</span>
                    <span className="text-xs font-bold text-slate-700">
                      {uploadingResume ? 'Processing & AI Parsing...' : 'Click to browse files'}
                    </span>
                    <span className="text-[9px] text-slate-400">Accepts PDF, DOCX, TXT (Max size 10MB)</span>
                  </label>
                </div>
              </div>
            )}

            {/* 4. SKILLS & STRENGTHS */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Core Competencies</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Manage key skills evaluated by the ATS matching engine.</p>
                </div>

                <div className="flex flex-wrap gap-2 py-2">
                  {profile.skills.length === 0 ? (
                    <span className="text-xs text-slate-400 italic font-semibold">No skills added yet. Add skills below.</span>
                  ) : (
                    profile.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-primary/20"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-500 font-bold leading-none text-sm transition-colors"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>

                <form onSubmit={addSkill} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Add more skills</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g. Next.js, Docker, Kubernetes"
                      className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => addSkill()}
                      className="bg-primary text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:brightness-110 active:scale-95 transition-all"
                    >
                      Add
                    </button>
                  </div>
                </form>

                {/* Recommendation Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="bg-gradient-to-tr from-purple-50/50 to-indigo-50/30 border border-purple-100 rounded-2xl p-5 text-left">
                    <h4 className="font-bold text-[10px] text-purple-700 uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">psychology</span>
                      AI Recommendation
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      Based on current job scans in your target market, adding keywords like **Kubernetes** and **Next.js** to your skills list would lift your profile match probability by **24%**.
                    </p>
                  </div>

                  <div className="bg-gradient-to-tr from-emerald-50/50 to-teal-50/30 border border-emerald-100 rounded-2xl p-5 text-left">
                    <h4 className="font-bold text-[10px] text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      Strength Analytics
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      Your core skills profile in backend distributed databases puts you in the top **5%** of active applicants targeting senior cloud architecture roles.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SOCIAL LINKS */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Professional Portfolios</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Link your online code repository, profile networks, and website portfolios.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="github">GitHub Profile URL</label>
                    <input
                      type="url"
                      id="github"
                      value={profile.githubUrl}
                      onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="linkedin">LinkedIn Profile URL</label>
                    <input
                      type="url"
                      id="linkedin"
                      value={profile.linkedinUrl}
                      onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="twitter">Twitter / X URL</label>
                    <input
                      type="url"
                      id="twitter"
                      value={profile.twitterUrl}
                      onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                      placeholder="https://x.com/username"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="portfolio">Personal Portfolio URL</label>
                    <input
                      type="url"
                      id="portfolio"
                      value={profile.portfolioUrl}
                      onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Notification Preferences</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Control which updates are triggered to your registered email account.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <p className="font-bold text-xs text-slate-800">New Job Match Alerts</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Notify me immediately when a scanned job exceeds my match threshold.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('notifyOnMatches', !profile.notifyOnMatches)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        profile.notifyOnMatches ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        profile.notifyOnMatches ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <p className="font-bold text-xs text-slate-800">Application Progress Updates</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Trigger notification updates when an application moves through your Kanban tracker.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('notifyOnApplications', !profile.notifyOnApplications)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        profile.notifyOnApplications ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        profile.notifyOnApplications ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <div>
                      <p className="font-bold text-xs text-slate-800">Interview Prep Brief Alerts</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Get email alerts when new AI coaching study guides are compiled for interviews.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('notifyOnInterviews', !profile.notifyOnInterviews)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        profile.notifyOnInterviews ? 'bg-primary' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        profile.notifyOnInterviews ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 7. SECURITY */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Account Security</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Manage authentication credentials and password settings.</p>
                </div>

                {passwordMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold border ${
                    passwordMsg.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                  }`}>
                    {passwordMsg.text}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="currPass">Current Password</label>
                    <input
                      type="password"
                      id="currPass"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="newPass">New Password</label>
                    <input
                      type="password"
                      id="newPass"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="confPass">Confirm New Password</label>
                    <input
                      type="password"
                      id="confPass"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="bg-primary text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-md"
                    >
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-[10px] text-red-500 uppercase tracking-wider">Danger Zone</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Permanently remove your data, agent match configurations, and application logs.</p>
                  <button
                    type="button"
                    onClick={() => alert('To delete your account, contact support@jobpilot.ai')}
                    className="mt-3 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold text-xs hover:bg-red-100/50 transition-colors"
                  >
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

            {/* 8. SUBSCRIPTION PLAN */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Subscription & Billing</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Check plan levels, active limits, and billing method summaries.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                  
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <div className="px-2.5 py-0.5 bg-primary text-white font-extrabold text-[8px] rounded-full w-fit mb-3 tracking-wider uppercase">
                        Active Plan
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {profile.subscriptionPlan} Tier
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-semibold">
                        {profile.subscriptionPlan === 'PREMIUM'
                          ? '$49 / month — Automatic matching priority'
                          : profile.subscriptionPlan === 'PRO'
                          ? '$29 / month — 15 minute scans'
                          : 'Free Account — Basic matched jobs'}
                      </p>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {profile.subscriptionPlan !== 'FREE' && (
                        <button
                          type="button"
                          onClick={() => triggerCheckout('FREE')}
                          className="px-4 py-2 border border-slate-200 bg-white rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all"
                        >
                          Downgrade to Free
                        </button>
                      )}
                      
                      {profile.subscriptionPlan !== 'PREMIUM' && (
                        <button
                          type="button"
                          onClick={() => triggerCheckout(profile.subscriptionPlan === 'PRO' ? 'PREMIUM' : 'PRO')}
                          className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs shadow-md hover:brightness-110 transition-all"
                        >
                          Upgrade Plan
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plan Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                  <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-2">
                    <p className="font-extrabold text-[10px] text-slate-400 uppercase">Free</p>
                    <p className="font-bold text-sm text-slate-800">$0 /mo</p>
                    <ul className="text-[10px] text-slate-500 space-y-1 list-disc list-inside">
                      <li>Daily matching scans</li>
                      <li>Manual application tracker</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-xl bg-blue-50/10 space-y-2 relative">
                    <span className="absolute -top-2 right-2 bg-blue-500 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded-full">POPULAR</span>
                    <p className="font-extrabold text-[10px] text-blue-500 uppercase">Pro</p>
                    <p className="font-bold text-sm text-slate-800">$29 /mo</p>
                    <ul className="text-[10px] text-slate-500 space-y-1 list-disc list-inside">
                      <li>Hourly matching scans</li>
                      <li>50 auto-applies/week</li>
                      <li>AI resume customizers</li>
                    </ul>
                  </div>

                  <div className="p-4 border border-purple-200 rounded-xl bg-purple-50/10 space-y-2">
                    <p className="font-extrabold text-[10px] text-purple-500 uppercase">Premium</p>
                    <p className="font-bold text-sm text-slate-800">$49 /mo</p>
                    <ul className="text-[10px] text-slate-500 space-y-1 list-disc list-inside">
                      <li>Real-time matching scans</li>
                      <li>Unlimited auto-applies</li>
                      <li>Tailored priority agents</li>
                    </ul>
                  </div>
                </div>

                {/* Card Payment Info */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Payment Method Details</h4>
                  <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-7 bg-slate-900 rounded flex items-center justify-center font-bold text-[9px] text-white tracking-wider">
                        VISA
                      </div>
                      <div>
                        <p className="font-bold text-xs text-slate-800">Visa ending in 4242</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Expires 04/2028</p>
                      </div>
                    </div>
                    <button type="button" className="text-primary font-bold text-xs hover:underline">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Action Footer for generic forms */}
          {activeTab !== 'security' && activeTab !== 'subscription' && activeTab !== 'resume' && (
            <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={fetchProfile}
                className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Discard Changes
              </button>
              
              <button
                type="button"
                onClick={saveProfile}
                disabled={saving}
                className="bg-primary text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-md hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
