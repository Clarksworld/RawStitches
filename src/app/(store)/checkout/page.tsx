import Checkout from '@/views/Checkout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Checkout',
  description: 'Complete your order with seamless payment via Paystack.',
};

export default function CheckoutPage() {
  return <Checkout />;
}
