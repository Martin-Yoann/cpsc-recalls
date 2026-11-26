"use client";
import { useI18n } from "@/lib/i18n/provider";


﻿// src/app/faq/faq-client.tsx

import { useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Input } from "@/components/ui/input";

/* =========================================================
   FAQ DATA

   Content is written around common U.S. consumer-product
   recall guidance. Specific recall notices should always
   control the actual remedy and instructions.
========================================================= */

const FAQS = [
  {
    category: "Basics",
    question: "ui.what.is.a.product.recall.c4c4e0",
    answer:
      "ui.a.product.recall.is.an.action.taken.015b7d",
  },

  {
    category: "Basics",
    question: "ui.why.has.a.product.been.recalled.5cebee",
    answer:
      "ui.a.recall.may.be.issued.because.a.1f79cc",
  },

  {
    category: "Product",
    question: "ui.how.do.i.know.if.my.product.aa3904",
    answer:
      "ui.compare.your.product.with.the.identification.information.eaf5c3",
  },

  {
    category: "Product",
    question: "ui.where.can.i.find.my.product.s.7076e1",
    answer:
      "ui.identification.information.may.be.printed.on.the.d7e496",
  },

  {
    category: "Safety",
    question: "ui.what.should.i.do.if.my.product.46b544",
    answer:
      "ui.follow.the.safety.instructions.in.the.specific.c20bed",
  },

  {
    category: "Safety",
    question: "ui.can.i.continue.using.the.product.if.bad8e8",
    answer:
      "ui.do.not.assume.that.a.recalled.product.61aabd",
  },

  {
    category: "Remedy",
    question: "ui.what.remedy.will.i.receive.0dab3e",
    answer:
      "ui.the.available.remedy.depends.on.the.specific.cb4c2e",
  },

  {
    category: "Remedy",
    question: "ui.will.i.automatically.receive.a.refund.0017fe",
    answer:
      "ui.not.necessarily.there.is.no.single.remedy.6289d8",
  },

  {
    category: "Remedy",
    question: "ui.how.long.do.i.have.to.participate.adb82b",
    answer:
      "ui.there.is.no.universal.deadline.that.applies.97226e",
  },

  {
    category: "Claims",
    question: "ui.how.do.i.file.a.recall.claim.9a7b9d",
    answer:
      "ui.if.the.recall.requires.a.claim.or.302251",
  },

  {
    category: "Claims",
    question: "ui.what.information.may.i.need.to.provide.b4fb93",
    answer:
      "ui.requirements.vary.by.recall.depending.on.the.2e1d7c",
  },

  {
    category: "Claims",
    question: "ui.i.no.longer.have.my.receipt.can.ce1b59",
    answer:
      "ui.requirements.vary.by.recall.some.recalls.may.319b67",
  },

  {
    category: "Claims",
    question: "ui.how.long.does.a.claim.take.5a48fb",
    answer:
      "ui.review.and.remedy.timing.depend.on.the.f4e060",
  },
  {
    category: "Safety",
    question: "ui.should.i.return.or.dispose.of.the.8e247d",
    answer:
      "ui.follow.the.return.or.disposal.instructions.in.d07e80",
  },
  {
    category: "Claims",
    question: "ui.how.can.i.get.help.if.i.2bed53",
    answer:
      "ui.use.the.email.address.or.phone.number.742962",
  },
  {
    category: "Claims",
    question: "ui.how.can.i.check.the.status.of.704cb3",
    answer:
      "ui.if.your.recall.provides.a.claim.number.d51826",
  },
];

const CATEGORIES = [
  { id: "Basics", label: "ui.recall.basics.89b5fa" },
  { id: "Product", label: "ui.product.identification.22b283" },
  { id: "Safety", label: "ui.safety.db6e7e" },
  { id: "Remedy", label: "ui.remedy.99e347" },
  { id: "Claims", label: "ui.claims.06e8db" },
];

/* =========================================================
   Component
========================================================= */

