import Contact from '@/views/Contact';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the Raw Stitches team for inquiries, bespoke orders, and sizing assistance.',
};

export default function ContactPage() {
  return <Contact />;
}
