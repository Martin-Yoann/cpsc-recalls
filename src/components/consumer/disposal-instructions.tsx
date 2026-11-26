"use client";
import { useI18n } from "@/lib/i18n/provider";
import { ContentLanguageNotice } from '@/components/consumer/content-language-notice';


import {
  AlertTriangle,
  Camera,
  Info,
  ListChecks,
  PauseCircle,
  PlayCircle,
} from "lucide-react";

import type { DisposalTask } from "@/lib/api-client";

/**
 * Page 4: the approved disposal instructions, plus the states that gate them.
 *
 * Four facts are kept visually and structurally distinct, because conflating any
 * two of them is the failure this domain exists to prevent:
 *
 *   1. the product is confirmed part of the recall   (`eligibilityStatus`)
 *   2. our team has accepted your photos             (`evidenceReviewStatus`)
 *   3. you are permitted to dispose                  (`authorizationStatus`)
 *   4. the instructions themselves                   (`instruction`)
 *
 * The component renders no instructional text of its own. Steps, warnings,
 * example photos and recognition requirements come from the server, and the whole
 * block is absent when `instruction` is null — a withheld instruction must not be
 * replaced by anything improvised here.
 */

interface Props {
  task: DisposalTask;
  /** The campaign support line, already formatted by the adapter. */
  supportContact?: string | undefined;
}

/**
 * Consumer-facing wording for the server's blocking codes.
 *
 * These explain what is happening and what happens next. They never describe a
 * method of disposal: that is approved content, and it arrives only inside
 * `instruction`.
 */
const BLOCKING_MESSAGES: Record<string, string> = {
  ELIGIBILITY_NOT_CONFIRMED:
    "ui.we.are.still.confirming.whether.this.product.d834bd",
  DISPOSAL_NOT_APPLICABLE:
    "ui.for.this.recall.this.product.does.not.a413fe",
  PRODUCT_RULED_INELIGIBLE:
    "ui.this.product.is.not.part.of.the.e39aee",
  INSTRUCTION_NOT_APPROVED:
    "ui.instructions.for.this.product.have.not.been.e13e2e",
  INSTRUCTION_WITHDRAWN:
    "ui.the.instructions.for.this.product.have.been.53d5b5",
  APPROVAL_NOT_AUTHORIZING:
    "ui.we.do.not.yet.have.the.approval.3ff30b",
  EVIDENCE_NOT_SUBMITTED: "ui.no.photos.have.been.sent.to.us.660bed",
  EVIDENCE_PENDING_REVIEW: "ui.your.photos.are.with.our.team.for.dc5cc6",
  EVIDENCE_NEEDS_RESUBMISSION:
    "ui.we.need.different.photos.before.we.can.ceeef5",
  DISPOSAL_ON_HOLD:
    "ui.this.step.is.paused.while.we.keep.a1de0e",
  TASK_CLOSED: "ui.this.task.is.closed.637b06",
};

const ELIGIBILITY_LABELS: Record<DisposalTask["eligibilityStatus"], string> = {
  pending_confirmation: "ui.being.confirmed.f0ecc6",
  confirmed_eligible: "ui.confirmed.part.of.this.recall.72cfa3",
  not_applicable: "ui.no.disposal.needed.ae3bc6",
  ineligible: "ui.not.part.of.this.recall.418adb",
};

const EVIDENCE_LABELS: Record<
  NonNullable<DisposalTask["evidenceReviewStatus"]>,
  string
> = {
  pending: "ui.with.our.team.for.review.aa26ba",
  accepted: "ui.accepted.by.our.team.6493f0",
  needs_resubmission: "ui.more.photos.needed.b98bbc",
  superseded: "ui.replaced.by.newer.photos.4f2508",
};

function StatusRow({ label, value }: { label: string; value: string }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-[#909399]">
        {t(label)}
      </dt>
      <dd className="text-sm font-semibold text-[#303133]">{t(value)}</dd>
    </div>
  );
}

export function DisposalInstructions({ task, supportContact }: Props) {
  const { t } = useI18n();
  const { instruction } = task;

  return (
    <section aria-labelledby="disposal-heading" className="space-y-6">
      <header className="space-y-2">
        <ContentLanguageNotice contentLocale={instruction?.locale} instructions />
        <h2
          id="disposal-heading"
          className="text-lg font-semibold text-[#303133]"
        >
          {t("ui.product.disposal.dfc4b8")}</h2>
        <p className="text-sm text-[#606266]">
          {t("ui.this.step.applies.only.if.we.have.8d2e66")}</p>
      </header>

      {/* Status: separate facts, never collapsed into one verdict. */}
      <dl className="grid gap-3 rounded border border-[#dcdfe6] bg-[#fafafa] p-4 sm:grid-cols-3">
        <StatusRow
          label={t("ui.product.dd3b86")}
          value={ELIGIBILITY_LABELS[task.eligibilityStatus]}
        />
        <StatusRow
          label={t("ui.your.photos.1e1ef1")}
          value={
            task.evidenceReviewStatus
              ? EVIDENCE_LABELS[task.evidenceReviewStatus]
              : t("ui.not.sent.yet.890dff")
          }
        />
        <StatusRow
          label={t("ui.permission.to.dispose.e44402")}
          value={
            task.authorizationStatus === "active"
              ? t("ui.given.6839d8")
              : task.authorizationStatus === "suspended"
                ? t("ui.paused.c7dfb6")
                : task.authorizationStatus === "revoked"
                  ? t("ui.withdrawn.ab014c")
                  : t("ui.not.given.ee3c4a")
          }
        />
      </dl>

      {task.holdActive && (
        <div
          role="status"
          className="flex gap-3 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <PauseCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            <strong className="font-semibold">{t("ui.this.step.is.paused.3e397c")}</strong> {t("ui.we.are.keeping.your.evidence.and.will.fc93f7")}</p>
        </div>
      )}

      {task.blockingReasons.length > 0 && (
        <ul className="space-y-2 text-sm text-[#606266]">
          {task.blockingReasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-[#909399]"
                aria-hidden="true"
              />
              <span>
                {t(BLOCKING_MESSAGES[reason] ?? "ui.this.step.cannot.go.ahead.yet.f1115b")}
              </span>
            </li>
          ))}
        </ul>
      )}

      {instruction ? (
        <ApprovedInstructions instruction={instruction} />
      ) : (
        <div className="space-y-2 rounded border border-[#dcdfe6] p-4 text-sm text-[#606266]">
          <p className="font-semibold text-[#303133]">
            {t(task.eligibilityStatus === "not_applicable" ||
            task.eligibilityStatus === "ineligible"
              ? "ui.there.is.nothing.for.you.to.dispose.66f521"
              : "ui.instructions.are.not.available.for.this.product.7cd606")}
          </p>
          <p>
            {t("ui.please.do.not.dispose.of.the.product.7a518c")}</p>
          {supportContact && (
            <p>{t("ui.if.you.have.questions.contact.us.at.149e01")}{" "}{supportContact}.</p>
          )}
        </div>
      )}
    </section>
  );
}

