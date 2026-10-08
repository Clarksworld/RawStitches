'use client';

import { useState, useEffect } from 'react';
import { Link } from '../components/router-adapter';
import { PRODUCTS, formatPrice, type Product } from '../data';
import { SearchInput, Badge, Button, ConfirmDialog, Pagination } from '../components/ui';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const PER_PAGE = 8;

  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load admin products:', err);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/products?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: 'DELETE',
      });
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
    } catch (err) {
      console.error('Failed to delete product:', err);
    } finally {
      setDeleteTarget(null);
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSelect(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleAll() {
    setSelected(prev => prev.length === paged.length ? [] : paged.map(p => p.id));
  }

  const [bulkLoading, setBulkLoading] = useState(false);

  async function handleBulkAction(action: 'publish' | 'unpublish' | 'archive' | 'delete') {
    if (selected.length === 0) return;
    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete ${selected.length} selected product(s)? This cannot be undone.`)) return;
      setBulkLoading(true);
      try {
        await Promise.all(selected.map(id => fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' })));
        setProducts(prev => prev.filter(p => !selected.includes(p.id)));
        setSelected([]);
      } catch (err) {
        console.error('Failed to bulk delete products:', err);
      } finally {
        setBulkLoading(false);
      }
      return;
    }

    setBulkLoading(true);
    try {
      await Promise.all(
        selected.map(id => {
          const patchBody =
            action === 'publish' ? { isFeatured: true } :
            action === 'unpublish' ? { isFeatured: false } :
            { stock: 0 };
          return fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchBody),
          });
        })
      );
      await loadProducts();
      setSelected([]);
    } catch (err) {
      console.error('Bulk action error:', err);
    } finally {
      setBulkLoading(false);
    }
  }

  const stockBadge = (p: Product) => {
    if (p.stock === 0) return <Badge variant="error">Out of Stock</Badge>;
    if (p.stock <= p.lowStockThreshold) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-charcoal">Products</h1>
        <Link to="/admin/products/new"><Button>+ Add Product</Button></Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-border p-4 flex flex-wrap items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products, SKU..." className="w-64" />
        {selected.length > 0 && (
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <span className="text-xs text-stone font-sans">{selected.length} selected</span>
            <Button variant="ghost" size="sm" disabled={bulkLoading} onClick={() => handleBulkAction('publish')}>
              Publish
            </Button>
            <Button variant="ghost" size="sm" disabled={bulkLoading} onClick={() => handleBulkAction('unpublish')}>
              Unpublish
            </Button>
            <Button variant="ghost" size="sm" disabled={bulkLoading} onClick={() => handleBulkAction('archive')}>
              Archive
            </Button>
            <Button variant="danger" size="sm" disabled={bulkLoading} onClick={() => handleBulkAction('delete')}>
              Delete
            </Button>
          </div>
        )}
        <span className="text-xs text-stone font-sans ml-auto">{filtered.length} products</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm font-sans min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-ivory/50">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={selected.length === paged.length && paged.length > 0} onChange={toggleAll} className="accent-gold" />
              </th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Product</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Category</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Price</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Stock</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Status</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paged.map(p => (
              <tr key={p.id} className="hover:bg-ivory/40 transition-colors">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="accent-gold" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images[0]} alt={p.name} className="w-10 h-12 object-cover bg-ivory-dark shrink-0" />
                    <div>
                      <p className="font-medium text-charcoal leading-snug">{p.name}</p>
                      <p className="text-xs text-stone">{p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone">{p.category}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className={p.salePrice ? 'text-gold font-medium' : 'text-charcoal'}>{formatPrice(p.salePrice ?? p.price)}</p>
                    {p.salePrice && <p className="text-xs text-stone line-through">{formatPrice(p.price)}</p>}
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal">{p.stock}</td>
                <td className="px-4 py-3">{stockBadge(p)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/products/${p.id}/edit`} className="text-xs text-gold hover:underline">Edit</Link>
                    <span className="text-border">·</span>
                    <button className="text-xs text-stone hover:text-charcoal">Duplicate</button>
                    <span className="text-border">·</span>
                    <button onClick={() => setDeleteTarget(p)} className="text-xs text-error hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-serif text-lg text-stone">No products found</p>
            <p className="text-xs text-stone/60 font-sans mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-stone font-sans">Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</p>
        <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Product"
      />
    </div>
  );
}
