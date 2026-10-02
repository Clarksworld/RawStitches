import { useState } from 'react';
import { PRODUCTS, ORDERS, CUSTOMERS, formatPrice } from '../data';
import { StatsCard, Button } from '../components/ui';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const PERIODS = ['Today', '7 Days', '30 Days', '3 Months', '12 Months'];

const weeklyData = [
  { period: 'Mon', revenue: 42000, orders: 3, customers: 2 },
  { period: 'Tue', revenue: 58000, orders: 4, customers: 4 },
  { period: 'Wed', revenue: 31000, orders: 2, customers: 1 },
  { period: 'Thu', revenue: 87000, orders: 6, customers: 5 },
  { period: 'Fri', revenue: 120000, orders: 9, customers: 8 },
  { period: 'Sat', revenue: 148000, orders: 11, customers: 9 },
  { period: 'Sun', revenue: 95000, orders: 7, customers: 6 },
];

const topProducts = [...PRODUCTS]
  .sort((a, b) => b.reviewCount - a.reviewCount)
  .slice(0, 5);

export default function AdminAnalytics() {
  const [period, setPeriod] = useState('7 Days');

  const totalRevenue = weeklyData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = weeklyData.reduce((s, d) => s + d.orders, 0);
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-charcoal">Analytics</h1>
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
          <Button variant="ghost" size="sm">Export CSV</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard label="Revenue" value={formatPrice(totalRevenue)} trend={{ value: '+18% vs last period', up: true }} />
        <StatsCard label="Orders" value={String(totalOrders)} trend={{ value: '+12%', up: true }} />
        <StatsCard label="Avg. Order Value" value={formatPrice(avgOrderValue)} trend={{ value: '+5%', up: true }} />
        <StatsCard label="Customers" value={String(CUSTOMERS.length)} trend={{ value: '+2 new', up: true }} />
        <StatsCard label="Conversion Rate" value="3.4%" sub="Placeholder metric" />
        <StatsCard label="Products Sold" value={String(weeklyData.reduce((s, d) => s + d.orders * 1.2 | 0, 0))} />
      </div>

      {/* Revenue chart */}
      <div className="bg-white border border-border p-5">
        <h3 className="font-sans font-medium text-sm text-charcoal mb-4">Revenue — {period}</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C4973F" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#C4973F" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
            <XAxis dataKey="period" tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
            <YAxis tick={{ fontSize: 11, fontFamily: 'Outfit' }} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [formatPrice(v), 'Revenue']} contentStyle={{ fontFamily: 'Outfit', fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke="#C4973F" strokeWidth={2} fill="url(#goldGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Orders chart */}
        <div className="bg-white border border-border p-5">
          <h3 className="font-sans font-medium text-sm text-charcoal mb-4">Orders vs Customers</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: 'Outfit' }} />
              <Tooltip contentStyle={{ fontFamily: 'Outfit', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Outfit' }} />
              <Bar dataKey="orders" fill="#0A0A0A" radius={[2, 2, 0, 0]} name="Orders" />
              <Bar dataKey="customers" fill="#C4973F" radius={[2, 2, 0, 0]} name="Customers" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-sans font-medium text-sm text-charcoal">Top Products</h3>
          </div>
          <div className="divide-y divide-border">
            {topProducts.map((p, i) => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                <span className="text-stone text-xs w-5 font-sans">{i + 1}</span>
                <img src={p.images[0]} alt={p.name} className="w-8 h-10 object-cover bg-ivory-dark shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-charcoal truncate">{p.name}</p>
                  <p className="text-[10px] text-stone font-sans">{p.reviewCount} reviews</p>
                </div>
                <p className="text-xs font-medium text-charcoal font-sans shrink-0">{formatPrice(p.salePrice ?? p.price)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
