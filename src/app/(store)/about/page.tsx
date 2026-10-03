import About from '@/views/About';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story & Craft',
  description: 'The story behind Raw Stitches — Nigerian fashion enterprise based in Uyo, Akwa Ibom State.',
};

export default function AboutPage() {
  return <About />;
}
