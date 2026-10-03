import { Suspense } from 'react';
import Account from '@/views/Account';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your profile, view orders, and manage your wishlist.',
};

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="max-w-screen-xl mx-auto px-6 py-20 text-center font-sans text-stone">Loading account...</div>}>
      <Account />
    </Suspense>
  );
}
