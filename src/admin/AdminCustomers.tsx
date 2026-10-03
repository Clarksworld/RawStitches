'use client';

import { useState, useEffect } from 'react';
import { CUSTOMERS, ORDERS, formatPrice } from '../data';
import type { Order } from '../data';
import type { Customer } from '../db/schema';
import { SearchInput, Badge, Tabs } from '../components/ui';

type CustomerData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  lastOrder?: string | null;
  status: string;
  createdAt?: Date | string | null;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState('Orders');

  useEffect(() => {
    async function load() {
      try {
        const [custRes, ordRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/orders'),
        ]);
        const [custData, ordData] = await Promise.all([custRes.json(), ordRes.json()]);
        setCustomers(custData.customers && Array.isArray(custData.customers) ? custData.customers : CUSTOMERS);
        setOrders(ordData.orders && Array.isArray(ordData.orders) ? ordData.orders : ORDERS);
      } catch {
        setCustomers(CUSTOMERS);
        setOrders(ORDERS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const customer = selected ? customers.find(c => c.id === selected) : null;
  const customerOrders = customer ? orders.filter(o => o.customer.email === customer.email) : [];

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-ivory-dark w-48 rounded" />
        <div className="h-64 bg-ivory-dark rounded" />
      </div>
    );
  }

  if (customer) {
    return (
      <div className="space-y-5">
        <button onClick={() => setSelected(null)} className="text-xs text-stone hover:text-gold font-sans">← All Customers</button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
            <span className="text-gold font-serif text-xl">{customer.name[0]}</span>
          </div>
          <div>
            <h1 className="font-serif text-2xl text-charcoal">{customer.name}</h1>
            <p className="text-stone text-sm font-sans">{customer.email} · {customer.phone}</p>
          </div>
          <div className="ml-auto flex gap-3 text-center">
            <div className="bg-white border border-border px-5 py-3">
              <p className="font-serif text-xl text-charcoal">{customer.orders}</p>
              <p className="text-xs text-stone font-sans">Orders</p>
            </div>
            <div className="bg-white border border-border px-5 py-3">
              <p className="font-serif text-xl text-charcoal">{formatPrice(customer.spent)}</p>
              <p className="text-xs text-stone font-sans">Total Spent</p>
            </div>
          </div>
        </div>
        <Tabs tabs={['Orders', 'Addresses', 'Notes']} active={profileTab} onChange={setProfileTab} />
        {profileTab === 'Orders' && (
          <div className="space-y-3">
            {customerOrders.length === 0
              ? <p className="text-stone text-sm font-sans py-8 text-center">No orders from this customer.</p>
              : customerOrders.map(o => (
                <div key={o.id} className="bg-white border border-border p-4 flex items-center gap-4 text-sm font-sans">
                  <div className="flex-1">
                    <p className="font-medium text-charcoal">{o.orderNumber}</p>
                    <p className="text-stone text-xs">{o.date}</p>
                  </div>
                  <Badge variant={o.paymentStatus as any}>{o.paymentStatus}</Badge>
                  <p className="font-medium text-charcoal">{formatPrice(o.total)}</p>
                </div>
              ))}
          </div>
        )}
        {profileTab === 'Addresses' && (
          <div className="bg-white border border-border p-5 text-sm font-sans text-stone">
            <p>No saved addresses on file for this customer.</p>
          </div>
        )}
        {profileTab === 'Notes' && (
          <div className="bg-white border border-border p-5">
            <textarea className="w-full text-sm font-sans text-stone border-none outline-none resize-none" rows={5} placeholder="Add internal notes about this customer..." />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-charcoal">Customers</h1>
        <span className="text-xs text-stone font-sans">{customers.length} total</span>
      </div>
      <div className="bg-white border border-border p-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or email..." className="w-72" />
      </div>
      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm font-sans min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-ivory/50">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Phone</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Orders</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Total Spent</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Last Order</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-ivory/40 transition-colors cursor-pointer" onClick={() => setSelected(c.id)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                      <span className="text-gold text-xs font-bold">{c.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-charcoal">{c.name}</p>
                      <p className="text-xs text-stone">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone">{c.phone}</td>
                <td className="px-4 py-3 text-charcoal">{c.orders}</td>
                <td className="px-4 py-3 font-medium text-charcoal">{formatPrice(c.spent)}</td>
                <td className="px-4 py-3 text-stone">{c.lastOrder ?? '—'}</td>
                <td className="px-4 py-3"><Badge variant={c.status === 'active' ? 'success' : 'warning'}>{c.status}</Badge></td>
                <td className="px-4 py-3 text-gold text-xs">View →</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-serif text-lg text-stone">No customers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
