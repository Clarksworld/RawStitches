import SizeGuide from '@/views/SizeGuide';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Size Guide | Raw Stitches Nigeria Enterprise',
  description: 'Measurement charts and silhouette guide for Raw Stitches womenswear collections.',
};

export default function SizeGuidePage() {
  return <SizeGuide />;
}
