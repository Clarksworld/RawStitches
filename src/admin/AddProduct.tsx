'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from '../components/router-adapter';
import { CATEGORIES, COLLECTIONS } from '../data';
import { Button, Input, Select, Textarea, Toggle } from '../components/ui';
import ImageUploader from '../components/ImageUploader';

export default function AddProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    collection: '',
    price: '',
    salePrice: '',
    costPrice: '',
    stock: '',
    lowStockThreshold: '5',
    trackInventory: true,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    published: true,
    seoTitle: '',
    metaDescription: '',
    slug: '',
    colors: 'Black',
    sizes: 'S, M, L',
  });

  const loadProduct = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/products/${id}`);
      if (res.ok) {
        const data = await res.json();
        const p = data.product;
        setImages(p.images || []);
        setForm({
          name: p.name ?? '',
          sku: p.sku ?? '',
          description: p.description ?? '',
          category: p.category ?? '',
          collection: p.collection ?? '',
          price: String(p.price ?? ''),
          salePrice: String(p.salePrice ?? ''),
          costPrice: '',
          stock: String(p.stock ?? ''),
          lowStockThreshold: String(p.lowStockThreshold ?? '5'),
          trackInventory: true,
          isFeatured: p.isFeatured ?? false,
          isBestSeller: p.isBestSeller ?? false,
          isNewArrival: p.isNewArrival ?? false,
          published: true,
          seoTitle: p.name ?? '',
          metaDescription: (p.description ?? '').slice(0, 160),
          slug: p.slug ?? '',
          colors: (p.colors || ['Black']).join(', '),
          sizes: (p.sizes || ['S', 'M', 'L']).join(', '),
        });
      }
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [isEdit, loadProduct]);

  function set(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) { alert('Please enter a product name'); return; }
    if (!form.price || Number(form.price) <= 0) { alert('Please enter a valid price'); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        images,
        price: Number(form.price),
        salePrice: form.salePrice && Number(form.salePrice) > 0 ? Number(form.salePrice) : null,
        stock: Number(form.stock) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
        colors: form.colors.split(',').map(s => s.trim()).filter(Boolean),
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colorHex: {},
        details: [],
        care: [],
      };

      const res = await fetch(isEdit ? `/api/products/${id}` : '/api/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save product');
      navigate('/admin/products');
    } catch (err: any) {
      console.error('Save product error:', err);
      alert(err?.message || 'Error saving product');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse max-w-screen-lg">
        <div className="h-8 bg-ivory-dark w-64 rounded" />
        <div className="h-48 bg-ivory-dark rounded" />
        <div className="h-32 bg-ivory-dark rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-screen-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/products" className="text-xs text-stone hover:text-gold font-sans mb-1 inline-block">← Products</Link>
          <h1 className="font-serif text-2xl text-charcoal">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
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

          {/* Cloudinary Images */}
          <div className="bg-white border border-border p-5">
            <h3 className="font-sans font-medium text-sm text-charcoal mb-1">Product Images (Cloudinary)</h3>
            <p className="text-xs text-stone font-sans mb-4">Upload photos directly to Cloudinary CDN. The first image will be the main cover photo.</p>
            <ImageUploader images={images} onChange={setImages} folder="raw-stitches/products" />
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

          {/* Variants */}
          <div className="bg-white border border-border p-5 space-y-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Variants</h3>
            <Input
              label="Available Colors"
              value={form.colors}
              onChange={e => set('colors', e.target.value)}
              placeholder="e.g. Black, White, Ivory"
              hint="Comma-separated list"
            />
            <Input
              label="Available Sizes"
              value={form.sizes}
              onChange={e => set('sizes', e.target.value)}
              placeholder="e.g. XS, S, M, L, XL"
              hint="Comma-separated list"
            />
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

          {/* Product labels */}
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
              <Button className="w-full" loading={saving} onClick={handleSave}>
                {isEdit ? 'Save Changes' : 'Publish Product'}
              </Button>
              <Button variant="ghost" className="w-full" disabled={saving} onClick={() => navigate('/admin/products')}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
