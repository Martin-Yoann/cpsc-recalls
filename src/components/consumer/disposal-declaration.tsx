"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { recordDisposalDeclaration } from "@/lib/api-client";
import { resolveDisposalToken } from "@/lib/disposal-access";

/**
 * Page 5 for the applicable branch: the consumer's declaration.
 *
 * Two bases, and which one is offered comes from the server's `allowedActions`
 * rather than from this component reading `authorizationStatus` itself:
 *
 *   - completed as instructed, against the authorization this task holds. The
 *     server resolves that authorization, so the client never names a permission.
 *   - an exception, for someone who already disposed of the unit before we asked.
 *     The exception path exists so the timeline stays true instead of a permission
 *     being back-dated to fit it.
 *
 * The declaration version comes from the task, so the text a consumer agreed to is
 * recorded as the version they actually saw.
 */

interface Props {
  taskId: string;
  /** Pinned statement version, or null when the task has none yet. */
  declarationTextVersion: string | null;
  allowedActions: readonly string[];
  onDeclared: () => void;
}

const EXCEPTION_OPTIONS = [
  {
    value: "already_disposed_before_authorization" as const,
    label: "I had already disposed of it before you asked me to",
  },
  {
    value: "evidence_unavailable" as const,
    label: "I could not take the photos you asked for",
  },
  { value: "other" as const, label: "Something else" },
];

export function DisposalDeclaration({
  taskId,
  declarationTextVersion,
  allowedActions,
  onDeclared,
}: Props) {
  const mayComplete = allowedActions.includes("disposal.declare_completion");
  const mayExcept = allowedActions.includes("disposal.declare_exception");
  const [showException, setShowException] = useState(false);
  const [exceptionType, setExceptionType] =
    useState<(typeof EXCEPTION_OPTIONS)[number]["value"]>(
      "already_disposed_before_authorization",
    );
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  if (!mayComplete && !mayExcept) return null;

  const submit = async (
    body: Parameters<typeof recordDisposalDeclaration>[2],
  ) => {
    const token = resolveDisposalToken(taskId);
    if (!token) {
      setProblem("We cannot open this step from this browser.");
      return;
    }
    setBusy(true);
    setProblem(null);
    const result = await recordDisposalDeclaration(taskId, token, body);
    setBusy(false);
    if (!result.ok) {
      setProblem(result.error.detail);
      return;
    }
    onDeclared();
  };

  const version = declarationTextVersion ?? "unversioned";

  return (
    <section
      aria-labelledby="disposal-declaration"
      className="space-y-4 rounded border border-[#dcdfe6] p-4"
    >
      <div className="space-y-1">
        <h3
          id="disposal-declaration"
          className="text-sm font-semibold text-[#303133]"
        >
          Confirm what happened
        </h3>
        <p className="text-xs text-[#909399]">
          This is the last step. It records your statement against version {version}{" "}
          of the instructions above.
        </p>
      </div>

      {mayComplete && (
        <div className="space-y-2">
          <Button
            type="button"
            disabled={busy}
            onClick={() =>
              void submit({ declarationTextVersion: version })
            }
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            {busy ? "Recording…" : "I disposed of it as instructed"}
          </Button>
          <p className="text-xs text-[#909399]">
            Choose this once you have followed the steps above.
          </p>
        </div>
      )}

      {mayExcept && !showException && (
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => setShowException(true)}
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" />
          I cannot do this, or I already did something else
        </Button>
      )}

      {mayExcept && showException && (
        <div className="space-y-3 rounded border border-[#faecd8] bg-[#fdf6ec] p-3">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-[#303133]">
              What happened?
            </legend>
            {EXCEPTION_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-start gap-2 text-sm text-[#303133]"
              >
                <input
                  type="radio"
                  name="disposal-exception"
                  value={option.value}
                  checked={exceptionType === option.value}
                  onChange={() => setExceptionType(option.value)}
                  className="mt-1"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="disposal-exception-note" className="text-sm font-medium text-[#303133]">
              Please explain
            </Label>
            <Textarea
              id="disposal-exception-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="rounded border border-[#dcdfe6] px-3 py-2 text-sm text-[#303133]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={busy || note.trim().length === 0}
              onClick={() =>
                void submit({
                  declarationTextVersion: version,
                  exceptionType,
                  exceptionNote: note.trim(),
                })
              }
            >
              {busy ? "Recording…" : "Record this"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => setShowException(false)}
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-[#909399]">
            This does not change your claim or your remedy. It records what actually
            happened, and our team follows up.
          </p>
        </div>
      )}

      {problem && (
        <p role="alert" className="flex items-center gap-2 text-sm text-[#f56c6c]">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {problem}
        </p>
      )}
    </section>
  );
}
