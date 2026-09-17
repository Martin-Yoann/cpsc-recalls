import type { Metadata } from 'next';
import { Providers } from '@/components/shared/providers';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Analytics } from '@/components/shared/analytics';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'KOI — Consumer Recall Platform',
    template: '%s | KOI Recall Platform',
  },
  description: 'Check product recalls, review campaign notices, submit claims, and track resolutions.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
