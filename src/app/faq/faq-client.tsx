// src/app/faq/faq-client.tsx
'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CircleHelp,
  Clock,
  FileQuestion,
  Mail,
  MessageCircle,
  Package,
  Phone,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';

// ============================================================
// FAQ 数据（共 19 条）
// ============================================================
const FAQS = [
  // ===== 一般问题 =====
  {
    category: 'General',
    question: 'What is a product recall and why does it happen?',
    answer:
      'A product recall is a request to return, repair, or replace a product after safety concerns or defects are identified. Recalls are typically initiated by the manufacturer or by a regulatory agency when a product poses a risk to consumer health or safety. Common reasons include contamination, design flaws, manufacturing defects, or failure to meet safety standards. When a recall is issued, the manufacturer works with regulators to notify consumers and provide remedies.',
  },
  {
    category: 'General',
    question: 'How do I know if my product is affected by a recall?',
    answer:
      'Check the recall notice for specific affected lot codes, date codes, UPC numbers, or product descriptions. Enter your product details using the "Check Your Product" tool on the recall page. If you\'re still unsure, contact the manufacturer directly with your product\'s identifying information. You can also sign up for recall alerts to stay informed about future safety notices.',
  },
  {
    category: 'General',
    question: 'What should I do immediately after seeing a recall notice?',
    answer:
      'First, stop using the product immediately if the notice instructs you to do so. Then, identify your product using the details on the recall page, check if it is affected, and select a remedy option. Do not continue using a product if the recall notice instructs you to stop use, as this could pose a safety risk. Keep the product in a safe place until you have completed the claim process.',
  },
  {
    category: 'General',
    question: 'Is there a deadline for submitting a recall claim?',
    answer:
      'Deadlines vary by recall and are typically specified in the recall notice. Most recalls have a timeframe of 6 to 12 months from the publication date, but some may be open-ended. We recommend submitting your claim as soon as possible after verifying your product is affected. Check the specific recall notice for deadline information, and if you\'re unsure, contact the manufacturer for clarification.',
  },

  // ===== 产品识别 =====
  {
    category: 'Identify',
    question: 'Identify Your Product — what details should I compare?',
    answer:
      'Use the product information printed on the package or label. Compare the product name, UPC or model number, lot code, date code, and any listed attributes such as shape, flavor, size, or color against the recall notice. Lot and date codes are often printed near the expiration date or on the bottom of the package. If you cannot find a code, try checking the box, wrapper, or container from all sides—sometimes codes are printed in small print on the side or back.',
  },
  {
    category: 'Identify',
    question: 'What if I can\'t find the lot code or date code on my product?',
    answer:
      'If you cannot locate the lot or date code, try looking in these common places: near the barcode, on the bottom of the package, on the inner seal, or on the box flap. Some codes are printed in very small text and may require good lighting. If you still cannot find it, the manufacturer\'s customer support team may be able to help you identify the product based on other details like purchase date, store location, or product appearance. Take clear photos of all sides of the packaging for reference.',
  },
  {
    category: 'Identify',
    question: 'What do the codes mean and why are they important?',
    answer:
      'Lot codes and date codes are unique identifiers that help trace products to specific production batches. They are essential for determining whether your specific product is included in a recall. The lot code typically identifies the production run, while the date code indicates when the product was manufactured. Entering these codes correctly ensures an accurate match and speeds up your claim processing. Without these codes, verification may take longer.',
  },

  // ===== 产品检查 =====
  {
    category: 'Check',
    question: 'Check Your Product — how does the product check work?',
    answer:
      'Select the details that match your package, such as shape, flavor, affected lot code, or date code, then submit the check. The system compares your entries against the recall database and provides a preliminary match result. If your product matches, you can proceed to select a remedy. If no automatic match is found, it does not confirm that the product is safe—review the notice carefully or contact the manufacturer for manual verification. The check is fast and typically takes less than a minute.',
  },
  {
    category: 'Check',
    question: 'What if my product doesn\'t match but I still have concerns?',
    answer:
      'If your product does not match the recall criteria but you have safety concerns, you can still contact the manufacturer directly. Some products may have variations or packaging changes that are not fully captured in the recall database. When in doubt, err on the side of caution and reach out to consumer support with photos of your product for manual review. Your safety is the top priority, and the manufacturer is there to address any concerns.',
  },
  {
    category: 'Check',
    question: 'Can I check multiple products at once?',
    answer:
      'Currently, each product check is processed individually to ensure accuracy. If you have multiple affected products, please check each one separately by entering their specific lot codes and date codes. This ensures that each product is properly verified and each eligible claim is processed correctly. For large volumes, consider contacting the manufacturer directly for guidance on bulk verification.',
  },

  // ===== 补救措施 =====
  {
    category: 'Remedy',
    question: 'Choose a Remedy — which option should I select?',
    answer:
      'The recall page displays only the remedies made available by the manufacturer, such as a refund, replacement, repair, or voucher. Select the option that best fits your situation, then continue to provide the information and evidence requested for that remedy. Consider factors like whether you still have the product, your purchase receipt, and how quickly you need a resolution. Refunds typically process within 7-14 business days after approval, while replacements may take 5-10 business days for shipping.',
  },
  {
    category: 'Remedy',
    question: 'What evidence do I need to submit for a remedy?',
    answer:
      'Commonly required evidence includes: proof of purchase (receipt, order confirmation, bank statement), photos of the product showing affected codes, photos of the product condition, and a description of any incidents. The specific requirements vary by recall and remedy type. You will see exactly what is needed in the "Evidence requirements" section after selecting a remedy. Having these ready before starting will speed up the process significantly.',
  },
  {
    category: 'Remedy',
    question: 'How long does the remedy process take?',
    answer:
      'The processing time varies by claim and remedy type. You will receive status updates as your submission moves through review and fulfillment. Check the claim status page for the most up-to-date information on your specific claim.',
  },
  {
    category: 'Remedy',
    question: 'Can I change my remedy selection after submitting?',
    answer:
      'Once you submit your claim, you cannot change the remedy selection directly through the website. If you need to change your selection, contact the manufacturer\'s support team with your claim reference number. They will advise whether a change is possible and help you update your claim accordingly. It\'s best to review all available options carefully before submitting to avoid delays. Take your time to consider which option works best for you.',
  },
  {
    category: 'Remedy',
    question: 'What happens if I no longer have the product or receipt?',
    answer:
      'If you no longer have the product, you may still be eligible for a remedy depending on the recall terms. Some manufacturers accept claims without the product if you have other proof of purchase. If you don\'t have a receipt, try providing a bank or credit card statement showing the purchase. Contact the manufacturer\'s support team to discuss your specific situation—they can advise on what evidence is acceptable.',
  },

  // ===== 索赔状态 =====
  {
    category: 'Status',
    question: 'Check Claim Status — what do I need to look up a claim?',
    answer:
      'Open the Check Status page and enter the details associated with your submitted claim. Keep your recall reference number and claim ID handy so KOI can locate the correct record and show the latest review or resolution update. You will also need the email address used during claim submission. If you\'ve lost your claim ID, you can request a resend via the lookup page or contact support for assistance. We recommend bookmarking the status page for easy access.',
  },
  {
    category: 'Status',
    question: 'What do the different claim statuses mean?',
    answer:
      'Here\'s what each status means: Submitted (claim received, pending review), Under Review (being evaluated by the recall team), Additional Info Requested (more details needed from you), Approved (remedy approved, processing fulfillment), Completed (remedy fulfilled, claim closed), or Rejected (claim did not meet eligibility criteria). You will receive notifications when your status changes, and you can always check the status page for the most up-to-date information.',
  },
  {
    category: 'Status',
    question: 'What should I do if my claim status hasn\'t changed for a while?',
    answer:
      'If your claim status has not changed for more than 10 business days, first check your spam or junk email folder for any missed communications. Then, use the claim status page to confirm your contact information is correct. If everything looks right, reach out to the manufacturer\'s support team with your claim reference number for a status update. Typical review times vary depending on the complexity of the claim and the volume of submissions.',
  },
  {
    category: 'Status',
    question: 'Will I be notified when my claim is approved?',
    answer:
      'Yes, you will receive an email notification when your claim status changes. Notifications are sent for: claim received, under review, additional info needed, approved, and completed. Make sure to check your spam or junk folder if you don\'t see the email. You can also check the status page at any time for real-time updates without waiting for email notifications.',
  },
];

