import OrderTracking from '@/views/OrderTracking';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order | Raw Stitches',
  description: 'Enter your order number to track your package delivery status in real time.',
};

export default function TrackPage() {
  return <OrderTracking />;
}
