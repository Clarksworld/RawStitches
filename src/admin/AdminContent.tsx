'use client';

import { useState, useEffect } from 'react';
import { Button, Toggle, Tabs, Modal, Input, Badge } from '../components/ui';
import ImageUploader from '../components/ImageUploader';

interface SectionItem {
  id: string;
  label: string;
  desc: string;
  published: boolean;
}

interface FaqItem {
  id: string;
  q: string;
  a: string;
  pub: boolean;
}

const DEFAULT_SECTIONS: SectionItem[] = [
  { id: 'hero', label: 'Homepage Hero', desc: 'Main banner image, headline, and CTA', published: true },
  { id: 'featured', label: 'Featured Products', desc: 'Products highlighted on homepage', published: true },
  { id: 'collections', label: 'Shop by Collection', desc: 'Collection cards on homepage', published: true },
  { id: 'about', label: 'Brand Story Section', desc: 'Short brand story on homepage', published: true },
  { id: 'testimonials', label: 'Testimonials', desc: 'Customer reviews shown on homepage', published: true },
  { id: 'social', label: 'Social Gallery', desc: 'Instagram / Facebook gallery', published: false },
  { id: 'newsletter', label: 'Newsletter / CTA', desc: 'Email signup section', published: true },
  { id: 'about_page', label: 'About Page', desc: 'Full about page content', published: true },
  { id: 'faq', label: 'FAQ', desc: 'Frequently asked questions', published: false },
  { id: 'footer', label: 'Footer Content', desc: 'Footer links, address, and social', published: true },
];

const DEFAULT_FAQS: FaqItem[] = [
  { id: 'f1', q: 'How do I place an order?', a: 'Browse our collection, select your size and colour, and add to bag. Proceed to checkout and enter your details.', pub: true },
  { id: 'f2', q: 'What payment methods do you accept?', a: 'We accept card payments (Visa, Mastercard, Verve), bank transfer, and USSD via Paystack.', pub: true },
  { id: 'f3', q: 'How long does delivery take?', a: 'Delivery takes 1–2 days within Uyo/Akwa Ibom, and 3–5 days for Lagos, Abuja, and other states across Nigeria.', pub: true },
  { id: 'f4', q: 'What is your return policy?', a: 'Items in unworn condition with original tags intact may be exchanged within 7 days of delivery.', pub: false },
];

