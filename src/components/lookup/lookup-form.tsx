"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface LookupFormProps {
  onSearch: (claimNumber: string, reference: string) => void;
  isLoading?: boolean;
}

export function LookupForm({ onSearch, isLoading }: LookupFormProps) {
  const [claimNumber, setClaimNumber] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!claimNumber.trim()) {
      setError("Please enter a claim number");
      return;
    }
    onSearch(claimNumber.trim().toUpperCase(), reference.trim());
  };

  const inputClass =
    "w-full h-10 px-3 border border-border bg-white text-sm rounded-md outline-none transition-colors placeholder:text-secondary focus:border-foreground focus:ring-1 focus:ring-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label
          htmlFor="lookup-claim"
          className="block text-xs font-semibold text-foreground mb-1.5"
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
          className="block text-xs font-semibold text-foreground mb-1.5"
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
        <p className="mt-1.5 text-xs text-secondary">
          Use the reference provided when your case was created.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-brand/20 bg-brand-light p-3 text-sm text-brand">
          {error}
        </div>
      )}

<button
  type="submit"
  disabled={isLoading}
  style={{
    background: "linear-gradient(to right, #A3A3A3, #7B7878, #A3A3A3)",
    border: ".5px solid #707070",
    color: "#FFFFFF",
  }}
  className="btn-dark h-10 w-full flex items-center justify-center gap-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Searching…
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
