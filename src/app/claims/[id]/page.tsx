import { ClaimDetailClient } from '@/components/claims/claim-detail-client';

export default async function PublicClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="container-content py-8 sm:py-10">
      <ClaimDetailClient claimNumber={id} backHref="/claims" backLabel="Back to Claims" />
    </div>
  );
}
