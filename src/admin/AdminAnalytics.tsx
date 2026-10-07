'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '../data';
import { StatsCard, Button } from '../components/ui';
import { downloadCSV } from '../lib/csv';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PERIODS = ['7 Days', '30 Days', '3 Months', '12 Months'];

type AnalyticsData = {
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
  salesData: { day: string; date: string; sales: number; orders: number }[];
  recentOrders: any[];
};

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('7 Days');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  function handleExportCSV() {
    if (!data) return;
    downloadCSV(
      `analytics-${period.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Day', 'Date', 'Revenue (NGN)', 'Orders'],
      data.salesData.map(d => [d.day, d.date, d.sales, d.orders])
    );
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-ivory-dark w-48 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-ivory-dark rounded" />)}
        </div>
        <div className="h-64 bg-ivory-dark rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20">
        <p className="font-serif text-lg text-charcoal mb-2">Could not load analytics</p>
        <p className="text-sm text-stone font-sans mb-4">{error}</p>
        <Button onClick={loadAnalytics} variant="ghost" size="sm">Retry</Button>
      </div>
    );
  }

  const avgOrderValue = data.totalOrders > 0 ? Math.round(data.totalRevenue / data.paidOrders || 1) : 0;
  const salesData = data.salesData || [];
  const chartRevenue = salesData.reduce((s, d) => s + d.sales, 0);
  const chartOrders = salesData.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">Analytics</h1>
          <p className="text-xs text-stone font-sans mt-0.5">Live data from Neon Postgres</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-border">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-sans transition-colors ${period === p ? 'bg-black text-ivory' : 'bg-white text-stone hover:text-charcoal'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={handleExportCSV}>Export CSV</Button>
          <Button variant="ghost" size="sm" onClick={loadAnalytics}>↻ Refresh</Button>
        </div>
      </div>

      {/* KPI Stats — all from live DB */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          label="Total Revenue"
          value={formatPrice(data.totalRevenue)}
          sub={`${data.paidOrders} paid orders`}
          trend={{ value: 'Paid orders only', up: true }}
        />
        <StatsCard
          label="Total Orders"
          value={String(data.totalOrders)}
          sub={`${data.pendingOrders} pending`}
        />
        <StatsCard
          label="Avg. Order Value"
          value={formatPrice(avgOrderValue)}
          sub="Based on paid orders"
        />
        <StatsCard
          label="Registered Customers"
          value={String(data.totalCustomers)}
          sub="Total in database"
          trend={{ value: 'Growing', up: true }}
        />
        <StatsCard
          label="Total Products"
          value={String(data.totalProducts)}
          sub={`${data.lowStockCount} low stock · ${data.outOfStockCount} out`}
        />
        <StatsCard
          label="Pending Fulfilment"
          value={String(data.pendingOrders)}
          sub="Orders awaiting dispatch"
          trend={{ value: data.pendingOrders > 5 ? 'Action needed' : 'On track', up: data.pendingOrders <= 5 }}
        />
      </div>

      {/* Revenue Chart — last 7 real days from DB */}
      <div className="bg-white border border-border p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans font-semibold text-sm text-charcoal">Revenue — Last 7 Days (Live)</h3>
          <div className="text-right">
            <p className="text-xs text-stone font-sans">
              Period total: <span className="font-medium text-charcoal">{formatPrice(chartRevenue)}</span>
            </p>
            <p className="text-xs text-stone font-sans">
              {chartOrders} paid order{chartOrders !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4973F" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#C4973F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'Outfit' }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: any) => [formatPrice(Number(v) || 0), 'Revenue']}
              contentStyle={{ fontFamily: 'Outfit', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="sales" stroke="#C4973F" strokeWidth={2} fill="url(#goldGrad)" name="Revenue" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Orders per day chart */}
        <div className="bg-white border border-border p-5 shadow-xs">
          <h3 className="font-sans font-semibold text-sm text-charcoal mb-4">Daily Orders — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Outfit' }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontFamily: 'Outfit', fontSize: 12 }} />
              <Bar dataKey="orders" fill="#0A0A0A" radius={[2, 2, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-border shadow-xs">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-sans font-semibold text-sm text-charcoal">Recent Orders</h3>
            <a href="/admin/orders" className="text-xs text-gold hover:underline font-sans">View all →</a>
          </div>
          <div className="divide-y divide-border">
            {data.recentOrders.length === 0 && (
              <p className="px-5 py-8 text-sm text-stone font-sans text-center">No orders yet</p>
            )}
            {data.recentOrders.slice(0, 6).map((o: any) => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-charcoal font-sans truncate">{o.orderNumber}</p>
                  <p className="text-[11px] text-stone font-sans">{o.customer?.name} · {o.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-charcoal font-sans">{formatPrice(o.total)}</p>
                  <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${o.paymentStatus === 'paid' ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                    {o.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {(data.lowStock.length > 0 || data.outOfStock.length > 0) && (
        <div className="bg-white border border-border shadow-xs">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-sans font-semibold text-sm text-charcoal">⚠️ Inventory Alerts</h3>
          </div>
          <div className="divide-y divide-border">
            {data.outOfStock.map((p: any) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <p className="text-xs font-medium text-charcoal font-sans">{p.name}</p>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                  Out of Stock
                </span>
              </div>
            ))}
            {data.lowStock.map((p: any) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <p className="text-xs font-medium text-charcoal font-sans">{p.name}</p>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Low Stock ({p.stock} left)
                </span>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-border">
            <a href="/admin/inventory" className="text-xs text-gold hover:underline font-sans font-medium">
              Manage inventory →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
