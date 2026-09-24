"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

import { DisposalDeclaration } from "@/components/consumer/disposal-declaration";
import { DisposalEvidenceUpload } from "@/components/consumer/disposal-evidence-upload";
import { DisposalInstructions } from "@/components/consumer/disposal-instructions";
import { Button } from "@/components/ui/button";
import { getDisposalTask, type DisposalTask } from "@/lib/api-client";
import { resolveDisposalToken } from "@/lib/disposal-access";

/**
 * Loads one disposal task for its visitor.
 *
 * The visitor credential is read client-side — a stored token, or a URL fragment
 * on first arrival — because it must never reach a server log or a shared cache.
 * The page itself holds no per-visitor data on the server.
 *
 * An unopenable task and a missing credential render the **same** message: the
 * backend already refuses to distinguish them, and repeating the distinction here
 * would leak what the API deliberately withholds.
 */

interface Props {
  taskId: string;
  supportContact?: string | undefined;
}

type LoadState =
  | { status: "loading" }
  | { status: "unopenable" }
  | { status: "error"; detail: string }
  | { status: "ready"; task: DisposalTask };

/**
 * Pure read: returns the next state instead of setting it, so the effect below
 * never calls a setter synchronously and the retry button reuses it as-is.
 */
async function readTaskState(taskId: string): Promise<LoadState> {
  const token = resolveDisposalToken(taskId);
  if (!token) return { status: "unopenable" };

  const result = await getDisposalTask(taskId, token);
  if (result.ok) return { status: "ready", task: result.data };
  // 404 covers "no such task" and "wrong token" alike, and 401 is the same story
  // from the caller's side, so neither is presented as retryable.
  if (result.status === 404 || result.status === 401)
    return { status: "unopenable" };
  return { status: "error", detail: result.error.detail };
}

export function DisposalTaskLoader({ taskId, supportContact }: Props) {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void readTaskState(taskId).then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, [taskId, attempt]);

  if (state.status === "loading") {
    return (
      <div
        role="status"
        className="flex items-center gap-2 p-6 text-sm text-[#606266]"
      >
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Loading your disposal step…
      </div>
    );
  }

  if (state.status === "unopenable") {
    return (
      <div className="space-y-3 rounded border border-[#dcdfe6] p-6 text-sm text-[#606266]">
        <p className="font-semibold text-[#303133]">
          We cannot open this page.
        </p>
        <p>
          Open the link from the message we sent you about this recall, or start
          again from the recall notice. If you have lost the link, contact us
          and we will help.
        </p>
        {supportContact && <p>You can reach us at {supportContact}.</p>}
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="space-y-3 rounded border border-amber-300 bg-amber-50 p-6 text-sm text-amber-900">
        <p className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          We could not load this step.
        </p>
        <p>{state.detail}</p>
        <p>
          Nothing has changed about your claim. This is a temporary problem on
          our side.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setState({ status: "loading" });
            setAttempt((previous) => previous + 1);
          }}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DisposalInstructions task={state.task} supportContact={supportContact} />
      {/*
        The section decides from the server's actions whether there is anything to offer,
        and hides itself when there is not. The eligibility check that used to gate this
        mount was a second encoding of a rule the server already answers — and the two
        disagreed: a task whose eligibility was still pending was shown steps the policy
        would have refused to act on.
      */}
      <DisposalEvidenceUpload
        taskId={taskId}
        reviewStatus={state.task.evidenceReviewStatus}
        allowedActions={state.task.allowedActions}
        onChanged={() => setAttempt((previous) => previous + 1)}
      />
      {/*
        The declaration renders whenever the server offers either basis. Which one is
        offered is the server answer rather than this component inference, and a
        task with no basis renders nothing here.
      */}
      <DisposalDeclaration
        taskId={taskId}
        declarationTextVersion={state.task.declarationTextVersion}
        allowedActions={state.task.allowedActions}
        onDeclared={() => setAttempt((previous) => previous + 1)}
      />
    </div>
  );
}
