"use client";
import { useI18n } from "@/lib/i18n/provider";


import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

// Mirrors the contract pattern ^KOI-[A-Z0-9]{4}-[A-Z0-9]{8}$ (server-side
// normalization uppercases the reference before HMAC comparison).
const CASE_REFERENCE_PATTERN = /^KOI-[A-Z0-9]{4}-[A-Z0-9]{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LookupFormProps {
  onSearch: (caseReference: string, email: string) => void;
  isLoading?: boolean;
}

export function LookupForm({ onSearch, isLoading }: LookupFormProps) {
  const { t } = useI18n();
  const [caseReference, setCaseReference] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedReference = caseReference.trim().toUpperCase();
    const trimmedEmail = email.trim();

    if (!CASE_REFERENCE_PATTERN.test(normalizedReference) || !EMAIL_PATTERN.test(trimmedEmail)) {
      setError("ui.enter.your.case.reference.in.the.koi.939c54");
      return;
    }

    onSearch(normalizedReference, trimmedEmail);
  };

  const inputClass =
    "w-full h-10 px-3 border border-border bg-white text-sm rounded-md outline-none transition-colors placeholder:text-secondary focus:border-foreground focus:ring-1 focus:ring-foreground";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div>
        <label
          htmlFor="lookup-case-reference"
          className="block text-xs font-semibold text-foreground mb-1.5"
        >
          {t("ui.case.reference.4461c6")}</label>
        <input
          id="lookup-case-reference"
          className={inputClass}
          type="text"
          placeholder="KOI-1234-56789012"
          autoComplete="off"
          value={caseReference}
          onChange={(e) => setCaseReference(e.target.value.toUpperCase())}
          disabled={isLoading}
        />
        <p className="mt-1.5 text-xs text-secondary">
          {t("ui.shown.on.your.confirmation.screen.and.email.c94962")}</p>
      </div>

      <div>
        <label
          htmlFor="lookup-email"
          className="block text-xs font-semibold text-foreground mb-1.5"
        >
          {t("ui.email.address.09ba55")}</label>
        <input
          id="lookup-email"
          className={inputClass}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <p className="mt-1.5 text-xs text-secondary">
          {t("ui.used.only.to.verify.this.combination.never.e83868")}</p>
      </div>

      {error && (
        <div className="rounded-md border border-brand/20 bg-brand-light p-3 text-sm text-brand">
          {t(error)}
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
      {t("ui.searching.1a6a5b")}</>
  ) : (
    <>
      <Search className="h-4 w-4" />
      {t("nav.checkStatus")}</>
  )}
</button>
    </form>
  );
}
