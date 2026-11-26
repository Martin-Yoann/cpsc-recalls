import { message } from './translate';

/** HTTP codes are stable; backend English descriptions are not translation keys. */
export function problemMessage(problem: { status?: number; type?: string }) {
  const status = problem.status ?? 0;
  const code = problem.type?.split('/').pop();
  const typeMessages: Record<string, string> = {
    'payload-too-large': 'error.fileTooLarge',
    'unsupported-media-type': 'error.fileType',
    'not-found': 'error.notFound',
    gone: 'error.expired',
  };
  if (code && typeMessages[code]) return message(typeMessages[code]);
  const id = status === 0 ? 'error.network'
    : status === 401 ? 'error.unauthorized'
    : status === 403 ? 'error.forbidden'
    : status === 409 ? 'error.conflict'
    : status === 404 ? 'error.notFound'
    : status === 410 ? 'error.expired'
    : status === 413 ? 'error.fileTooLarge'
    : status === 415 ? 'error.fileType'
    : status === 400 || status === 422 ? 'error.validation'
    : status >= 500 || status === 429 ? 'error.unavailable'
    : 'error.unexpected';
  return message(id);
}
