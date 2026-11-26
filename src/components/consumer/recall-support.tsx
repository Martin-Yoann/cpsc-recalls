"use client";
import { useI18n } from "@/lib/i18n/provider";


import { Mail, Phone } from 'lucide-react';
import type { Campaign } from '@/types';
import { usableRecallEmail, usableRecallPhone } from '@/lib/recall-support';

/** Contact details belong to a published recall, not to the portal shell. */
export function RecallSupport({ support }: { support: Campaign['support'] }) {
  const { t } = useI18n();
  const email = usableRecallEmail(support?.email);
  const phone = usableRecallPhone(support?.phone);
  const telephoneHref = phone?.replace(/[^+\d]/g, '');

  if (!email && !phone) {
    return <p className="text-sm text-secondary">{t("ui.recall.support.contact.information.is.not.currently.586f70")}</p>;
  }

  return (
    <div className="space-y-3 text-sm">
      {phone && (
        <div className="flex items-start gap-2">
          <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            {telephoneHref ? <a href={`tel:${telephoneHref}`} className="font-medium underline underline-offset-4">{phone}</a> : <span>{phone}</span>}
            {support?.hours.trim() && <p className="mt-1 text-xs text-secondary">{support.hours}</p>}
          </div>
        </div>
      )}
      {email && (
        <a href={`mailto:${email}`} className="flex items-start gap-2 break-all underline underline-offset-4">
          <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{email}
        </a>
      )}
    </div>
  );
}
