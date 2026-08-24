import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  AlertCircle,
  Calendar,
  CheckSquare,
  Eye,
  Factory,
  FileText,
  HelpCircle,
  Info,
  Package,
  Phone,
  Search,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import { fetchCampaign } from '@/lib/api-adapter';
import { ClaimSubmitWrapper } from '@/components/consumer/claim-submit-wrapper';
import { RecallCheckCard } from '@/components/consumer/recall-check-card';
import { SafetyBanner } from '@/components/consumer/safety-banner';
import { StatusBadge } from '@/components/shared/status-badge';
import { RiskLevel } from '@/types';

interface RecallPageProps {
  params: Promise<{ slug: string }>;
}

const riskLabels: Record<string, string> = {
  [RiskLevel.CRITICAL]: 'CRITICAL RISK',
  [RiskLevel.HIGH]: 'HIGH RISK',
  [RiskLevel.MODERATE]: 'MODERATE RISK',
  [RiskLevel.LOW]: 'LOW RISK',
};

const riskColors: Record<string, string> = {
  [RiskLevel.CRITICAL]: 'bg-red-100 text-red-700 border-red-200',
  [RiskLevel.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
  [RiskLevel.MODERATE]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  [RiskLevel.LOW]: 'bg-blue-100 text-blue-700 border-blue-200',
};

export async function generateMetadata({ params }: RecallPageProps): Promise<Metadata> {
  const { campaign } = await fetchCampaign((await params).slug);
  return {
    title: campaign?.title ?? 'Recall Details',
    description: campaign?.hazardDescription ?? 'Product safety recall information',
  };
}

function SectionTitle({
  icon: Icon,
  children,
  description,
}: {
  icon: typeof Info;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5 border-b border-[#dcdfe6] pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-[#ecf5ff] text-[#409eff]">
          <Icon className="h-4 w-4" strokeWidth={1.7} />
        </div>
        <h2 className="text-lg font-semibold text-[#303133]">{children}</h2>
      </div>
      {description && (
        <p className="mt-2 text-sm text-[#606266] leading-relaxed">{description}</p>
      )}
    </div>
  );
}

function SideCard({ title, icon: Icon, children }: { title: string; icon?: typeof Info; children: React.ReactNode }) {
  return (
    <aside className="rounded border border-[#dcdfe6] bg-white p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 border-b border-[#ebeef5] pb-2.5 text-base font-semibold text-[#303133]">
        {Icon && <Icon className="h-4 w-4 text-[#409eff]" strokeWidth={1.7} />}
        {title}
      </h3>
      {children}
    </aside>
  );
}

function StatCard({ label, value, icon: Icon, trend }: { label: string; value: string; icon: typeof Info; trend?: string }) {
  return (
    <div className="rounded border border-[#ebeef5] bg-white p-4 text-center">
      <div className="flex items-center justify-center gap-2 text-[#909399]">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1.5 text-2xl font-bold text-[#303133]">{value}</p>
      {trend && <p className="mt-0.5 text-xs text-[#67c23a]">{trend}</p>}
    </div>
  );
}

export default async function RecallPage({ params }: RecallPageProps) {
  const { campaign } = await fetchCampaign((await params).slug);
  if (!campaign) notFound();
  const product = campaign.affectedProducts?.[0];
  if (!product) notFound();

  // 模拟数据（实际应从 API 获取）
  const stats = {
    affectedUnits: '12,847',
    claimsResolved: '94%',
    publishedDate: 'March 15, 2026',
    recallReference: 'CPSC ML-DEMO-2026',
  };

  return (
    <div className="recall-detail-theme bg-[#f5f7fa] text-[#303133]">
      <SafetyBanner campaign={campaign} />

      <main className="mx-auto max-w-[1250px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {/* ===== 头部区域 ===== */}
        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <StatusBadge
              variant={campaign.status}
              label="Active Recall"
              className="rounded-full border-0 bg-[#ecf5ff] px-4 py-1 text-sm font-medium text-[#409eff]"
            />
            <span
              className={`
                inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider
                ${riskColors[campaign.riskLevel] || 'bg-gray-100 text-gray-700'}
              `}
            >
              <AlertCircle className="mr-1.5 h-3 w-3" />
              {riskLabels[campaign.riskLevel] || 'UNKNOWN RISK'}
            </span>
            <span className="text-sm text-[#909399]">
              Reference: <span className="font-mono font-medium text-[#303133]">{stats.recallReference}</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight text-[#1f2937] sm:text-4xl">
            {campaign.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#606266]">
            <span className="flex items-center gap-1.5">
              <Factory className="h-4 w-4 text-[#909399]" strokeWidth={1.5} />
              Manufacturer: <strong className="font-medium text-[#303133]">Candy Master</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[#909399]" strokeWidth={1.5} />
              Published: <strong className="font-medium text-[#303133]">{stats.publishedDate}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Package className="h-4 w-4 text-[#909399]" strokeWidth={1.5} />
              Affected Units: <strong className="font-medium text-[#303133]">{stats.affectedUnits}</strong>
            </span>
          </div>

          <div className="mt-4 rounded border-l-4 border-[#e6a23c] bg-[#fdf6ec] px-4 py-3 text-sm text-[#606266]">
            <p className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#e6a23c]" />
              <span>
                <strong className="text-[#303133]">Important:</strong> Do not continue using a product
                if the recall notice instructs you to stop use. Check your product immediately.
              </span>
            </p>
          </div>
        </header>

        {/* ===== 统计卡片 ===== */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Affected Units" value={stats.affectedUnits} icon={Package} />
          <StatCard label="Claims Resolved" value={stats.claimsResolved} icon={TrendingUp} trend="↑ 12% this month" />
          <StatCard label="Remedies Available" value={String(campaign.remedies?.length || 0)} icon={Shield} />
          <StatCard label="Products Affected" value={String(campaign.affectedProducts?.length || 0)} icon={Users} />
        </div>

        {/* ===== 主内容区域 ===== */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* ===== 左侧主内容 ===== */}
          <div className="min-w-0 space-y-12">
            {/* 1. 识别产品 */}
            <section>
              <SectionTitle
                icon={Info}
                description="Check whether your product matches this recall. Locate the lot code, date code, shape, and flavor on your package."
              >
                Identify the Product
              </SectionTitle>

              <div className="rounded border border-[#dcdfe6] bg-white p-5">
                <div className="grid gap-6 border-b border-[#ebeef5] pb-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#909399]">
                      Product Details
                    </p>
                    <div className="space-y-1.5 text-sm text-[#303133]">
                      <p>
                        <span className="text-[#606266]">Name:</span>{' '}
                        <strong className="font-medium">{product.name}</strong>
                      </p>
                      <p>
                        <span className="text-[#606266]">Manufacturer:</span>{' '}
                        <strong className="font-medium">Candy Master</strong>
                      </p>
                      <p>
                        <span className="text-[#606266]">Shapes:</span>{' '}
                        <span className="inline-flex flex-wrap gap-1">
                          {product.shapes?.map((shape) => (
                            <span
                              key={shape}
                              className="rounded bg-[#ecf5ff] px-2 py-0.5 text-xs text-[#409eff]"
                            >
                              {shape}
                            </span>
                          ))}
                        </span>
                      </p>
                      <p>
                        <span className="text-[#606266]">Flavors:</span>{' '}
                        <span className="inline-flex flex-wrap gap-1">
                          {product.flavors?.map((flavor) => (
                            <span
                              key={flavor}
                              className="rounded bg-[#f0f9eb] px-2 py-0.5 text-xs text-[#67c23a]"
                            >
                              {flavor}
                            </span>
                          ))}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#909399]">
                      Hazard Description
                    </p>
                    <p className="text-sm leading-relaxed text-[#606266]">
                      {campaign.hazardDescription}
                    </p>
                    <p className="mt-2 text-sm text-[#e6a23c]">
                      ⚠️ Stop using a potentially affected product until its lot code has been checked.
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#909399]">
                    Affected Lot Codes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.affectedLots?.map((lot) => (
                      <code
                        key={lot}
                        className="rounded bg-[#ecf5ff] px-3 py-1.5 text-xs font-mono font-medium text-[#409eff]"
                      >
                        {lot}
                      </code>
                    ))}
                  </div>
                  {campaign.dateCodes && campaign.dateCodes.length > 0 && (
                    <p className="mt-2 text-xs text-[#606266]">
                      Date codes:{' '}
                      <span className="font-mono text-[#303133]">
                        {campaign.dateCodes.join(', ')}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 2. 检查产品 */}
            <section>
              <SectionTitle
                icon={CheckSquare}
                description="Enter your product codes below to verify whether your item is covered by this safety recall."
              >
                Check Your Product
              </SectionTitle>

              <div className="rounded border border-[#dcdfe6] bg-white p-5">
                <RecallCheckCard campaign={campaign} product={product} />
              </div>
            </section>

            {/* 3. 选择补救措施 */}
            <section>
              <SectionTitle
                icon={FileText}
                description="Select the resolution option that works best for you. Free replacement or full refund are available."
              >
                Choose a Remedy
              </SectionTitle>

              <div className="rounded border border-[#dcdfe6] bg-white p-5">
                {/* 进度指示 */}
                <div className="mb-5 flex items-center gap-3 text-sm text-[#606266]">
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#67c23a] text-xs font-bold text-white">
                      1
                    </span>
                    Select Remedy
                  </span>
                  <span className="text-[#dcdfe6]">—</span>
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#dcdfe6] text-xs font-bold text-[#909399]">
                      2
                    </span>
                    Submit Info
                  </span>
                  <span className="text-[#dcdfe6]">—</span>
                  <span className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#dcdfe6] text-xs font-bold text-[#909399]">
                      3
                    </span>
                    Confirmation
                  </span>
                </div>

                <ClaimSubmitWrapper campaign={campaign} />
              </div>
            </section>
          </div>

          {/* ===== 右侧边栏 ===== */}
          <div className="space-y-5 lg:pt-[72px]">
            {/* 需要帮助？ */}
            <SideCard title="Need Help?" icon={HelpCircle}>
              <div className="flex items-start gap-3 rounded bg-[#f5f7fa] p-3 text-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ecf5ff] text-[#409eff]">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-[#303133]">Consumer Support</p>
                  <p className="text-xs text-[#606266]">
                    {campaign.manufacturerContact?.split(' (')[0] || '1-800-555-0199'}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#909399]">
                    Mon-Fri, 9:00 AM - 5:00 PM ET
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#909399]">
                  What to Expect
                </p>
                <ol className="space-y-3 text-sm leading-relaxed">
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ecf5ff] text-xs font-bold text-[#409eff]">
                      1
                    </span>
                    <span className="text-[#606266]">
                      Submit your claim without creating an account
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ecf5ff] text-xs font-bold text-[#409eff]">
                      2
                    </span>
                    <span className="text-[#606266]">
                      Your submission will be reviewed by the recall team
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ecf5ff] text-xs font-bold text-[#409eff]">
                      3
                    </span>
                    <span className="text-[#606266]">
                      You will receive confirmation and next steps within 3-5 business days
                    </span>
                  </li>
                </ol>
              </div>
            </SideCard>

            {/* 查找代码位置 */}
            <SideCard title="Where to Find Codes" icon={Search}>
              <ul className="space-y-3 text-sm leading-relaxed">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f5f7fa] text-[#909399]">
                    <Package className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[#606266]">
                    Look for product identifiers (SKU, UPC, model) on the package or label
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f5f7fa] text-[#909399]">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[#606266]">
                    Lot and date codes are typically printed near the expiration date
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f5f7fa] text-[#909399]">
                    <Eye className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[#606266]">
                    Select visible attributes like shape or flavor from the label
                  </span>
                </li>
              </ul>
            </SideCard>

            {/* 快速链接 */}
<SideCard title="Quick Links" icon={FileText}>
  <div className="space-y-2 text-sm">
    <a
      href="/faq#general"
      className="block rounded px-3 py-2 text-[#409eff] transition-colors hover:bg-[#ecf5ff]"
    >
      → General Questions
    </a>
    <a
      href="/faq#identify"
      className="block rounded px-3 py-2 text-[#409eff] transition-colors hover:bg-[#ecf5ff]"
    >
      → Identify Your Product
    </a>
    <a
      href="/faq#check"
      className="block rounded px-3 py-2 text-[#409eff] transition-colors hover:bg-[#ecf5ff]"
    >
      → Check Your Product
    </a>
    <a
      href="/faq#remedy"
      className="block rounded px-3 py-2 text-[#409eff] transition-colors hover:bg-[#ecf5ff]"
    >
      → Choose a Remedy
    </a>
    <a
      href="/faq#status"
      className="block rounded px-3 py-2 text-[#409eff] transition-colors hover:bg-[#ecf5ff]"
    >
      → Check Claim Status
    </a>
  </div>
</SideCard>
          </div>
        </div>
      </main>
    </div>
  );
}