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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    text: 'Free delivery on orders above ₦50,000 · Made in Nigeria',
    link: '/shop',
  });
  const { count } = useCart();
  const { ids } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rs_announcement');
      if (saved) setAnnouncement(JSON.parse(saved));
    } catch {}
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
              {ids.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-black text-[10px] font-bold rounded-full flex items-center justify-center">{ids.length}</span>}
            </Link>
            <Link to="/cart" className={`p-1 transition-colors hover:text-gold relative ${navText}`} aria-label="Cart">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {count > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-black text-[10px] font-bold rounded-full flex items-center justify-center">{count}</span>}
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
      <footer className="bg-black text-ivory mt-24">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <img src={logo} alt="Raw Stitches" className="h-12 mb-4" />
              <p className="text-sm text-ivory/60 leading-relaxed max-w-sm font-sans">
                Nigerian-made women's fashion. Unique, elegant and beautifully crafted clothing made with purpose.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="https://www.facebook.com/rawstitchesnigeria" target="_blank" rel="noopener noreferrer" className="text-ivory/40 hover:text-gold transition-colors text-sm font-sans">Facebook</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gold mb-4 font-sans font-medium">Shop</h4>
              <ul className="space-y-2.5">
                {['New Arrivals', 'Best Sellers', 'Dresses', 'Tops', 'Two-Piece Sets', 'Skirts'].map(l => (
                  <li key={l}><Link to="/shop" className="text-sm text-ivory/60 hover:text-ivory transition-colors font-sans">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-gold mb-4 font-sans font-medium">Help</h4>
              <ul className="space-y-2.5">
                {['About Us', 'Contact', 'Track Order', 'Size Guide', 'Returns'].map(l => (
                  <li key={l}><Link to="/contact" className="text-sm text-ivory/60 hover:text-ivory transition-colors font-sans">{l}</Link></li>
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
      </footer>
    </div>
  );
}
