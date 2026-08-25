'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface LookupFormProps {
  onSearch: (claimNumber: string, reference: string) => void;
  isLoading?: boolean;
}

export function LookupForm({ onSearch, isLoading }: LookupFormProps) {
  const [claimNumber, setClaimNumber] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!claimNumber.trim()) {
      setError('Please enter a claim number');
      return;
    }

    onSearch(claimNumber.trim().toUpperCase(), reference.trim());
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

      <div>
        <label
          htmlFor="lookup-reference"
          className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-text-primary"
        >
          Reference Number
        </label>
        <input
          id="lookup-reference"
          className={inputClass}
          type="text"
          placeholder="Your claim or case reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          disabled={isLoading}
        />
        <p className="mt-2 text-xs leading-relaxed text-text-tertiary">
          Use the reference provided when your case was created.
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
  className={`
    relative flex w-full items-center justify-center gap-2 
    rounded-lg bg-brand-teal py-3.5 px-6 
    text-sm font-bold uppercase tracking-wider 
    text-gray-900 shadow-md
    transition-all duration-200 ease-in-out
    hover:shadow-lg hover:brightness-105
    active:scale-[0.98] active:shadow-sm
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2
    disabled:pointer-events-none disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none
    ${isLoading ? 'cursor-wait' : 'cursor-pointer'}
  `}
>
  {isLoading ? (
    <>
      <Loader2 className="h-5 w-5 animate-spin text-gray-700" />
      <span>Searching…</span>
    </>
  ) : (
    <>
      <Search className="h-4 w-4" />
      <span>Check Status</span>
    </>
  )}
</button>
    </form>
  );
}
