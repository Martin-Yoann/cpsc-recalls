"use client";
import { useI18n } from "@/lib/i18n/provider";
import { problemMessage } from '@/lib/i18n/problem';
import type { MessageInput } from '@/lib/i18n/translate';


import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DisposalEvidenceDocument, DisposalTask } from "@/lib/api-client";
import {
  disposeEvidenceReadyToSubmit,
  isDisposalDocumentPending,
  isDisposalDocumentRemovable,
  refreshDisposalEvidence,
  removeDisposalEvidence,
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
  reviewReasonCode: DisposalTask["evidenceReviewReasonCode"];
  /** Action ids the server will accept right now. */
  allowedActions: readonly string[];
  onChanged: () => void;
}

const STATUS_LABELS: Record<DisposalEvidenceDocument["status"], string> = {
  uploading: "ui.uploading.de2724",
  verifying: "ui.checking.97876b",
  verified: "ui.passed.our.checks.63dbc3",
  scan_pending: "ui.checking.97876b",
  rejected: "ui.rejected.27eeb7",
  expired: "ui.expired.a689a9",
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
  mime_mismatch: "ui.the.file.type.did.not.match.what.31f030",
  malware_detected: "ui.the.file.did.not.pass.our.safety.fc0db6",
};

const REVIEW_REASON_LABELS: Record<
  NonNullable<DisposalTask["evidenceReviewReasonCode"]>,
  string
> = {
  recognition_unclear:
    "disposal.review.recognition",
  coverage_insufficient:
    "disposal.review.coverage",
  photo_unreadable: "disposal.review.unreadable",
  wrong_product:
    "disposal.review.wrongProduct",
  safety_step_not_visible:
    "disposal.review.safetyStep",
  other:
    "disposal.review.other",
};

