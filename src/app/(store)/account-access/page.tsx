import { Suspense } from 'react';
import CustomerAccess from '@/views/CustomerAccess';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recover Account Access',
  description: 'Recover access to your Raw Stitches account.',
};

export default function AccountAccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center font-sans text-stone">Loading...</div>}>
      <CustomerAccess />
    </Suspense>
  );
}
