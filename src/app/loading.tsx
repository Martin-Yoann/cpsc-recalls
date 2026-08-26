import { ShieldCheck, Loader2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10" aria-busy="true">
      <div className="w-full max-w-md border border-outline bg-surface p-8 text-center shadow-none">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
        <h2 className="mt-6 text-xl font-semibold text-primary">System loading</h2>
        <p className="mt-2 text-sm text-secondary">Retrieving recall details and notice information.</p>
      </div>
    </div>
  );
}