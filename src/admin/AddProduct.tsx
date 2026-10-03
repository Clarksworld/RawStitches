'use client';

import { useState } from 'react';
import { Link, useNavigate, useParams } from '../components/router-adapter';
import { PRODUCTS, CATEGORIES, COLLECTIONS } from '../data';
import { Button, Input, Select, Textarea, Toggle, Badge } from '../components/ui';

export default function AddProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const existing = id ? PRODUCTS.find(p => p.id === id) : null;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    sku: existing?.sku ?? '',
    description: existing?.description ?? '',
    category: existing?.category ?? '',
    collection: existing?.collection ?? '',
    price: String(existing?.price ?? ''),
    salePrice: String(existing?.salePrice ?? ''),
    costPrice: '',
    stock: String(existing?.stock ?? ''),
    lowStockThreshold: String(existing?.lowStockThreshold ?? '5'),
    trackInventory: true,
    isFeatured: existing?.isFeatured ?? false,
    isBestSeller: existing?.isBestSeller ?? false,
    isNewArrival: existing?.isNewArrival ?? false,
    published: true,
    seoTitle: existing?.name ?? '',
    metaDescription: existing?.description.slice(0, 160) ?? '',
    slug: existing?.slug ?? '',
  });

  const [variants] = useState([
    { color: 'Black', size: 'S', stock: 4 },
    { color: 'Black', size: 'M', stock: 8 },
    { color: 'Black', size: 'L', stock: 5 },
    { color: 'Ivory', size: 'S', stock: 2 },
    { color: 'Ivory', size: 'M', stock: 6 },
  ]);

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSave(publish: boolean) {
    navigate('/admin/products');
  }

  return (
    <div className="space-y-6 max-w-screen-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/products" className="text-xs text-stone hover:text-gold font-sans mb-1 inline-block">← Products</Link>
          <h1 className="font-serif text-2xl text-charcoal">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          {isEdit && <p className="text-xs text-stone font-sans mt-0.5">Last updated: 28 Nov 2024 · Created: 1 Nov 2024 · {existing?.reviewCount} sales</p>}
        </div>
        {isEdit && (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">Duplicate</Button>
            <Button variant="ghost" size="sm">Archive</Button>
            <Button variant="danger" size="sm">Delete</Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main form */}
        <div className="space-y-6">
          {/* Basic info */}
          <div className="bg-white border border-border p-5 space-y-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Basic Information</h3>
            <Input label="Product Name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. The Onyinye Wrap Dress" />
            <Input label="SKU" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. RS-DR-001" />
            <Textarea label="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder="Describe the product..." />
          </div>

          {/* Images */}
          <div className="bg-white border border-border p-5">
            <h3 className="font-sans font-medium text-sm text-charcoal mb-4">Product Images</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
              {existing?.images.map((img, i) => (
                <div key={i} className="relative group aspect-[3/4] bg-ivory-dark overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="text-white text-xs bg-black/60 px-2 py-1">Primary</button>
                    <button className="text-error text-xs">✕</button>
                  </div>
                  {i === 0 && <span className="absolute top-1 left-1 bg-gold text-black text-[10px] px-1.5 py-0.5 font-medium">Primary</span>}
                </div>
              ))}
              <div className="aspect-[3/4] border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-gold transition-colors">
                <svg className="w-6 h-6 text-stone mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                <span className="text-xs text-stone font-sans">Add Image</span>
              </div>
            </div>
            <p className="text-xs text-stone font-sans">Drag to reorder. First image is the primary. Recommended: 800×1000px (4:5 ratio)</p>
          </div>

          {/* Pricing */}
          <div className="bg-white border border-border p-5 space-y-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Pricing</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Price (₦)" type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
              <Input label="Sale Price (₦)" type="number" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} placeholder="0.00" />
              <Input label="Cost Price (₦)" type="number" value={form.costPrice} onChange={e => set('costPrice', e.target.value)} placeholder="0.00" />
            </div>
            {form.salePrice && Number(form.salePrice) > 0 && Number(form.price) > 0 && (
              <div className="text-xs text-stone font-sans bg-ivory p-2">
                Discount: {Math.round((1 - Number(form.salePrice) / Number(form.price)) * 100)}% off
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="bg-white border border-border p-5 space-y-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Inventory</h3>
            <Toggle checked={form.trackInventory} onChange={v => set('trackInventory', v)} label="Track inventory for this product" />
            {form.trackInventory && (
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Stock Quantity" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} />
                <Input label="Low Stock Threshold" type="number" value={form.lowStockThreshold} onChange={e => set('lowStockThreshold', e.target.value)} />
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans font-medium text-sm text-charcoal">Variants</h3>
              <Button variant="ghost" size="sm">+ Add Variant</Button>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-4 gap-2 text-xs uppercase tracking-widest text-stone font-medium font-sans px-3 py-2 bg-ivory">
                <span>Color</span><span>Size</span><span>Stock</span><span>Actions</span>
              </div>
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center px-3 py-2 border border-border text-sm font-sans hover:bg-ivory/50">
                  <span className="text-charcoal">{v.color}</span>
                  <span className="text-charcoal">{v.size}</span>
                  <input type="number" defaultValue={v.stock} className="w-16 px-2 py-1 border border-border text-xs focus:border-gold focus:outline-none" />
                  <button className="text-error text-xs hover:underline text-left">Remove</button>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white border border-border p-5 space-y-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">SEO</h3>
            <Input label="SEO Title" value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} />
            <Textarea label="Meta Description" value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} rows={3} />
            <Input label="URL Slug" value={form.slug} onChange={e => set('slug', e.target.value)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Organisation */}
          <div className="bg-white border border-border p-4 space-y-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Organisation</h3>
            <Select
              label="Category"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              options={[{ value: '', label: 'Select category...' }, ...CATEGORIES.map(c => ({ value: c.name, label: c.name }))]}
            />
            <Select
              label="Collection"
              value={form.collection}
              onChange={e => set('collection', e.target.value)}
              options={[{ value: '', label: 'Select collection...' }, ...COLLECTIONS.map(c => ({ value: c.name, label: c.name }))]}
            />
          </div>

          {/* Product tags */}
          <div className="bg-white border border-border p-4 space-y-3">
            <h3 className="font-sans font-medium text-sm text-charcoal">Product Labels</h3>
            <div className="space-y-2.5">
              <Toggle checked={form.isFeatured} onChange={v => set('isFeatured', v)} label="Featured" />
              <Toggle checked={form.isBestSeller} onChange={v => set('isBestSeller', v)} label="Best Seller" />
              <Toggle checked={form.isNewArrival} onChange={v => set('isNewArrival', v)} label="New Arrival" />
            </div>
          </div>

          {/* Publish */}
          <div className="bg-white border border-border p-4 space-y-3">
            <h3 className="font-sans font-medium text-sm text-charcoal">Visibility</h3>
            <Toggle checked={form.published} onChange={v => set('published', v)} label="Published (visible on store)" />
            <div className="pt-2 space-y-2">
              <Button className="w-full" onClick={() => handleSave(true)}>Publish Product</Button>
              <Button variant="ghost" className="w-full" onClick={() => handleSave(false)}>Save as Draft</Button>
            </div>
          </div>

          {isEdit && existing && (
            <div className="bg-white border border-border p-4 space-y-3">
              <h3 className="font-sans font-medium text-sm text-charcoal">Product Stats</h3>
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between"><span className="text-stone">Total Sales</span><span className="text-charcoal">{existing.reviewCount}</span></div>
                <div className="flex justify-between"><span className="text-stone">Current Stock</span><span className={existing.stock === 0 ? 'text-error' : existing.stock <= existing.lowStockThreshold ? 'text-warning' : 'text-success'}>{existing.stock}</span></div>
                <div className="flex justify-between"><span className="text-stone">Rating</span><span className="text-charcoal">{existing.rating} / 5</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
