import Confirmation from '@/views/Confirmation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Thank you for your order with Raw Stitches.',
};

export default function ConfirmationPage() {
  return <Confirmation />;
}
