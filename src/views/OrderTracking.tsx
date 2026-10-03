'use client';

import { useState, useEffect } from 'react';
import { useParams, Link } from '../components/router-adapter';
import { Button, Badge } from '../components/ui';

const STEPS = [
  { key: 'placed', label: 'Order Placed', desc: 'We received your order.' },
  { key: 'paid', label: 'Payment Confirmed', desc: 'Your payment has been verified.' },
  { key: 'processing', label: 'Processing', desc: 'Your order is being prepared.' },
  { key: 'shipped', label: 'Shipped', desc: 'Your order is on the way.' },
  { key: 'out', label: 'Out for Delivery', desc: 'Your order will arrive today.' },
  { key: 'delivered', label: 'Delivered', desc: 'Order has been delivered.' },
];

function getStepIndex(deliveryStatus = '', paymentStatus = '') {
  const d = deliveryStatus.toLowerCase();
  const p = paymentStatus.toLowerCase();
  if (d === 'delivered') return 5;
  if (d === 'out' || d === 'out_for_delivery') return 4;
  if (d === 'shipped') return 3;
  if (d === 'processing') return 2;
  if (p === 'paid') return 1;
  return 0;
}

export default function OrderTracking() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchInput, setSearchInput] = useState(orderNumber ?? '');
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchOrder(num: string) {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(num.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.order) {
        throw new Error(data.error || 'Order not found with that reference number.');
      }
      setTrackedOrder(data.order);
    } catch (err: any) {
      setTrackedOrder(null);
      setError(err?.message || 'Failed to track order');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (orderNumber) {
      fetchOrder(orderNumber);
    }
  }, [orderNumber]);

  function track(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput) {
      fetchOrder(searchInput);
    }
  }

  const activeStep = trackedOrder
    ? getStepIndex(trackedOrder.deliveryStatus, trackedOrder.paymentStatus)
    : 0;

  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-black text-ivory py-14 px-6 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-2 font-sans">Track Your Order</p>
        <h1 className="font-serif text-3xl lg:text-4xl">Order Tracking</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Search form */}
        <form onSubmit={track} className="flex gap-2 mb-8">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Enter your order number (e.g. RS-2024-0089)"
            className="flex-1 px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans"
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Track'}
          </Button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xs mb-8">
            {error}
          </div>
        )}

        {trackedOrder && (
          <div className="space-y-8">
            {/* Order info */}
            <div className="bg-white border border-border p-5 space-y-3 text-sm font-sans">
              <div className="flex justify-between">
                <span className="text-stone">Order Number</span>
                <span className="font-medium text-charcoal">{trackedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Recipient</span>
                <span className="text-charcoal">{trackedOrder.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Order Date</span>
                <span className="text-charcoal">{trackedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Payment</span>
                <span className={`font-medium ${trackedOrder.paymentStatus === 'paid' ? 'text-success' : 'text-amber-600'}`}>
                  {trackedOrder.paymentStatus?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Delivery Status</span>
                <Badge variant={trackedOrder.deliveryStatus === 'delivered' ? 'success' : 'processing'}>
                  {trackedOrder.deliveryStatus || 'Pending'}
                </Badge>
              </div>
              {trackedOrder.address && (
                <div className="flex justify-between">
                  <span className="text-stone">Delivery Address</span>
                  <span className="text-charcoal text-right max-w-64">
                    {trackedOrder.address.line1}, {trackedOrder.address.city}, {trackedOrder.address.state}
                  </span>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div>
              <h2 className="font-serif text-xl text-charcoal mb-6">Tracking Timeline</h2>
              <div className="space-y-0">
                {STEPS.map((step, i) => {
                  const done = i < activeStep;
                  const active = i === activeStep;
                  const future = i > activeStep;
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                            done
                              ? 'bg-success border-success'
                              : active
                              ? 'bg-gold border-gold'
                              : 'bg-white border-border'
                          }`}
                        >
                          {done ? (
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : active ? (
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full bg-border" />
                          )}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`w-0.5 h-10 mt-1 ${done ? 'bg-success' : 'bg-border'}`} />
                        )}
                      </div>
                      <div className="pb-10">
                        <p className={`font-sans font-medium text-sm ${future ? 'text-stone' : 'text-charcoal'}`}>
                          {step.label}
                        </p>
                        <p className={`font-sans text-xs mt-0.5 ${future ? 'text-stone/50' : 'text-stone'}`}>
                          {step.desc}
                        </p>
                        {active && <p className="text-xs text-gold font-sans mt-1">In progress</p>}
                        {done && <p className="text-xs text-stone font-sans mt-1">Completed</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link to="/shop">
                <Button variant="ghost">Continue Shopping</Button>
              </Link>
              <a href="https://wa.me/2348036895862" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">WhatsApp Support</Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
