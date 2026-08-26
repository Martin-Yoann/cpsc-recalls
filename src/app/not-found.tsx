import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-lg card-elevated p-10 text-center">
        <p className="label-eyebrow text-brand">Error 404</p>
        <h1 className="mt-3 text-[40px] leading-none font-bold tracking-[-0.02em] text-foreground">Page Not Found</h1>
        <p className="mt-4 text-secondary leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Check the URL or return home to continue.
        </p>
        <div className="mt-8">
          <Link href="/" className="btn-dark">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
