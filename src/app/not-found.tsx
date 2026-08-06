// ============================================================
// KOI Recall Platform — 404 Not Found
// ============================================================

import Link from 'next/link';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blade-safety-light mb-6">
        <ShieldOff className="h-10 w-10 text-blade-safety" />
      </div>
      <h1 className="text-display-md font-bold text-text-primary mb-3">Page Not Found</h1>
      <p className="text-body-md text-text-secondary max-w-md mb-8 leading-relaxed">
        This page does not exist or has been moved. If you believe this is an error
        with an active recall, please verify the URL or return to the safety portal.
      </p>
      <Link href="/">
        <Button
          size="lg"
          className="bg-blade-safety hover:bg-blade-safety-dark text-white font-medium"
        >
          Return to Safety Portal
        </Button>
      </Link>
    </div>
  );
}
