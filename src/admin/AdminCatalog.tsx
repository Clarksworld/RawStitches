'use client';

import { useState, useEffect } from 'react';
import { CATEGORIES, COLLECTIONS } from '../data';
import type { Category } from '../db/schema';
import type { Collection } from '../db/schema';
import { Button, Badge, Tabs, Modal, Input, Textarea, Toggle } from '../components/ui';

export default function AdminCatalog() {
  const [tab, setTab] = useState('Categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [catModal, setCatModal] = useState(false);
  const [colModal, setColModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', enabled: true });
  const [colForm, setColForm] = useState({ name: '', description: '', publishDate: '', status: 'draft' });

  useEffect(() => {
    async function load() {
      try {
        const [catRes, colRes] = await Promise.all([
          fetch('/api/catalog?type=categories'),
          fetch('/api/catalog?type=collections'),
        ]);
        const [catData, colData] = await Promise.all([catRes.json(), colRes.json()]);
        setCategories(catData.categories ?? CATEGORIES);
        setCollections(colData.collections ?? COLLECTIONS);
      } catch {
        setCategories(CATEGORIES);
        setCollections(COLLECTIONS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveCategory() {
    if (!catForm.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/catalog?type=categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catForm),
      });
      const data = await res.json();
      if (data.category) {
        setCategories(prev => [...prev, data.category]);
      } else {
        const newCat: Category = {
          id: `cat_${Date.now()}`,
          name: catForm.name,
          slug: catForm.slug || catForm.name.toLowerCase().replace(/\s+/g, '-'),
          image: '',
          count: 0,
          enabled: catForm.enabled,
        };
        setCategories(prev => [...prev, newCat]);
      }
      setCatForm({ name: '', slug: '', enabled: true });
      setCatModal(false);
    } catch (err) {
      console.error('Failed to create category:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleCategory(cat: Category) {
    const updated = !cat.enabled;
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, enabled: updated } : c));
    try {
      await fetch('/api/catalog?type=categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, enabled: updated }),
      });
    } catch (err) {
      console.error('Failed to toggle category:', err);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`/api/catalog?type=categories&id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  }

  async function handleSaveCollection() {
    if (!colForm.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/catalog?type=collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colForm),
      });
      const data = await res.json();
      if (data.collection) {
        setCollections(prev => [...prev, data.collection]);
      } else {
        const newCol: Collection = {
          id: `col_${Date.now()}`,
          name: colForm.name,
          description: colForm.description,
          image: '',
          publishDate: colForm.publishDate || new Date().toISOString().split('T')[0],
          status: colForm.status,
        };
        setCollections(prev => [...prev, newCol]);
      }
      setColForm({ name: '', description: '', publishDate: '', status: 'draft' });
      setColModal(false);
    } catch (err) {
      console.error('Failed to create collection:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCollection(id: string) {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    setCollections(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`/api/catalog?type=collections&id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete collection:', err);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-ivory-dark w-48 rounded" />
        <div className="h-64 bg-ivory-dark rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-charcoal">Catalog</h1>
        <Button onClick={() => tab === 'Categories' ? setCatModal(true) : setColModal(true)}>
          + Add {tab === 'Categories' ? 'Category' : 'Collection'}
        </Button>
      </div>

      <Tabs tabs={['Categories', 'Collections']} active={tab} onChange={setTab} />

      {tab === 'Categories' && (
        <div className="space-y-3">
          <p className="text-xs text-stone font-sans">{categories.length} categories · Manage the product categories shown on your store.</p>
          <div className="bg-white border border-border overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-border bg-ivory/50">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Products</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-ivory/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {cat.image && <img src={cat.image} alt={cat.name} className="w-10 h-8 object-cover bg-ivory-dark" />}
                        <div>
                          <p className="font-medium text-charcoal">{cat.name}</p>
                          <p className="text-xs text-stone">/shop?category={cat.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone">{cat.count}</td>
                    <td className="px-4 py-3"><Badge variant={cat.enabled ? 'active' : 'warning'}>{cat.enabled ? 'Enabled' : 'Disabled'}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="text-xs text-gold hover:underline">Edit</button>
                        <button
                          className="text-xs text-stone hover:text-charcoal"
                          onClick={() => handleToggleCategory(cat)}
                        >
                          {cat.enabled ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className="text-xs text-error hover:underline"
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Collections' && (
        <div className="space-y-3">
          <p className="text-xs text-stone font-sans">{collections.length} collections · Groups of products featured on the homepage and shop.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {collections.map(col => (
              <div key={col.id} className="bg-white border border-border overflow-hidden">
                <div className="relative h-32 bg-charcoal overflow-hidden">
                  {col.image && <img src={col.image} alt={col.name} className="w-full h-full object-cover opacity-70" />}
                  {!col.image && <div className="w-full h-full bg-charcoal/20" />}
                  <div className="absolute top-2 right-2">
                    <Badge variant={col.status as any}>{col.status}</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-lg text-charcoal">{col.name}</h3>
                  <p className="text-xs text-stone font-sans mt-1 mb-3">{col.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-stone font-sans">Publish: {col.publishDate}</p>
                    <div className="flex gap-2">
                      <button className="text-xs text-gold hover:underline">Edit</button>
                      <button
                        className="text-xs text-error hover:underline"
                        onClick={() => handleDeleteCollection(col.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title="Add Category" size="sm">
        <div className="space-y-4">
          <Input label="Category Name" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dresses" />
          <Input label="URL Slug" value={catForm.slug} onChange={e => setCatForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. dresses" />
          <Toggle checked={catForm.enabled} onChange={v => setCatForm(f => ({ ...f, enabled: v }))} label="Enabled on store" />
          <div className="flex gap-3">
            <Button className="flex-1" loading={saving} onClick={handleSaveCategory}>Save Category</Button>
            <Button variant="ghost" onClick={() => setCatModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Collection Modal */}
      <Modal open={colModal} onClose={() => setColModal(false)} title="Add Collection" size="md">
        <div className="space-y-4">
          <Input label="Collection Name" value={colForm.name} onChange={e => setColForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Summer Edit" />
          <Textarea label="Description" value={colForm.description} onChange={e => setColForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe this collection..." />
          <Input label="Publish Date" type="date" value={colForm.publishDate} onChange={e => setColForm(f => ({ ...f, publishDate: e.target.value }))} />
          <div className="flex gap-3">
            <Button className="flex-1" loading={saving} onClick={handleSaveCollection}>Save Collection</Button>
            <Button variant="ghost" onClick={() => setColModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
