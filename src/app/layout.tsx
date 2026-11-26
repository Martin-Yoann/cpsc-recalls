import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Providers } from '@/components/shared/providers';
import { Header } from '@/components/shared/header';
import { Footer } from '@/components/shared/footer';
import { Analytics } from '@/components/shared/analytics';
import { getI18n } from '@/lib/i18n/server';
import { I18nProvider } from '@/lib/i18n/provider';
import './globals.css';

/**
 * Fonts are self-hosted (variable latin subsets, SIL OFL 1.1) instead of loaded
 * from Google Fonts: builds and dev runs must work without outbound access to
 * fonts.googleapis.com, which is blocked in this environment.
 */
const inter = localFont({
  src: [{ path: './fonts/Inter-latin.woff2', weight: '100 900', style: 'normal' }],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = localFont({
  src: [{ path: './fonts/JetBrainsMono-latin.woff2', weight: '100 800', style: 'normal' }],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getI18n();
  return (
    <html
      lang={locale === 'es-US' ? 'es' : 'en'}
      className={`h-full antialiased ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider initialLocale={locale}><Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers></I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
