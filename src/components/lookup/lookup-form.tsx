'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface LookupFormProps {
  onSearch: (claimNumber: string, phone: string) => void;
  isLoading?: boolean;
}

export function LookupForm({ onSearch, isLoading }: LookupFormProps) {
  const [claimNumber, setClaimNumber] = useState('KOI-0001');
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
    'w-full rounded-md border border-input bg-surface-secondary px-3 py-3 text-base text-text-primary transition-colors outline-none placeholder:text-text-tertiary focus:border-ring focus:ring-2 focus:ring-ring/20';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Claim Number */}
      <div>
        <label
          htmlFor="lookup-claim"
          className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-text-primary"
        >
          Claim Number
        </label>
        <input
          id="lookup-claim"
          className={inputClass}
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
          className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-text-primary"
        >
          Phone Number
        </label>
        <input
          id="lookup-phone"
          className={inputClass}
          type="tel"
          placeholder="Your registered phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isLoading}
        />
        <p className="mt-2 text-xs leading-relaxed text-text-tertiary">
          Used to verify your identity and protect your information
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn-lift btn-press flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-brand-teal py-3 text-sm font-bold uppercase tracking-[0.05em] text-white transition-colors hover:bg-blade-resolution-dark disabled:cursor-not-allowed disabled:opacity-50"
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
