import { Suspense } from 'react';
import CustomerAccess from '@/views/CustomerAccess';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Raw Stitches account.',
};

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center font-sans text-stone">Loading...</div>}>
      <CustomerAccess />
    </Suspense>
  );
}
