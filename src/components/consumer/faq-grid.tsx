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
    question: "How long does a claim take?",
    answer: "Most claims are reviewed within 5–7 business days. You'll receive status updates by email and can track progress in your dashboard.",
  },
  {
    icon: Receipt,
    question: "Do I need my receipt?",
    answer: "Proof of purchase is required for refund claims. Replacement claims only need a photo of the product showing the lot code.",
  },
  {
    icon: Package,
    question: "How do I return the item?",
    answer: "Most remedies don't require a return. Stop using the product, keep it in a safe place, and follow the remedy-specific instructions we'll email you.",
  },
  {
    icon: ShieldCheck,
    question: "Is my information secure?",
    answer: "All claim data is encrypted in transit and at rest. We never share personal information with third parties beyond the manufacturer handling your remedy.",
  },
  {
    icon: FileText,
    question: "What documents are required?",
    answer: "At minimum: product photo showing the lot code. For refunds: also a receipt or bank statement showing the purchase.",
  },
  {
    icon: Phone,
    question: "How do I contact support?",
    answer: "Call 1-800-555-SAFE (Mon–Fri 9am–5pm ET) or email support@koiimprtinc.com. We respond within one business day.",
  },
];

export function FAQGrid() {
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
            {question}
          </h3>
          <p className="text-sm text-secondary leading-relaxed">{answer}</p>
        </article>
      ))}
    </div>
  );
}

export function FAQCTA() {
  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
      <Link href="/faq" className="btn-dark">
        View All Questions
      </Link>
      <Link href="/lookup" className="btn-outline">
        Check Existing Claim
      </Link>
    </div>
  );
}
