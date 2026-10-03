'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from '../components/router-adapter';
import { ORDERS, formatPrice, type Order } from '../data';
import { Badge, Button, Textarea } from '../components/ui';

const DELIVERY_STEPS = [
  { key: 'pending', label: 'Order Placed' },
  { key: 'confirmed', label: 'Payment Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export default function AdminOrderDetail() {
  const { orderNumber: orderNum } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  const loadOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderNum}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setNote(data.order.note || '');
      } else {
        // fallback
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

  return (
    <div className="space-y-6 max-w-screen-lg">
      <div>
        <Link to="/admin/orders" className="text-xs text-stone hover:text-gold font-sans mb-1 inline-block">← Orders</Link>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-charcoal">{order.orderNumber}</h1>
          <div className="flex gap-2">
            <Badge variant={order.paymentStatus as any}>{order.paymentStatus}</Badge>
            <Badge variant={order.deliveryStatus as any}>{order.deliveryStatus}</Badge>
          </div>
        </div>
        <p className="text-sm text-stone font-sans">{order.date}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="bg-white border border-border">
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
              {order.discount > 0 && <div className="flex justify-between text-success"><span>Discount</span><span>−{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between text-stone"><span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span></div>
              <div className="flex justify-between font-serif text-lg text-charcoal pt-2 border-t border-border"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Order timeline */}
          <div className="bg-white border border-border p-5">
            <h3 className="font-sans font-medium text-sm text-charcoal mb-5">Order Timeline</h3>
            <div className="space-y-0">
              {DELIVERY_STEPS.map((step, i) => {
                const done = i <= currentStepIndex;
                return (
                  <div key={step.key} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 ${done ? 'bg-success border-success' : 'bg-white border-border'}`}>
                        {done && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      {i < DELIVERY_STEPS.length - 1 && <div className={`w-0.5 h-8 ${done ? 'bg-success' : 'bg-border'}`} />}
                    </div>
                    <div className="pb-8">
                      <p className={`text-sm font-sans font-medium ${done ? 'text-charcoal' : 'text-stone'}`}>{step.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin note */}
          <div className="bg-white border border-border p-5">
            <h3 className="font-sans font-medium text-sm text-charcoal mb-3">Internal Note</h3>
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Add a note about this order (only visible to admins)..." />
            <Button size="sm" loading={saving} className="mt-3" onClick={saveNote}>Save Note</Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white border border-border p-4">
            <h3 className="font-sans font-medium text-sm text-charcoal mb-3">Customer</h3>
            <div className="space-y-1.5 text-sm font-sans">
              <p className="font-medium text-charcoal">{order.customer.name}</p>
              <a href={`mailto:${order.customer.email}`} className="text-stone hover:text-gold transition-colors block text-xs">{order.customer.email}</a>
              <a href={`tel:${order.customer.phone}`} className="text-stone hover:text-gold transition-colors block text-xs">{order.customer.phone}</a>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white border border-border p-4">
            <h3 className="font-sans font-medium text-sm text-charcoal mb-3">Delivery Address</h3>
            <div className="text-sm text-stone font-sans space-y-0.5">
              <p>{order.address.line1}</p>
              <p>{order.address.city}, {order.address.state}</p>
              <p>{order.address.country}</p>
            </div>
            {order.note && <p className="text-xs text-stone mt-2 italic font-sans">"{order.note}"</p>}
          </div>

          {/* Payment */}
          <div className="bg-white border border-border p-4">
            <h3 className="font-sans font-medium text-sm text-charcoal mb-3">Payment</h3>
            <div className="space-y-2 text-sm font-sans">
              <div className="flex justify-between"><span className="text-stone">Status</span><Badge variant={order.paymentStatus as any}>{order.paymentStatus}</Badge></div>
              <div className="flex justify-between"><span className="text-stone">Method</span><span className="text-charcoal">{order.paymentMethod}</span></div>
              {order.paymentRef && <div className="flex justify-between"><span className="text-stone">Reference</span><span className="text-charcoal text-xs font-mono">{order.paymentRef}</span></div>}
            </div>
          </div>

          {/* Admin actions */}
          <div className="bg-white border border-border p-4 space-y-2">
            <h3 className="font-sans font-medium text-sm text-charcoal mb-2">Update Status</h3>
            {(order.deliveryStatus as string) !== 'confirmed' && (
              <Button size="sm" className="w-full" disabled={saving} onClick={() => updateStatus('deliveryStatus', 'confirmed')}>Confirm Order</Button>
            )}
            {(order.deliveryStatus as string) !== 'processing' && (
              <Button variant="ghost" size="sm" className="w-full" disabled={saving} onClick={() => updateStatus('deliveryStatus', 'processing')}>Mark as Processing</Button>
            )}
            {(order.deliveryStatus as string) !== 'shipped' && (
              <Button variant="ghost" size="sm" className="w-full" disabled={saving} onClick={() => updateStatus('deliveryStatus', 'shipped')}>Mark as Shipped</Button>
            )}
            {(order.deliveryStatus as string) !== 'delivered' && (
              <Button variant="ghost" size="sm" className="w-full" disabled={saving} onClick={() => updateStatus('deliveryStatus', 'delivered')}>Mark as Delivered</Button>
            )}
            <div className="border-t border-border pt-2 mt-2 space-y-2">
              {order.paymentStatus !== 'paid' && (
                <Button variant="ghost" size="sm" className="w-full text-success" disabled={saving} onClick={() => updateStatus('paymentStatus', 'paid')}>Mark as Paid</Button>
              )}
              <Button variant="danger" size="sm" className="w-full" disabled={saving} onClick={() => updateStatus('deliveryStatus', 'cancelled')}>Cancel Order</Button>
              <Button variant="ghost" size="sm" className="w-full text-warning" disabled={saving} onClick={() => updateStatus('paymentStatus', 'refunded')}>Refund Order</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
