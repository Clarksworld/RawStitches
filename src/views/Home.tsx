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
  const [hero, setHero] = useState({
    eyebrow: 'Raw Stitches Nigeria Enterprise',
    headline: 'Made for the Woman\nWho Stands Out',
    sub: "Unique, elegant and beautifully crafted women's clothing made in Nigeria.",
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1800&h=1200&fit=crop&auto=format&q=80',
    primaryCta: 'Shop the Collection',
    primaryLink: '/shop',
    secondaryCta: 'Explore New Arrivals',
    secondaryLink: '/shop?filter=new',
  });

  useEffect(() => {
    try {
      const savedHero = localStorage.getItem('rs_hero_content');
      if (savedHero) setHero(JSON.parse(savedHero));
    } catch {}

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

  const newArrivals = productList.filter(p => p.isNewArrival);
  const bestSellers = productList.filter(p => p.isBestSeller);

  return (
    <div className="bg-ivory">
      {/* ─── Hero ──────────────────────────────────────────────────── */}
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

      {/* ─── New Arrivals ──────────────────────────────────────────── */}
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

      {/* ─── Divider ────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
        <div className="border-t border-border" />
      </div>

      {/* ─── Best Sellers ─────────────────────────────────────────── */}
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

      {/* ─── Collections ──────────────────────────────────────────── */}
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

      {/* ─── Brand Story ──────────────────────────────────────────── */}
      <section className="py-24 lg:py-32">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1551698618-1dbd93a4f6a6?w=800&h=1000&fit=crop&auto=format&q=80"
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
                Fashion Born from Nigerian Craft
              </h2>
              <p className="text-stone text-base leading-relaxed mb-4 font-sans">
                Raw Stitches Nigeria Enterprise is a Nigerian fashion brand creating unique and beautiful clothing for women. Every piece tells a story of craft, intention, and quiet confidence.
              </p>
              <p className="text-stone text-base leading-relaxed mb-8 font-sans">
                From our atelier in Uyo, Akwa Ibom State, we design and produce clothing that celebrates modern Nigerian femininity — elegant, bold, and unmistakably ours.
              </p>
              <Link to="/about">
                <Button variant="ghost">Discover Our Story</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

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

      {/* ─── Social / Instagram ──────────────────────────────────── */}
      <section className="bg-ivory-dark py-16">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 text-center mb-8">
          <p className="text-gold text-xs uppercase tracking-widest mb-2 font-sans">Follow Us</p>
          <h2 className="font-serif text-2xl text-charcoal">Raw Stitches on Facebook</h2>
          <a href="https://www.facebook.com/rawstitchesnigeria" target="_blank" rel="noopener noreferrer" className="text-xs text-stone hover:text-gold transition-colors font-sans mt-1 inline-block">
            Raw Stitches Nigeria Enterprise →
          </a>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1 max-w-screen-xl mx-auto px-6 lg:px-12">
          {[
            'photo-1596609548086-85bbf8ddb6b9',
            'photo-1515886657613-9f3515b0c78f',
            'photo-1539109136881-3be0616acf4b',
            'photo-1583744946564-b52ac1c389c8',
            'photo-1509631179647-0177331693ae',
            'photo-1485968579580-b6d095142e6e',
          ].map((id, i) => (
            <a key={id} href="https://www.facebook.com/rawstitchesnigeria" target="_blank" rel="noopener noreferrer" className="relative group aspect-square overflow-hidden bg-charcoal">
              <img
                src={`https://images.unsplash.com/${id}?w=300&h=300&fit=crop&auto=format&q=80`}
                alt={`Social post ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 group-hover:opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xl">f</span>
              </div>
            </a>
          ))}
        </div>
        <p className="text-center text-[10px] text-stone/50 mt-4 font-sans italic">Placeholder gallery — connect your Facebook page</p>
      </section>

      {/* ─── Newsletter ───────────────────────────────────────────── */}
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
    </div>
  );
}
