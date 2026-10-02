import { useState } from 'react';
import { Button, Toggle, Tabs } from '../components/ui';

const SECTIONS = [
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

const FAQS = [
  { id: 'f1', q: 'How do I place an order?', a: 'Browse our collection, select your size and colour, and add to bag. Proceed to checkout and enter your details.', pub: true },
  { id: 'f2', q: 'What payment methods do you accept?', a: 'We accept card payments (Visa, Mastercard, Verve), bank transfer, and USSD.', pub: true },
  { id: 'f3', q: 'How long does delivery take?', a: 'Delivery times vary by location. We will update this when delivery zones are configured.', pub: false },
];

export default function AdminContent() {
  const [tab, setTab] = useState('Sections');
  const [editing, setEditing] = useState<string | null>(null);
  const [heroHeadline, setHeroHeadline] = useState('Made for the Woman Who Stands Out');
  const [heroSub, setHeroSub] = useState('Unique, elegant and beautifully crafted women\'s clothing made in Nigeria.');

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-charcoal">Content Management</h1>
      <p className="text-sm text-stone font-sans">Manage the content on your customer-facing website without editing code.</p>

      <Tabs tabs={['Sections', 'Homepage Hero', 'FAQ']} active={tab} onChange={setTab} />

      {tab === 'Sections' && (
        <div className="space-y-2">
          {SECTIONS.map(section => (
            <div key={section.id} className="bg-white border border-border p-4 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-charcoal font-sans">{section.label}</p>
                <p className="text-xs text-stone font-sans">{section.desc}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-xs font-sans ${section.published ? 'text-success' : 'text-stone'}`}>
                  {section.published ? 'Published' : 'Hidden'}
                </span>
                <Toggle checked={section.published} onChange={() => {}} />
                <Button size="sm" variant="ghost" onClick={() => setEditing(section.id)}>Edit</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Homepage Hero' && (
        <div className="space-y-5 max-w-2xl">
          <div className="bg-white border border-border p-5 space-y-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Hero Image</h3>
            <div className="relative h-40 bg-ivory-dark border border-border overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=400&fit=crop&auto=format&q=60"
                alt="Current hero"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="sm">Change Image</Button>
              </div>
            </div>
          </div>
          <div className="bg-white border border-border p-5 space-y-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Hero Text</h3>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Headline</span>
              <input value={heroHeadline} onChange={e => setHeroHeadline(e.target.value)} className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Supporting Text</span>
              <textarea value={heroSub} onChange={e => setHeroSub(e.target.value)} rows={3} className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans resize-none" />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Primary CTA</span>
                <input defaultValue="Shop the Collection" className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Secondary CTA</span>
                <input defaultValue="Explore New Arrivals" className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans" />
              </label>
            </div>
            <Button>Save Hero</Button>
          </div>
        </div>
      )}

      {tab === 'FAQ' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm">+ Add FAQ</Button>
          </div>
          {FAQS.map(faq => (
            <div key={faq.id} className="bg-white border border-border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm text-charcoal font-sans">{faq.q}</p>
                  <p className="text-xs text-stone font-sans mt-1 leading-relaxed">{faq.a}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Toggle checked={faq.pub} onChange={() => {}} />
                  <Button size="sm" variant="ghost">Edit</Button>
                  <Button size="sm" variant="danger">Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
