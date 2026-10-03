'use client';

import { Link } from '../components/router-adapter';
import { StatsCard, Badge, Button } from '../components/ui';
import { ORDERS, PRODUCTS, CUSTOMERS, formatPrice } from '../data';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
  { day: 'Mon', sales: 42000, orders: 3 },
  { day: 'Tue', sales: 58000, orders: 4 },
  { day: 'Wed', sales: 31000, orders: 2 },
  { day: 'Thu', sales: 87000, orders: 6 },
  { day: 'Fri', sales: 120000, orders: 9 },
  { day: 'Sat', sales: 148000, orders: 11 },
  { day: 'Sun', sales: 95000, orders: 7 },
];

const lowStock = PRODUCTS.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
const outOfStock = PRODUCTS.filter(p => p.stock === 0);
const recentOrders = ORDERS.slice(0, 5);

export default function AdminDashboard() {
  const todayRevenue = formatPrice(salesData[salesData.length - 1].sales);
  const totalRevenue = formatPrice(salesData.reduce((s, d) => s + d.sales, 0));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">Dashboard</h1>
          <p className="text-sm text-stone font-sans mt-0.5">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products/new"><Button size="sm">+ Add Product</Button></Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard label="Today's Sales" value={todayRevenue} trend={{ value: '+12% vs yesterday', up: true }} />
        <StatsCard label="Total Orders" value={String(ORDERS.length)} sub="This week" trend={{ value: '+3 new', up: true }} />
        <StatsCard label="Pending Orders" value={String(ORDERS.filter(o => o.deliveryStatus === 'pending').length)} />
        <StatsCard label="Products Sold" value="42" sub="This week" trend={{ value: '+8%', up: true }} />
        <StatsCard label="Low Stock" value={String(lowStock.length)} sub="Products" trend={{ value: 'Needs attention', up: false }} />
        <StatsCard label="Customers" value={String(CUSTOMERS.length)} sub="Total registered" trend={{ value: '+2 this week', up: true }} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Revenue (7 Days)</h3>
            <span className="text-xs text-stone font-sans">{totalRevenue} total</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={salesData}>
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
            <h3 className="font-sans font-medium text-sm text-charcoal">Orders (7 Days)</h3>
            <span className="text-xs text-stone font-sans">{salesData.reduce((s, d) => s + d.orders, 0)} total</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={salesData}>
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
            {recentOrders.map(order => (
              <div key={order.id} className="px-5 py-3.5 flex items-center gap-3 text-sm font-sans">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal text-xs">{order.orderNumber}</p>
                  <p className="text-stone text-xs">{order.customer.name}</p>
                </div>
                <Badge variant={order.paymentStatus as any} className="shrink-0">{order.paymentStatus}</Badge>
                <p className="text-charcoal text-xs font-medium shrink-0">{formatPrice(order.total)}</p>
                <Link to={`/admin/orders/${order.id}`} className="text-gold text-xs hover:underline shrink-0">View</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory alerts */}
        <div className="space-y-4">
          {lowStock.length > 0 && (
            <div className="bg-white border border-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-sans font-medium text-xs text-charcoal">Low Stock</h3>
                <Badge variant="warning">{lowStock.length}</Badge>
              </div>
              <div className="divide-y divide-border">
                {lowStock.map(p => (
                  <div key={p.id} className="px-4 py-2.5 flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="w-8 h-10 object-cover bg-ivory-dark shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-charcoal leading-snug truncate">{p.name}</p>
                      <p className="text-[10px] text-warning">{p.stock} left</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {outOfStock.length > 0 && (
            <div className="bg-white border border-border">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-sans font-medium text-xs text-charcoal">Out of Stock</h3>
                <Badge variant="error">{outOfStock.length}</Badge>
              </div>
              <div className="divide-y divide-border">
                {outOfStock.map(p => (
                  <div key={p.id} className="px-4 py-2.5 flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="w-8 h-10 object-cover bg-ivory-dark shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-charcoal leading-snug truncate">{p.name}</p>
                      <p className="text-[10px] text-error">Out of stock</p>
                    </div>
                  </div>
                ))}
              </div>
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
