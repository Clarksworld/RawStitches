'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from '../components/router-adapter';
import { ORDERS, formatPrice, type Order } from '../data';
import { Badge, Button, Textarea } from '../components/ui';

const DELIVERY_STEPS = [
  { key: 'pending',          label: 'Order Placed',       emoji: '📦', desc: 'Order received and awaiting confirmation' },
  { key: 'confirmed',        label: 'Order Confirmed',     emoji: '✅', desc: 'Payment verified, ready to process' },
  { key: 'processing',       label: 'Being Prepared',      emoji: '✂️',  desc: 'Atelier team is preparing your items' },
  { key: 'shipped',          label: 'Shipped',             emoji: '🚚', desc: 'Order dispatched to courier' },
  { key: 'out_for_delivery', label: 'Out for Delivery',    emoji: '📍', desc: 'Your order is on the way to you today' },
  { key: 'delivered',        label: 'Delivered',           emoji: '🎉', desc: 'Order successfully delivered' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

type NotifChannel = 'email' | 'whatsapp' | 'both';

export default function AdminOrderDetail() {
  const { orderNumber: orderNum } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  // Notification state
  const [notifStatus, setNotifStatus] = useState('');
  const [notifChannel, setNotifChannel] = useState<NotifChannel>('both');
  const [notifNote, setNotifNote] = useState('');
  const [sending, setSending] = useState(false);
  const [notifResult, setNotifResult] = useState<{
    success?: boolean;
    error?: string;
    emailSent?: boolean;
    waLink?: string | null;
    waMessage?: string;
  } | null>(null);
  const [showWAModal, setShowWAModal] = useState(false);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderNum}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setNote(data.order.note || '');
      } else {
        const fallback = ORDERS.find(o => o.orderNumber === orderNum) ?? ORDERS[0];
        setOrder(fallback);
        setNote(fallback.note || '');
      }
    } catch {
      const fallback = ORDERS.find(o => o.orderNumber === orderNum) ?? ORDERS[0];
      setOrder(fallback);
      setNote(fallback.note || '');
    } finally {
      setLoading(false);
    }
  }, [orderNum]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  async function updateStatus(field: 'deliveryStatus' | 'paymentStatus', value: string) {
    if (!order) return;
    setSaving(true);
    try {
      await fetch(`/api/orders/${orderNum}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      setOrder(prev => prev ? { ...prev, [field]: value as any } : prev);
      // Auto-set notification status when delivery status changes
      if (field === 'deliveryStatus') {
        setNotifStatus(value);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!order) return;
    setSaving(true);
    try {
      await fetch(`/api/orders/${orderNum}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      setOrder(prev => prev ? { ...prev, note } : prev);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  }

  async function sendNotification() {
    if (!order || !notifStatus) return;
    setSending(true);
    setNotifResult(null);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          newStatus: notifStatus,
          adminNote: notifNote.trim() || undefined,
          channel: notifChannel,
        }),
      });
      const data = await res.json();

      const emailSent = data.results?.email?.success === true;
      const waLink = data.results?.whatsapp?.link || null;
      const waMessage = data.results?.whatsapp?.message || '';

      setNotifResult({ success: data.success, emailSent, waLink, waMessage });

      if ((notifChannel === 'whatsapp' || notifChannel === 'both') && waLink) {
        setShowWAModal(true);
      }
    } catch (err: any) {
      setNotifResult({ success: false, error: err.message });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-ivory-dark w-48 rounded" />
        <div className="h-48 bg-ivory-dark rounded" />
      </div>
    );
  }

  if (!order) return <p className="text-stone font-sans">Order not found.</p>;

  const currentStepIndex = STATUS_ORDER.indexOf(order.deliveryStatus);
  const cleanPhone = (order.customer.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '234');

  return (
    <div className="space-y-6 max-w-screen-lg">
      {/* Header */}
      <div>
        <Link to="/admin/orders" className="text-xs text-stone hover:text-gold font-sans mb-1 inline-block">
          ← Back to Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl text-charcoal">{order.orderNumber}</h1>
            <p className="text-sm text-stone font-sans">{order.date} · {order.customer.name}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={order.paymentStatus as any}>{order.paymentStatus}</Badge>
            <Badge variant={order.deliveryStatus as any}>{order.deliveryStatus.replace('_', ' ')}</Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ─── Main Column ─── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Items */}
          <div className="bg-white border border-border shadow-xs">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="font-sans font-medium text-sm text-charcoal">Order Items</h3>
            </div>
            <div className="divide-y divide-border">
              {(order.items as any[]).map((item, i) => (
                <div key={i} className="px-5 py-4 flex gap-4">
                  <img src={item.image} alt={item.name} className="w-14 h-18 object-cover bg-ivory-dark shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-charcoal">{item.name}</p>
                    <p className="text-xs text-stone font-sans">{item.color} / {item.size}</p>
                    <p className="text-xs text-stone font-sans mt-1">Qty: {item.qty}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium text-sm text-charcoal">{formatPrice(item.price * item.qty)}</p>
                    <p className="text-xs text-stone font-sans">{formatPrice(item.price)} each</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-border space-y-2 text-sm font-sans">
              <div className="flex justify-between text-stone"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>−{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between text-stone"><span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span></div>
              <div className="flex justify-between font-serif text-lg text-charcoal pt-2 border-t border-border"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white border border-border p-5 shadow-xs">
            <h3 className="font-sans font-semibold text-sm text-charcoal mb-5">Order Timeline</h3>
            <div className="space-y-0">
              {DELIVERY_STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                const current = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 text-sm
                        ${done ? 'bg-charcoal border-charcoal' : 'bg-white border-border'}
                        ${current ? 'ring-2 ring-gold ring-offset-2' : ''}`}
                      >
                        {done
                          ? <span className="text-gold text-xs">{step.emoji}</span>
                          : <div className="w-2 h-2 rounded-full bg-border" />
                        }
                      </div>
                      {i < DELIVERY_STEPS.length - 1 && (
                        <div className={`w-0.5 h-10 ${done ? 'bg-charcoal' : 'bg-border'}`} />
                      )}
                    </div>
                    <div className="pb-10 flex-1">
                      <p className={`text-sm font-sans font-semibold ${done ? 'text-charcoal' : 'text-stone'}`}>
                        {step.label}
                        {current && <span className="ml-2 text-[10px] text-gold font-medium uppercase tracking-wider">← Current</span>}
                      </p>
                      <p className={`text-xs font-sans mt-0.5 ${done ? 'text-stone' : 'text-stone/50'}`}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Customer Notification Panel ─── */}
          <div className="bg-white border border-border shadow-xs">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-sans font-semibold text-sm text-charcoal">📣 Notify Customer</h3>
                <p className="text-xs text-stone font-sans mt-0.5">Send an order update to the customer via Email and/or WhatsApp</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {/* Status to notify about */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-1.5 font-medium">
                  Order Update to Send
                </label>
                <select
                  value={notifStatus}
                  onChange={e => setNotifStatus(e.target.value)}
                  className="w-full bg-ivory border border-border px-3 py-2 text-sm font-sans text-charcoal focus:border-gold focus:outline-none"
                >
                  <option value="">Select status to notify about…</option>
                  {DELIVERY_STEPS.map(s => (
                    <option key={s.key} value={s.key}>
                      {s.emoji} {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Channel */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-1.5 font-medium">
                  Notification Channel
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['email', 'whatsapp', 'both'] as NotifChannel[]).map(ch => (
                    <button
                      key={ch}
                      onClick={() => setNotifChannel(ch)}
                      className={`px-4 py-2 text-xs font-sans border rounded-sm transition-colors capitalize
                        ${notifChannel === ch
                          ? 'bg-charcoal text-ivory border-charcoal'
                          : 'bg-white text-stone border-border hover:border-charcoal'}`}
                    >
                      {ch === 'email' ? '✉ Email' : ch === 'whatsapp' ? '💬 WhatsApp' : '✉ + 💬 Both'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional note */}
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-1.5 font-medium">
                  Additional Note to Customer <span className="normal-case text-stone/60">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Your dress will arrive in gold packaging. Tracking: ABC123..."
                  value={notifNote}
                  onChange={e => setNotifNote(e.target.value)}
                  className="w-full bg-ivory border border-border px-3 py-2 text-sm font-sans text-charcoal focus:border-gold focus:outline-none resize-none"
                />
              </div>

              {/* Send button */}
              <div className="flex items-center gap-3 pt-1">
                <Button
                  onClick={sendNotification}
                  disabled={!notifStatus || sending}
                  size="sm"
                >
                  {sending ? 'Sending…' : `Send Notification${notifStatus ? '' : ' (select status first)'}`}
                </Button>

                {/* WhatsApp manual link */}
                {cleanPhone && (
                  <a
                    href={`https://wa.me/${cleanPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-sm"
                  >
                    💬 Open WhatsApp
                  </a>
                )}
              </div>

              {/* Result feedback */}
              {notifResult && (
                <div className={`px-4 py-3 text-xs font-sans border rounded-sm ${notifResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  {notifResult.success ? (
                    <div className="space-y-1">
                      <p className="font-semibold">✓ Notification sent successfully</p>
                      {notifResult.emailSent && <p>✉ Email sent to <strong>{order.customer.email}</strong></p>}
                      {notifResult.waLink && (
                        <p>
                          💬 WhatsApp message ready —{' '}
                          <a href={notifResult.waLink} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                            Click to send via WhatsApp Web
                          </a>
                        </p>
                      )}
                      {!notifResult.emailSent && (notifChannel === 'email' || notifChannel === 'both') && (
                        <p className="text-amber-600">⚠ Email not sent — add GMAIL_USER & GMAIL_APP_PASSWORD to .env.local</p>
                      )}
                    </div>
                  ) : (
                    <p>✗ {notifResult.error || 'Failed to send notification'}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Internal Note */}
          <div className="bg-white border border-border p-5 shadow-xs">
            <h3 className="font-sans font-semibold text-sm text-charcoal mb-3">Internal Admin Note</h3>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note about this order (only visible to admins)..."
            />
            <Button size="sm" loading={saving} className="mt-3" onClick={saveNote}>Save Note</Button>
          </div>
        </div>

        {/* ─── Sidebar ─── */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white border border-border p-4 shadow-xs">
            <h3 className="font-sans font-semibold text-sm text-charcoal mb-3">Customer</h3>
            <div className="space-y-2 text-sm font-sans">
              <p className="font-medium text-charcoal">{order.customer.name}</p>
              <a href={`mailto:${order.customer.email}`} className="text-stone hover:text-gold transition-colors block text-xs">
                ✉ {order.customer.email}
              </a>
              <a href={`tel:${order.customer.phone}`} className="text-stone hover:text-gold transition-colors block text-xs">
                📞 {order.customer.phone}
              </a>
              {cleanPhone && (
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 block text-xs font-medium"
                >
                  💬 Chat on WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-border p-4 shadow-xs">
            <h3 className="font-sans font-semibold text-sm text-charcoal mb-3">Delivery Address</h3>
            <div className="text-sm text-stone font-sans space-y-0.5">
              <p className="font-medium text-charcoal">{order.address.line1}</p>
              <p>{order.address.city}, {order.address.state}</p>
              <p>{order.address.country}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.address.line1}, ${order.address.city}, ${order.address.state}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold hover:underline font-sans font-medium mt-2 inline-block"
            >
              View on Google Maps ↗
            </a>
            {order.note && (
              <p className="text-xs text-stone mt-3 italic font-sans bg-ivory/60 px-3 py-2 border border-border">
                "{order.note}"
              </p>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white border border-border p-4 shadow-xs">
            <h3 className="font-sans font-semibold text-sm text-charcoal mb-3">Payment</h3>
            <div className="space-y-2 text-sm font-sans">
              <div className="flex justify-between"><span className="text-stone">Status</span><Badge variant={order.paymentStatus as any}>{order.paymentStatus}</Badge></div>
              <div className="flex justify-between"><span className="text-stone">Method</span><span className="text-charcoal">{order.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-stone">Total</span><span className="text-charcoal font-semibold">{formatPrice(order.total)}</span></div>
              {order.paymentRef && (
                <div className="pt-2 border-t border-border">
                  <span className="text-stone text-xs">Ref: </span>
                  <span className="text-charcoal text-xs font-mono">{order.paymentRef}</span>
                </div>
              )}
            </div>
          </div>

          {/* ─── Update Status Actions ─── */}
          <div className="bg-white border border-border p-4 shadow-xs space-y-2">
            <h3 className="font-sans font-semibold text-sm text-charcoal mb-3">Update Order Status</h3>
            <p className="text-xs text-stone font-sans mb-3">Click a status to update. Then use the Notify Customer panel to alert the customer.</p>

            {DELIVERY_STEPS.filter(s => s.key !== 'pending').map(step => {
              const isCurrent = order.deliveryStatus === step.key;
              return (
                <button
                  key={step.key}
                  disabled={saving || isCurrent}
                  onClick={() => updateStatus('deliveryStatus', step.key)}
                  className={`w-full text-left px-3 py-2.5 text-xs font-sans border transition-colors rounded-sm flex items-center justify-between
                    ${isCurrent
                      ? 'bg-charcoal text-ivory border-charcoal cursor-default'
                      : 'bg-white text-charcoal border-border hover:border-gold hover:bg-ivory/50'}`}
                >
                  <span>{step.emoji} {step.label}</span>
                  {isCurrent && <span className="text-gold text-[10px] font-bold uppercase">Current</span>}
                </button>
              );
            })}

            <div className="border-t border-border pt-3 mt-3 space-y-2">
              {order.paymentStatus !== 'paid' && (
                <button
                  disabled={saving}
                  onClick={() => updateStatus('paymentStatus', 'paid')}
                  className="w-full text-left px-3 py-2 text-xs font-sans border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors rounded-sm"
                >
                  ✅ Mark Payment as Paid
                </button>
              )}
              <button
                disabled={saving}
                onClick={() => updateStatus('deliveryStatus', 'cancelled')}
                className="w-full text-left px-3 py-2 text-xs font-sans border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors rounded-sm"
              >
                ✗ Cancel Order
              </button>
              <button
                disabled={saving}
                onClick={() => updateStatus('paymentStatus', 'refunded')}
                className="w-full text-left px-3 py-2 text-xs font-sans border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors rounded-sm"
              >
                ↩ Refund Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── WhatsApp Preview Modal ─── */}
      {showWAModal && notifResult?.waLink && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg text-charcoal">💬 WhatsApp Message Ready</h3>
              <button onClick={() => setShowWAModal(false)} className="text-stone hover:text-charcoal text-xl">✕</button>
            </div>
            <p className="text-xs text-stone font-sans">
              Your WhatsApp message has been prepared. Click the button below to open WhatsApp Web and send it to{' '}
              <strong>{order.customer.name}</strong> ({order.customer.phone}).
            </p>
            <pre className="bg-ivory border border-border p-4 text-xs font-sans whitespace-pre-wrap max-h-60 overflow-y-auto text-charcoal">
              {notifResult.waMessage}
            </pre>
            <div className="flex gap-3">
              <a
                href={notifResult.waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Open WhatsApp & Send
              </a>
              <button
                onClick={() => setShowWAModal(false)}
                className="px-4 py-2.5 border border-border text-stone text-sm hover:text-charcoal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