// ============================================================
// 分类配置
// ============================================================
const CATEGORY_COLORS: Record<string, string> = {
  General: 'bg-[#EEF8FF] text-[#3788C8] border-[#A9D5F5]',
  Identify: 'bg-[#EDFFF7] text-[#3FA77D] border-[#A9E5CC]',
  Check: 'bg-[#FFF4D6] text-[#B57924] border-[#F5D98B]',
  Remedy: 'bg-[#FFF0F4] text-[#E85D75] border-[#F4B9C6]',
  Status: 'bg-[#FFF9F7] text-[#846E76] border-[#E8D4DA]',
};

const CATEGORY_ICONS: Record<string, typeof CircleHelp> = {
  General: Sparkles,
  Identify: Package,
  Check: Search,
  Remedy: Shield,
  Status: Clock,
};

const CATEGORY_LABELS: Record<string, string> = {
  General: 'General Questions',
  Identify: 'Product Identification',
  Check: 'Product Check',
  Remedy: 'Remedy Selection',
  Status: 'Claim Status',
};

// ============================================================
// 分类 -> 锚点 ID 映射
// ============================================================
const CATEGORY_ANCHOR_MAP: Record<string, string> = {
  General: 'general',
  Identify: 'identify',
  Check: 'check',
  Remedy: 'remedy',
  Status: 'status',
};

