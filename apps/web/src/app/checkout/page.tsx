'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = (searchParams.get('plan') || 'PRO').toUpperCase();

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const planName = plan === 'PREMIUM' ? 'Premium Plan' : 'Pro Plan';
  const planPrice = plan === 'PREMIUM' ? 49 : 29;
  const perks = plan === 'PREMIUM' 
    ? [
        'Real-time priority matching scans',
        'AI Career Coach chatbot assistant',
        'All matching jobs auto AI apply',
        'Unlimited AI customized resumes',
        'Priority agent queues'
      ]
    : [
        'Hourly matching scans',
        'Tailored ATS resume insights',
        '50 AI auto-applies per week',
        'Core analytics tracking'
      ];

  useEffect(() => {
    // Validate token existence
    const token = localStorage.getItem('jobpilot_token');
    if (!token) {
      router.push('/sign-in');
    }
  }, [router]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.substring(0, 16);
    // Add space formatting
    const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length >= 3) {
      setCardExpiry(`${val.substring(0, 2)}/${val.substring(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 3) val = val.substring(0, 3);
    setCardCvc(val);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!cardName.trim()) {
      setErrorMsg('Cardholder name is required.');
      return;
    }
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 16) {
      setErrorMsg('Please enter a valid 16-digit card number.');
      return;
    }
    if (cardExpiry.length < 5) {
      setErrorMsg('Expiry date is invalid.');
      return;
    }
    if (cardCvc.length < 3) {
      setErrorMsg('CVC is invalid.');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('jobpilot_token');
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${apiBaseUrl}/billing/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan,
          cardNumber: cleanCard
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        // Sync local storage copy of profile
        localStorage.setItem('jobpilot_user', JSON.stringify(data.profile));
        
        setTimeout(() => {
          router.push('/dashboard?payment=success');
        }, 1500);
      } else {
        setErrorMsg(data.error || 'Payment declined. Try another card.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to the payment gateway.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-left">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Left column: Plan Info */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-8 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-primary-fixed-dim">JobPilot AI</h2>
            <p className="text-xs text-slate-400 mt-1">Autonomous job search settings & upgrades</p>
            
            <div className="mt-8 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-primary-fixed bg-indigo-800/60 px-2 py-0.5 rounded">
                  Selected Plan
                </span>
                <h3 className="text-2xl font-extrabold mt-2 font-display">{planName}</h3>
              </div>

              <div className="flex items-baseline gap-1.5 pt-2">
                <span className="text-4xl font-extrabold font-display">${planPrice}</span>
                <span className="text-xs text-slate-400 font-semibold">/ month</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Features included:</p>
              {perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-emerald-400 font-bold">check_circle</span>
                  <span className="text-xs text-slate-300 font-semibold">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-semibold mt-8 border-t border-slate-800 pt-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">lock</span>
            Secure encrypted sandbox payment portal
          </div>
        </div>

        {/* Right column: Card Form */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center">
          {success ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <span className="material-symbols-outlined text-3xl font-extrabold">done</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800">Payment Confirmed!</h3>
              <p className="text-xs text-slate-500 font-semibold">Preparing your JobPilot workspace dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitPayment} className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Secure Payment</h3>
                <p className="text-xs text-slate-400 mt-0.5">Please provide your credentials below.</p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl border border-red-100 bg-red-50 text-red-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="cardholder">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardholder"
                    value={cardName}
                    placeholder="Jane Doe"
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="cardnum">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      id="cardnum"
                      value={cardNumber}
                      placeholder="4242 4242 4242 4242"
                      onChange={handleCardNumberChange}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs outline-none focus:border-primary font-semibold"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-300">credit_card</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="expiry">Expiry Date</label>
                    <input
                      type="text"
                      id="expiry"
                      value={cardExpiry}
                      placeholder="MM/YY"
                      onChange={handleExpiryChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-semibold text-center"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase" htmlFor="cvc">CVC Code</label>
                    <input
                      type="password"
                      id="cvc"
                      value={cardCvc}
                      placeholder="•••"
                      onChange={handleCvcChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-semibold text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-grow bg-primary text-white text-xs font-bold py-3 px-6 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {processing ? 'Processing Securely...' : `Pay & Subscribe $${planPrice}`}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