export function DisposalEvidenceUpload({
  taskId,
  reviewStatus,
  reviewReasonCode,
  allowedActions,
  onChanged,
}: Props) {
  const { t } = useI18n();
  const [documents, setDocuments] = useState<DisposalEvidenceDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [problem, setProblem] = useState<MessageInput | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRevision = useRef(0);
  const [loadProblem, setLoadProblem] = useState<MessageInput | null>(null);

  const mayUpload =
    allowedActions.includes("disposal.submit_evidence") ||
    allowedActions.includes("disposal.resubmit_evidence");

  const load = useCallback(async () => {
    const revision = ++requestRevision.current;
    const token = resolveDisposalToken(taskId);
    try {
      const result = token ? await refreshDisposalEvidence(taskId, token) : null;
      if (revision !== requestRevision.current) return;
      if (result?.ok) {
        setDocuments(result.data);
        setLoadProblem(null);
      } else setLoadProblem(problemMessage(result ? { ...result.error, status: result.status } : { status: 401 }));
    } catch {
      if (revision === requestRevision.current) setLoadProblem(problemMessage({ status: 0 }));
    } finally {
      if (revision === requestRevision.current) setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => { if (!cancelled) void load(); });
    return () => { cancelled = true; requestRevision.current += 1; };
  }, [load]);

  const hasPending = documents.some(isDisposalDocumentPending);
  useEffect(() => {
    if (!hasPending || isUploading || removingId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      await load();
      if (!cancelled) timer = setTimeout(() => void poll(), 4000);
    };
    timer = setTimeout(() => void poll(), 4000);
    return () => { cancelled = true; clearTimeout(timer); requestRevision.current += 1; };
  }, [hasPending, load, isUploading, removingId]);

  const onFiles = async (files: FileList | null) => {
    const token = resolveDisposalToken(taskId);
    if (!token || !files?.length) return;

    requestRevision.current += 1;
    setIsUploading(true);
    setMessage(null);
    setProblem(null);
    for (const file of Array.from(files)) {
      const result = await uploadDisposalEvidence(taskId, token, file);
      if (!result.ok) {
        setProblem(problemMessage({ ...result.error, status: result.status }));
        break;
      }
    }
    await load();
    setIsUploading(false);
    onChanged();
  };

  const onSendForReview = async () => {
    const token = resolveDisposalToken(taskId);
    if (!token) return;
    requestRevision.current += 1;
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
      setProblem(problemMessage({ ...result.error, status: result.status }));
      return;
    }
    setMessage(
      "ui.sent.for.review.we.will.look.at.8bada3",
    );
    onChanged();
  };

  // The way past a photo that can never be sent: clearing it is what lets the
  // remaining photos — or a retaken replacement — go to review. Only offered in
  // the same states the API allows removal, so the button never promises
  // something the server will refuse.
  const onRemove = async (documentId: string) => {
    const token = resolveDisposalToken(taskId);
    if (!token) return;
    requestRevision.current += 1;
    setRemovingId(documentId);
    setMessage(null);
    setProblem(null);
    const result = await removeDisposalEvidence(taskId, token, documentId);
    if (!result.ok) {
      setRemovingId(null);
      setProblem(problemMessage({ ...result.error, status: result.status }));
      return;
    }
    setDocuments((current) => current.filter((document) => document.documentId !== documentId));
    await load();
    setRemovingId(null);
    onChanged();
  };

  const ready = disposeEvidenceReadyToSubmit(documents);

  // Nothing to offer and nothing to report: the section hides itself rather than
  // rendering a heading over an empty list. Mirrors DisposalDeclaration, so the two
  // sections decide alike — and what they decide from is the server's actions.
  if (!mayUpload && documents.length === 0 && !isLoading && !loadProblem) return null;

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
          {t("ui.your.photos.1e1ef1")}</h3>
        <p className="text-xs text-[#909399]">
          {t("ui.passing.our.checks.only.confirms.the.file.08c898")}</p>
      </div>

      {isLoading ? (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-[#606266]"
        >
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {t("ui.loading.your.photos.dce1c4")}</p>
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
                    {t(STATUS_LABELS[document.status])}
                  </span>
                  {document.statusReason && (
                    <span className="w-full text-xs text-[#f56c6c]">
                      {t(REASON_LABELS[document.statusReason] ??
                        "ui.this.file.was.not.accepted.0a0cf4")}
                    </span>
                  )}
                  {mayUpload && isDisposalDocumentRemovable(document) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={removingId !== null || isUploading}
                      onClick={() => void onRemove(document.documentId)}
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                      {t(removingId === document.documentId ? "disposal.photos.removing" : "disposal.photos.remove")}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {reviewStatus === "accepted" && (
            <p className="flex items-center gap-2 rounded border border-[#e1f3d8] bg-[#f0f9eb] p-3 text-sm text-[#67c23a]">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t("ui.our.team.accepted.your.photos.eff9e5")}</p>
          )}
          {reviewStatus === "needs_resubmission" && (
            <p className="flex items-center gap-2 rounded border border-[#faecd8] bg-[#fdf6ec] p-3 text-sm text-[#e6a23c]">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              {t(reviewReasonCode ? REVIEW_REASON_LABELS[reviewReasonCode] : "ui.we.need.different.photos.please.check.the.f09986")}
            </p>
          )}
          {reviewStatus === "pending" && (
            <p className="rounded border border-[#e9e9eb] bg-[#f4f4f5] p-3 text-sm text-[#606266]">
              {t("ui.your.photos.are.with.our.team.for.e12844")}</p>
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
              disabled={isUploading || removingId !== null}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {t("ui.add.photos.a59893")}</Button>
            {mayUpload && documents.length > 0 && (
              <Button
                type="button"
                disabled={isUploading || removingId !== null || isLoading || !!loadProblem || !ready}
                onClick={() => void onSendForReview()}
              >
                {t(isUploading ? "ui.sending.cf7655" : "ui.send.for.review.ddc873")}
              </Button>
            )}
          </div>
          {documents.length > 0 && !ready && !hasPending && (
            <p className="text-xs text-[#e6a23c]">
              {t("disposal.photos.retry")}
            </p>
          )}
        </div>
      )}

      {message && (
        <p role="status" className="text-sm text-[#67c23a]">
          {t(message)}
        </p>
      )}
      {loadProblem && <div role="alert" className="space-y-2 text-sm text-[#f56c6c]">
        <p>{t(loadProblem)}</p>
        <Button type="button" variant="outline" disabled={isUploading || removingId !== null} onClick={() => void load()}>{t("claims.retry")}</Button>
      </div>}
      {problem && (
        <p
          role="alert"
          className="flex items-center gap-2 text-sm text-[#f56c6c]"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {t(problem)}
        </p>
      )}
      {documents.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isUploading || removingId !== null}
          onClick={() => {
            // The document list is this component's own state, but the review
            // banners above come from the task: "Refresh" refreshes both, or a
            // consumer who just got their photos accepted sees nothing change.
            void load();
            onChanged();
          }}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {t("ui.refresh.status.ade15a")}</Button>
      )}
    </section>
  );
}
