'use client';

import { Link, useParams } from '../components/router-adapter';
import { Button } from '../components/ui';
import { useStore } from '../store';
const logo = '/raw-stitches-logo.png';

export default function Confirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const now = new Date();
  const { state } = useStore();

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <header className="border-b border-border bg-ivory px-6 py-4">
        <Link to="/"><img src={logo} alt="Raw Stitches" className="h-8" /></Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mx-auto mb-8">
            <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-gold text-xs uppercase tracking-widest mb-3 font-sans">Order Confirmed</p>
          <h1 className="font-serif text-3xl text-charcoal mb-3">Your order has been confirmed.</h1>
          <p className="text-stone text-sm mb-8 font-sans leading-relaxed">
            Thank you for shopping with Raw Stitches Nigeria Enterprise. A confirmation has been noted for your order.
          </p>

          {/* Order details card */}
          <div className="bg-white border border-border p-6 text-left mb-8">
            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-stone">Order Number</span>
                <span className="font-medium text-charcoal">{orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-stone">Date</span>
                <span className="text-charcoal">{now.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-stone">Payment</span>
                <span className="text-success">Confirmed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone">Estimated Delivery</span>
                <span className="text-charcoal">2–5 business days</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={`/track/${orderNumber}`} className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">Track Order</Button>
            </Link>
            <Link to="/shop" className="flex-1">
              <Button variant="ghost" size="lg" className="w-full">Continue Shopping</Button>
            </Link>
          </div>

          {!state.customerPreview && (
            <div className="mt-8 bg-white border border-border p-6 text-left">
              <p className="text-gold text-xs uppercase tracking-widest mb-3">Make your next visit simpler</p>
              <div role="heading" aria-level={2} className="font-serif text-2xl text-charcoal mb-3">Your style deserves its own space.</div>
              <p className="text-sm text-stone leading-relaxed mb-5">Create an optional account for your favourites and future order history. Your order does not depend on creating an account.</p>
              <Link to="/create-account"><Button className="w-full">Create an account</Button></Link>
              <p className="text-xs text-stone leading-relaxed mt-4">Account setup is currently a preview. Once connected, we will verify your email before linking any guest orders. No marketing signup is included.</p>
            </div>
          )}
          <div className="mt-8 text-xs text-stone font-sans space-y-1">
            <p>Questions? Contact us:</p>
            <a href="tel:08036895862" className="text-gold hover:underline block">0803 689 5862</a>
            <a href="https://wa.me/2348036895862" className="text-gold hover:underline block">WhatsApp: +234 803 689 5862</a>
          </div>
        </div>
      </div>
    </div>
  );
}
