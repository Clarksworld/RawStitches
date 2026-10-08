'use client';

import { Link } from '../components/router-adapter';
import { useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES, formatPrice, type Product } from '../data';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui';

const FALLBACK_TESTIMONIALS = [
  { customerName: 'Adaeze O.', city: 'Port Harcourt', body: 'The quality is exceptional. I wore my wrap dress to a formal event and received so many compliments. Raw Stitches truly understands Nigerian elegance.', rating: 5 },
  { customerName: 'Chisom E.', city: 'Abuja', body: "I am obsessed with my two-piece set. The fit is perfect and the fabric is luxurious. This brand is doing something special for Nigerian women's fashion.", rating: 5 },
  { customerName: 'Ngozi A.', city: 'Lagos', body: 'Finally, a Nigerian brand that combines craftsmanship with contemporary style. The maxi dress is everything I imagined and more.', rating: 5 },
];

export default function Home() {
  const [productList, setProductList] = useState<Product[]>(PRODUCTS);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [featuredReviews, setFeaturedReviews] = useState<any[]>([]);
  const [sections, setSections] = useState<Record<string, boolean>>({
    hero: true,
    featured: true,
    collections: true,
    about: true,
    testimonials: true,
    social: true,
    newsletter: true,
    faq: true,
  });
  const [faqs, setFaqs] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [brand, setBrand] = useState({
    tagline: 'Refined Nigerian Couture for the Modern Woman',
    manifesto: 'Founded in Uyo, Raw Stitches creates contemporary womenswear inspired by African heritage, architectural silhouettes, and fine tailoring.',
    address: 'No. 62 Enwe Street, Uyo, Akwa Ibom State, Nigeria',
  });
  const [hero, setHero] = useState({
    eyebrow: 'Raw Stitches Nigeria Enterprise',
    headline: 'Made for the Woman\nWho Stands Out',
    sub: "Unique, elegant and beautifully crafted women's clothing made in Nigeria.",
    image: 'https://res.cloudinary.com/bisnlyad/image/upload/v1791387009/copy_of_whatsapp_image_2026-10-07_at_161833.jpg',
    primaryCta: 'Shop the Collection',
    primaryLink: '/shop',
    secondaryCta: 'Explore New Arrivals',
    secondaryLink: '/shop?filter=new',
  });

  useEffect(() => {
    // 1. Optimistic load from localStorage
    try {
      const savedHero = localStorage.getItem('rs_hero_content');
      if (savedHero) setHero(JSON.parse(savedHero));

      const savedSections = localStorage.getItem('rs_site_sections');
      if (savedSections) {
        const parsed = JSON.parse(savedSections);
        if (Array.isArray(parsed)) {
          const map: Record<string, boolean> = {};
          parsed.forEach((s: any) => { map[s.id] = s.published; });
          setSections(map);
        }
      }

      const savedFaqs = localStorage.getItem('rs_faqs');
      if (savedFaqs) setFaqs(JSON.parse(savedFaqs));

      const savedBrand = localStorage.getItem('rs_brand_story');
      if (savedBrand) setBrand(JSON.parse(savedBrand));
    } catch { }

    // 2. Fetch authoritative database content
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.hero) setHero(data.hero);
        if (data.sections && Array.isArray(data.sections)) {
          const map: Record<string, boolean> = {};
          data.sections.forEach((s: any) => { map[s.id] = s.published; });
          setSections(map);
        }
        if (data.faqs && Array.isArray(data.faqs)) setFaqs(data.faqs);
        if (data.brand) setBrand(data.brand);
      })
      .catch(() => {});

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products)) {
          setProductList(data.products);
        }
      })
      .catch(console.error);

    fetch('/api/reviews?featured=true&status=approved')
      .then(res => res.json())
      .then(data => {
        if (data.reviews && data.reviews.length > 0) {
          setFeaturedReviews(data.reviews.slice(0, 3));
        }
      })
      .catch(() => { });
  }, []);

  const isVisible = (id: string) => sections[id] !== false;

  const newArrivals = productList.filter(p => p.isNewArrival);
  const bestSellers = productList.filter(p => p.isBestSeller);

  return (
    <div className="bg-ivory">
      {/* ─── Hero ──────────────────────────────────────────────────── */}
      {isVisible('hero') && (
        <section className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-charcoal">
            <img
              src={hero.image}
              alt="Raw Stitches editorial fashion"
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
          <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-12 pb-20 lg:pb-32 w-full">
            <div className="max-w-2xl">
              <p className="text-gold text-2xl font-bold uppercase tracking-[0.25em] mb-5 font-sans">
                {hero.eyebrow}
              </p>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-ivory leading-tight mb-6 whitespace-pre-line">
                {hero.headline}
              </h1>
              <p className="text-ivory/70 text-base lg:text-lg max-w-md leading-relaxed mb-8 font-sans">
                {hero.sub}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => window.location.href = hero.primaryLink || '/shop'}>
                  {hero.primaryCta}
                </Button>
                <Link to={hero.secondaryLink || '/shop?filter=new'}>
                  <Button variant="ghost" size="lg" className="border-ivory/40 text-ivory hover:border-gold hover:text-gold">
                    {hero.secondaryCta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 right-12 text-ivory/30 text-[10px] uppercase tracking-widest font-sans flex items-center gap-2 rotate-90 origin-right hidden lg:flex">
            Scroll <span className="w-8 h-px bg-ivory/30" />
          </div>
        </section>
      )}

      {/* ─── Featured Products (New Arrivals & Best Sellers) ───────── */}
      {isVisible('featured') && (
        <>
          {/* New Arrivals */}
          <section className="max-w-screen-xl mx-auto px-6 lg:px-12 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2 font-sans">Just In</p>
                <h2 className="font-serif text-3xl lg:text-4xl text-charcoal">New Arrivals</h2>
              </div>
              <Link to="/shop?filter=new" className="text-xs uppercase tracking-widest text-stone hover:text-gold transition-colors font-sans hidden md:block">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
              {newArrivals.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>

          {/* Divider */}
          <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
            <div className="border-t border-border" />
          </div>

          {/* Best Sellers */}
          <section className="max-w-screen-xl mx-auto px-6 lg:px-12 py-20">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-2 font-sans">Customer Favourites</p>
                <h2 className="font-serif text-3xl lg:text-4xl text-charcoal">Best Sellers</h2>
              </div>
              <Link to="/shop?filter=bestsellers" className="text-xs uppercase tracking-widest text-stone hover:text-gold transition-colors font-sans hidden md:block">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
              {bestSellers.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        </>
      )}

      {/* ─── Collections ──────────────────────────────────────────── */}
      {isVisible('collections') && (
        <section className="bg-black py-20">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
            <div className="mb-10">
              <p className="text-gold text-xs uppercase tracking-widest mb-2 font-sans">Explore</p>
              <h2 className="font-serif text-3xl lg:text-4xl text-ivory">Shop by Collection</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.filter(c => c.enabled).slice(0, 3).map((cat, i) => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className={`relative overflow-hidden group ${i === 0 ? 'md:row-span-2 md:col-span-1' : ''}`}
                >
                  <div className={`relative bg-charcoal overflow-hidden ${i === 0 ? 'aspect-[3/4] md:h-full' : 'aspect-[4/3]'}`}>
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <h3 className="font-serif text-2xl text-ivory mb-2">{cat.name}</h3>
                      <span className="text-xs text-ivory/60 uppercase tracking-widest font-sans group-hover:text-gold transition-colors">
                        Shop Now →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-2 gap-4">
              {CATEGORIES.filter(c => c.enabled).slice(3).map(cat => (
                <Link
                  key={cat.id}
                  to={`/shop?category=${cat.slug}`}
                  className="relative overflow-hidden group aspect-[16/7]"
                >
                  <div className="relative bg-charcoal overflow-hidden h-full">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 flex items-center justify-between px-8">
                      <h3 className="font-serif text-2xl text-ivory">{cat.name}</h3>
                      <span className="text-xs text-ivory/60 uppercase tracking-widest font-sans group-hover:text-gold transition-colors">Shop →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Brand Story ──────────────────────────────────────────── */}
      {isVisible('about') && (
        <section className="py-24 lg:py-32">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1000&fit=crop&auto=format&q=80"
                  alt="Raw Stitches craftsmanship"
                  className="w-full aspect-[4/5] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-gold p-6 hidden lg:block">
                  <p className="font-serif text-3xl text-black">Made in</p>
                  <p className="font-serif text-3xl text-black italic">Nigeria</p>
                </div>
              </div>
              <div>
                <p className="text-gold text-xs uppercase tracking-widest mb-4 font-sans">Our Story</p>
                <h2 className="font-serif text-3xl lg:text-4xl text-charcoal mb-6 leading-tight">
                  {brand.tagline || 'Fashion Born from Nigerian Craft'}
                </h2>
                <p className="text-stone text-base leading-relaxed mb-6 font-sans">
                  {brand.manifesto || 'Raw Stitches Nigeria Enterprise is a Nigerian fashion brand creating unique and beautiful clothing for women. Every piece tells a story of craft, intention, and quiet confidence.'}
                </p>
                <p className="text-stone text-sm leading-relaxed mb-8 font-sans">
                  From our atelier at {brand.address || 'No. 62 Enwe Street, Uyo, Akwa Ibom State'}, we design and produce clothing that celebrates modern Nigerian femininity — elegant, bold, and unmistakably ours.
                </p>
                <Link to="/about">
                  <Button variant="ghost">Discover Our Story</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Editorial Grid ──────────────────────────────────────── */}
      <section className="bg-ivory-dark py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <p className="text-gold text-xs uppercase tracking-widest mb-4 font-sans">The Lookbook</p>
          <h2 className="font-serif text-3xl lg:text-4xl text-charcoal mb-10">Editorial</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-3">
            {[
              'photo-1509631179647-0177331693ae',
              'photo-1583744946564-b52ac1c389c8',
              'photo-1485968579580-b6d095142e6e',
              'photo-1539109136881-3be0616acf4b',
              'photo-1469334031218-e382a71b716b',
              'photo-1529139574466-a303027c1d8b',
            ].map((id, i) => (
              <div key={id} className={`overflow-hidden bg-charcoal ${i === 0 ? 'col-span-2 md:col-span-1 md:row-span-2' : ''}`}>
                <img
                  src={`https://images.unsplash.com/${id}?w=600&h=${i === 0 ? 900 : 450}&fit=crop&auto=format&q=80`}
                  alt={`Raw Stitches lookbook ${i + 1}`}
                  className={`w-full ${i === 0 ? 'aspect-[2/3] md:h-full' : 'aspect-[4/3]'} object-cover hover:scale-105 transition-transform duration-700`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────── */}
      {isVisible('testimonials') && (
        <section className="py-20 lg:py-28">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-14">
              <p className="text-gold text-xs uppercase tracking-widest mb-2 font-sans">Reviews</p>
              <h2 className="font-serif text-3xl lg:text-4xl text-charcoal">What She Says</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
              {(featuredReviews.length > 0 ? featuredReviews : FALLBACK_TESTIMONIALS).map((t: any, i) => (
                <div key={i} className="bg-white p-8 border border-border">
                  <div className="flex mb-4">
                    {Array.from({ length: t.rating }).map((_: any, j: number) => (
                      <span key={j} className="text-gold text-sm">★</span>
                    ))}
                  </div>
                  <p className="font-serif text-lg text-charcoal italic leading-relaxed mb-6">"{t.body}"</p>
                  <div>
                    <p className="text-sm font-medium text-charcoal font-sans">{t.customerName}</p>
                    {t.city && <p className="text-xs text-stone font-sans">{t.city}</p>}
                    {t.productName && <p className="text-xs text-stone/60 font-sans mt-0.5">on {t.productName}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Frequently Asked Questions (FAQ) ────────────────────── */}
      {isVisible('faq') && faqs.filter(f => f.pub).length > 0 && (
        <section className="bg-white border-y border-border py-20 lg:py-24">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-gold text-xs uppercase tracking-widest mb-2 font-sans">Got Questions?</p>
              <h2 className="font-serif text-3xl lg:text-4xl text-charcoal">Frequently Asked Questions</h2>
              <p className="text-stone text-sm font-sans mt-2">
                Everything you need to know about ordering, bespoke fittings, delivery across Nigeria, and exchanges.
              </p>
            </div>

            <div className="divide-y divide-border border-y border-border">
              {faqs.filter(f => f.pub).map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id} className="py-5">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between text-left gap-4 font-serif text-lg text-charcoal hover:text-gold transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span className="text-gold text-xl shrink-0 font-sans font-light">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-stone text-sm leading-relaxed font-sans pr-6">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <p className="text-xs text-stone font-sans">
                Have a bespoke enquiry or need style advice?{' '}
                <a href="https://wa.me/2348036895862" target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-gold-dark font-medium">
                  Chat with our atelier on WhatsApp →
                </a>
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ─── Social / Instagram & TikTok ──────────────────────────── */}
      {isVisible('social') && (
        <section className="bg-ivory-dark py-16">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-12 text-center mb-8">
            <p className="text-gold text-xs uppercase tracking-widest mb-2 font-sans">Follow Our Journey</p>
            <h2 className="font-serif text-2xl lg:text-3xl text-charcoal">Raw Stitches on Instagram & TikTok</h2>
            <p className="text-xs text-stone font-sans mt-2 max-w-md mx-auto">
              Discover new drops, styling reels, behind-the-scenes bespoke tailoring, and client stories.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              <a
                href="https://www.instagram.com/rawstitches_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-sans text-charcoal hover:text-gold px-4 py-2 border border-border bg-white shadow-xs hover:border-gold transition-colors"
              >
                <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>@rawstitches_</span>
              </a>
              <a
                href="https://www.tiktok.com/@rawstitches1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-sans text-charcoal hover:text-gold px-4 py-2 border border-border bg-white shadow-xs hover:border-gold transition-colors"
              >
                <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
                <span>@rawstitches1</span>
              </a>
              <a
                href="https://www.facebook.com/rawstitchesnigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-sans text-charcoal hover:text-gold px-4 py-2 border border-border bg-white shadow-xs hover:border-gold transition-colors"
              >
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1 max-w-screen-xl mx-auto px-6 lg:px-12">
            {[
              { id: 'photo-1596609548086-85bbf8ddb6b9', platform: 'ig', url: 'https://www.instagram.com/rawstitches_' },
              { id: 'photo-1515886657613-9f3515b0c78f', platform: 'tt', url: 'https://www.tiktok.com/@rawstitches1' },
              { id: 'photo-1539109136881-3be0616acf4b', platform: 'ig', url: 'https://www.instagram.com/rawstitches_' },
              { id: 'photo-1583744946564-b52ac1c389c8', platform: 'tt', url: 'https://www.tiktok.com/@rawstitches1' },
              { id: 'photo-1509631179647-0177331693ae', platform: 'ig', url: 'https://www.instagram.com/rawstitches_' },
              { id: 'photo-1485968579580-b6d095142e6e', platform: 'tt', url: 'https://www.tiktok.com/@rawstitches1' },
            ].map((item, i) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group aspect-square overflow-hidden bg-charcoal"
              >
                <img
                  src={`https://images.unsplash.com/${item.id}?w=300&h=300&fit=crop&auto=format&q=80`}
                  alt={`Social post ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 group-hover:opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  {item.platform === 'ig' ? (
                    <span className="text-white text-xs font-sans font-semibold tracking-wider bg-black/60 px-2 py-1 border border-white/20">
                      Instagram ↗
                    </span>
                  ) : (
                    <span className="text-white text-xs font-sans font-semibold tracking-wider bg-black/60 px-2 py-1 border border-white/20">
                      TikTok ↗
                    </span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ─── Newsletter ───────────────────────────────────────────── */}
      {isVisible('newsletter') && (
        <section className="bg-black py-20">
          <div className="max-w-md mx-auto px-6 text-center">
            <p className="text-gold text-xs uppercase tracking-widest mb-4 font-sans">Join the Community</p>
            <h2 className="font-serif text-3xl text-ivory mb-3">Be the First to Know</h2>
            <p className="text-ivory/50 text-sm mb-8 font-sans">Be the first to discover new collections, exclusive offers, and fashion stories from Raw Stitches.</p>
            {subscribed ? (
              <div className="py-4">
                <p className="text-gold font-serif text-xl">Thank you for subscribing.</p>
                <p className="text-ivory/40 text-sm mt-2 font-sans">Welcome to the Raw Stitches community.</p>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); if (email) setSubscribed(true); }} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="flex-1 bg-white/10 border border-white/20 text-ivory placeholder:text-ivory/30 px-4 py-3 text-sm font-sans focus:border-gold focus:outline-none transition-colors"
                />
                <Button type="submit" size="md">Subscribe</Button>
              </form>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