// ============================================================
// 子组件：分类标签
// ============================================================
function CategoryPill({
  category,
  active,
  onClick,
  count,
}: {
  category: string;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  const Icon = CATEGORY_ICONS[category] || CircleHelp;
  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
        ${
          active
            ? `${CATEGORY_COLORS[category]} border-2 shadow-sm`
            : 'border border-[#dcdfe6] bg-white text-[#606266] hover:border-[#409eff] hover:bg-[#ecf5ff] hover:text-[#409eff]'
        }
      `}
    >
      <Icon className="h-3.5 w-3.5" />
      {CATEGORY_LABELS[category] || category}
      <span
        className={`
          ml-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold
          ${active ? 'bg-white/50' : 'bg-[#f5f7fa]'}
        `}
      >
        {count}
      </span>
    </button>
  );
}

// ============================================================
// 主组件
// ============================================================
export function FaqClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // ===== 平滑滚动：页面加载时启用 =====
  useEffect(() => {
    // 启用平滑滚动
    document.documentElement.style.scrollBehavior = 'smooth';

    // 如果 URL 中有 hash，延迟一下确保 DOM 渲染完成后再滚动
    if (window.location.hash) {
      setTimeout(() => {
        const targetId = window.location.hash.replace('#', '');
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }

    return () => {
      // 组件卸载时恢复（可选）
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  const filteredFaqs = useMemo(() => {
    let filtered = FAQS;
    if (activeCategory) {
      filtered = filtered.filter((faq) => faq.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query),
      );
    }
    return filtered;
  }, [activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    FAQS.forEach((faq) => {
      counts[faq.category] = (counts[faq.category] || 0) + 1;
    });
    return counts;
  }, []);

  const categories = Object.keys(CATEGORY_LABELS).filter(
    (cat) => categoryCounts[cat] > 0,
  );
  const totalQuestions = FAQS.length;

  return (
    <>
      {/* ===== 头部区域（优化后） ===== */}
      <section className="border-b border-[#dcdfe6] bg-gradient-to-b from-white to-[#f8faff]">
        <div className="mx-auto max-w-[1250px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            {/* 标签 */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EEF8FF] px-4 py-1.5 text-xs font-medium text-[#3788C8]">
              <CircleHelp className="h-3.5 w-3.5" />
              Help Center
            </div>

            {/* 主标题 */}
            <h1 className="text-3xl font-bold tracking-tight text-[#49343D] sm:text-4xl lg:text-5xl">
              Frequently Asked <br className="sm:hidden" />
              <span className="text-[#F05B78]">Questions</span>
            </h1>

            {/* 副标题 */}
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#765F68] sm:text-lg">
              Everything you need to know about product recalls, from identification to claim resolution.
              Find clear answers to the most common questions—all in one place.
            </p>

            {/* 统计信息 */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-[#AA929B]">
              <span className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF8FF] text-xs font-bold text-[#3788C8]">
                  {totalQuestions}
                </span>
                Articles
              </span>
              <span className="h-4 w-px bg-[#F4D5DC]" />
              <span className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EEF8FF] text-xs font-bold text-[#3788C8]">
                  {categories.length}
                </span>
                Categories
              </span>
              <span className="h-4 w-px bg-[#dcdfe6]" />
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#909399]" />
                Updated regularly
              </span>
            </div>

            {/* 快捷入口（温和的 CTA） */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/recalls"
                className="inline-flex items-center gap-2 rounded-lg border border-[#dcdfe6] bg-white px-4 py-2 text-sm font-medium text-[#606266] transition-all hover:border-[#409eff] hover:bg-[#ecf5ff] hover:text-[#409eff]"
              >
                Browse all recalls
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/recalls/music-lollipop-demo-2026"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#409eff] transition-colors hover:text-[#337ecc]"
              >
                View a sample recall
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 主要内容区域 ===== */}
      <section className="bg-[#f7f9fc] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1250px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
            {/* ===== 左侧边栏 ===== */}
            <div className="space-y-4">
              {/* 分类过滤器 */}
              <div className="rounded-xl border border-[#dcdfe6] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-[#409eff]" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#909399]">
                    Filter by Category
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className={`
                      inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200
                      ${
                        !activeCategory
                          ? 'bg-[#409eff] text-white shadow-md shadow-[#409eff]/20'
                          : 'border border-[#dcdfe6] bg-white text-[#606266] hover:border-[#409eff] hover:bg-[#ecf5ff] hover:text-[#409eff]'
                      }
                    `}
                  >
                    All Questions
                    <span
                      className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        !activeCategory
                          ? 'bg-white/20 text-white'
                          : 'bg-[#f5f7fa] text-[#606266]'
                      }`}
                    >
                      {totalQuestions}
                    </span>
                  </button>
                  {categories.map((category) => (
                    <CategoryPill
                      key={category}
                      category={category}
                      active={activeCategory === category}
                      onClick={() =>
                        setActiveCategory(activeCategory === category ? null : category)
                      }
                      count={categoryCounts[category]}
                    />
                  ))}
                </div>
              </div>

              {/* 统计信息 */}
              <div className="rounded-xl border border-[#dcdfe6] bg-white p-5 shadow-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#909399]">
                  Quick Stats
                </p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-[#ebeef5] pb-3">
                    <span className="flex items-center gap-2 text-[#606266]">
                      <MessageCircle className="h-4 w-4 text-[#409eff]" />
                      Total Questions
                    </span>
                    <span className="font-bold text-[#303133]">{totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#ebeef5] pb-3">
                    <span className="flex items-center gap-2 text-[#606266]">
                      <Package className="h-4 w-4 text-[#67c23a]" />
                      Categories
                    </span>
                    <span className="font-bold text-[#303133]">{categories.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[#606266]">
                      <Clock className="h-4 w-4 text-[#e6a23c]" />
                      Avg. Response Time
                    </span>
                    <span className="font-bold text-[#303133]">3-5 days</span>
                  </div>
                </div>
              </div>

              {/* 仍需要帮助？ */}
              <div className="rounded-xl border-2 border-[#409eff] bg-[#ecf5ff] p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <CircleHelp className="h-5 w-5 text-[#409eff]" />
                  <p className="font-semibold text-[#303133]">Still need help?</p>
                </div>
                <p className="mt-1 text-sm text-[#606266]">
                  Our support team is here to assist you.
                </p>
                <div className="mt-4 space-y-2.5 text-sm">
                  <a
                    href="mailto:support@koi-recall.com"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#409eff] transition-colors hover:bg-[#d9ecff]"
                  >
                    <Mail className="h-4 w-4" />
                    support@koi-recall.com
                  </a>
                  <a
                    href="tel:1-800-555-0199"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[#409eff] transition-colors hover:bg-[#d9ecff]"
                  >
                    <Phone className="h-4 w-4" />
                    1-800-555-0199
                  </a>
                  <p className="mt-1 px-3 text-xs text-[#909399]">
                    Mon–Fri, 9:00 AM – 5:00 PM ET
                  </p>
                </div>
              </div>
            </div>

            {/* ===== 右侧 FAQ 列表 ===== */}
            <div>
              {/* 搜索框 */}
              <div className="mb-6">
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-12 items-center justify-center"
                  >
                    <Search className="h-4 w-4 shrink-0 text-[#909399]" />
                  </span>
                  <Input
                    type="text"
                    placeholder="Search for questions or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="!h-12 w-full rounded-xl border-[#dcdfe6] !pl-12 !pr-12 text-sm leading-5 text-[#303133] placeholder:text-[#c0c4cc] shadow-sm transition-all focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#909399] transition-colors hover:bg-[#f5f7fa] hover:text-[#303133]"
                    >
                      <span className="sr-only">Clear search</span>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="mt-2 text-sm text-[#606266]">
                    Found{' '}
                    <span className="font-semibold text-[#303133]">
                      {filteredFaqs.length}
                    </span>{' '}
                    result{filteredFaqs.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* ===== FAQ 手风琴（带锚点 ID） ===== */}
              {filteredFaqs.length > 0 ? (
                <Accordion className="space-y-3">
                  {(() => {
                    // 用于追踪已添加锚点的分类
                    const addedAnchors = new Set<string>();

                    return filteredFaqs.map((faq, index) => {
                      const anchorId = CATEGORY_ANCHOR_MAP[faq.category];
                      // 只有该分类的第一个问题才添加锚点 ID
                      const shouldAddAnchor = anchorId && !addedAnchors.has(anchorId);

                      if (shouldAddAnchor) {
                        addedAnchors.add(anchorId);
                      }

                      return (
                        <AccordionItem
                          key={`${faq.question}-${index}`}
                          value={`${faq.question}-${index}`}
                          id={shouldAddAnchor ? anchorId : undefined}
                          className={`
                            overflow-hidden rounded-xl border border-[#dcdfe6] bg-white shadow-sm transition-shadow hover:shadow-md data-[state=open]:border-[#409eff]
                            ${shouldAddAnchor ? 'scroll-mt-20' : ''}
                          `}
                        >
                          <AccordionTrigger
                            className={`
                              group relative flex w-full items-center justify-between gap-4 px-5 py-4 pr-14 text-left
                              hover:no-underline hover:bg-[#f7f9fc]
                              data-[state=open]:bg-[#ecf5ff] data-[state=open]:shadow-sm
                              [&>svg]:absolute [&>svg]:right-5 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2
                              [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-[#909399]
                              [&>svg]:transition-all [&>svg]:duration-300
                              [&[data-state="open"]>svg]:rotate-180 [&[data-state="open"]>svg]:text-[#409eff]
                              [&[data-state="open"]>svg]:scale-110
                            `}
                          >
                            <div className="flex min-w-0 items-start gap-4">
                              <span
                                className={`
                                  mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold
                                  transition-colors duration-300
                                  bg-[#ecf5ff] text-[#409eff]
                                  group-data-[state=open]:bg-[#409eff] group-data-[state=open]:text-white
                                `}
                              >
                                {index + 1}
                              </span>
                              <span
                                className={`
                                  min-w-0 flex-1 text-sm font-semibold leading-6 transition-colors duration-300
                                  text-[#303133]
                                  group-data-[state=open]:text-[#409eff]
                                `}
                              >
                                {faq.question}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-5 pb-5 pt-0">
                            <div className="mt-3 border-t border-[#ebeef5] pt-4">
                              <div className="mb-3 flex flex-wrap items-center gap-2">
                                <span
                                  className={`
                                    inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium
                                    ${
                                      CATEGORY_COLORS[faq.category] ||
                                      'bg-[#f5f7fa] text-[#606266] border-[#d9d9d9]'
                                    }
                                  `}
                                >
                                  {CATEGORY_LABELS[faq.category] || faq.category}
                                </span>
                              </div>
                              <p className="leading-relaxed text-[#606266]">{faq.answer}</p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    });
                  })()}
                </Accordion>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#dcdfe6] bg-white py-16 text-center">
                  <div className="rounded-full bg-[#f5f7fa] p-4">
                    <Search className="h-8 w-8 text-[#c0c4cc]" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-[#303133]">
                    No results found
                  </p>
                  <p className="text-sm text-[#606266]">
                    Try adjusting your search terms or category filter
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setActiveCategory(null);
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-[#409eff] transition-colors hover:bg-[#ecf5ff]"
                  >
                    Clear all filters
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* 底部提示 */}
              <div className="mt-6 rounded-xl border border-[#ebeef5] bg-white p-4 shadow-sm">
                <p className="flex items-start gap-3 text-sm text-[#606266]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#409eff]" />
                    <strong className="text-[#303133]">Disclaimer:</strong> These FAQs provide
                    general guidance. For product-specific safety instructions, always follow the
                    official recall notice and the manufacturer&apos;s direction. If you have an
                    urgent safety concern, contact the manufacturer immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}