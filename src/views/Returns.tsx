'use client';

import { Link } from '../components/router-adapter';
import { Button } from '../components/ui';
import StudioMap from '../components/StudioMap';

export default function Returns() {
  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-black text-ivory py-16 px-6 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-3 font-sans">Customer Care</p>
        <h1 className="font-serif text-4xl lg:text-5xl">Returns & Exchanges</h1>
        <p className="text-ivory/60 text-sm max-w-md mx-auto mt-3 font-sans">
          We want you to feel extraordinary in every Raw Stitches piece. Here is everything you need to know about our exchange policy.
        </p>
      </div>

      <div className="max-w-screen-md mx-auto px-6 lg:px-12 py-16 space-y-12">
        {/* Core Policy Highlight */}
        <div className="bg-white border border-border p-8 space-y-6">
          <div className="flex items-center gap-4 border-b border-border pb-4">
            <span className="text-3xl">✨</span>
            <div>
              <h2 className="font-serif text-2xl text-charcoal">7-Day Exchange Window</h2>
              <p className="text-xs text-stone font-sans mt-0.5">Prompt, hassle-free exchanges for sizing and style</p>
            </div>
          </div>

          <p className="text-stone text-sm font-sans leading-relaxed">
            If your order does not fit as desired or you would prefer a different color or silhouette, we are pleased to offer an exchange within <strong>7 days</strong> of delivery.
          </p>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-charcoal font-sans">Conditions for Return & Exchange:</h3>
            <ul className="space-y-2.5 text-sm font-sans text-stone">
              <li className="flex items-start gap-2.5">
                <span className="text-gold font-bold">✓</span>
                <span>The item must be in its original, unworn, unwashed, and undamaged condition.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-gold font-bold">✓</span>
                <span>All original brand tags, labels, and packaging must remain securely attached.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-gold font-bold">✓</span>
                <span>Proof of purchase or your Raw Stitches order reference number (e.g. <code>RS-2024-XXXX</code>) must be presented.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-gold font-bold">✓</span>
                <span>Custom-tailored bespoke creations made to custom body measurements cannot be returned, but complimentary alterations can be requested at our Uyo studio.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Steps to Return */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-charcoal">How to Initiate an Exchange</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white border border-border p-6 space-y-2">
              <span className="font-mono text-gold font-bold text-lg">01</span>
              <h3 className="font-serif text-lg text-charcoal">Contact Us</h3>
              <p className="text-xs text-stone font-sans leading-relaxed">
                Reach out to our customer care team via WhatsApp or email with your order number and desired replacement size or piece.
              </p>
            </div>
            <div className="bg-white border border-border p-6 space-y-2">
              <span className="font-mono text-gold font-bold text-lg">02</span>
              <h3 className="font-serif text-lg text-charcoal">Ship the Item</h3>
              <p className="text-xs text-stone font-sans leading-relaxed">
                Dispatch the item securely to our atelier: <strong>No. 62 Enwe Street, Uyo, Akwa Ibom State</strong>.
              </p>
            </div>
            <div className="bg-white border border-border p-6 space-y-2">
              <span className="font-mono text-gold font-bold text-lg">03</span>
              <h3 className="font-serif text-lg text-charcoal">Get Replacement</h3>
              <p className="text-xs text-stone font-sans leading-relaxed">
                Upon inspection, your exchange is dispatched within 2 business days and real-time tracking is provided.
              </p>
            </div>
          </div>
        </div>

        {/* Drop-off / Return Location Map */}
        <div className="space-y-3">
          <div>
            <h3 className="font-serif text-xl text-charcoal">Atelier Return & Drop-off Location</h3>
            <p className="text-xs text-stone font-sans mt-0.5">Bring returns directly to our studio or dispatch via courier.</p>
          </div>
          <StudioMap heightClass="h-56 sm:h-64" />
        </div>

        {/* Help Banner */}
        <div className="bg-charcoal text-ivory p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-xl">Need Assistance with a Return?</h3>
            <p className="text-ivory/60 text-xs font-sans">Our support team is ready to assist you Monday through Saturday.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/contact">
              <Button variant="ghost" size="sm" className="border-ivory/30 text-ivory hover:text-gold hover:border-gold">Contact Form</Button>
            </Link>
            <a
              href="https://wa.me/2348000000000?text=Hello%20Raw%20Stitches,%20I%20would%20like%20to%20request%20an%20exchange"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm">WhatsApp Support →</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
