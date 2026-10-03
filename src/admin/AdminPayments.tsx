'use client';

import { ORDERS, formatPrice } from '../data';
import { Badge, StatsCard } from '../components/ui';

export default function AdminPayments() {
  const paid = ORDERS.filter(o => o.paymentStatus === 'paid');
  const pending = ORDERS.filter(o => o.paymentStatus === 'pending');
  const failed = ORDERS.filter(o => o.paymentStatus === 'failed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-charcoal">Payments</h1>
        <div className="flex gap-2">
          <button className="text-xs text-stone hover:text-gold font-sans border border-border px-3 py-1.5 transition-colors">Export CSV</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Received" value={formatPrice(paid.reduce((s, o) => s + o.total, 0))} />
        <StatsCard label="Successful" value={String(paid.length)} />
        <StatsCard label="Pending" value={String(pending.length)} />
        <StatsCard label="Failed / Refunded" value={String(failed.length)} />
      </div>

      <div className="bg-ivory-dark border border-border px-4 py-3 text-xs text-stone font-sans">
        💡 This payment dashboard is designed to be populated by a payment gateway (Paystack or Flutterwave). Connect your gateway to see live transaction data.
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm font-sans min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-ivory/50">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Order</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Method</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Reference</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Status</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ORDERS.map(order => (
              <tr key={order.id} className="hover:bg-ivory/40 transition-colors">
                <td className="px-4 py-3 font-medium text-charcoal">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <p className="text-charcoal">{order.customer.name}</p>
                  <p className="text-xs text-stone">{order.customer.email}</p>
                </td>
                <td className="px-4 py-3 font-medium text-charcoal">{formatPrice(order.total)}</td>
                <td className="px-4 py-3 text-stone">{order.paymentMethod}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone">{order.paymentRef || '—'}</td>
                <td className="px-4 py-3"><Badge variant={order.paymentStatus as any}>{order.paymentStatus}</Badge></td>
                <td className="px-4 py-3 text-stone">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
