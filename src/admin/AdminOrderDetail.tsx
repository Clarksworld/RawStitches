'use client';

import { useState } from 'react';
import { useParams, Link } from '../components/router-adapter';
import { ORDERS, formatPrice } from '../data';
import { Badge, Button, Textarea } from '../components/ui';

const TIMELINE = [
  { status: 'Order Placed', date: '28 Nov 2024, 14:22', done: true },
  { status: 'Payment Confirmed', date: '28 Nov 2024, 14:23', done: true },
  { status: 'Processing', date: '28 Nov 2024, 16:00', done: true },
  { status: 'Shipped', date: '', done: false },
  { status: 'Out for Delivery', date: '', done: false },
  { status: 'Delivered', date: '', done: false },
];

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = ORDERS.find(o => o.id === id) ?? ORDERS[0];
  const [note, setNote] = useState('');

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
              {order.items.map((item, i) => (
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
              {TIMELINE.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 ${event.done ? 'bg-success border-success' : 'bg-white border-border'}`}>
                      {event.done && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    {i < TIMELINE.length - 1 && <div className={`w-0.5 h-8 ${event.done ? 'bg-success' : 'bg-border'}`} />}
                  </div>
                  <div className="pb-8">
                    <p className={`text-sm font-sans font-medium ${event.done ? 'text-charcoal' : 'text-stone'}`}>{event.status}</p>
                    {event.date && <p className="text-xs text-stone font-sans">{event.date}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin note */}
          <div className="bg-white border border-border p-5">
            <h3 className="font-sans font-medium text-sm text-charcoal mb-3">Internal Note</h3>
            <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Add a note about this order (only visible to admins)..." />
            <Button size="sm" className="mt-3">Save Note</Button>
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
            {order.note && <p className="text-xs text-stone mt-2 italic font-sans">"Note: {order.note}"</p>}
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
            <h3 className="font-sans font-medium text-sm text-charcoal mb-2">Actions</h3>
            <Button size="sm" className="w-full">Confirm Order</Button>
            <Button variant="ghost" size="sm" className="w-full">Mark as Processing</Button>
            <Button variant="ghost" size="sm" className="w-full">Mark as Shipped</Button>
            <Button variant="ghost" size="sm" className="w-full">Mark as Delivered</Button>
            <div className="border-t border-border pt-2 mt-2 space-y-2">
              <Button variant="danger" size="sm" className="w-full">Cancel Order</Button>
              <Button variant="ghost" size="sm" className="w-full text-warning">Refund Order</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
