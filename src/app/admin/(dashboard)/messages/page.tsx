import AdminMessages from '@/admin/AdminMessages';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Inquiries | Admin Backoffice',
  description: 'Manage and respond to customer messages sent from the storefront contact page.',
};

export default function AdminMessagesPage() {
  return <AdminMessages />;
}
