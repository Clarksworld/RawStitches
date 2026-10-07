'use client';

import { useState, useEffect } from 'react';
import { CUSTOMERS, ORDERS, formatPrice } from '../data';
import type { Order } from '../data';
import { SearchInput, Badge, Tabs, Button } from '../components/ui';
import { downloadCSV } from '../lib/csv';

type AddressItem = {
  line1: string;
  city: string;
  state: string;
  country: string;
  isDefault?: boolean;
};

type Measurements = {
  bust?: string;
  waist?: string;
  hips?: string;
  height?: string;
  preferredSize?: string;
  customNotes?: string;
};

type CustomerData = {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  orders: number;
  spent: number;
  lastOrder?: string | null;
  status: string;
  notes?: string;
  addresses?: AddressItem[];
  measurements?: Measurements;
  createdAt?: Date | string | null;
};

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [profileTab, setProfileTab] = useState('Orders');

  // Customer Edit State
  const [notesText, setNotesText] = useState('');
  const [measurements, setMeasurements] = useState<Measurements>({});
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

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
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.toLowerCase().includes(search.toLowerCase())
  );

  const customer = selected ? customers.find(c => c.id === selected) : null;
  const customerOrders = customer
    ? orders.filter(o => o.customer && o.customer.email.toLowerCase() === customer.email.toLowerCase())
    : [];

  // When customer changes, initialize notes and measurements
  useEffect(() => {
    if (customer) {
      setNotesText(customer.notes || '');
      setMeasurements(customer.measurements || {});
      setSaveSuccess('');
    }
  }, [selected]);

  // Collect and deduplicate all addresses (from customer record + all orders placed)
  const combinedAddresses: Array<AddressItem & { count: number; lastUsed?: string }> = [];
  if (customer) {
    // 1. Saved addresses on profile
    if (Array.isArray(customer.addresses)) {
      customer.addresses.forEach(addr => {
        if (addr && addr.line1) {
          combinedAddresses.push({
            ...addr,
            count: 0,
            isDefault: addr.isDefault || false,
          });
        }
      });
    }

    // 2. Extract shipping addresses from all past customer orders
    customerOrders.forEach(o => {
      if (o.address && o.address.line1) {
        const normLine1 = o.address.line1.trim().toLowerCase();
        const existing = combinedAddresses.find(a => a.line1.trim().toLowerCase() === normLine1);
        if (existing) {
          existing.count += 1;
          if (!existing.lastUsed || o.date > existing.lastUsed) {
            existing.lastUsed = o.date;
          }
        } else {
          combinedAddresses.push({
            line1: o.address.line1,
            city: o.address.city || '',
            state: o.address.state || '',
            country: o.address.country || 'Nigeria',
            isDefault: combinedAddresses.length === 0,
            count: 1,
            lastUsed: o.date,
          });
        }
      }
    });
  }

  // Collect checkout notes from orders
  const orderNotes = customerOrders.filter(o => o.note && o.note.trim());

  // Save notes to database
  const handleSaveNotes = async () => {
    if (!customer) return;
    setSavingNotes(true);
    setSaveSuccess('');
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesText }),
      });
      if (res.ok) {
        setCustomers(prev =>
          prev.map(c => (c.id === customer.id ? { ...c, notes: notesText } : c))
        );
        setSaveSuccess('Notes saved successfully.');
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Save measurements to database
  const handleSaveMeasurements = async () => {
    if (!customer) return;
    setSavingNotes(true);
    setSaveSuccess('');
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ measurements }),
      });
      if (res.ok) {
        setCustomers(prev =>
          prev.map(c => (c.id === customer.id ? { ...c, measurements } : c))
        );
        setSaveSuccess('Measurements saved successfully.');
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save measurements:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleExportCSV = () => {
    downloadCSV(
      'raw_stitches_customers.csv',
      ['Customer ID', 'Full Name', 'Email', 'Phone', 'Orders Count', 'Total Spent (NGN)', 'Last Order Date', 'Status'],
      filtered.map(c => [c.id, c.name, c.email, c.phone, c.orders, c.spent, c.lastOrder || 'N/A', c.status])
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-ivory-dark w-48 rounded" />
        <div className="h-64 bg-ivory-dark rounded" />
      </div>
    );
  }

  if (customer) {
    const aov = customer.orders > 0 ? Math.round(customer.spent / customer.orders) : 0;
    const isVip = customer.spent >= 100000 || customer.orders >= 3;
    const isRepeat = customer.orders > 1;
    const cleanPhone = (customer.whatsapp || customer.phone || '').replace(/[^0-9]/g, '');

    return (
      <div className="space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-1.5 text-xs text-stone hover:text-gold font-sans font-medium transition-colors"
          >
            ← Back to All Customers
          </button>
          <div className="flex items-center gap-2">
            <Badge variant={customer.status === 'active' ? 'success' : 'warning'}>
              {customer.status.toUpperCase()}
            </Badge>
            {isVip ? (
              <span className="px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold bg-gold/15 text-gold border border-gold/30 rounded-full">
                ★ VIP Client
              </span>
            ) : isRepeat ? (
              <span className="px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                Repeat Client
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[10px] tracking-wider uppercase font-medium bg-stone/10 text-stone rounded-full">
                New Client
              </span>
            )}
          </div>
        </div>

        {/* Customer Profile Card */}
        <div className="bg-white border border-border p-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-charcoal flex items-center justify-center shrink-0 shadow-inner">
                <span className="text-gold font-serif text-2xl font-medium">{customer.name[0]}</span>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-2xl text-charcoal">{customer.name}</h1>
                </div>
                <p className="text-stone text-sm font-sans mt-0.5">
                  <a href={`mailto:${customer.email}`} className="hover:text-gold underline decoration-dotted">
                    {customer.email}
                  </a>
                  {customer.phone && (
                    <>
                      {' · '}
                      <a href={`tel:${customer.phone}`} className="hover:text-gold">
                        {customer.phone}
                      </a>
                    </>
                  )}
                </p>

                {/* Direct quick action buttons */}
                <div className="flex items-center gap-2 mt-3">
                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone.startsWith('0') ? '234' + cleanPhone.slice(1) : cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-sans font-medium rounded transition-colors"
                    >
                      <span>💬 Chat on WhatsApp</span>
                    </a>
                  )}
                  <a
                    href={`mailto:${customer.email}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-ivory text-charcoal hover:bg-ivory-dark border border-border text-xs font-sans font-medium rounded transition-colors"
                  >
                    <span>✉ Email Client</span>
                  </a>
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-ivory text-charcoal hover:bg-ivory-dark border border-border text-xs font-sans font-medium rounded transition-colors"
                    >
                      <span>📞 Call</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-ivory/50 border border-border px-4 py-3 min-w-[90px]">
                <p className="font-serif text-xl text-charcoal">{customer.orders}</p>
                <p className="text-[11px] text-stone font-sans uppercase tracking-wider">Orders</p>
              </div>
              <div className="bg-ivory/50 border border-border px-4 py-3 min-w-[120px]">
                <p className="font-serif text-xl text-charcoal">{formatPrice(customer.spent)}</p>
                <p className="text-[11px] text-stone font-sans uppercase tracking-wider">Total Spent</p>
              </div>
              <div className="bg-ivory/50 border border-border px-4 py-3 min-w-[110px]">
                <p className="font-serif text-xl text-gold">{formatPrice(aov)}</p>
                <p className="text-[11px] text-stone font-sans uppercase tracking-wider">Avg. Order</p>
              </div>
            </div>
          </div>

          {/* Additional details bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs font-sans text-stone">
            <div>
              <span className="block text-stone/70 uppercase text-[10px] tracking-wider">Last Order</span>
              <span className="font-medium text-charcoal">{customer.lastOrder || 'No orders yet'}</span>
            </div>
            <div>
              <span className="block text-stone/70 uppercase text-[10px] tracking-wider">Customer ID</span>
              <span className="font-mono text-charcoal">{customer.id}</span>
            </div>
            <div>
              <span className="block text-stone/70 uppercase text-[10px] tracking-wider">Primary State</span>
              <span className="font-medium text-charcoal">
                {combinedAddresses[0]?.state || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="block text-stone/70 uppercase text-[10px] tracking-wider">Account Created</span>
              <span className="font-medium text-charcoal">
                {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs
          tabs={['Orders', 'Addresses', 'Bespoke Measurements', 'Notes']}
          active={profileTab}
          onChange={setProfileTab}
        />

        {/* ─── ORDERS TAB ─── */}
        {profileTab === 'Orders' && (
          <div className="space-y-3">
            {customerOrders.length === 0 ? (
              <div className="bg-white border border-border p-12 text-center">
                <p className="font-serif text-lg text-charcoal mb-1">No orders on record</p>
                <p className="text-stone text-xs font-sans">
                  Orders placed by {customer.email} will automatically appear here with live tracking and receipts.
                </p>
              </div>
            ) : (
              customerOrders.map(o => (
                <div
                  key={o.id}
                  className="bg-white border border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm font-sans hover:border-gold/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-charcoal font-serif">{o.orderNumber}</p>
                      <Badge variant={o.paymentStatus as any}>{o.paymentStatus}</Badge>
                      <span className="text-[11px] px-2 py-0.5 bg-ivory text-stone border border-border rounded">
                        {o.deliveryStatus}
                      </span>
                    </div>
                    <p className="text-stone text-xs mt-1">
                      Date: {o.date} · {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}
                      {o.address?.line1 ? ` · Delivery to: ${o.address.line1}, ${o.address.city || ''}` : ''}
                    </p>
                    {o.note && (
                      <p className="text-xs text-stone/90 bg-ivory/60 px-2.5 py-1 mt-2 rounded border border-border/50 inline-block">
                        <strong>Order note:</strong> {o.note}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-lg text-charcoal">{formatPrice(o.total)}</p>
                    <a
                      href={`/admin/orders/${o.orderNumber}`}
                      className="text-xs text-gold hover:underline font-medium inline-block mt-0.5"
                    >
                      View Order Details →
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ─── ADDRESSES TAB ─── */}
        {profileTab === 'Addresses' && (
          <div className="space-y-4">
            {combinedAddresses.length === 0 ? (
              <div className="bg-white border border-border p-12 text-center">
                <p className="font-serif text-lg text-charcoal mb-1">No saved addresses on file</p>
                <p className="text-stone text-xs font-sans max-w-md mx-auto">
                  When this customer places an order at checkout, their delivery street address, city, and state will automatically be captured and saved here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {combinedAddresses.map((addr, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-border p-5 relative hover:border-gold/50 transition-colors shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-ivory text-gold flex items-center justify-center text-xs font-bold">
                          📍
                        </span>
                        <h4 className="font-serif text-sm font-medium text-charcoal">
                          Address {idx + 1}
                        </h4>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gold/10 text-gold border border-gold/20 rounded">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-sans text-charcoal space-y-0.5 my-3">
                      <p className="font-medium text-charcoal">{addr.line1}</p>
                      <p className="text-stone">
                        {[addr.city, addr.state, addr.country].filter(Boolean).join(', ')}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-stone font-sans">
                      <span>
                        {addr.count > 0 ? (
                          <span className="text-charcoal font-medium">Used for {addr.count} order{addr.count > 1 ? 's' : ''}</span>
                        ) : (
                          'Saved profile address'
                        )}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${addr.line1}, ${addr.city || ''}, ${addr.state || ''}, ${addr.country || ''}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline font-medium"
                      >
                        View on Map ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── BESPOKE MEASUREMENTS TAB ─── */}
        {profileTab === 'Bespoke Measurements' && (
          <div className="bg-white border border-border p-6 space-y-6">
            <div>
              <h3 className="font-serif text-lg text-charcoal">Atelier Tailoring & Sizing Profile</h3>
              <p className="text-xs text-stone font-sans mt-0.5">
                Record client measurements, standard size preferences, and bespoke fitting instructions for custom atelier orders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-1.5 font-medium">
                  Preferred Size
                </label>
                <select
                  value={measurements.preferredSize || ''}
                  onChange={e => setMeasurements(m => ({ ...m, preferredSize: e.target.value }))}
                  className="w-full bg-ivory border border-border px-3 py-2 text-sm font-sans text-charcoal focus:border-gold focus:outline-none"
                >
                  <option value="">Select size</option>
                  <option value="XS">XS (UK 6)</option>
                  <option value="S">S (UK 8)</option>
                  <option value="M">M (UK 10)</option>
                  <option value="L">L (UK 12)</option>
                  <option value="XL">XL (UK 14)</option>
                  <option value="XXL">XXL (UK 16+)</option>
                  <option value="Custom">Custom Bespoke</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-1.5 font-medium">
                  Bust (Inches)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 36 in"
                  value={measurements.bust || ''}
                  onChange={e => setMeasurements(m => ({ ...m, bust: e.target.value }))}
                  className="w-full bg-ivory border border-border px-3 py-2 text-sm font-sans text-charcoal focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-1.5 font-medium">
                  Waist (Inches)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 28 in"
                  value={measurements.waist || ''}
                  onChange={e => setMeasurements(m => ({ ...m, waist: e.target.value }))}
                  className="w-full bg-ivory border border-border px-3 py-2 text-sm font-sans text-charcoal focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-1.5 font-medium">
                  Hips (Inches)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 40 in"
                  value={measurements.hips || ''}
                  onChange={e => setMeasurements(m => ({ ...m, hips: e.target.value }))}
                  className="w-full bg-ivory border border-border px-3 py-2 text-sm font-sans text-charcoal focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-1.5 font-medium">
                  Height
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5 ft 8 in"
                  value={measurements.height || ''}
                  onChange={e => setMeasurements(m => ({ ...m, height: e.target.value }))}
                  className="w-full bg-ivory border border-border px-3 py-2 text-sm font-sans text-charcoal focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-1.5 font-medium">
                Tailoring & Fit Preferences
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Prefers modest neckline, extra 2 inches length on maxi dresses, tailored waist fit..."
                value={measurements.customNotes || ''}
                onChange={e => setMeasurements(m => ({ ...m, customNotes: e.target.value }))}
                className="w-full bg-ivory border border-border p-3 text-sm font-sans text-charcoal focus:border-gold focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button onClick={handleSaveMeasurements} disabled={savingNotes} size="sm">
                {savingNotes ? 'Saving...' : 'Save Measurements'}
              </Button>
              {saveSuccess && (
                <span className="text-xs text-emerald-600 font-sans font-medium">✓ {saveSuccess}</span>
              )}
            </div>
          </div>
        )}

        {/* ─── NOTES TAB ─── */}
        {profileTab === 'Notes' && (
          <div className="space-y-6">
            {/* Internal Admin Notes */}
            <div className="bg-white border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-charcoal">Internal Atelier CRM Notes</h3>
                  <p className="text-xs text-stone font-sans mt-0.5">
                    Private notes visible only to the Raw Stiches management team.
                  </p>
                </div>
                {saveSuccess && (
                  <span className="text-xs text-emerald-600 font-sans font-medium">✓ {saveSuccess}</span>
                )}
              </div>

              <textarea
                className="w-full bg-ivory border border-border p-4 text-sm font-sans text-charcoal focus:border-gold focus:outline-none leading-relaxed"
                rows={5}
                placeholder="Add internal notes about this customer (e.g. VIP client, preferred fabrics, delivery instructions, WhatsApp interaction notes)..."
                value={notesText}
                onChange={e => setNotesText(e.target.value)}
              />

              <div className="flex justify-end">
                <Button onClick={handleSaveNotes} disabled={savingNotes} size="sm">
                  {savingNotes ? 'Saving...' : 'Save Customer Notes'}
                </Button>
              </div>
            </div>

            {/* Customer Checkout Instructions / Notes */}
            <div className="bg-white border border-border p-6 space-y-4">
              <h3 className="font-serif text-lg text-charcoal">Checkout Instructions Left by Client</h3>
              <p className="text-xs text-stone font-sans">
                Delivery notes and special requests entered by the customer during checkout:
              </p>

              {orderNotes.length === 0 ? (
                <p className="text-xs text-stone font-sans py-4 italic">
                  No order-specific instructions were left during past checkouts.
                </p>
              ) : (
                <div className="space-y-3">
                  {orderNotes.map(o => (
                    <div key={o.id} className="p-3 bg-ivory/60 border border-border text-xs font-sans space-y-1">
                      <div className="flex items-center justify-between text-stone">
                        <span className="font-medium text-charcoal">{o.orderNumber}</span>
                        <span>{o.date}</span>
                      </div>
                      <p className="text-charcoal font-medium">"{o.note}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── CUSTOMERS LISTING TABLE ───
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">Customers</h1>
          <span className="text-xs text-stone font-sans">{customers.length} total customer accounts</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleExportCSV}>Export CSV</Button>
      </div>

      <div className="bg-white border border-border p-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name, email, or phone..."
          className="w-full sm:w-80"
        />
      </div>

      <div className="bg-white border border-border overflow-x-auto shadow-xs">
        <table className="w-full text-sm font-sans min-w-[760px]">
          <thead>
            <tr className="border-b border-border bg-ivory/50">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Contact</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Tier</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Orders</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Total Spent</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Last Order</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c => {
              const isVip = c.spent >= 100000 || c.orders >= 3;
              const isRepeat = c.orders > 1;

              return (
                <tr
                  key={c.id}
                  className="hover:bg-ivory/40 transition-colors cursor-pointer group"
                  onClick={() => setSelected(c.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-charcoal flex items-center justify-center shrink-0">
                        <span className="text-gold text-xs font-bold">{c.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-charcoal group-hover:text-gold transition-colors">{c.name}</p>
                        <p className="text-xs text-stone">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone text-xs">
                    <p className="text-charcoal font-medium">{c.phone || '—'}</p>
                    {c.whatsapp && c.whatsapp !== c.phone && (
                      <p className="text-[11px] text-emerald-600">WA: {c.whatsapp}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isVip ? (
                      <span className="px-2 py-0.5 text-[10px] tracking-wider uppercase font-semibold bg-gold/15 text-gold border border-gold/30 rounded-full">
                        VIP
                      </span>
                    ) : isRepeat ? (
                      <span className="px-2 py-0.5 text-[10px] tracking-wider uppercase font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                        Repeat
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] tracking-wider uppercase font-medium bg-stone/10 text-stone rounded-full">
                        New
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal font-medium">{c.orders}</td>
                  <td className="px-4 py-3 font-medium text-charcoal">{formatPrice(c.spent)}</td>
                  <td className="px-4 py-3 text-stone text-xs">{c.lastOrder ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === 'active' ? 'success' : 'warning'}>{c.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-gold text-xs font-medium group-hover:underline">
                    View Profile →
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-serif text-lg text-stone">No customers found</p>
            <p className="text-xs text-stone font-sans mt-1">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
