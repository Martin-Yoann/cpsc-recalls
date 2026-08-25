import { ClaimsListClient } from '@/components/claims/claims-list-client';

export default function ClaimsPage() {
  return (
    <div className="container-content py-8 sm:py-10">
      <ClaimsListClient
        detailBasePath="/claims"
        title="Claims"
        emptyDescription="Look up a claim as a guest or sign in to see account-linked claims here."
      />
    </div>
  );
}
