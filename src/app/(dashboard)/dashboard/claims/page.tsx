
import { getI18n } from "@/lib/i18n/server";
import { ClaimsListClient } from '@/components/claims/claims-list-client';

export default async function MyClaimsPage() {
  const { t } = await getI18n();
  return (
    <ClaimsListClient
      detailBasePath="/dashboard/claims"
      title={t("ui.my.claims.ed07c1")}
      emptyDescription="Your account-linked claims will appear here after you submit or bind a claim."
    />
  );
}
