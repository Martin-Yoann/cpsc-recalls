"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { submitClaim } from "@/lib/shared-claims-store";
import type { Campaign } from "@/types";
import { cn } from "@/lib/utils";
import { size } from "zod";

type FormState = {
  // Personal
  name: string;
  email: string;
  phone: string;
  // Product
  shape: string;
  flavor: string;
  lotCode: string;
  dateCode: string;
  // Remedy
  remedyId: string;
};

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; claimNumber: string }
  | { kind: "error"; message: string };

const STEPS = [
  { id: 0, label: "Your Info", description: "Contact details" },
  { id: 1, label: "Product", description: "Identify your product" },
  { id: 2, label: "Remedy", description: "Choose resolution" },
];

const SHAPE_OPTIONS = ["Bear", "Dinosaur", "Strawberry", "Heart"];
const FLAVOR_OPTIONS = ["Peach", "Strawberry"];

interface Props {
  campaign: Campaign;
}

export function ClaimFormHero({ campaign }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submit, setSubmit] = useState<SubmitState>({ kind: "idle" });
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    shape: "",
    flavor: "",
    lotCode: "",
    dateCode: "",
    remedyId: campaign.remedies[0]?.id ?? "",
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canAdvance = (): boolean => {
    if (step === 0)
      return form.name.trim() !== "" && /.+@.+\..+/.test(form.email);
    if (step === 1)
      return form.lotCode.trim() !== "" && form.dateCode.trim() !== "";
    return form.remedyId !== "";
  };

  const handleSubmit = async () => {
    setSubmit({ kind: "submitting" });
    try {
      const remedy = campaign.remedies.find((r) => r.id === form.remedyId);
      if (!remedy) {
        setSubmit({ kind: "error", message: "Please choose a remedy option." });
        return;
      }
      const claim = await submitClaim({
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        campaignSlug: campaign.slug,
        consumerName: form.name,
        consumerEmail: form.email,
        productName: campaign.affectedProducts[0]?.name ?? "Recalled Product",
        shape: form.shape || undefined,
        flavor: form.flavor || undefined,
        lotCode: form.lotCode,
        dateCode: form.dateCode,
        remedyId: remedy.id,
        remedyTitle: remedy.title,
        remedyType: remedy.type,
        refundAmount: remedy.compensationAmount,
      });
      setSubmit({ kind: "success", claimNumber: claim.claimNumber });
    } catch (e) {
      setSubmit({
        kind: "error",
        message:
          e instanceof Error
            ? e.message
            : "Something went wrong. Please try again.",
      });
    }
  };

  // ── Success view ──
  if (submit.kind === "success") {
    return (
      <div 
       
        className="card-elevated p-6 sm:p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Claim Submitted
            </h3>
            <p className="mt-2 text-sm text-secondary">
              Your claim has been received. Reference number below.
            </p>
          </div>
          <div className="w-full rounded-md bg-surface-dim p-4">
            <p className="label-eyebrow">Claim Reference</p>
            <p className="mt-1 font-mono text-2xl font-bold text-foreground">
              {submit.claimNumber}
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2">
            <button
              onClick={() => router.push("/lookup")}
              className=" w-60 h-12 justify-center"
              style={{
                border: "1px solid #746B6B",
                backgroundColor: "#f5f5f5",
                color: "#333",
                fontWeight: "bold",
              }}
            >
              Track Status
            </button>
            <button
              onClick={() => {
                setSubmit({ kind: "idle" });
                setStep(0);
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  shape: "",
                  flavor: "",
                  lotCode: "",
                  dateCode: "",
                  remedyId: campaign.remedies[0]?.id ?? "",
                });
              }}
              className=" w-60 h-12 btn-dark justify-center"
               style={{
                border: "1px solid #746B6B",
                backgroundColor: "#f5f5f5",
                color: "#333",
                fontWeight: "bold",
              }}
            >
              New Claim
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground">File a New Claim</h3>
        <p className="mt-1 text-sm text-secondary">{campaign.title}</p>
      </div>

      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex-1 flex items-center gap-1.5">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                i < step
                  ? "bg-success text-white"
                  : i === step
                    ? "bg-brand text-white"
                    : "bg-surface-dim text-secondary",
              )}
            >
              {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px flex-1 transition-colors",
                  i < step ? "bg-success" : "bg-surface-dim-strong",
                )}
              />
            )}
          </div>
        ))}
      </div>

      <p className="label-eyebrow mb-4">
        Step {step + 1} of {STEPS.length} · {STEPS[step].label}
      </p>

      {/* Step content */}
      <div className="space-y-4 min-h-[260px]">
        {step === 0 && (
          <>
            <Field label="Full Name" required>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="your name"
                className="w-full h-10 px-3 border border-border bg-white text-sm rounded-md focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
              />
            </Field>
            <Field label="Email Address" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="your@example.com"
                className="w-full h-10 px-3 border border-border bg-white text-sm rounded-md focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
              />
            </Field>
            <Field
              label="Phone Number"
              hint="Optional — for SMS status updates"
            >
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full h-10 px-3 border border-border bg-white text-sm rounded-md focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <Field
              label="Lot Code"
              required
              hint="Printed near the package seal (e.g. ML-2406-A)"
            >
              <input
                type="text"
                value={form.lotCode}
                onChange={(e) =>
                  update("lotCode", e.target.value.toUpperCase())
                }
                placeholder="ML-2406-A"
                className="w-full h-10 px-3 border border-border bg-white text-sm rounded-md font-mono focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
              />
            </Field>
            <Field label="Date Code" required hint="Format MM/YYYY">
              <input
                type="text"
                value={form.dateCode}
                onChange={(e) => update("dateCode", e.target.value)}
                placeholder="06/2024"
                className="w-full h-10 px-3 border border-border bg-white text-sm rounded-md font-mono focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Shape" hint="Optional">
                <select
                  value={form.shape}
                  onChange={(e) => update("shape", e.target.value)}
                  className="w-full h-10 px-3 border border-border bg-white text-sm rounded-md focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select…</option>
                  {SHAPE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Flavor" hint="Optional">
                <select
                  value={form.flavor}
                  onChange={(e) => update("flavor", e.target.value)}
                  className="w-full h-10 px-3 border border-border bg-white text-sm rounded-md focus:outline-none focus:border-foreground focus:ring-1 focus:ring-foreground"
                >
                  <option value="">Select…</option>
                  {FLAVOR_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-secondary">
              Select the remedy you would like to receive:
            </p>
            {campaign.remedies.map((remedy) => (
              <label
                key={remedy.id}
                className={cn(
                  "flex items-start gap-3 p-4 border rounded-md cursor-pointer transition-colors",
                  form.remedyId === remedy.id
                    ? "border-foreground bg-foreground/[0.02]"
                    : "border-border hover:border-foreground/40",
                )}
              >
                <input
                  type="radio"
                  name="remedy"
                  value={remedy.id}
                  checked={form.remedyId === remedy.id}
                  onChange={() => update("remedyId", remedy.id)}
                  className="mt-1 accent-brand"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground text-sm">
                      {remedy.title}
                    </p>
                    {remedy.compensationAmount && (
                      <span className="font-mono text-sm text-foreground">
                        ${remedy.compensationAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-secondary leading-relaxed">
                    {remedy.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {submit.kind === "error" && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-brand-light border border-brand/20 text-sm text-brand">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{submit.message}</span>
          </div>
        )}
      </div>

      {/* Footer nav */}
     <div className="mt-6 flex items-center justify-between gap-3">
  {step > 0 ? (
    <button
      onClick={() => setStep(step - 1)}
      type="button"
      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] h-10"
    >
      <ChevronLeft className="h-4 w-4" />
      Back
    </button>
  ) : (
    <span /> // 占位保持右侧按钮右对齐
  )}

  {step < STEPS.length - 1 ? (
    <button
      onClick={() => canAdvance() && setStep(step + 1)}
      disabled={!canAdvance()}
      type="button"
      style={{
        width: "210px",
        height: "40px",
        background: "#ffffff",
        border: "1px solid #7B7A7A",
        color: "#333333",
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        cursor: "pointer",fontWeight: "bold",
      }}
      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#dc2626] bg-[#dc2626] px-5 py-2 text-sm font-medium  transition-all hover:bg-[#b91c1c] hover:border-[#b91c1c] hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] h-10"
    >
      Continue
      <ChevronRight className="h-4 w-4" />
    </button>
  ) : (
    <button
      onClick={handleSubmit}
      disabled={!canAdvance() || submit.kind === "submitting"}
      type="button"
      style={{
        width: "210px",
        height: "40px",
        background: "#ffffff",
        border: "1px solid #dc2626",
        color: "#dc2626",
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
        cursor: "pointer",fontWeight: "bold",
      }}
      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#dc2626] bg-[#dc2626] px-5 py-2 text-sm font-medium transition-all hover:bg-[#b91c1c] hover:border-[#b91c1c] hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] h-10"
    >
      {submit.kind === "submitting" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Submitting…
        </>
      ) : (
        <>
          Submit Claim
          <ChevronRight className="h-4 w-4" />
        </>
      )}
    </button>
  )}
</div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">
        {label}
        {required && <span className="text-brand ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-secondary">{hint}</p>}
    </div>
  );
}
