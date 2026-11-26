/** Old published demo data must never masquerade as a working support channel. */
export function usableRecallEmail(value: string | undefined): string {
  const email = value?.trim() ?? '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    && !/@(?:example\.(?:com|org|net)|test\.com)$|\.invalid$/i.test(email) ? email : '';
}

export function usableRecallPhone(value: string | undefined): string {
  const phone = value?.trim() ?? '';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && !/555[-\s]*SAFE/i.test(phone)
    && !/55501\d{2}$/.test(digits) && !/^(?:1)?555\d{7}$/.test(digits) ? phone : '';
}
