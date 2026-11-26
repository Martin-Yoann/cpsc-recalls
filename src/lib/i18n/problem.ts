import { message } from './translate';

/** HTTP codes are stable; backend English descriptions are not translation keys. */
export function problemMessage(problem: { status?: number }) {
  const status = problem.status ?? 0;
  const id = status === 0 ? 'error.network'
    : status === 401 ? 'error.unauthorized'
    : status === 403 ? 'error.forbidden'
    : status === 409 ? 'error.conflict'
    : status === 400 || status === 422 ? 'error.validation'
    : status >= 500 || status === 429 ? 'error.unavailable'
    : 'error.unexpected';
  return message(id);
}
