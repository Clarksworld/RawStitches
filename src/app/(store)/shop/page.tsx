import { Suspense } from 'react';
import Shop from '@/views/Shop';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All Collections',
  description: 'Browse our full catalog of handcrafted Nigerian fashion: dresses, tops, sets, and traditional styles.',
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-screen-xl mx-auto px-6 py-20 text-center font-sans text-stone">Loading collection...</div>}>
      <Shop />
    </Suspense>
  );
}
