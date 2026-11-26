"use client";
import { useI18n } from "@/lib/i18n/provider";


import Link from "next/link";
import { Clock, Receipt, Package, ShieldCheck, FileText, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FAQ = {
  icon: LucideIcon;
  question: string;
  answer: string;
};

const FAQS: FAQ[] = [
  {
    icon: Clock,
    question: "ui.how.long.does.a.claim.take.5a48fb",
    answer: "ui.review.and.remedy.timing.depend.on.the.f4e060",
  },
  {
    icon: Receipt,
    question: "ui.do.i.need.my.receipt.39c1e6",
    answer: "ui.evidence.requirements.depend.on.the.recall.review.58bc7b",
  },
  {
    icon: Package,
    question: "ui.how.do.i.return.the.item.5d2484",
    answer: "ui.follow.the.return.or.disposal.instructions.in.e19eb4",
  },
  {
    icon: ShieldCheck,
    question: "ui.is.my.information.secure.266c4c",
    answer: "ui.read.the.privacy.notice.linked.in.your.7f6178",
  },
  {
    icon: FileText,
    question: "ui.what.documents.are.required.494d06",
    answer: "ui.the.claim.form.lists.the.document.types.5bb4a8",
  },
  {
    icon: Phone,
    question: "ui.how.do.i.contact.support.6012fd",
    answer: "ui.use.the.email.address.phone.number.and.9aaf1a",
  },
];

export function FAQGrid() {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {FAQS.map(({ icon: Icon, question, answer }) => (
        <article
          key={question}
          className="card-surface p-6 group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-light text-brand mb-4">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-brand transition-colors">
            {t(question)}
          </h3>
          <p className="text-sm text-secondary leading-relaxed">{t(answer)}</p>
        </article>
      ))}
    </div>
  );
}

export function FAQCTA() {
  const { t } = useI18n();
  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
      <Link href="/faq" className="btn-dark">
        {t("ui.view.all.questions.c04d7d")}</Link>
      <Link href="/lookup" className="btn-outline">
        {t("ui.check.existing.claim.391444")}</Link>
    </div>
  );
}
