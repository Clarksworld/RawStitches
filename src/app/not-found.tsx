import { Suspense } from 'react';
import NotFound from '@/views/NotFound';
import CustomerLayout from '@/components/CustomerLayout';

export default function GlobalNotFound() {
  return (
    <Suspense fallback={null}>
      <CustomerLayout>
        <NotFound />
      </CustomerLayout>
    </Suspense>
  );
}
