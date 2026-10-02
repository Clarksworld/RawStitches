import { useState } from 'react';
import { CATEGORIES, COLLECTIONS } from '../data';
import { Button, Badge, Tabs, Modal, Input, Textarea, Toggle } from '../components/ui';

export default function AdminCatalog() {
  const [tab, setTab] = useState('Categories');
  const [catModal, setCatModal] = useState(false);
  const [colModal, setColModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', slug: '', enabled: true });
  const [colForm, setColForm] = useState({ name: '', description: '', publishDate: '', status: 'draft' });

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
          <p className="text-xs text-stone font-sans">Manage the product categories shown on your store. Drag to reorder (placeholder).</p>
          <div className="bg-white border border-border overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-border bg-ivory/50">
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium w-12">Order</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Category</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Products</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {CATEGORIES.map((cat, i) => (
                  <tr key={cat.id} className="hover:bg-ivory/40">
                    <td className="px-4 py-3 text-stone text-center cursor-grab">⠿</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={cat.image} alt={cat.name} className="w-10 h-8 object-cover bg-ivory-dark" />
                        <div>
                          <p className="font-medium text-charcoal">{cat.name}</p>
                          <p className="text-xs text-stone">/shop?category={cat.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone">{cat.count}</td>
                    <td className="px-4 py-3"><Badge variant={cat.enabled ? 'active' : 'warning'}>{cat.enabled ? 'Enabled' : 'Disabled'}</Badge></td>
                    <td className="px-4 py-3 flex gap-2">
                      <button className="text-xs text-gold hover:underline">Edit</button>
                      <button className="text-xs text-stone hover:text-charcoal">{cat.enabled ? 'Disable' : 'Enable'}</button>
                      <button className="text-xs text-error hover:underline">Delete</button>
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
          <p className="text-xs text-stone font-sans">Manage fashion collections. Collections group products and appear on the homepage and shop page.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {COLLECTIONS.map(col => (
              <div key={col.id} className="bg-white border border-border overflow-hidden">
                <div className="relative h-32 bg-charcoal overflow-hidden">
                  <img src={col.image} alt={col.name} className="w-full h-full object-cover opacity-70" />
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
                      <button className="text-xs text-error hover:underline">Delete</button>
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
          <div>
            <label className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans block mb-2">Category Image</label>
            <div className="border-2 border-dashed border-border h-24 flex items-center justify-center cursor-pointer hover:border-gold transition-colors">
              <span className="text-xs text-stone font-sans">Upload image</span>
            </div>
          </div>
          <Toggle checked={catForm.enabled} onChange={v => setCatForm(f => ({ ...f, enabled: v }))} label="Enabled on store" />
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => setCatModal(false)}>Save Category</Button>
            <Button variant="ghost" onClick={() => setCatModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Collection Modal */}
      <Modal open={colModal} onClose={() => setColModal(false)} title="Add Collection" size="md">
        <div className="space-y-4">
          <Input label="Collection Name" value={colForm.name} onChange={e => setColForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Summer Edit" />
          <Textarea label="Description" value={colForm.description} onChange={e => setColForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe this collection..." />
          <div>
            <label className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans block mb-2">Cover Image</label>
            <div className="border-2 border-dashed border-border h-28 flex items-center justify-center cursor-pointer hover:border-gold transition-colors">
              <span className="text-xs text-stone font-sans">Upload cover image</span>
            </div>
          </div>
          <Input label="Publish Date" type="date" value={colForm.publishDate} onChange={e => setColForm(f => ({ ...f, publishDate: e.target.value }))} />
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => setColModal(false)}>Save Collection</Button>
            <Button variant="ghost" onClick={() => setColModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
