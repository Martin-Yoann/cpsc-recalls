'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LookupFormProps {
  onSearch: (claimNumber: string, phone: string) => void;
  isLoading?: boolean;
}

export function LookupForm({ onSearch, isLoading }: LookupFormProps) {
  const [claimNumber, setClaimNumber] = useState('KOI-2512-1842');
  const [phone, setPhone] = useState('13812341234');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!claimNumber.trim()) {
      setError('Please enter a claim number');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a phone number');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    onSearch(claimNumber.trim().toUpperCase(), phone.trim());
  };

  const inputClass =
    'w-full border-0 border-b-2 border-transparent focus:border-emerald-600 focus:ring-0 rounded-t px-4 py-3 text-base transition-colors outline-none';
  const inputBg = { background: 'rgba(0,53,39,0.05)' };
  const labelStyle = { color: '#003527' };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Claim Number */}
      <div>
        <label
          htmlFor="lookup-claim"
          className="block text-sm font-medium tracking-[0.05em] uppercase mb-2"
          style={labelStyle}
        >
          Claim Number
        </label>
        <input
          id="lookup-claim"
          className={inputClass}
          style={inputBg}
          type="text"
          placeholder="e.g., KOI-1234-5678"
          value={claimNumber}
          onChange={(e) => setClaimNumber(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="lookup-phone"
          className="block text-sm font-medium tracking-[0.05em] uppercase mb-2"
          style={labelStyle}
        >
          Phone Number
        </label>
        <input
          id="lookup-phone"
          className={inputClass}
          style={inputBg}
          type="tel"
          placeholder="Your registered phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs mt-2" style={{ color: 'rgba(64,73,68,0.7)' }}>
          Used to verify your identity and protect your information
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: '#ffdad6', color: '#93000a', border: '1px solid rgba(186,26,26,0.2)' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium tracking-[0.05em] uppercase transition-colors cursor-pointer btn-lift btn-press disabled:opacity-50"
        style={{ background: '#003527', color: '#ffffff' }}
        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,53,39,0.9)'; }}
        onMouseOut={(e) => { e.currentTarget.style.background = '#003527'; }}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Check Status
          </>
        )}
      </button>
    </form>
  );
}
