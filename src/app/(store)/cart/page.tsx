import Cart from '@/views/Cart';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Bag',
  description: 'Review your items and proceed to secure checkout.',
};

export default function CartPage() {
  return <Cart />;
}
