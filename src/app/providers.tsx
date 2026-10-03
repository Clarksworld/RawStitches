'use client';

import { type ReactNode } from 'react';
import { StoreProvider } from '@/store';
import { ToastContainer } from '@/components/ui';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      {children}
      <ToastContainer />
    </StoreProvider>
  );
}
