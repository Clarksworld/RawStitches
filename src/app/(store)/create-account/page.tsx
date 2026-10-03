import { Suspense } from 'react';
import CustomerAccess from '@/views/CustomerAccess';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create an account to track orders and save your favorites.',
};

export default function CreateAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center font-sans text-stone">Loading...</div>}>
      <CustomerAccess />
    </Suspense>
  );
}
