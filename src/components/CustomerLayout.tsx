'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from './router-adapter';
import { useCart, useWishlist } from '../store';
const logo = '/raw-stitches-logo.png';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Collections', to: '/shop?tab=collections' },
  { label: 'New Arrivals', to: '/shop?filter=new' },
  { label: 'Best Sellers', to: '/shop?filter=bestsellers' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export default function CustomerLayout({ children }: { children?: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    text: 'Free delivery on orders above ₦50,000 · Made in Nigeria',
    link: '/shop',
  });
  const [showFooter, setShowFooter] = useState(true);
  const { count } = useCart();
  const { ids } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 1. Instant optimistic load from localStorage
    try {
      const saved = localStorage.getItem('rs_announcement');
      if (saved) setAnnouncement(JSON.parse(saved));
      const savedSections = localStorage.getItem('rs_site_sections');
      if (savedSections) {
        const parsed = JSON.parse(savedSections);
        if (Array.isArray(parsed)) {
          const footerSection = parsed.find((s: any) => s.id === 'footer');
          if (footerSection) setShowFooter(footerSection.published !== false);
        }
      }
    } catch {}

    // 2. Fetch authoritative content from DB
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.announcement) {
          setAnnouncement(data.announcement);
          localStorage.setItem('rs_announcement', JSON.stringify(data.announcement));
        }
        if (data.sections && Array.isArray(data.sections)) {
          localStorage.setItem('rs_site_sections', JSON.stringify(data.sections));
          const footerSection = data.sections.find((s: any) => s.id === 'footer');
          if (footerSection) setShowFooter(footerSection.published !== false);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const navBg = isHome && !scrolled ? 'bg-transparent' : 'bg-ivory border-b border-border';
  const navText = isHome && !scrolled ? 'text-ivory' : 'text-charcoal';
  const logoFilter = isHome && !scrolled ? '' : '';

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Top announcement */}
      {announcement.enabled && (
        <div className="bg-black text-ivory text-center py-2 text-xs tracking-widest font-sans px-4">
          {announcement.link ? (
            <Link to={announcement.link} className="hover:text-gold transition-colors">
              {announcement.text}
            </Link>
          ) : (
            announcement.text
          )}
        </div>
      )}

      {/* Nav */}
      <header className={`fixed ${announcement.enabled ? 'top-8' : 'top-0'} left-0 right-0 z-40 transition-all duration-300 ${navBg}`}>
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img src={logo} alt="Raw Stitches Nigeria Enterprise" className="h-10 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-xs font-medium uppercase tracking-widest transition-colors hover:text-gold font-sans ${
                  location.pathname === link.to ? 'text-gold' : navText
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} className={`p-1 transition-colors hover:text-gold ${navText}`} aria-label="Search">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <Link to="/account" className={`p-1 transition-colors hover:text-gold hidden lg:block ${navText}`} aria-label="Account">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </Link>
            <Link to="/account?tab=wishlist" className={`p-1 transition-colors hover:text-gold hidden lg:block relative ${navText}`} aria-label="Wishlist">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {mounted && ids.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-black text-[10px] font-bold rounded-full flex items-center justify-center">{ids.length}</span>}
            </Link>
            <Link to="/cart" className={`p-1 transition-colors hover:text-gold relative ${navText}`} aria-label="Cart">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {mounted && count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-black text-[10px] font-bold rounded-full flex items-center justify-center">{count}</span>}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`lg:hidden p-1 ${navText}`}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-black text-ivory border-t border-white/10">
            <div className="px-6 py-6 flex flex-col gap-5">
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className="text-sm uppercase tracking-widest hover:text-gold transition-colors font-sans">{link.label}</Link>
              ))}
              <div className="pt-4 border-t border-white/10 flex gap-6">
                <Link to="/account" className="text-xs uppercase tracking-widest hover:text-gold transition-colors">Account</Link>
                <Link to="/account?tab=wishlist" className="text-xs uppercase tracking-widest hover:text-gold transition-colors">Wishlist ({ids.length})</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-32 px-6">
          <form onSubmit={handleSearch} className="w-full max-w-xl">
            <div className="relative">
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full bg-transparent border-b-2 border-ivory/50 focus:border-gold text-ivory text-xl py-3 pr-12 placeholder:text-ivory/40 outline-none font-sans transition-colors"
              />
              <button type="submit" className="absolute right-0 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-gold transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </div>
            <p className="text-ivory/40 text-xs mt-3 font-sans">Press Enter to search · Esc to close</p>
          </form>
          <button onClick={() => setSearchOpen(false)} className="absolute top-8 right-8 text-ivory/60 hover:text-ivory p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 ${isHome ? '' : 'pt-24'}`}>
        {children}
      </main>

      {/* Footer */}
      {showFooter && <footer className="bg-black text-ivory mt-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <img src={logo} alt="Raw Stitches" className="h-12 mb-4" />
              <p className="text-sm text-ivory/60 leading-relaxed max-w-sm font-sans">
                Nigerian-made women's fashion. Unique, elegant and beautifully crafted clothing made with purpose.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-6">
                <a
                  href="https://www.instagram.com/rawstitches_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold hover:bg-gold/10 transition-all"
                  aria-label="Instagram"
                  title="Follow us on Instagram (@rawstitches_)"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@rawstitches1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold hover:bg-gold/10 transition-all"
                  aria-label="TikTok"
                  title="Follow us on TikTok (@rawstitches1)"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/rawstitchesnigeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold hover:bg-gold/10 transition-all"
                  aria-label="Facebook"
                  title="Follow us on Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://wa.me/2348036895862"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-ivory/60 hover:text-gold hover:border-gold hover:bg-gold/10 transition-all"
                  aria-label="WhatsApp"
                  title="Chat with us on WhatsApp"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gold mb-4 font-sans font-medium">Shop</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'New Arrivals', href: '/shop?collection=new-arrivals' },
                  { label: 'Best Sellers', href: '/shop?collection=best-sellers' },
                  { label: 'Dresses', href: '/shop?category=dresses' },
                  { label: 'Tops', href: '/shop?category=tops' },
                  { label: 'Two-Piece Sets', href: '/shop?category=two-piece-sets' },
                  { label: 'Skirts', href: '/shop?category=skirts' },
                ].map(item => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-ivory/60 hover:text-ivory transition-colors font-sans">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gold mb-4 font-sans font-medium">Help</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'About Us', href: '/about' },
                  { label: 'Contact', href: '/contact' },
                  { label: 'Track Order', href: '/track' },
                  { label: 'Size Guide', href: '/size-guide' },
                  { label: 'Returns & Exchanges', href: '/returns' },
                ].map(item => (
                  <li key={item.label}>
                    <Link to={item.href} className="text-sm text-ivory/60 hover:text-gold transition-colors font-sans">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <h4 className="text-xs uppercase tracking-widest text-gold mb-4 font-sans font-medium">Contact</h4>
                <div className="space-y-1.5 text-sm text-ivory/60 font-sans">
                  <p>No. 62 Enwe Street, Uyo</p>
                  <p>Akwa Ibom State, Nigeria</p>
                  <a href="tel:08036895862" className="block hover:text-ivory transition-colors">0803 689 5862</a>
                  <a href="https://wa.me/2348036895862" className="block hover:text-gold transition-colors">WhatsApp</a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-ivory/30 font-sans">© {new Date().getFullYear()} Raw Stitches Nigeria Enterprise. All rights reserved.</p>
            <p className="text-xs text-ivory/30 font-sans">Prices in NGN (₦)</p>
          </div>
        </div>
      </footer>}
    </div>
  );
}
