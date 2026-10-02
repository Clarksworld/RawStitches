import { useState } from 'react';
import { PRODUCTS, formatPrice, type Product } from '../data';
import { SearchInput, Badge, Button, Modal, Input, Select, StatsCard } from '../components/ui';

export default function AdminInventory() {
  const [search, setSearch] = useState('');
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('restock');
  const [adjustNote, setAdjustNote] = useState('');

  const filtered = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = PRODUCTS.reduce((s, p) => s + p.price * p.stock, 0);
  const lowStock = PRODUCTS.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
  const outOfStock = PRODUCTS.filter(p => p.stock === 0);

  const stockBadge = (p: Product) => {
    if (p.stock === 0) return <Badge variant="error">Out of Stock</Badge>;
    if (p.stock <= p.lowStockThreshold) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-charcoal">Inventory</h1>
        <Button variant="ghost" size="sm">Export CSV</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Products" value={String(PRODUCTS.length)} />
        <StatsCard label="Low Stock" value={String(lowStock.length)} sub="Need restocking" />
        <StatsCard label="Out of Stock" value={String(outOfStock.length)} />
        <StatsCard label="Inventory Value" value={formatPrice(totalValue)} />
      </div>

      {/* Filter/Search */}
      <div className="bg-white border border-border p-4 flex gap-3 flex-wrap items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products..." className="w-64" />
        <select className="text-sm border border-border px-3 py-2.5 focus:border-gold focus:outline-none font-sans bg-white">
          <option>All Status</option>
          <option>In Stock</option>
          <option>Low Stock</option>
          <option>Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm font-sans min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-ivory/50">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Product</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">SKU</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Stock</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Threshold</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Status</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(p => (
              <tr key={p.id} className={`hover:bg-ivory/40 transition-colors ${p.stock === 0 ? 'bg-error/5' : p.stock <= p.lowStockThreshold ? 'bg-warning/5' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="w-8 h-10 object-cover bg-ivory-dark shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal">{p.name}</p>
                      <p className="text-xs text-stone">{p.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3">
                  <span className={`font-medium text-lg font-serif ${p.stock === 0 ? 'text-error' : p.stock <= p.lowStockThreshold ? 'text-warning' : 'text-charcoal'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone">{p.lowStockThreshold}</td>
                <td className="px-4 py-3">{stockBadge(p)}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="ghost" onClick={() => { setAdjustProduct(p); setAdjustQty(''); setAdjustNote(''); }}>
                    Adjust Stock
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Adjustment Modal */}
      <Modal open={!!adjustProduct} onClose={() => setAdjustProduct(null)} title="Adjust Stock" size="sm">
        {adjustProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <img src={adjustProduct.images[0]} alt="" className="w-10 h-12 object-cover bg-ivory-dark" />
              <div>
                <p className="font-medium text-sm text-charcoal">{adjustProduct.name}</p>
                <p className="text-xs text-stone">Current stock: <span className="font-medium text-charcoal">{adjustProduct.stock}</span></p>
              </div>
            </div>
            <Select
              label="Reason"
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              options={[
                { value: 'restock', label: 'Restock / Add inventory' },
                { value: 'remove', label: 'Remove / Damage / Loss' },
                { value: 'correction', label: 'Stock count correction' },
                { value: 'other', label: 'Other' },
              ]}
            />
            <Input
              label="Quantity Adjustment"
              type="number"
              value={adjustQty}
              onChange={e => setAdjustQty(e.target.value)}
              placeholder={adjustReason === 'remove' ? '-5' : '+10'}
              hint={adjustQty ? `New stock: ${adjustProduct.stock + Number(adjustQty)}` : undefined}
            />
            <Input label="Note (optional)" value={adjustNote} onChange={e => setAdjustNote(e.target.value)} placeholder="Add a note about this adjustment..." />
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={() => setAdjustProduct(null)}>Save Adjustment</Button>
              <Button variant="ghost" onClick={() => setAdjustProduct(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
