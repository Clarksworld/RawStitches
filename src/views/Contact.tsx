'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/ui';
import StudioMap from '../components/StudioMap';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [brand, setBrand] = useState({
    name: 'Raw Stitches Nigeria Enterprise',
    address: 'No. 62 Enwe Street, Uyo, Akwa Ibom State, Nigeria',
    phone: '+234 803 689 5862',
    whatsapp: '+234 803 689 5862',
    instagram: '@rawstitches_',
    tiktok: '@rawstitches1',
    facebook: 'Raw Stitches Nigeria Enterprise',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rs_brand_story');
      if (saved) setBrand(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch {}

    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.brand) setBrand(prev => ({ ...prev, ...data.brand }));
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setSent(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again or contact us via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  }

  const cleanPhone = brand.phone.replace(/[^0-9+]/g, '');
  const cleanWa = brand.whatsapp.replace(/[^0-9]/g, '');
  const instaHandle = brand.instagram?.replace(/^@/, '') || 'rawstitches_';
  const tiktokHandle = brand.tiktok?.replace(/^@/, '') || 'rawstitches1';

  return (
    <div className="bg-ivory min-h-screen">
      <div className="bg-black text-ivory py-14 px-6 text-center">
        <p className="text-gold text-xs uppercase tracking-widest mb-2 font-sans">Get in Touch</p>
        <h1 className="font-serif text-3xl lg:text-4xl">Contact Us</h1>
      </div>

      <div className="max-w-screen-lg mx-auto px-6 lg:px-12 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <div className="mb-10">
              <p className="text-gold text-xs uppercase tracking-widest mb-4 font-sans">Our Details</p>
              <h2 className="font-serif text-2xl text-charcoal mb-6">{brand.name || 'Raw Stitches Nigeria Enterprise'}</h2>
              <div className="space-y-4 text-sm font-sans">
                <div className="flex gap-4 items-start">
                  <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <div className="text-stone leading-relaxed whitespace-pre-line">
                    <p>{brand.address || 'No. 62 Enwe Street, Uyo, Akwa Ibom State, Nigeria'}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center">
                  <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <a href={`tel:${cleanPhone}`} className="text-stone hover:text-gold transition-colors">{brand.phone || '0803 689 5862'}</a>
                </div>
                <div className="flex gap-4 items-center">
                  <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  <a href={`https://wa.me/${cleanWa}`} className="text-stone hover:text-gold transition-colors">WhatsApp: {brand.whatsapp || '+234 803 689 5862'}</a>
                </div>
                <div className="flex gap-4 items-center">
                  <svg className="w-5 h-5 text-gold shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <a href={`https://www.instagram.com/${instaHandle}`} target="_blank" rel="noopener noreferrer" className="text-stone hover:text-gold transition-colors">Instagram: @{instaHandle}</a>
                </div>
                <div className="flex gap-4 items-center">
                  <svg className="w-5 h-5 text-gold shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                  <a href={`https://www.tiktok.com/@${tiktokHandle}`} target="_blank" rel="noopener noreferrer" className="text-stone hover:text-gold transition-colors">TikTok: @{tiktokHandle}</a>
                </div>
                <div className="flex gap-4 items-center">
                  <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                  <a href="https://www.facebook.com/rawstitchesnigeria" target="_blank" rel="noopener noreferrer" className="text-stone hover:text-gold transition-colors">Facebook: {brand.facebook || 'Raw Stitches Nigeria Enterprise'}</a>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <a href={`tel:${cleanPhone}`}>
                <Button variant="secondary" className="w-full sm:w-auto">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Call Us
                </Button>
              </a>
              <a href={`https://wa.me/${cleanWa}?text=Hello%20Raw%20Stitches%2C%20I%20have%20an%20enquiry`} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" className="w-full sm:w-auto">
                  Chat on WhatsApp
                </Button>
              </a>
              <a href="https://maps.google.com/?q=Uyo+Akwa+Ibom+Nigeria" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" className="w-full sm:w-auto">Get Directions</Button>
              </a>
            </div>

            {/* Studio Map */}
            <StudioMap className="mt-8" heightClass="h-64 sm:h-72" />
          </div>

          {/* Form */}
          <div>
            <p className="text-gold text-xs uppercase tracking-widest mb-4 font-sans">Send a Message</p>
            <h2 className="font-serif text-2xl text-charcoal mb-6">We'd Love to Hear From You</h2>

            {sent ? (
              <div className="bg-success/10 border border-success/30 p-6 text-center">
                <p className="text-success font-serif text-xl mb-2">Message Sent</p>
                <p className="text-stone text-sm font-sans">Thank you for reaching out. We'll get back to you shortly.</p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', message: '' }); }} className="text-xs text-stone hover:text-charcoal mt-4 font-sans underline">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Full Name</span>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans bg-white" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Email Address</span>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans bg-white" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Phone Number (optional)</span>
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="080XXXXXXXX" className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans bg-white" />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Message</span>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="How can we help you?" className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans bg-white resize-none" />
                </label>

                {error && (
                  <div className="bg-error/10 border border-error/30 text-error text-xs p-3 font-sans">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" loading={submitting} className="w-full">
                  {submitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
