// src/app/faq/faq-client.tsx

"use client";

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
    question: "What is a product recall?",
    answer:
      "A product recall is an action taken when a product may present a safety risk or does not comply with applicable safety requirements. A recall may ask consumers to stop using the product and follow specific instructions for a repair, replacement, refund, or other remedy.",
  },

  {
    category: "Basics",
    question: "Why has a product been recalled?",
    answer:
      "A recall may be issued because a product presents a safety hazard, contains a defect, or does not meet an applicable mandatory safety standard. The specific recall notice explains the identified hazard and the products covered by the recall.",
  },

  {
    category: "Product",
    question: "How do I know if my product is affected?",
    answer:
      "Compare your product with the identification information in the recall notice. This may include the product name, brand, model number, serial number, UPC, lot code, date code, or other identifying information. A recall may apply only to specific products or production periods.",
  },

  {
    category: "Product",
    question: "Where can I find my product's model or lot number?",
    answer:
      "Identification information may be printed on the product, packaging, label, rating plate, barcode, or another location described in the recall notice. Check the specific recall notice for the exact location and information you need.",
  },

  {
    category: "Safety",
    question: "What should I do if my product is recalled?",
    answer:
      "Follow the safety instructions in the specific recall notice. In many cases, consumers are instructed to stop using the recalled product immediately and keep it away from others until the recall instructions have been completed.",
  },

  {
    category: "Safety",
    question: "Can I continue using the product if it appears to be working normally?",
    answer:
      "Do not assume that a recalled product is safe because it appears to work normally. Follow the instructions in the recall notice. If the notice instructs consumers to stop using the product, discontinue use as directed.",
  },

  {
    category: "Remedy",
    question: "What remedy will I receive?",
    answer:
      "The available remedy depends on the specific recall. A recall may offer a refund, repair, replacement, disposal instructions, or other corrective action. The recall notice should be used to determine which remedy is available for your product.",
  },

  {
    category: "Remedy",
    question: "Will I automatically receive a refund?",
    answer:
      "Not necessarily. There is no single remedy that applies to every recall. The available remedy may be a refund, repair, replacement, or another corrective action. Check the specific recall notice for the remedy offered for your product.",
  },

  {
    category: "Remedy",
    question: "How long do I have to participate in a recall?",
    answer:
      "There is no universal deadline that applies to every product recall. Recall terms and remedy availability can vary. Follow the instructions and contact information provided in the specific recall notice.",
  },

  {
    category: "Claims",
    question: "How do I file a recall claim?",
    answer:
      "If the recall requires a claim or registration, follow the submission instructions provided for that recall. You may be asked for information that helps identify the product and verify your eligibility for the available remedy.",
  },

  {
    category: "Claims",
    question: "What information may I need to provide?",
    answer:
      "Requirements vary by recall. Depending on the recall, you may need product identification information, purchase information, photographs, an order number, or other documentation. Only provide information specifically requested by the recall instructions.",
  },

  {
    category: "Claims",
    question: "I no longer have my receipt. Can I still participate?",
    answer:
      "Requirements vary by recall. Some recalls may accept alternative information to identify the product or verify the claim. Review the specific recall instructions or contact the recall administrator for guidance.",
  },

  {
    category: "Claims",
    question: "How can I check the status of my claim?",
    answer:
      "If your recall provides a claim number and reference information, you can use the Check Status page to look up the current status of your case.",
  },
];

const CATEGORIES = [
  { id: "Basics", label: "Recall Basics" },
  { id: "Product", label: "Product Identification" },
  { id: "Safety", label: "Safety" },
  { id: "Remedy", label: "Remedy" },
  { id: "Claims", label: "Claims" },
];

/* =========================================================
   Component
========================================================= */

