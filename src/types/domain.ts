// ============================================================
// KOI Recall Platform — Core Domain Model
// ============================================================

// === Enums ===

export enum RiskLevel {
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum RecallStatus {
  ACTIVE = "active",
  CLOSED = "closed",
  PENDING = "pending",
  EXPANDED = "expanded",
}

export enum ClaimStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  /** Backend need_info — the review team asked the consumer for more input. */
  ACTION_REQUIRED = "action_required",
  VERIFIED = "verified",
  REMEDY_ISSUED = "remedy_issued",
  RESOLVED = "resolved",
  REJECTED = "rejected",
}

export enum RemedyType {
  REFUND = "refund",
  REPLACEMENT = "replacement",
  REPAIR = "repair",
  DISPOSAL_INSTRUCTION = "disposal_instruction",
  VOUCHER = "voucher",
}

export enum EvidenceType {
  PROOF_OF_PURCHASE = "proof_of_purchase",
  PRODUCT_PHOTO = "product_photo",
  SERIAL_NUMBER = "serial_number",
  DAMAGE_PHOTO = "damage_photo",
  OTHER = "other",
}

export enum IncidentSeverity {
  MINOR = "minor",
  MODERATE = "moderate",
  SERIOUS = "serious",
  FATAL = "fatal",
}

/**
 * Evidence categories as the API defines them. Deliberately the complete set
 * rather than a hand-narrowed one: a campaign may legitimately declare a
 * `disposal_evidence` requirement, and the web app must be able to receive it
 * without the type pretending it cannot happen.
 */
export type EvidenceCategory =
  | "product_photo"
  | "proof_of_purchase"
  | "incident_evidence"
  | "disposal_evidence";

// === Core Domain Interfaces ===

export interface CampaignEvidenceRequirement {
  /** The full API union, including categories not collected at claim time. */
  category: EvidenceCategory;
  required: boolean;
  minimumFiles: number;
  maximumFiles: number;
  allowedMimeTypes: string[];
  maximumFileSizeBytes: number;
  instructions: string;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  /** Only rendered when the API actually provides a severity signal. */
  riskLevel?: RiskLevel;
  status: RecallStatus;
  cpscNumber: string;
  recallDate: string;
  lastUpdated: string;
  remedySummary?: string;
  affectedProducts: Product[];
  remedies: Remedy[];
  manufacturerName: string;
  manufacturerContact: string;
  estimatedUnits: number;
  hazardDescription: string;
  instructions: string;
  images: string[];
  affectedLots?: string[];
  dateCodes?: string[];
  evidenceRequirements?: CampaignEvidenceRequirement[];
  privacyNotice?: {
    url: string;
    version: string;
  };
}

export interface Product {
  id: string;
  name: string;
  modelNumber: string;
  upc: string;
  manufactureDateStart: string;
  manufactureDateEnd: string;
  description: string;
  imageUrl: string;
  brandName: string;
  retailerNames: string[];
  priceRange: { min: number; max: number };
  weight?: string;
  flavors?: string[];
  shapes?: string[];
}

export interface Remedy {
  id: string;
  type: RemedyType;
  title: string;
  description: string;
  deadline: string;
  requiresEvidence: boolean;
  evidenceTypes: EvidenceType[];
  compensationAmount?: number;
}

export interface Claim {
  id: string;
  campaignId: string;
  status: ClaimStatus;
  consumerName: string;
  consumerEmail: string;
  productId: string;
  remedyId: string;
  evidence: Evidence[];
  incident?: Incident;
  submittedAt: string;
  updatedAt: string;
  resolutionDate?: string;
  claimNumber: string;
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  fileUrl: string;
  fileName: string;
  uploadedAt: string;
  notes?: string;
}

export interface Incident {
  id: string;
  severity: IncidentSeverity;
  occurredAt: string;
  description: string;
  injuryDescription?: string;
  medicalAttentionRequired: boolean;
  photos: string[];
}

export interface AuditEntry {
  id: string;
  campaignId: string;
  claimId?: string;
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
  bladeStage: "safety" | "verification" | "resolution";
}

export interface Communication {
  id: string;
  claimId: string;
  direction: "inbound" | "outbound";
  channel: "email" | "sms" | "portal";
  subject: string;
  body: string;
  sentAt: string;
  readAt?: string;
}
