import Home from '@/views/Home';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home — Nigerian Fashion Enterprise',
  description: "Explore elegant, contemporary Nigerian women's fashion by Raw Stitches. Handcrafted dresses, two-piece sets, and bespoke pieces.",
};

export default function HomePage() {
  return <Home />;
}
