"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DisposalEvidenceDocument } from "@/lib/api-client";
import {
  disposeEvidenceReadyToSubmit,
  isDisposalDocumentPending,
  refreshDisposalEvidence,
  sendDisposalEvidenceForReview,
  uploadDisposalEvidence,
} from "@/lib/disposal-evidence";
import { resolveDisposalToken } from "@/lib/disposal-access";

/**
 * Page 4's photo step: upload evidence for one disposal task and send it to a
 * person for review.
 *
 * Three facts stay separate here, and the wording never merges them:
 *
 *   - the bytes arrived              (`uploading` / `verifying`)
 *   - the file passed our checks     (`verified`)
 *   - a reviewer accepted the photos (`evidenceReviewStatus`)
 *
 * Only the last one permits anything, and it is not this component's to decide:
 * it renders whatever the server reports.
 */

interface Props {
  taskId: string;
  /** Server-reported review state; null means nothing has been sent yet. */
  reviewStatus:
    "pending" | "accepted" | "needs_resubmission" | "superseded" | null;
  /** Action ids the server will accept right now. */
  allowedActions: readonly string[];
  onChanged: () => void;
}

const STATUS_LABELS: Record<DisposalEvidenceDocument["status"], string> = {
  uploading: "Uploading",
  verifying: "Checking",
  verified: "Passed our checks",
  scan_pending: "Checking",
  rejected: "Rejected",
  expired: "Expired",
};

const STATUS_STYLES: Record<DisposalEvidenceDocument["status"], string> = {
  uploading: "bg-[#f4f4f5] text-[#606266]",
  verifying: "bg-[#f4f4f5] text-[#606266]",
  scan_pending: "bg-[#f4f4f5] text-[#606266]",
  verified: "bg-[#f0f9eb] text-[#67c23a]",
  rejected: "bg-[#fef0f0] text-[#f56c6c]",
  expired: "bg-[#fef0f0] text-[#f56c6c]",
};

const REASON_LABELS: Record<string, string> = {
  mime_mismatch: "The file type did not match what was sent.",
  malware_detected: "The file did not pass our safety check.",
};

export function DisposalEvidenceUpload({
  taskId,
  reviewStatus,
  allowedActions,
  onChanged,
}: Props) {
  const [documents, setDocuments] = useState<DisposalEvidenceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mayUpload =
    allowedActions.includes("disposal.submit_evidence") ||
    allowedActions.includes("disposal.resubmit_evidence");

  const load = useCallback(async () => {
    const token = resolveDisposalToken(taskId);
    if (!token) return [];
    const result = await refreshDisposalEvidence(taskId, token);
    return result.ok ? result.data : [];
  }, [taskId]);

  useEffect(() => {
    let cancelled = false;
    void load().then((next) => {
      if (cancelled) return;
      setDocuments(next);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  // Poll only while something is genuinely in flight, so a settled list is not
  // re-fetched forever.
  const hasPending = documents.some(isDisposalDocumentPending);
  useEffect(() => {
    if (!hasPending) return;
    const timer = setInterval(() => {
      void load().then((next) => setDocuments(next));
    }, 4000);
    return () => clearInterval(timer);
  }, [hasPending, load]);

  const onFiles = async (files: FileList | null) => {
    const token = resolveDisposalToken(taskId);
    if (!token || !files?.length) return;

    setIsUploading(true);
    setMessage(null);
    setProblem(null);
    for (const file of Array.from(files)) {
      const result = await uploadDisposalEvidence(taskId, token, file);
      if (!result.ok) {
        setProblem(result.error.detail);
        break;
      }
    }
    setDocuments(await load());
    setIsUploading(false);
    onChanged();
  };

  const onSendForReview = async () => {
    const token = resolveDisposalToken(taskId);
    if (!token) return;
    setIsUploading(true);
    setMessage(null);
    setProblem(null);

    const result = await sendDisposalEvidenceForReview(
      taskId,
      token,
      documents.map((d) => d.documentId),
    );
    setIsUploading(false);
    if (!result.ok) {
      setProblem(result.error.detail);
      return;
    }
    setMessage(
      "Sent for review. We will look at your photos and let you know.",
    );
    onChanged();
  };

  const ready = disposeEvidenceReadyToSubmit(documents);

  // Nothing to offer and nothing to report: the section hides itself rather than
  // rendering a heading over an empty list. Mirrors DisposalDeclaration, so the two
  // sections decide alike — and what they decide from is the server's actions.
  if (!mayUpload && documents.length === 0) return null;

  return (
    <section
      aria-labelledby="disposal-evidence"
      className="space-y-4 rounded border border-[#dcdfe6] p-4"
    >
      <div className="space-y-1">
        <h3
          id="disposal-evidence"
          className="text-sm font-semibold text-[#303133]"
        >
          Your photos
        </h3>
        <p className="text-xs text-[#909399]">
          Passing our checks only confirms the file itself is readable and safe.
          A person then looks at whether it shows what the instructions above
          ask for.
        </p>
      </div>

      {isLoading ? (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-[#606266]"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading your photos…
        </p>
      ) : (
        <>
          {documents.length > 0 && (
            <ul className="space-y-2">
              {documents.map((document) => (
                <li
                  key={document.documentId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#dcdfe6] bg-[#fafafa] px-3 py-2"
                >
                  <span className="text-sm text-[#303133]">
                    {document.fileName}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[document.status]}`}
                  >
                    {STATUS_LABELS[document.status]}
                  </span>
                  {document.statusReason && (
                    <span className="w-full text-xs text-[#f56c6c]">
                      {REASON_LABELS[document.statusReason] ??
                        "This file was not accepted."}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {reviewStatus === "accepted" && (
            <p className="flex items-center gap-2 rounded border border-[#e1f3d8] bg-[#f0f9eb] p-3 text-sm text-[#67c23a]">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Our team accepted your photos.
            </p>
          )}
          {reviewStatus === "needs_resubmission" && (
            <p className="flex items-center gap-2 rounded border border-[#faecd8] bg-[#fdf6ec] p-3 text-sm text-[#e6a23c]">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              We need different photos. Please check the instructions above and
              add new ones.
            </p>
          )}
          {reviewStatus === "pending" && (
            <p className="rounded border border-[#e9e9eb] bg-[#f4f4f5] p-3 text-sm text-[#606266]">
              Your photos are with our team for review. You can leave this page
              and come back.
            </p>
          )}
        </>
      )}

      {mayUpload && (
        <div className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif"
            multiple
            className="sr-only"
            onChange={(event) => void onFiles(event.target.files)}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Add photos
            </Button>
            {mayUpload && documents.length > 0 && (
              <Button
                type="button"
                disabled={isUploading || !ready}
                onClick={() => void onSendForReview()}
              >
                {isUploading ? "Sending…" : "Send for review"}
              </Button>
            )}
          </div>
          {documents.length > 0 && !ready && !hasPending && (
            <p className="text-xs text-[#e6a23c]">
              Only photos that passed our checks can be sent for review. Remove
              any that were rejected and add them again.
            </p>
          )}
        </div>
      )}

      {message && (
        <p role="status" className="text-sm text-[#67c23a]">
          {message}
        </p>
      )}
      {problem && (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-[#f56c6c]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {problem}
        </p>
      )}
      {documents.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isUploading}
          onClick={() => {
            void load().then(setDocuments);
          }}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Refresh status
        </Button>
      )}
    </section>
  );
}
