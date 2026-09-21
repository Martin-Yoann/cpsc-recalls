// ============================================================
// KOI Recall Platform — App Constants
// ============================================================

import type { BladeStage, NavItem } from "@/types";

// === Navigation ===
export const NAV_ITEMS: NavItem[] = [
  { label: "Safety Recall", href: "/recalls/music-lollipop-demo-2026" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Active Recalls", href: "/#active-recalls" },
  { label: "FAQ", href: "/faq" },
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
    label: "Verification",
    color: "var(--blade-verification)",
    lightColor: "var(--blade-verification-light)",
    darkColor: "var(--blade-verification-dark)",
    textColor: "var(--blade-verification-text)",
    icon: "SearchCheck",
    description: "Verify your product eligibility and submit your claim.",
  },
  resolution: {
    stage: "resolution",
    label: "Resolution",
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
  active: "Active",
  closed: "Closed",
  pending: "Pending",
  expanded: "Expanded",
};

export const CLAIM_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  verified: "Verified",
  remedy_issued: "Remedy Issued",
  resolved: "Resolved",
  rejected: "Rejected",
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
  refund: "Refund",
  replacement: "Replacement",
  repair: "Repair",
  disposal_instruction: "Disposal Instructions",
  voucher: "Voucher",
};

export const INCIDENT_SEVERITY_LABELS: Record<string, string> = {
  minor: "Minor",
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
  { id: "submitted", label: "Submitted", blade: "verification" },
  { id: "under_review", label: "Under Review", blade: "verification" },
  { id: "verified", label: "Verified", blade: "verification" },
  { id: "remedy_issued", label: "Remedy Issued", blade: "resolution" },
  { id: "resolved", label: "Resolved", blade: "resolution" },
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
