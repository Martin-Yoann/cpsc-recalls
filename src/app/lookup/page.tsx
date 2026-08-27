"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";

import { caseStatusLookup, type CaseStatusLookupOk } from "@/lib/api-client";
import { LookupForm } from "@/components/lookup/lookup-form";
import { LookupResult } from "@/components/lookup/lookup-result";
import { cn } from "@/lib/utils";

// The contract returns an identical 404 for an unknown reference and a
// mismatched email, so both cases share one neutral message by design.
const NOT_FOUND_MESSAGE = {
  title: "No matching record found.",
  body: "Check your case reference and email address and try again.",
};

export default function LookupPage() {
  const [result, setResult] = useState<CaseStatusLookupOk | null>(null);
  const [failure, setFailure] = useState<typeof NOT_FOUND_MESSAGE | null>(null);
  const [genericError, setGenericError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (caseReference: string, email: string) => {
    setIsLoading(true);
    setResult(null);
    setFailure(null);
    setGenericError(null);

    try {
      const response = await caseStatusLookup({ caseReference, email });

      if (response.ok) {
        setResult(response.data);
        return;
      }

      if (response.status === 404) {
        setFailure(NOT_FOUND_MESSAGE);
        return;
      }

      setGenericError(
        response.status === 429
          ? "Too many attempts. Please wait about a minute and try again."
          : `Something went wrong while checking your case. Please try again shortly.${response.error.requestId ? ` Request ID: ${response.error.requestId}` : ""}`,
      );
    } catch {
      setGenericError("Could not reach the recall service. Please try again shortly.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="container-content flex min-h-[calc(100vh-64px)] items-center justify-center py-12 sm:py-16">
        <section className="w-full max-w-[560px]">

          {/* =================================================
              Header
          ================================================== */}

          <div className="text-center">

            <div
              className={cn(
                "mx-auto inline-flex items-center gap-2",
                "text-[12px] font-medium",
                "text-[#163A5F]"
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>KOI Recall</span>
            </div>

            <h1
              className={cn(
                "mt-4",
                "text-[34px] leading-[1.1]",
                "font-bold tracking-[-0.025em]",
                "text-slate-900",
                "sm:text-[40px]"
              )}
            >
              Check your recall status
            </h1>

            <p
              className={cn(
                "mx-auto mt-3 max-w-md",
                "text-[15px] leading-6",
                "text-slate-500"
              )}
            >
              Enter your case reference and the email you filed with
              to view your case.
            </p>
          </div>

          {/* =================================================
              Result / Lookup Form
          ================================================== */}

          <div
            className={cn(
              "mt-8",
              "rounded-[4px]",
              "border border-slate-200",
              "bg-white",
              "p-6",
              "shadow-[0_4px_18px_rgba(15,23,42,0.05)]",
              result ? "sm:p-8" : "sm:p-8"
            )}
          >
            {result ? (
              <LookupResult result={result} />
            ) : (
              <>
                <LookupForm
                  onSearch={handleSearch}
                  isLoading={isLoading}
                />

                {/* Not Found (identical response for unknown reference or
                    mismatched email — one message for both by design). */}

                {failure && (
                  <div
                    className={cn(
                      "mt-4",
                      "border border-slate-200",
                      "rounded-[3px]",
                      "bg-slate-50",
                      "px-4 py-3"
                    )}
                  >
                    <p className="text-[13px] font-semibold text-slate-800">
                      {failure.title}
                    </p>

                    <p className="mt-0.5 text-[12px] leading-5 text-slate-500">
                      {failure.body}
                    </p>
                  </div>
                )}

                {genericError && (
                  <div
                    className={cn(
                      "mt-4",
                      "border border-red-200",
                      "rounded-[3px]",
                      "bg-red-50",
                      "px-4 py-3"
                    )}
                  >
                    <p className="text-[13px] leading-5 text-red-700">
                      {genericError}
                    </p>
                  </div>
                )}

                {/* Security */}

                <div
                  className={cn(
                    "mt-5 flex items-start gap-2",
                    "border-t border-slate-200",
                    "pt-4"
                  )}
                >
                  <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                  <p className="text-[11px] leading-5 text-slate-500">
                    Your information is encrypted and only used
                    to locate your recall record.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* =================================================
              Secondary Action
          ================================================== */}

          {!result && (
            <div className="mt-6 text-center">
              <span className="text-[13px] text-slate-500">
                Don`&apos;t have a claim yet?
              </span>{" "}

              <Link
                href="/recalls/music-lollipop-demo-2026"
                className={cn(
                  "inline-flex items-center gap-1",
                  "text-[13px] font-semibold",
                  "text-[#163A5F]",
                  "transition-colors",
                  "hover:text-[#1D4F7A]"
                )}
              >
                File a new claim
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
