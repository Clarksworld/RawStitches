'use client';

import { useState, useEffect } from 'react';
import { Link } from '../components/router-adapter';
import { ORDERS, formatPrice, type Order } from '../data';
import { SearchInput, Badge, Button, Pagination } from '../components/ui';

const STATUS_FILTERS = ['All', 'Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      })
      .catch(console.error);
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.deliveryStatus.toLowerCase() === statusFilter.toLowerCase() || o.paymentStatus.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-charcoal">Orders</h1>
        <Button variant="ghost" size="sm">Export CSV</Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-0">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-2.5 text-xs font-sans uppercase tracking-widest transition-colors border-b-2 -mb-px whitespace-nowrap ${statusFilter === s ? 'border-gold text-gold' : 'border-transparent text-stone hover:text-charcoal'}`}
          >
            {s}
            {s !== 'All' && (
              <span className="ml-1.5 text-[10px] text-stone/60">
                ({orders.filter(o => o.deliveryStatus === s.toLowerCase() || o.paymentStatus === s.toLowerCase()).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-border p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by order number, customer name..." className="w-72" />
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm font-sans min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-ivory/50">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Order</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Date</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Amount</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Payment</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Delivery</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map(order => (
              <tr key={order.id} className="hover:bg-ivory/40 transition-colors">
                <td className="px-4 py-3 font-medium text-charcoal">{order.orderNumber}</td>
                <td className="px-4 py-3">
                  <p className="text-charcoal">{order.customer.name}</p>
                  <p className="text-xs text-stone">{order.customer.email}</p>
                </td>
                <td className="px-4 py-3 text-stone">{order.date}</td>
                <td className="px-4 py-3 font-medium text-charcoal">{formatPrice(order.total)}</td>
                <td className="px-4 py-3"><Badge variant={order.paymentStatus as any}>{order.paymentStatus}</Badge></td>
                <td className="px-4 py-3"><Badge variant={order.deliveryStatus as any}>{order.deliveryStatus}</Badge></td>
                <td className="px-4 py-3">
                  <Link to={`/admin/orders/${order.orderNumber}`} className="text-gold text-xs hover:underline font-sans">View Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-serif text-lg text-stone">No orders found</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-stone font-sans">{filtered.length} orders</p>
        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
      </div>
    </div>
  );
}
