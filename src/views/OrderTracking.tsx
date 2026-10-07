'use client';

import { useState, useEffect } from 'react';
import { useParams, Link } from '../components/router-adapter';
import { Button, Badge } from '../components/ui';
import { formatPrice } from '../data';

const STEPS = [
  { key: 'placed',     label: 'Order Placed',       desc: 'We received your order and payment.',      emoji: '📦' },
  { key: 'confirmed',  label: 'Payment Confirmed',   desc: 'Your payment has been verified.',           emoji: '✅' },
  { key: 'processing', label: 'Being Prepared',       desc: 'Your items are being crafted with care.',   emoji: '✂️' },
  { key: 'shipped',    label: 'Shipped',              desc: 'Your order is with the courier.',           emoji: '🚚' },
  { key: 'out',        label: 'Out for Delivery',     desc: 'Delivery expected today — stay close!',    emoji: '📍' },
  { key: 'delivered',  label: 'Delivered',            desc: 'Your order has arrived. Enjoy!',            emoji: '🎉' },
];

function getStepIndex(deliveryStatus = '', paymentStatus = '') {
  const d = deliveryStatus.toLowerCase();
  const p = paymentStatus.toLowerCase();
  if (d === 'delivered') return 5;
  if (d === 'out_for_delivery' || d === 'out') return 4;
  if (d === 'shipped') return 3;
  if (d === 'processing') return 2;
  if (d === 'confirmed' || p === 'paid') return 1;
  return 0;
}

