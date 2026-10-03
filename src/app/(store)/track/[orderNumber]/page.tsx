import OrderTracking from '@/views/OrderTracking';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Order',
  description: 'Real-time order tracking and shipment status.',
};

export default function OrderTrackingPage() {
  return <OrderTracking />;
}