export default function AdminContent() {
  const [tab, setTab] = useState('Homepage Hero');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // ─── Sections State ──────────────────────────────────────────────────────────
  const [sections, setSections] = useState<SectionItem[]>(DEFAULT_SECTIONS);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);

  // ─── Hero State ──────────────────────────────────────────────────────────────
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
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // ─── Announcement Bar State ──────────────────────────────────────────────────
  const [announcement, setAnnouncement] = useState({
    enabled: true,
    text: 'Free delivery on orders above ₦50,000 · Made in Nigeria',
    link: '/shop',
  });

  // ─── FAQ State ───────────────────────────────────────────────────────────────
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqForm, setFaqForm] = useState({ q: '', a: '', pub: true });

  // ─── Brand Info State ────────────────────────────────────────────────────────
  const [brandInfo, setBrandInfo] = useState({
    tagline: 'Refined Nigerian Couture for the Modern Woman',
    manifesto: 'Founded in Uyo, Raw Stitches creates contemporary womenswear inspired by African heritage, architectural silhouettes, and fine tailoring.',
    address: 'No. 62 Enwe Street, Uyo, Akwa Ibom State, Nigeria',
    email: 'info@rawstitches.ng',
    phone: '+234 800 000 0000',
    whatsapp: '+234 800 000 0000',
    instagram: '@rawstitches.ng',
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedHero = localStorage.getItem('rs_hero_content');
      if (savedHero) setHero(JSON.parse(savedHero));

      const savedAnnounce = localStorage.getItem('rs_announcement');
      if (savedAnnounce) setAnnouncement(JSON.parse(savedAnnounce));

      const savedSections = localStorage.getItem('rs_site_sections');
      if (savedSections) setSections(JSON.parse(savedSections));

      const savedFaqs = localStorage.getItem('rs_faqs');
      if (savedFaqs) setFaqs(JSON.parse(savedFaqs));

      const savedBrand = localStorage.getItem('rs_brand_story');
      if (savedBrand) setBrandInfo(JSON.parse(savedBrand));
    } catch (e) {
      console.error('Failed to load content settings:', e);
    }
  }, []);

  function triggerFeedback(msg: string) {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(null), 3000);
  }

  // ─── Section Handlers ────────────────────────────────────────────────────────
  function toggleSection(id: string) {
    const updated = sections.map(s => s.id === id ? { ...s, published: !s.published } : s);
    setSections(updated);
    localStorage.setItem('rs_site_sections', JSON.stringify(updated));
    triggerFeedback('Section visibility updated');
  }

  function handleSaveSectionEdit() {
    if (!editingSection) return;
    const updated = sections.map(s => s.id === editingSection.id ? editingSection : s);
    setSections(updated);
    localStorage.setItem('rs_site_sections', JSON.stringify(updated));
    setEditingSection(null);
    triggerFeedback('Section details saved');
  }

  // ─── Hero Handlers ───────────────────────────────────────────────────────────
  function handleSaveHero() {
    localStorage.setItem('rs_hero_content', JSON.stringify(hero));
    triggerFeedback('Homepage Hero successfully saved');
  }

  // ─── Announcement Handlers ───────────────────────────────────────────────────
  function handleSaveAnnouncement() {
    localStorage.setItem('rs_announcement', JSON.stringify(announcement));
    triggerFeedback('Announcement bar updated');
  }

  // ─── FAQ Handlers ────────────────────────────────────────────────────────────
  function openAddFaq() {
    setEditingFaq(null);
    setFaqForm({ q: '', a: '', pub: true });
    setFaqModalOpen(true);
  }

  function openEditFaq(faq: FaqItem) {
    setEditingFaq(faq);
    setFaqForm({ q: faq.q, a: faq.a, pub: faq.pub });
    setFaqModalOpen(true);
  }

  function handleSaveFaq() {
    if (!faqForm.q.trim() || !faqForm.a.trim()) return;

    let updated: FaqItem[];
    if (editingFaq) {
      updated = faqs.map(f => f.id === editingFaq.id ? { ...f, q: faqForm.q.trim(), a: faqForm.a.trim(), pub: faqForm.pub } : f);
    } else {
      const newFaq: FaqItem = {
        id: `faq_${Date.now()}`,
        q: faqForm.q.trim(),
        a: faqForm.a.trim(),
        pub: faqForm.pub,
      };
      updated = [newFaq, ...faqs];
    }

    setFaqs(updated);
    localStorage.setItem('rs_faqs', JSON.stringify(updated));
    setFaqModalOpen(false);
    triggerFeedback(editingFaq ? 'FAQ updated successfully' : 'New FAQ added');
  }

  function toggleFaqPublish(id: string) {
    const updated = faqs.map(f => f.id === id ? { ...f, pub: !f.pub } : f);
    setFaqs(updated);
    localStorage.setItem('rs_faqs', JSON.stringify(updated));
    triggerFeedback('FAQ status changed');
  }

  function handleDeleteFaq(id: string) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;
    const updated = faqs.filter(f => f.id !== id);
    setFaqs(updated);
    localStorage.setItem('rs_faqs', JSON.stringify(updated));
    triggerFeedback('FAQ deleted');
  }

  // ─── Brand Info Handlers ─────────────────────────────────────────────────────
  function handleSaveBrandInfo() {
    localStorage.setItem('rs_brand_story', JSON.stringify(brandInfo));
    triggerFeedback('Brand & Studio info saved');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">Content Management</h1>
          <p className="text-sm text-stone font-sans mt-0.5">
            Manage storefront banners, hero storytelling, section visibility, and FAQ answers.
          </p>
        </div>
        {savedFeedback && (
          <div className="bg-success/10 border border-success/30 text-success text-xs font-sans px-4 py-2 flex items-center gap-2">
            <span>✓</span> {savedFeedback}
          </div>
        )}
      </div>

      <Tabs
        tabs={['Homepage Hero', 'Announcement Bar', 'Sections Visibility', 'FAQ Management', 'Brand & Studio']}
        active={tab}
        onChange={setTab}
      />

      {/* ─── TAB 1: Homepage Hero ─────────────────────────────────────────── */}
      {tab === 'Homepage Hero' && (
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white border border-border p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-serif text-lg text-charcoal">Hero Banner Preview</h3>
                <p className="text-xs text-stone font-sans">The main entrance visual on your homepage</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setImageModalOpen(true)}>
                Change Image
              </Button>
            </div>

            <div className="relative h-56 bg-charcoal border border-border overflow-hidden">
              <img
                src={hero.image}
                alt="Hero banner"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6">
                <p className="text-gold text-xs font-bold uppercase tracking-widest">{hero.eyebrow}</p>
                <h2 className="font-serif text-2xl text-ivory font-normal leading-snug whitespace-pre-line mt-1">
                  {hero.headline}
                </h2>
                <p className="text-ivory/70 text-xs font-sans mt-1 line-clamp-2 max-w-md">
                  {hero.sub}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                  Eyebrow Text
                </span>
                <input
                  value={hero.eyebrow}
                  onChange={e => setHero(h => ({ ...h, eyebrow: e.target.value }))}
                  placeholder="e.g. Raw Stitches Nigeria Enterprise"
                  className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                  Main Headline
                </span>
                <textarea
                  rows={2}
                  value={hero.headline}
                  onChange={e => setHero(h => ({ ...h, headline: e.target.value }))}
                  placeholder="Hero headline"
                  className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans resize-none"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                  Supporting Subtitle
                </span>
                <textarea
                  rows={2}
                  value={hero.sub}
                  onChange={e => setHero(h => ({ ...h, sub: e.target.value }))}
                  placeholder="Short supporting description"
                  className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans resize-none"
                />
              </label>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                    Primary CTA Label
                  </span>
                  <input
                    value={hero.primaryCta}
                    onChange={e => setHero(h => ({ ...h, primaryCta: e.target.value }))}
                    className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                    Primary CTA Link
                  </span>
                  <input
                    value={hero.primaryLink}
                    onChange={e => setHero(h => ({ ...h, primaryLink: e.target.value }))}
                    className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans font-mono text-xs"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                    Secondary CTA Label
                  </span>
                  <input
                    value={hero.secondaryCta}
                    onChange={e => setHero(h => ({ ...h, secondaryCta: e.target.value }))}
                    className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                    Secondary CTA Link
                  </span>
                  <input
                    value={hero.secondaryLink}
                    onChange={e => setHero(h => ({ ...h, secondaryLink: e.target.value }))}
                    className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans font-mono text-xs"
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSaveHero} size="md">
                  Save Hero Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Announcement Bar ───────────────────────────────────────── */}
      {tab === 'Announcement Bar' && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white border border-border p-6 space-y-5">
            <div>
              <h3 className="font-serif text-lg text-charcoal">Top Announcement Bar</h3>
              <p className="text-xs text-stone font-sans">
                Appears at the very top of all customer storefront pages.
              </p>
            </div>

            {/* Live Preview */}
            <div className="border border-border p-4 bg-ivory">
              <span className="text-[10px] text-stone font-sans uppercase tracking-wider block mb-2">Live Preview:</span>
              {announcement.enabled ? (
                <div className="bg-black text-ivory text-center py-2 px-4 text-xs tracking-widest font-sans">
                  {announcement.text}
                </div>
              ) : (
                <div className="bg-stone/10 text-stone text-center py-2 px-4 text-xs italic font-sans border border-dashed border-border">
                  (Announcement bar is currently disabled and hidden)
                </div>
              )}
            </div>

            <div className="flex items-center justify-between py-2 border-y border-border">
              <div>
                <p className="text-sm font-medium text-charcoal font-sans">Enable Announcement Bar</p>
                <p className="text-xs text-stone font-sans">Display banner across the top of all pages</p>
              </div>
              <Toggle
                checked={announcement.enabled}
                onChange={() => setAnnouncement(a => ({ ...a, enabled: !a.enabled }))}
              />
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                Banner Announcement Text
              </span>
              <input
                value={announcement.text}
                onChange={e => setAnnouncement(a => ({ ...a, text: e.target.value }))}
                placeholder="e.g. Free delivery on orders above ₦50,000 · Made in Nigeria"
                className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                Destination Link (optional)
              </span>
              <input
                value={announcement.link}
                onChange={e => setAnnouncement(a => ({ ...a, link: e.target.value }))}
                placeholder="/shop"
                className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans font-mono text-xs"
              />
            </label>

            <div className="pt-2 flex justify-end">
              <Button onClick={handleSaveAnnouncement} size="md">
                Save Announcement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Sections Visibility ───────────────────────────────────── */}
      {tab === 'Sections Visibility' && (
        <div className="space-y-4 max-w-3xl">
          <div className="bg-ivory-dark border border-border p-4 text-xs text-stone font-sans">
            💡 Toggle which sections appear on the homepage and customer layout. Changes save immediately.
          </div>

          <div className="space-y-2">
            {sections.map(section => (
              <div
                key={section.id}
                className="bg-white border border-border p-4 flex items-center justify-between gap-4 transition-colors hover:border-gold/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-charcoal font-sans">{section.label}</p>
                  <p className="text-xs text-stone font-sans">{section.desc}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-xs font-sans ${section.published ? 'text-success font-medium' : 'text-stone'}`}>
                    {section.published ? 'Published' : 'Hidden'}
                  </span>
                  <Toggle
                    checked={section.published}
                    onChange={() => toggleSection(section.id)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (section.id === 'hero') setTab('Homepage Hero');
                      else if (section.id === 'faq') setTab('FAQ Management');
                      else setEditingSection(section);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 4: FAQ Management ─────────────────────────────────────────── */}
      {tab === 'FAQ Management' && (
        <div className="space-y-5 max-w-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg text-charcoal">Storefront FAQs</h3>
              <p className="text-xs text-stone font-sans">Answer customer questions regarding orders, sizing, delivery, and payments.</p>
            </div>
            <Button size="sm" onClick={openAddFaq}>
              + Add FAQ
            </Button>
          </div>

          <div className="space-y-3">
            {faqs.map(faq => (
              <div key={faq.id} className="bg-white border border-border p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm text-charcoal font-sans">{faq.q}</p>
                      {faq.pub ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="draft">Hidden</Badge>
                      )}
                    </div>
                    <p className="text-xs text-stone font-sans leading-relaxed mt-1">{faq.a}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Toggle
                      checked={faq.pub}
                      onChange={() => toggleFaqPublish(faq.id)}
                    />
                    <Button size="sm" variant="ghost" onClick={() => openEditFaq(faq)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteFaq(faq.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: Brand & Studio ────────────────────────────────────────── */}
      {tab === 'Brand & Studio' && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-white border border-border p-6 space-y-4">
            <div>
              <h3 className="font-serif text-lg text-charcoal">Brand Story & Studio Coordinates</h3>
              <p className="text-xs text-stone font-sans">Used across the About page, Contact page, and site footer.</p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                Brand Tagline
              </span>
              <input
                value={brandInfo.tagline}
                onChange={e => setBrandInfo(b => ({ ...b, tagline: e.target.value }))}
                className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                Brand Philosophy / Manifesto
              </span>
              <textarea
                rows={3}
                value={brandInfo.manifesto}
                onChange={e => setBrandInfo(b => ({ ...b, manifesto: e.target.value }))}
                className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans resize-none"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                Studio Address
              </span>
              <input
                value={brandInfo.address}
                onChange={e => setBrandInfo(b => ({ ...b, address: e.target.value }))}
                className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                  Support Email
                </span>
                <input
                  value={brandInfo.email}
                  onChange={e => setBrandInfo(b => ({ ...b, email: e.target.value }))}
                  className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                  Phone Number
                </span>
                <input
                  value={brandInfo.phone}
                  onChange={e => setBrandInfo(b => ({ ...b, phone: e.target.value }))}
                  className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                  WhatsApp Contact
                </span>
                <input
                  value={brandInfo.whatsapp}
                  onChange={e => setBrandInfo(b => ({ ...b, whatsapp: e.target.value }))}
                  className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                  Instagram Handle
                </span>
                <input
                  value={brandInfo.instagram}
                  onChange={e => setBrandInfo(b => ({ ...b, instagram: e.target.value }))}
                  className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end">
              <Button onClick={handleSaveBrandInfo} size="md">
                Save Brand Info
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: Change Hero Image ─────────────────────────────────────── */}
      <Modal open={imageModalOpen} onClose={() => setImageModalOpen(false)} title="Update Hero Banner Image" size="md">
        <div className="space-y-4">
          <p className="text-xs text-stone font-sans">
            Upload a high-resolution editorial portrait or landscape banner from your device via Cloudinary, or enter an image URL directly.
          </p>
          <ImageUploader
            images={hero.image ? [hero.image] : []}
            onChange={(imgs) => {
              if (imgs.length > 0) {
                setHero(h => ({ ...h, image: imgs[imgs.length - 1] }));
              }
            }}
            folder="raw-stitches/hero"
            maxFiles={1}
          />
          <div className="border-t border-border pt-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                Or Paste Direct Image URL
              </span>
              <input
                value={hero.image}
                onChange={e => setHero(h => ({ ...h, image: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="px-3 py-2 border border-border focus:border-gold focus:outline-none text-xs font-mono"
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button size="sm" onClick={() => setImageModalOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL: Add / Edit FAQ ────────────────────────────────────────── */}
      <Modal
        open={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
        title={editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
        size="md"
      >
        <div className="space-y-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
              Question
            </span>
            <input
              value={faqForm.q}
              onChange={e => setFaqForm(f => ({ ...f, q: e.target.value }))}
              placeholder="e.g. Do you ship outside Nigeria?"
              className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
              Answer
            </span>
            <textarea
              rows={4}
              value={faqForm.a}
              onChange={e => setFaqForm(f => ({ ...f, a: e.target.value }))}
              placeholder="Provide clear, concise guidance for the customer..."
              className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans resize-none"
            />
          </label>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-sm font-medium text-charcoal font-sans">Publish to Store</p>
              <p className="text-xs text-stone font-sans">Visible to customers when published</p>
            </div>
            <Toggle
              checked={faqForm.pub}
              onChange={() => setFaqForm(f => ({ ...f, pub: !f.pub }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setFaqModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveFaq}>
              {editingFaq ? 'Save Changes' : 'Create FAQ'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── MODAL: Edit Section Info ─────────────────────────────────────── */}
      <Modal
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        title={`Edit Section: ${editingSection?.label || ''}`}
        size="md"
      >
        {editingSection && (
          <div className="space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                Section Label
              </span>
              <input
                value={editingSection.label}
                onChange={e => setEditingSection({ ...editingSection, label: e.target.value })}
                className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">
                Description / Purpose
              </span>
              <textarea
                rows={3}
                value={editingSection.desc}
                onChange={e => setEditingSection({ ...editingSection, desc: e.target.value })}
                className="px-4 py-2.5 border border-border focus:border-gold focus:outline-none text-sm font-sans resize-none"
              />
            </label>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div>
                <p className="text-sm font-medium text-charcoal font-sans">Section Status</p>
                <p className="text-xs text-stone font-sans">Toggle visibility on storefront</p>
              </div>
              <Toggle
                checked={editingSection.published}
                onChange={() => setEditingSection({ ...editingSection, published: !editingSection.published })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveSectionEdit}>
                Save Section
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
