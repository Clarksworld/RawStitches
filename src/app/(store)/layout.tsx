import CustomerLayout from '@/components/CustomerLayout';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerLayout>{children}</CustomerLayout>;
}