export function FaqClient() {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<string | null>(null);

  // 统一处理分类切换（含“全部”）
  const handleToggle = (categoryId: string | null) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return FAQS.filter((faq) => {
      const matchesSearch =
        !query ||
        t(faq.question).toLowerCase().includes(query) ||
        t(faq.answer).toLowerCase().includes(query);

      const matchesCategory =
        !activeCategory ||
        faq.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, t]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <div className="container-content py-10 sm:py-12 lg:py-16">

        {/* =================================================
            HEADER
        ================================================== */}

        <header className="mx-auto max-w-3xl">

          <div className="border-b border-slate-200 pb-8">

            <p
              className={cn(
                "text-[11px]",
                "font-semibold",
                "uppercase",
                "tracking-[0.14em]",
                "text-[#163A5F]"
              )}
            >
              {t("ui.koi.recall.ccd6c2")}</p>

            <h1
              className={cn(
                "mt-3",
                "text-[36px]",
                "font-bold",
                "leading-[1.08]",
                "tracking-[-0.025em]",
                "text-slate-900",
                "sm:text-[44px]"
              )}
            >
              {t("ui.help.center.110158")}</h1>

            <p
              className={cn(
                "mt-4",
                "max-w-2xl",
                "text-[15px]",
                "leading-7",
                "text-slate-500",
                "sm:text-[16px]"
              )}
            >
              {t("ui.clear.answers.about.product.recalls.safety.instructions.24a747")}</p>

          </div>

        </header>

        {/* =================================================
            SEARCH
        ================================================== */}

        <section className="mx-auto mt-8 max-w-3xl">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            <div className="relative flex-1">

              <Search
                aria-hidden="true"
                className={cn(
                  "pointer-events-none",
                  "absolute left-4 top-1/2 z-10",
                  "h-4 w-4 -translate-y-1/2",
                  "text-slate-400"
                )}
              />

              <Input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder={t("ui.search.recall.questions.a4a613")}
                className={cn(
                  "h-12 w-full",
                  "rounded-xl",
                  "border-slate-200",
                  "bg-white",
                  "pl-11! pr-10!",
                  "text-[14px]",
                  "text-slate-900",
                  "placeholder:text-slate-400",
                  "shadow-sm",
                  "outline-none",
                  "ring-0",
                  "focus:outline-none",
                  "focus:ring-0",
                  "focus-visible:outline-none",
                  "focus-visible:ring-4 focus-visible:ring-[#163A5F]/10",
                  "focus-visible:border-[#163A5F]"
                )}
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label={t("ui.clear.search.67300d")}
                  className={cn(
                    "absolute right-3 top-1/2 z-10",
                    "flex h-7 w-7",
                    "-translate-y-1/2",
                    "items-center justify-center",
                    "rounded-full",
                    "text-slate-400",
                    "transition-colors",
                    "hover:bg-slate-100",
                    "hover:text-slate-700",
                    "focus:outline-none"
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              )}

            </div>

            <p
              className={cn(
                "shrink-0",
                "text-[13px]",
                "text-slate-400",
                "sm:text-right"
              )}
            >
              {filteredFaqs.length}{t(" ")}
              {t(filteredFaqs.length === 1
                ? "ui.question.3b2be2"
                : "ui.questions.ff3d39")}
            </p>

          </div>

          {/* =================================================
              FILTERS
          ================================================== */}

          <div
            className={cn(
              "mt-4 flex flex-wrap items-center gap-2"
            )}
          >

            {[{ id: null, label: "ui.all.6a7208" }, ...CATEGORIES].map(
              (cat) => {
                const isActive =
                  activeCategory === cat.id;

                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => handleToggle(cat.id)}
                    aria-pressed={isActive}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5",
                      "text-[13px] font-medium",
                      "transition-colors",
                      "focus:outline-none",
                      "focus-visible:ring-2 focus-visible:ring-[#163A5F]/30",
                      isActive
                        ? cn(
                            "border-[#163A5F]",
                            "bg-[#163A5F]",
                            "text-white"
                          )
                        : cn(
                            "border-slate-200",
                            "bg-white",
                            "text-slate-600",
                            "hover:border-slate-300",
                            "hover:text-slate-900"
                          )
                    )}
                  >
                    {t(cat.label)}
                  </button>
                );
              }
            )}

          </div>

        </section>

        {/* =================================================
            FAQ LIST
        ================================================== */}

        <section className="mx-auto mt-8 max-w-3xl">

          {filteredFaqs.length > 0 ? (
            <Accordion className="gap-2.5">

              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={`${faq.category}-${faq.question}`}
                  value={`faq-${index}`}
                  className={cn(
                    "not-last:border-b-0",
                    "rounded-xl border bg-white",
                    "shadow-sm",
                    "transition-[border-color,box-shadow]",
                    "duration-200",
                    "border-slate-200",
                    "hover:border-slate-300",
                    "has-data-open:border-[#163A5F]/40",
                    "has-data-open:ring-1 has-data-open:ring-[#163A5F]/10"
                  )}
                >

                  <AccordionTrigger
                    className={cn(
                      "group",
                      "px-5 py-4",
                      "text-left",
                      "text-[14px]",
                      "font-semibold",
                      "leading-6",
                      "text-slate-800",
                      "hover:no-underline",
                      "hover:text-[#163A5F]",
                      "aria-expanded:text-[#163A5F]",
                      "sm:px-6",
                      "[&>svg]:h-4",
                      "[&>svg]:w-4",
                      "[&>svg]:text-slate-400"
                    )}
                  >
                    <span className="pr-6">
                      {t(faq.question)}
                    </span>
                  </AccordionTrigger>

                  <AccordionContent
                    className={cn(
                      "px-5 pb-5 pt-0",
                      "sm:px-6"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg bg-slate-50",
                        "px-4 py-3.5",
                        "text-[14px]",
                        "leading-7",
                        "text-slate-600"
                      )}
                    >
                      {t(faq.answer)}
                    </div>
                  </AccordionContent>

                </AccordionItem>
              ))}

            </Accordion>
          ) : (
            <div
              className={cn(
                "border border-slate-200",
                "rounded-xl",
                "bg-white",
                "px-6 py-12",
                "text-center"
              )}
            >
              <Search className="mx-auto h-5 w-5 text-slate-300" />

              <p className="mt-3 text-[14px] font-semibold text-slate-800">
                {t("ui.no.matching.questions.b9b5f4")}</p>

              <p className="mt-1 text-[13px] text-slate-500">
                {t("ui.try.another.search.term.or.category.f138c3")}</p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(null);
                }}
                className="mt-4 text-[13px] font-semibold text-[#163A5F] hover:text-[#1D4F7A]"
              >
                {t("ui.clear.filters.412226")}</button>
            </div>
          )}

        </section>

        {/* =================================================
            CHECK STATUS CTA
        ================================================== */}

        <section className="mx-auto mt-12 max-w-3xl">

          <div
            className={cn(
              "rounded-xl bg-[#163A5F]/[0.04]",
              "p-6 sm:p-7",
              "flex flex-col gap-4",
              "sm:flex-row",
              "sm:items-center",
              "sm:justify-between"
            )}
          >

            <div>

              <p className="text-[14px] font-semibold text-slate-900">
                {t("ui.need.information.about.your.case.f31719")}</p>

              <p className="mt-1 text-[12px] text-slate-500">
                {t("ui.check.your.recall.claim.using.your.claim.39fbd0")}</p>

            </div>

            <a
              href="/lookup"
              className={cn(
                "inline-flex h-9 shrink-0",
                "items-center justify-center gap-1.5",
                "rounded-lg",
                "border border-[#163A5F]",
                "bg-[#163A5F]",
                "px-4",
                "text-[13px]",
                "font-medium",
                "text-white",
                "transition-colors",
                "hover:border-[#1D4F7A]",
                "hover:bg-[#1D4F7A]"
              )}
            >
              {t("ui.check.recall.status.d85ce6")}<ArrowRight className="h-3.5 w-3.5" />
            </a>

          </div>

        </section>

        {/* =================================================
            POLICY NOTE
        ================================================== */}

        <div className="mx-auto mt-10 max-w-3xl">

          <p
            className={cn(
              "border-t border-slate-200",
              "pt-5",
              "text-[11px]",
              "leading-5",
              "text-slate-400"
            )}
          >
            {t("ui.recall.remedies.eligibility.requirements.safety.instructions.and.3579a3")}</p>

        </div>

      </div>
    </main>
  );
}
