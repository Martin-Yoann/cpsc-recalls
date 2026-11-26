// ============================================================
// KOI Recall Platform — App Constants
// ============================================================

import type { BladeStage, NavItem } from "@/types";

// === Navigation ===
export const NAV_ITEMS: NavItem[] = [
  { label: "Safety Recall", href: "/recalls/music-lollipop-demo-2026" },
  { label: "ui.how.it.works.8cecc8", href: "/how-it-works" },
  { label: "ui.active.recalls.f6dc50", href: "/#active-recalls" },
  { label: "nav.faq", href: "/faq" },
];

// === Blade Configuration ===
export interface BladeConfig {
  stage: BladeStage;
  label: string;
  color: string;
  lightColor: string;
  darkColor: string;
  textColor: string;
  icon: string;
  description: string;
}

export const BLADE_CONFIG: Record<BladeStage, BladeConfig> = {
  safety: {
    stage: "safety",
    label: "Safety Notice",
    color: "var(--blade-safety)",
    lightColor: "var(--blade-safety-light)",
    darkColor: "var(--blade-safety-dark)",
    textColor: "var(--blade-safety-text)",
    icon: "ShieldAlert",
    description: "Stay informed about product recalls and safety hazards.",
  },
  verification: {
    stage: "verification",
    label: "stage.verification",
    color: "var(--blade-verification)",
    lightColor: "var(--blade-verification-light)",
    darkColor: "var(--blade-verification-dark)",
    textColor: "var(--blade-verification-text)",
    icon: "SearchCheck",
    description: "Verify your product eligibility and submit your claim.",
  },
  resolution: {
    stage: "resolution",
    label: "stage.resolution",
    color: "var(--blade-resolution)",
    lightColor: "var(--blade-resolution-light)",
    darkColor: "var(--blade-resolution-dark)",
    textColor: "var(--blade-resolution-text)",
    icon: "CheckCircle2",
    description: "Receive your remedy and track resolution progress.",
  },
};

// === Status Labels ===
export const RISK_LEVEL_LABELS: Record<string, string> = {
  low: "Low Risk",
  moderate: "Moderate Risk",
  high: "High Risk",
  critical: "Critical Risk",
};

export const RECALL_STATUS_LABELS: Record<string, string> = {
  active: "ui.active.a733b8",
  closed: "ui.closed.88d86b",
  pending: "ui.pending.96f608",
  expanded: "ui.expanded.6d1704",
};

export const CLAIM_STATUS_LABELS: Record<string, string> = {
  draft: "ui.draft.23d33e",
  submitted: "ui.submitted.2e0035",
  under_review: "ui.under.review.18afed",
  verified: "ui.verified.aed3b8",
  remedy_issued: "ui.remedy.issued.c74da1",
  resolved: "ui.resolved.d999ae",
  rejected: "ui.rejected.27eeb7",
};

/**
 * Evidence a consumer supplies while submitting a claim.
 *
 * `disposal_evidence` is deliberately absent. Disposal photos are collected later,
 * from the disposal task, after eligibility is confirmed and approved
 * instructions exist — asking for them on the claim form would demand evidence
 * for a step the consumer may never be offered. A campaign declares the category
 * so the upload endpoint accepts it, not so the claim form demands it.
 */
export const CLAIM_TIME_EVIDENCE_CATEGORIES = [
  "product_photo",
  "proof_of_purchase",
  "incident_evidence",
] as const;

export type ClaimTimeEvidenceCategory =
  (typeof CLAIM_TIME_EVIDENCE_CATEGORIES)[number];

export function isClaimTimeEvidence(
  category: string,
): category is ClaimTimeEvidenceCategory {
  return (CLAIM_TIME_EVIDENCE_CATEGORIES as readonly string[]).includes(
    category,
  );
}

/**
 * Whether satisfying this remedy requires the consumer to give a mailing address.
 *
 * Previously this was inferred from "is it a refund?", which silently made every
 * other remedy a shipment. Disposal instructions are the counter-example: nothing
 * is posted, so a mailing address is not part of the remedy. Stating the rule
 * directly means a new remedy code has to be classified rather than defaulting to
 * "post something".
 */
export function remedyRequiresMailingAddress(
  type: string | undefined,
): boolean {
  switch (type) {
    case "replacement":
    case "repair":
    case "voucher":
      return true;
    case "refund":
    case "disposal_instruction":
      return false;
    default:
      return false;
  }
}

export const REMEDY_TYPE_LABELS: Record<string, string> = {
  refund: "remedy.refund",
  replacement: "remedy.replacement",
  repair: "Repair",
  disposal_instruction: "Disposal Instructions",
  voucher: "Voucher",
};

export const INCIDENT_SEVERITY_LABELS: Record<string, string> = {
  minor: "ui.minor.100b45",
  moderate: "Moderate",
  serious: "Serious",
  fatal: "Fatal",
};

// === File Upload ===
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
];
export const ALLOWED_FILE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".heic",
  ".heif",
  ".pdf",
];

// === Claim Steps ===
export const CLAIM_STEPS = [
  { id: "submitted", label: "ui.submitted.2e0035", blade: "verification" },
  { id: "under_review", label: "ui.under.review.18afed", blade: "verification" },
  { id: "verified", label: "ui.verified.aed3b8", blade: "verification" },
  { id: "remedy_issued", label: "ui.remedy.issued.c74da1", blade: "resolution" },
  { id: "resolved", label: "ui.resolved.d999ae", blade: "resolution" },
] as const;

// === Eligibility Steps ===
export const ELIGIBILITY_STEPS = [
  { id: "product", label: "Identify Product", blade: "safety" as BladeStage },
  {
    id: "purchase",
    label: "Purchase Details",
    blade: "verification" as BladeStage,
  },
  {
    id: "confirm",
    label: "Confirm Eligibility",
    blade: "verification" as BladeStage,
  },
];
