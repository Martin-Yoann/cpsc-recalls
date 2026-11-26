"use client";

import { uploadPrivateObject } from "@/lib/blob-upload";
import {
  authorizeDisposalUpload,
  deleteDisposalDocument,
  listDisposalDocuments,
  submitDisposalEvidence,
  type DisposalEvidenceBatch,
  type DisposalEvidenceDocument,
  type ProblemDetails,
  type UploadTokenRequest,
} from "@/lib/api-client";

/**
 * Evidence upload for one disposal task.
 *
 * Mirrors the claim form's upload sequence — authorise, upload, then let the API
 * reconcile the blob into a technical status — because the two surfaces must mean
 * the same thing by "uploaded". A verified photo is still not an accepted one:
 * acceptance is a person's decision, recorded against a batch.
 */

export type DisposalUploadResult<T> =
  { ok: true; data: T } | { ok: false; error: ProblemDetails; status: number };

function failure(detail: string, status = 0): DisposalUploadResult<never> {
  return {
    ok: false,
    status,
    error: { type: "about:blank", title: "Upload Error", status, detail },
  };
}

/** Technical-only status: the six-state vocabulary the claim form also uses. */
export function isDisposalDocumentPending(
  document: DisposalEvidenceDocument,
): boolean {
  return (
    document.status === "uploading" ||
    document.status === "verifying" ||
    document.status === "scan_pending"
  );
}

export function disposeEvidenceReadyToSubmit(
  documents: DisposalEvidenceDocument[],
): boolean {
  return (
    documents.length > 0 && documents.every((d) => d.status === "verified")
  );
}

/**
 * A photo the consumer can clear off the step themselves: never sent for
 * review, and in a technical state that can only be replaced, not fixed.
 * Photos inside a review batch are the reviewer's to keep, and the API
 * refuses their removal anyway — the button follows the same line.
 */
export function isDisposalDocumentRemovable(
  document: DisposalEvidenceDocument,
): boolean {
  return (
    document.status === "rejected" ||
    document.status === "expired" ||
    document.status === "uploading"
  );
}

export async function removeDisposalEvidence(
  taskId: string,
  taskToken: string,
  documentId: string,
): Promise<DisposalUploadResult<null>> {
  const result = await deleteDisposalDocument(taskId, taskToken, documentId);
  if (!result.ok) return result;
  return { ok: true, data: null };
}

export async function uploadDisposalEvidence(
  taskId: string,
  taskToken: string,
  file: File,
): Promise<DisposalUploadResult<{ documentId: string }>> {
  const body: UploadTokenRequest = {
    category: "disposal_evidence",
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  };

  const token = await authorizeDisposalUpload(taskId, taskToken, body);
  if (!token.ok) return token;

  try {
    await uploadPrivateObject({
      pathname: token.data.pathname,
      file,
      clientToken: token.data.clientToken,
      contentType: file.type,
    });
  } catch (error) {
    return failure(
      error instanceof Error
        ? error.message
        : "Could not upload the selected file.",
    );
  }

  // Bytes are stored once `put` resolves; reconciliation on the API side decides
  // between verified, rejected and expired. Reporting the row's own state here
  // would be guesswork, so the caller re-reads it.
  return { ok: true, data: { documentId: token.data.documentId } };
}

export async function refreshDisposalEvidence(
  taskId: string,
  taskToken: string,
): Promise<DisposalUploadResult<DisposalEvidenceDocument[]>> {
  const result = await listDisposalDocuments(taskId, taskToken);
  if (!result.ok) return result;
  return { ok: true, data: result.data.documents };
}

export async function sendDisposalEvidenceForReview(
  taskId: string,
  taskToken: string,
  documentIds: string[],
): Promise<DisposalUploadResult<DisposalEvidenceBatch>> {
  const result = await submitDisposalEvidence(
    taskId,
    taskToken,
    documentIds,
    crypto.randomUUID(),
  );
  if (!result.ok) return result;
  return { ok: true, data: result.data };
}
