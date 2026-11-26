
import { getI18n } from "@/lib/i18n/server";
import { ClaimsListClient } from '@/components/claims/claims-list-client';

export default async function ClaimsPage() {
  const { t } = await getI18n();
  return (
    <div className="container-content py-8 sm:py-10">
      <ClaimsListClient
        detailBasePath="/claims"
        title={t("ui.claims.06e8db")}
        emptyDescription="Look up a claim as a guest or sign in to see account-linked claims here."
      />
    </div>
  );
}
