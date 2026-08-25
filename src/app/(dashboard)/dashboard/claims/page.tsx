import { ClaimsListClient } from '@/components/claims/claims-list-client';

export default function MyClaimsPage() {
  return (
    <ClaimsListClient
      detailBasePath="/dashboard/claims"
      title="My Claims"
      emptyDescription="Your account-linked claims will appear here after you submit or bind a claim."
    />
  );
}
