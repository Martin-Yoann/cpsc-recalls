import { put } from "@vercel/blob/client";

/**
 * Uploads one private object.
 *
 * When this app is deployed, the browser transfers the file straight to the blob
 * store: the API only mints a constrained token, and the store posts a completion
 * callback when the transfer finishes. A development machine has no store to
 * transfer to, so `put()` cannot work there at all.
 *
 * Naming the API's development endpoint in `NEXT_PUBLIC_LOCAL_UPLOAD_URL` switches
 * to posting the file there instead. That endpoint writes it through the
 * filesystem adapter and runs the same reconciliation the store's callback runs,
 * so the `document_uploads` row reaches the same state either way — which is why
 * nothing after this call has to know which path was taken.
 *
 * Unset, this is exactly the call it replaced.
 */
const LOCAL_UPLOAD_URL = process.env.NEXT_PUBLIC_LOCAL_UPLOAD_URL;

export async function uploadPrivateObject(input: {
  pathname: string;
  file: File;
  clientToken: string;
  contentType: string;
}): Promise<void> {
  if (!LOCAL_UPLOAD_URL) {
    await put(input.pathname, input.file, {
      access: "private",
      token: input.clientToken,
      contentType: input.contentType,
    });
    return;
  }

  const form = new FormData();
  form.append("file", input.file, input.file.name);
  const response = await fetch(
    `${LOCAL_UPLOAD_URL}?pathname=${encodeURIComponent(input.pathname)}`,
    {
      method: "POST",
      headers: { "X-Blob-Token": input.clientToken },
      body: form,
    },
  );
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(
      body?.detail ?? `The upload was refused (${response.status}).`,
    );
  }
}
