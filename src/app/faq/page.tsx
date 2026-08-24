// src/app/faq/page.tsx
import type { Metadata } from 'next';
import { FaqClient } from './faq-client';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Guidance for the product identification, product check, remedy selection and claim status steps on a KOI recall page.',
};

export default function FaqPage() {
  return <FaqClient />;
}