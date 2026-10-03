import AdminLogin from '@/admin/AdminLogin';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Portal Login',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminLogin />;
}
