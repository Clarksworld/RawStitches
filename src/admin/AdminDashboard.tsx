'use client';

import { useState, useEffect } from 'react';
import { Link } from '../components/router-adapter';
import { StatsCard, Badge, Button } from '../components/ui';
import { formatPrice } from '../data';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  outOfStockCount: number;
  lowStock: any[];
  outOfStock: any[];
  salesData: { day: string; sales: number; orders: number }[];
  recentOrders: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-ivory-dark w-48 rounded" />
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-20 bg-ivory-dark rounded" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-ivory-dark rounded" />
          <div className="h-64 bg-ivory-dark rounded" />
        </div>
      </div>
    );
  }

  const totalWeekRevenue = data.salesData.reduce((s, d) => s + d.sales, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">Dashboard</h1>
          <p className="text-sm text-stone font-sans mt-0.5">Welcome back, Admin. Here's what's happening.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products/new"><Button size="sm">+ Add Product</Button></Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard label="Total Revenue" value={formatPrice(data.totalRevenue)} sub="All time (paid)" />
        <StatsCard label="Total Orders" value={String(data.totalOrders)} sub="All time" />
        <StatsCard label="Pending Orders" value={String(data.pendingOrders)} trend={data.pendingOrders > 0 ? { value: 'Needs attention', up: false } : undefined} />
        <StatsCard label="Products" value={String(data.totalProducts)} />
        <StatsCard label="Low Stock" value={String(data.lowStockCount)} sub="Products" trend={data.lowStockCount > 0 ? { value: 'Needs restocking', up: false } : undefined} />
        <StatsCard label="Customers" value={String(data.totalCustomers)} sub="Total registered" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Revenue (Last 7 Days)</h3>
            <span className="text-xs text-stone font-sans">{formatPrice(totalWeekRevenue)} total</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Outfit' }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatPrice(Number(v) || 0)} contentStyle={{ fontFamily: 'Outfit', fontSize: 12 }} />
              <Line type="monotone" dataKey="sales" stroke="#C4973F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Orders (Last 7 Days)</h3>
            <span className="text-xs text-stone font-sans">{data.salesData.reduce((s, d) => s + d.orders, 0)} total</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
              <Tooltip contentStyle={{ fontFamily: 'Outfit', fontSize: 12 }} />
              <Bar dataKey="orders" fill="#0A0A0A" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-sans font-medium text-sm text-charcoal">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-gold hover:underline font-sans">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {data.recentOrders.length === 0 ? (
              <p className="text-stone text-sm font-sans px-5 py-8 text-center">No orders yet.</p>
            ) : data.recentOrders.map((order: any) => (
              <div key={order.id} className="px-5 py-3.5 flex items-center gap-3 text-sm font-sans">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal text-xs">{order.orderNumber}</p>
                  <p className="text-stone text-xs">{order.customer?.name ?? '—'}</p>
                </div>
                <Badge variant={order.paymentStatus as any} className="shrink-0">{order.paymentStatus}</Badge>
                <p className="text-charcoal text-xs font-medium shrink-0">{formatPrice(order.total)}</p>
                <Link to={`/admin/orders/${order.orderNumber}`} className="text-gold text-xs hover:underline shrink-0">View</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory alerts */}
        <div className="space-y-4">
          {data.lowStock.length > 0 && (
            <div className="bg-white border border-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-sans font-medium text-xs text-charcoal">Low Stock</h3>
                <Badge variant="warning">{data.lowStockCount}</Badge>
              </div>
              <div className="divide-y divide-border">
                {data.lowStock.map((p: any) => (
                  <div key={p.id} className="px-4 py-2.5 flex items-center gap-3">
                    <img src={p.images?.[0]} alt={p.name} className="w-8 h-10 object-cover bg-ivory-dark shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-charcoal leading-snug truncate">{p.name}</p>
                      <p className="text-[10px] text-warning">{p.stock} left</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.outOfStock.length > 0 && (
            <div className="bg-white border border-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-sans font-medium text-xs text-charcoal">Out of Stock</h3>
                <Badge variant="error">{data.outOfStockCount}</Badge>
              </div>
              <div className="divide-y divide-border">
                {data.outOfStock.map((p: any) => (
                  <div key={p.id} className="px-4 py-2.5 flex items-center gap-3">
                    <img src={p.images?.[0]} alt={p.name} className="w-8 h-10 object-cover bg-ivory-dark shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-charcoal leading-snug truncate">{p.name}</p>
                      <p className="text-[10px] text-error">Out of stock</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.lowStock.length === 0 && data.outOfStock.length === 0 && (
            <div className="bg-white border border-border p-4 text-center">
              <p className="text-xs text-success font-sans">✓ All products are well stocked</p>
            </div>
          )}
          <div className="bg-white border border-border p-4">
            <h3 className="font-sans font-medium text-xs text-charcoal mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/admin/products/new"><Button size="sm" className="w-full text-xs">+ Add Product</Button></Link>
              <Link to="/admin/orders"><Button variant="ghost" size="sm" className="w-full text-xs">View Orders</Button></Link>
              <Link to="/admin/inventory"><Button variant="ghost" size="sm" className="w-full text-xs">Manage Inventory</Button></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