export function FaqClient() {
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
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query);

      const matchesCategory =
        !activeCategory ||
        faq.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      <div className="container-content py-12 sm:py-16 lg:py-20">

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
              KOI Recall
            </p>

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
              Help Center
            </h1>

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
              Clear answers about product recalls, safety
              instructions, remedies, and claims.
            </p>

          </div>

        </header>

        {/* =================================================
            SEARCH
        ================================================== */}

        <section className="mx-auto mt-8 max-w-3xl">

          <div className="relative">

            <Input
              type="text"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search recall questions..."
              className={cn(
                "h-12 w-full",
                "rounded-[4px]",
                "border-slate-300",
                "bg-white",
                "pl-12 pr-10",
                "text-[14px]",
                "text-slate-900",
                "placeholder:text-slate-400",
                "shadow-none",
                "outline-none",
                "ring-0",
                "focus:outline-none",
                "focus:ring-0",
                "focus-visible:outline-none",
                "focus-visible:ring-0",
                "focus-visible:border-[#163A5F]"
              )}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className={cn(
                  "absolute right-3 top-1/2 z-10",
                  "flex h-7 w-7",
                  "-translate-y-1/2",
                  "items-center justify-center",
                  "rounded-[3px]",
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

          {/* =================================================
              FILTERS  — 优化后的按钮组
          ================================================== */}

        </section>

        {/* =================================================
            FAQ LIST
        ================================================== */}

        <section className="mx-auto mt-8 max-w-3xl">

          {filteredFaqs.length > 0 ? (
            <div
              className={cn(
                "overflow-hidden",
                "rounded-[4px]",
                "border border-slate-200",
                "bg-white"
              )}
            >

              <Accordion
                className="w-full"
              >

                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={`${faq.category}-${faq.question}`}
                    value={`faq-${index}`}
                    className={cn(
                      "border-b border-slate-200",
                      "last:border-b-0"
                    )}
                  >

                    <AccordionTrigger
                      className={cn(
                        "group",
                        "px-5 py-5",
                        "text-left",
                        "text-[14px]",
                        "font-semibold",
                        "leading-6",
                        "text-slate-800",
                        "hover:no-underline",
                        "hover:text-[#163A5F]",
                        "sm:px-6",
                        "[&>svg]:h-4",
                        "[&>svg]:w-4",
                        "[&>svg]:text-slate-400"
                      )}
                    >
                      <span className="pr-6">
                        {faq.question}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent
                      className={cn(
                        "border-t border-slate-100",
                        "px-5 pb-5 pt-4",
                        "text-[13px]",
                        "leading-6",
                        "text-slate-600",
                        "sm:px-6"
                      )}
                    >
                      {faq.answer}
                    </AccordionContent>

                  </AccordionItem>
                ))}

              </Accordion>

            </div>
          ) : (
            <div
              className={cn(
                "border border-slate-200",
                "rounded-[4px]",
                "bg-white",
                "px-6 py-12",
                "text-center"
              )}
            >
              <Search className="mx-auto h-5 w-5 text-slate-300" />

              <p className="mt-3 text-[14px] font-semibold text-slate-800">
                No matching questions
              </p>

              <p className="mt-1 text-[13px] text-slate-500">
                Try another search term or category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(null);
                }}
                className="mt-4 text-[13px] font-semibold text-[#163A5F] hover:text-[#1D4F7A]"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="mt-3 text-[11px] text-slate-400">
            {filteredFaqs.length}{" "}
            {filteredFaqs.length === 1
              ? "question"
              : "questions"}
          </div>

        </section>

        {/* =================================================
            CHECK STATUS CTA
        ================================================== */}

        <section className="mx-auto mt-12 max-w-3xl">

          <div
            className={cn(
              "border-t border-slate-200",
              "pt-7",
              "flex flex-col gap-3",
              "sm:flex-row",
              "sm:items-center",
              "sm:justify-between"
            )}
          >

            <div>

              <p className="text-[14px] font-semibold text-slate-900">
                Need information about your case?
              </p>

              <p className="mt-1 text-[12px] text-slate-500">
                Check your recall claim using your claim number
                and reference.
              </p>

            </div>

            <a
              href="/lookup"
              className={cn(
                "inline-flex h-9 shrink-0",
                "items-center justify-center gap-1.5",
                "rounded-[3px]",
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
              Check Recall Status
              <ArrowRight className="h-3.5 w-3.5" />
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
            Recall remedies, eligibility requirements, safety
            instructions, and other terms vary by recall. Always
            follow the instructions in the applicable recall
            notice.
          </p>

        </div>

      </div>
    </main>
  );
}
