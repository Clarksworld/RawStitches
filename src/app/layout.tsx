import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'Raw Stitches — Nigerian Fashion Enterprise',
    template: '%s | Raw Stitches',
  },
  description: "Unique, elegant and beautifully crafted women's clothing made in Nigeria.",
  keywords: ['Nigerian Fashion', 'Women Fashion', 'Raw Stitches', 'African Contemporary Wear', 'Lagos Fashion'],
  openGraph: {
    title: 'Raw Stitches — Nigerian Fashion Enterprise',
    description: "Unique, elegant and beautifully crafted women's clothing made in Nigeria.",
    type: 'website',
    locale: 'en_NG',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[#FAF7F0] text-[#1A1A1A]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