function ReviewForm({ order }: { order: any }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState(0);
  const [error, setError] = useState('');

  const items = (order.items as any[]) || [];
  const item = items[selectedItem];

  async function submitReview() {
    if (!rating) { setError('Please select a star rating'); return; }
    if (!body.trim()) { setError('Please write a short review'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item?.productId || 'unknown',
          productName: item?.name || 'Raw Stitches Item',
          productSlug: item?.productId || 'unknown',
          customerName: order.customer?.name || 'Anonymous',
          customerEmail: order.customer?.email || '',
          rating,
          body: body.trim(),
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
        <p className="text-2xl">🙏</p>
        <p className="font-serif text-lg text-charcoal">Thank you for your review!</p>
        <p className="text-sm text-stone font-sans">Your feedback helps other customers and inspires our atelier team.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border p-6 space-y-5">
      <div>
        <h3 className="font-serif text-xl text-charcoal">Leave a Review</h3>
        <p className="text-xs text-stone font-sans mt-1">
          Share your experience with your purchase — it takes less than a minute.
        </p>
      </div>

      {/* Item selector if multiple items */}
      {items.length > 1 && (
        <div>
          <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-2">Reviewing</label>
          <div className="flex flex-col gap-2">
            {items.map((it: any, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedItem(i)}
                className={`flex items-center gap-3 px-3 py-2 border text-left transition-colors ${
                  selectedItem === i ? 'border-gold bg-ivory' : 'border-border hover:border-stone'
                }`}
              >
                <img src={it.image} alt={it.name} className="w-8 h-10 object-cover bg-ivory-dark shrink-0" />
                <span className="text-sm font-sans text-charcoal">{it.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stars */}
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="text-3xl transition-transform hover:scale-110"
            >
              <span className={(hovered || rating) >= star ? 'text-gold' : 'text-border'}>★</span>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-xs text-stone font-sans self-center ml-2">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Review body */}
      <div>
        <label className="block text-xs font-sans uppercase tracking-wider text-stone mb-2">Your Review</label>
        <textarea
          rows={4}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={`What did you think of the ${item?.name || 'item'}? Fit, fabric, quality...`}
          className="w-full bg-ivory border border-border px-4 py-3 text-sm font-sans text-charcoal focus:border-gold focus:outline-none resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-600 font-sans">{error}</p>
      )}

      <Button onClick={submitReview} disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit Review'}
      </Button>

      <p className="text-xs text-stone font-sans">
        Reviews are moderated and will appear after approval by our team.
      </p>
    </div>
  );
}

export default function OrderTracking() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [searchInput, setSearchInput] = useState(orderNumber ?? '');
  const [mode, setMode] = useState<'number' | 'lookup'>('number');
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupOrders, setLookupOrders] = useState<any[] | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);

  async function fetchOrder(num: string) {
    if (!num.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(num.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.order) {
        throw new Error(data.error || 'Order not found. Please check your order number and try again.');
      }
      setTrackedOrder(data.order);
      setShowReview(false);
    } catch (err: any) {
      setTrackedOrder(null);
      setError(err?.message || 'Failed to track order');
    } finally {
      setLoading(false);
    }
  }

  async function searchGuestOrders(e: React.FormEvent) {
    e.preventDefault();
    const query = lookupQuery.trim();
    if (!query) return;
    setLookupLoading(true);
    setLookupError(null);
    setLookupOrders(null);
    try {
      const isEmail = query.includes('@');
      const param = isEmail
        ? `email=${encodeURIComponent(query.toLowerCase())}`
        : `phone=${encodeURIComponent(query)}`;
      const res = await fetch(`/api/orders?${param}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to lookup orders');
      if (!data.orders || data.orders.length === 0) {
        setLookupError(`No orders found matching "${query}". Check for typos or try tracking by Order Number.`);
      } else {
        setLookupOrders(data.orders);
      }
    } catch (err: any) {
      setLookupError(err.message || 'Error looking up orders');
    } finally {
      setLookupLoading(false);
    }
  }

  useEffect(() => {
    if (orderNumber) fetchOrder(orderNumber);
  }, [orderNumber]);

  function track(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput) fetchOrder(searchInput);
  }

  const activeStep = trackedOrder
    ? getStepIndex(trackedOrder.deliveryStatus, trackedOrder.paymentStatus)
    : 0;

  const isDelivered = trackedOrder?.deliveryStatus === 'delivered';
  const isCancelled = trackedOrder?.deliveryStatus === 'cancelled';

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero */}
      <div className="bg-black text-ivory py-14 px-6 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-2 font-sans">Real-Time Updates</p>
        <h1 className="font-serif text-3xl lg:text-4xl">Track Your Order</h1>
        <p className="text-stone text-sm font-sans mt-3 max-w-md mx-auto">
          Track a single package with your order number, or find all your previous orders using your email or phone number — no account required.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">

        {/* Tab selection */}
        <div className="flex border-b border-border bg-white">
          <button
            type="button"
            onClick={() => setMode('number')}
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-sans font-medium transition-colors text-center ${
              mode === 'number'
                ? 'border-b-2 border-gold text-charcoal font-semibold bg-ivory/50'
                : 'text-stone hover:text-charcoal'
            }`}
          >
            Track by Order Number
          </button>
          <button
            type="button"
            onClick={() => setMode('lookup')}
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-sans font-medium transition-colors text-center ${
              mode === 'lookup'
                ? 'border-b-2 border-gold text-charcoal font-semibold bg-ivory/50'
                : 'text-stone hover:text-charcoal'
            }`}
          >
            Find Orders by Email / Phone
          </button>
        </div>

        {/* Search form: By Order Number */}
        {mode === 'number' && (
          <div className="bg-white border border-border p-6 space-y-4">
            <form onSubmit={track} className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Order number — e.g. RS-2025-0089"
                className="flex-1 px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans bg-ivory"
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Searching…' : 'Track'}
              </Button>
            </form>
            <p className="text-xs text-stone font-sans">
              No account needed — anyone can track an order with just the order number.
              Your order number is in your confirmation email or WhatsApp message.
            </p>
          </div>
        )}

        {/* Search form: By Email or Phone (Guest history lookup) */}
        {mode === 'lookup' && (
          <div className="bg-white border border-border p-6 space-y-4">
            <form onSubmit={searchGuestOrders} className="flex gap-2">
              <input
                type="text"
                value={lookupQuery}
                onChange={e => setLookupQuery(e.target.value)}
                placeholder="Your email address or phone number (e.g. 0803...)"
                className="flex-1 px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans bg-ivory"
              />
              <Button type="submit" disabled={lookupLoading}>
                {lookupLoading ? 'Finding…' : 'Find Orders'}
              </Button>
            </form>
            <p className="text-xs text-stone font-sans">
              Guests can view all past orders placed with their email or phone without creating an account.
            </p>

            {lookupError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3">
                {lookupError}
              </div>
            )}

            {lookupOrders && lookupOrders.length > 0 && (
              <div className="pt-2 space-y-3">
                <p className="text-xs uppercase tracking-wider text-stone font-sans font-medium">
                  Found {lookupOrders.length} order{lookupOrders.length === 1 ? '' : 's'}:
                </p>
                <div className="space-y-3">
                  {lookupOrders.map((ord: any) => (
                    <div
                      key={ord.id || ord.orderNumber}
                      className="border border-border p-4 bg-ivory/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-gold transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-charcoal">{ord.orderNumber}</span>
                          <span className="text-xs text-stone">· {ord.date}</span>
                        </div>
                        <p className="text-xs text-stone font-sans">
                          {ord.items?.length || 0} item{(ord.items?.length || 0) === 1 ? '' : 's'} · {formatPrice(ord.total)}
                        </p>
                        <div className="flex gap-1.5 pt-1">
                          <Badge variant={ord.paymentStatus as any}>{ord.paymentStatus}</Badge>
                          <Badge variant={ord.deliveryStatus === 'delivered' ? 'success' : ord.deliveryStatus as any}>
                            {ord.deliveryStatus?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTrackedOrder(ord);
                          setSearchInput(ord.orderNumber);
                          setMode('number');
                          setShowReview(false);
                          window.scrollTo({ top: 350, behavior: 'smooth' });
                        }}
                        className="text-xs uppercase tracking-wider font-semibold font-sans text-gold hover:text-gold-dark hover:underline flex items-center gap-1 shrink-0"
                      >
                        Track Order →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 space-y-2">
            <p className="font-medium">Order not found</p>
            <p className="text-xs">{error}</p>
            <p className="text-xs text-stone">
              Need help? <a href="https://wa.me/2348036895862" className="text-gold underline">WhatsApp us</a> or{' '}
              <Link to="/contact" className="text-gold underline">contact support</Link>.
            </p>
          </div>
        )}

        {trackedOrder && (
          <div className="space-y-6">

            {/* Delivered celebration banner */}
            {isDelivered && (
              <div className="bg-emerald-600 text-white p-5 text-center space-y-1">
                <p className="text-2xl">🎉</p>
                <p className="font-serif text-xl">Your order has arrived!</p>
                <p className="text-sm text-emerald-100 font-sans">
                  We hope you love your Raw Stitches piece. Thank you for shopping with us.
                </p>
              </div>
            )}

            {/* Cancelled banner */}
            {isCancelled && (
              <div className="bg-red-50 border border-red-200 p-4 text-center">
                <p className="font-medium text-red-700">This order has been cancelled.</p>
                <p className="text-xs text-stone mt-1 font-sans">
                  Questions? <a href="https://wa.me/2348036895862" className="text-gold underline">Contact us</a>
                </p>
              </div>
            )}

            {/* Order summary card */}
            <div className="bg-white border border-border p-5 space-y-3 text-sm font-sans">
              <div className="flex justify-between border-b border-border pb-3 mb-3">
                <span className="font-serif text-lg text-charcoal">{trackedOrder.orderNumber}</span>
                <div className="flex gap-2">
                  <Badge variant={trackedOrder.paymentStatus as any}>{trackedOrder.paymentStatus}</Badge>
                  <Badge variant={isDelivered ? 'success' : isCancelled ? 'error' : trackedOrder.deliveryStatus as any}>
                    {trackedOrder.deliveryStatus?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Recipient</span>
                <span className="text-charcoal font-medium">{trackedOrder.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Order Date</span>
                <span className="text-charcoal">{trackedOrder.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Order Total</span>
                <span className="text-charcoal font-semibold">{formatPrice(trackedOrder.total)}</span>
              </div>
              {trackedOrder.address && (
                <div className="flex justify-between">
                  <span className="text-stone">Delivering to</span>
                  <span className="text-charcoal text-right max-w-[240px]">
                    {trackedOrder.address.line1}, {trackedOrder.address.city}, {trackedOrder.address.state}
                  </span>
                </div>
              )}
            </div>

            {/* Items */}
            {(trackedOrder.items as any[])?.length > 0 && (
              <div className="bg-white border border-border">
                <div className="px-5 py-3 border-b border-border">
                  <p className="text-xs uppercase tracking-wider text-stone font-sans font-medium">Items in this order</p>
                </div>
                <div className="divide-y divide-border">
                  {(trackedOrder.items as any[]).map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3">
                      <img src={item.image} alt={item.name} className="w-10 h-13 object-cover bg-ivory-dark shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                        <p className="text-xs text-stone font-sans">{item.color} / {item.size} × {item.qty}</p>
                      </div>
                      <p className="text-sm font-medium text-charcoal shrink-0">{formatPrice(item.price * item.qty)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {!isCancelled && (
              <div className="bg-white border border-border p-6">
                <h2 className="font-serif text-xl text-charcoal mb-6">Tracking Timeline</h2>
                <div className="space-y-0">
                  {STEPS.map((step, i) => {
                    // For delivered: all steps including the last one are "done" (green)
                    const done   = isDelivered ? true : i < activeStep;
                    const active = !isDelivered && i === activeStep;
                    const future = !isDelivered && i > activeStep;

                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors text-sm
                            ${done   ? 'bg-emerald-600 border-emerald-600'
                            : active ? 'bg-gold border-gold'
                            :          'bg-white border-border'}`}
                          >
                            {done   ? <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            : active ? <div className="w-2.5 h-2.5 rounded-full bg-white" />
                            :          <div className="w-2.5 h-2.5 rounded-full bg-border" />}
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`w-0.5 h-10 mt-1 transition-colors ${done ? 'bg-emerald-600' : 'bg-border'}`} />
                          )}
                        </div>
                        <div className="pb-10 flex-1">
                          <p className={`font-sans font-semibold text-sm ${future ? 'text-stone/50' : done || active ? 'text-charcoal' : 'text-stone'}`}>
                            {step.emoji} {step.label}
                          </p>
                          <p className={`font-sans text-xs mt-0.5 ${future ? 'text-stone/30' : 'text-stone'}`}>
                            {step.desc}
                          </p>
                          {active && !isDelivered && (
                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-gold font-bold font-sans border border-gold/30 px-2 py-0.5 bg-gold/5">
                              In Progress
                            </span>
                          )}
                          {done && i === STEPS.length - 1 && (
                            <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-emerald-600 font-bold font-sans border border-emerald-200 px-2 py-0.5 bg-emerald-50">
                              Completed ✓
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── Post-delivery review prompt ─── */}
            {isDelivered && (
              <div>
                {!showReview ? (
                  <div className="bg-charcoal text-ivory p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
                    <div>
                      <p className="font-serif text-lg">Enjoyed your purchase?</p>
                      <p className="text-sm text-stone font-sans mt-1">Leave a review and help others discover Raw Stitches.</p>
                    </div>
                    <Button
                      onClick={() => setShowReview(true)}
                      className="shrink-0 whitespace-nowrap"
                    >
                      Write a Review ★
                    </Button>
                  </div>
                ) : (
                  <ReviewForm order={trackedOrder} />
                )}
              </div>
            )}

            {/* Action links */}
            <div className="flex gap-3 flex-wrap">
              <Link to="/shop">
                <Button variant="ghost">Continue Shopping</Button>
              </Link>
              <a href="https://wa.me/2348036895862" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">💬 WhatsApp Support</Button>
              </a>
            </div>

          </div>
        )}

        {/* Help text for first-time visitors */}
        {!trackedOrder && !error && !loading && (
          <div className="text-center py-6 space-y-3">
            <p className="text-stone font-sans text-sm">Haven't placed an order yet?</p>
            <Link to="/shop">
              <Button variant="ghost" size="sm">Browse the Collection</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
