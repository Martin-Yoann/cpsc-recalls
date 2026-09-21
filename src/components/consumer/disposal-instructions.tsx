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
    "We are still confirming whether this product is part of the recall.",
  DISPOSAL_NOT_APPLICABLE:
    "For this recall, this product does not need to be disposed of by you. Follow the remedy you selected.",
  PRODUCT_RULED_INELIGIBLE:
    "This product is not part of the recall, so no disposal step applies.",
  INSTRUCTION_NOT_APPROVED:
    "Instructions for this product have not been published yet.",
  INSTRUCTION_WITHDRAWN:
    "The instructions for this product have been withdrawn. Do not act on any copy you have.",
  APPROVAL_NOT_AUTHORIZING:
    "We do not yet have the approval needed to ask you to dispose of this product.",
  EVIDENCE_NOT_SUBMITTED: "No photos have been sent to us yet.",
  EVIDENCE_PENDING_REVIEW: "Your photos are with our team for review.",
  EVIDENCE_NEEDS_RESUBMISSION:
    "We need different photos before we can continue.",
  DISPOSAL_ON_HOLD:
    "This step is paused while we keep your evidence. Please do not dispose of anything yet.",
  TASK_CLOSED: "This task is closed.",
};

const ELIGIBILITY_LABELS: Record<DisposalTask["eligibilityStatus"], string> = {
  pending_confirmation: "Being confirmed",
  confirmed_eligible: "Confirmed part of this recall",
  not_applicable: "No disposal needed",
  ineligible: "Not part of this recall",
};

const EVIDENCE_LABELS: Record<
  NonNullable<DisposalTask["evidenceReviewStatus"]>,
  string
> = {
  pending: "With our team for review",
  accepted: "Accepted by our team",
  needs_resubmission: "More photos needed",
  superseded: "Replaced by newer photos",
};

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-[#909399]">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-[#303133]">{value}</dd>
    </div>
  );
}

export function DisposalInstructions({ task, supportContact }: Props) {
  const { instruction } = task;

  return (
    <section aria-labelledby="disposal-heading" className="space-y-6">
      <header className="space-y-2">
        <h2
          id="disposal-heading"
          className="text-lg font-semibold text-[#303133]"
        >
          Product disposal
        </h2>
        <p className="text-sm text-[#606266]">
          This step applies only if we have confirmed your product is part of
          this recall and have approved instructions for it.
        </p>
      </header>

      {/* Status: separate facts, never collapsed into one verdict. */}
      <dl className="grid gap-3 rounded border border-[#dcdfe6] bg-[#fafafa] p-4 sm:grid-cols-3">
        <StatusRow
          label="Product"
          value={ELIGIBILITY_LABELS[task.eligibilityStatus]}
        />
        <StatusRow
          label="Your photos"
          value={
            task.evidenceReviewStatus
              ? EVIDENCE_LABELS[task.evidenceReviewStatus]
              : "Not sent yet"
          }
        />
        <StatusRow
          label="Permission to dispose"
          value={
            task.authorizationStatus === "active"
              ? "Given"
              : task.authorizationStatus === "suspended"
                ? "Paused"
                : task.authorizationStatus === "revoked"
                  ? "Withdrawn"
                  : "Not given"
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
            <strong className="font-semibold">This step is paused.</strong> We
            are keeping your evidence and will contact you. Please do not
            dispose of anything yet.
          </p>
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
                {BLOCKING_MESSAGES[reason] ?? "This step cannot go ahead yet."}
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
            {task.eligibilityStatus === "not_applicable" ||
            task.eligibilityStatus === "ineligible"
              ? "There is nothing for you to dispose of."
              : "Instructions are not available for this product right now."}
          </p>
          <p>
            Please do not dispose of the product on your own initiative. We will
            only ask you to dispose of it once we have approved instructions in
            place, and you will be able to see them here.
          </p>
          {supportContact && (
            <p>If you have questions, contact us at {supportContact}.</p>
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
  return (
    <div className="space-y-6 rounded border border-[#dcdfe6] p-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[#303133]">
          {instruction.title}
        </h3>
        <p className="text-xs text-[#909399]">
          Instructions version {instruction.versionNumber} ·{" "}
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
          Safety warnings
        </h4>
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
          What to do
        </h4>
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
            Example photos
          </h4>
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
            Video
          </h4>
          <a
            className="mt-2 inline-flex items-center gap-2 text-sm text-brand underline"
            href={instruction.videoUrl}
          >
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            Watch the instructions
          </a>
          {/* A video is an alternative, never the only route: the steps above are
              the same content in text. */}
          <p className="mt-1 text-xs text-[#909399]">
            The video covers the same steps listed above.
          </p>
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
            What your photos must show
          </h4>
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
        These instructions come from the company conducting this recall. They
        are not a government permit or approval.
      </p>
    </div>
  );
}