function ApprovedInstructions({
  instruction,
}: {
  instruction: NonNullable<DisposalTask["instruction"]>;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-6 rounded border border-[#dcdfe6] p-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[#303133]">
          {instruction.title}
        </h3>
        <p className="text-xs text-[#909399]">
          {t("ui.instructions.version.c7d8eb")}{" "}{instruction.versionNumber} ·{t(" ")}
          {instruction.locale}
        </p>
      </div>

      {/* Warnings before steps: the order someone reads in should not invite an
          action before they have read the reasons not to. */}
      <section
        aria-labelledby="disposal-warnings"
        className="rounded border border-red-200 bg-red-50 p-4"
      >
        <h4
          id="disposal-warnings"
          className="flex items-center gap-2 text-sm font-semibold text-red-800"
        >
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          {t("ui.safety.warnings.b864d9")}</h4>
        <ul className="mt-3 space-y-2 text-sm text-red-900">
          {instruction.safetyWarnings.map((warning) => (
            <li key={warning} className="flex gap-2">
              <span aria-hidden="true" className="select-none">
                •
              </span>
              <span>{warning}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="disposal-steps">
        <h4
          id="disposal-steps"
          className="text-sm font-semibold text-[#303133]"
        >
          {t("ui.what.to.do.779b1d")}</h4>
        <ol className="mt-3 space-y-3">
          {instruction.steps
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((step, index) => (
              <li
                key={`${step.order}-${step.text}`}
                className="flex gap-3 text-sm text-[#303133]"
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#303133] text-xs font-semibold text-white"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="pt-0.5">{step.text}</span>
              </li>
            ))}
        </ol>
      </section>

      {instruction.referenceImages.length > 0 && (
        <section aria-labelledby="disposal-examples">
          <h4
            id="disposal-examples"
            className="text-sm font-semibold text-[#303133]"
          >
            {t("ui.example.photos.9a351f")}</h4>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {instruction.referenceImages.map((image) => (
              <li key={image.url} className="space-y-2">
                {/*
                  Example images are supplied by compliance content and are not
                  restricted to configured Next Image hosts, so this stays a plain
                  <img>: optimisation is not worth a runtime failure on a page whose
                  whole purpose is showing someone what to do.

                  alt text is required by the contract, so an example is never
                  conveyed by the image alone.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.altText}
                  className="w-full rounded border border-[#dcdfe6]"
                  loading="lazy"
                />
                {image.caption && (
                  <p className="text-xs text-[#606266]">{image.caption}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {instruction.videoUrl && (
        <section aria-labelledby="disposal-video">
          <h4
            id="disposal-video"
            className="text-sm font-semibold text-[#303133]"
          >
            {t("ui.video.bc17c1")}</h4>
          <a
            className="mt-2 inline-flex items-center gap-2 text-sm text-brand underline"
            href={instruction.videoUrl}
          >
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            {t("ui.watch.the.instructions.e5cf20")}</a>
          {/* A video is an alternative, never the only route: the steps above are
              the same content in text. */}
          <p className="mt-1 text-xs text-[#909399]">
            {t("ui.the.video.covers.the.same.steps.listed.022bf6")}</p>
        </section>
      )}

      {instruction.recognitionRequirements.length > 0 && (
        <section
          aria-labelledby="disposal-photos"
          className="rounded border border-[#dcdfe6] bg-[#fafafa] p-4"
        >
          <h4
            id="disposal-photos"
            className="flex items-center gap-2 text-sm font-semibold text-[#303133]"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            {t("ui.what.your.photos.must.show.c75ced")}</h4>
          <ul className="mt-3 space-y-2 text-sm text-[#606266]">
            {instruction.recognitionRequirements.map((requirement) => (
              <li key={requirement} className="flex gap-2">
                <ListChecks
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#909399]"
                  aria-hidden="true"
                />
                <span>{requirement}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-[#909399]">
        {t("ui.these.instructions.come.from.the.company.conducting.ec512f")}</p>
    </div>
  );
}
