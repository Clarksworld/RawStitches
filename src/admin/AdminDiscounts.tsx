'use client';

import { useState, useEffect } from 'react';
import { Button, Badge, Modal, Input, Select } from '../components/ui';
import { formatPrice } from '../data';

type Discount = {
  id: string;
  code: string;
  type: string;
  value: number;
  minOrder: number;
  maxUses: number | null;
  uses: number;
  startDate: string | null;
  endDate: string | null;
  status: string;
};

const emptyForm = {
  code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', startDate: '', endDate: '',
};

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Discount | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDiscounts();
  }, []);

  async function loadDiscounts() {
    try {
      const res = await fetch('/api/discounts');
      const data = await res.json();
      setDiscounts(Array.isArray(data.discounts) ? data.discounts : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditItem(null);
    setForm(emptyForm);
    setError('');
    setOpen(true);
  }

  function openEdit(d: Discount) {
    setEditItem(d);
    setForm({
      code: d.code,
      type: d.type,
      value: String(d.value),
      minOrder: String(d.minOrder),
      maxUses: d.maxUses != null ? String(d.maxUses) : '',
      startDate: d.startDate || '',
      endDate: d.endDate || '',
    });
    setError('');
    setOpen(true);
  }

  async function handleSave() {
    if (!form.code.trim()) { setError('Code is required'); return; }
    if (!form.value) { setError('Value is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...(editItem ? { id: editItem.id } : {}),
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder) || 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      const method = editItem ? 'PATCH' : 'POST';
      const res = await fetch('/api/discounts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); return; }
      await loadDiscounts();
      setOpen(false);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/discounts?id=${id}`, { method: 'DELETE' });
      setDiscounts(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteId(null);
    }
  }

  const statusBadge = (s: string) =>
    s === 'active' ? <Badge variant="active">Active</Badge>
    : s === 'scheduled' ? <Badge variant="scheduled">Scheduled</Badge>
    : <Badge variant="warning">Expired</Badge>;

  const stats = {
    active: discounts.filter(d => d.status === 'active').length,
    scheduled: discounts.filter(d => d.status === 'scheduled').length,
    expired: discounts.filter(d => d.status === 'expired').length,
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-ivory-dark w-48 rounded" />
        <div className="h-48 bg-ivory-dark rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">Discounts & Promo Codes</h1>
          <p className="text-xs text-stone font-sans mt-0.5">{discounts.length} codes in system</p>
        </div>
        <Button onClick={openCreate}>+ Create Discount</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Codes', value: stats.active, color: 'text-emerald-600' },
          { label: 'Scheduled', value: stats.scheduled, color: 'text-gold' },
          { label: 'Expired', value: stats.expired, color: 'text-stone' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-border p-4 text-center">
            <p className={`font-serif text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone font-sans mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-border overflow-x-auto shadow-xs">
        <table className="w-full text-sm font-sans min-w-[760px]">
          <thead>
            <tr className="border-b border-border bg-ivory/50">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Code</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Discount</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Min. Order</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Uses</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Period</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Status</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {discounts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-stone font-sans text-sm">
                  No discount codes yet. Create your first one →
                </td>
              </tr>
            )}
            {discounts.map(code => (
              <tr key={code.id} className="hover:bg-ivory/40 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-charcoal tracking-wider">{code.code}</td>
                <td className="px-4 py-3 text-charcoal font-medium">
                  {code.type === 'percentage' ? `${code.value}% off` : `${formatPrice(code.value)} off`}
                </td>
                <td className="px-4 py-3 text-stone">
                  {code.minOrder > 0 ? formatPrice(code.minOrder) : 'No minimum'}
                </td>
                <td className="px-4 py-3 text-charcoal">
                  {code.uses} / {code.maxUses ?? '∞'}
                </td>
                <td className="px-4 py-3 text-stone text-xs">
                  {code.startDate || '—'} → {code.endDate || '—'}
                </td>
                <td className="px-4 py-3">{statusBadge(code.status)}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => openEdit(code)}
                    className="text-xs text-gold hover:underline font-medium"
                  >
                    Edit
                  </button>
                  {deleteId === code.id ? (
                    <>
                      <button onClick={() => handleDelete(code.id)} className="text-xs text-error hover:underline font-medium">Confirm</button>
                      <button onClick={() => setDeleteId(null)} className="text-xs text-stone hover:underline">Cancel</button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteId(code.id)} className="text-xs text-error/70 hover:text-error hover:underline">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Info on how checkout uses codes */}
      <div className="bg-ivory border border-border p-4 text-xs text-stone font-sans space-y-1">
        <p className="font-medium text-charcoal">ℹ️ How promo codes work at checkout:</p>
        <ul className="list-disc list-inside space-y-0.5 mt-1">
          <li>Codes are validated live against this database — no hardcoding needed</li>
          <li>Expired codes and over-limit codes are automatically rejected</li>
          <li>Minimum order requirements are enforced at the time of application</li>
        </ul>
      </div>

      {/* Create / Edit Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title={editItem ? 'Edit Discount Code' : 'Create Discount Code'} size="md">
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs font-sans rounded">
              {error}
            </div>
          )}
          <Input
            label="Discount Code"
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="e.g. WELCOME10"
            hint="Customers will enter this at checkout"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              options={[
                { value: 'percentage', label: 'Percentage (%)' },
                { value: 'fixed', label: 'Fixed Amount (₦)' },
              ]}
            />
            <Input
              label={form.type === 'percentage' ? 'Percentage (%)' : 'Amount (₦)'}
              type="number"
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              placeholder={form.type === 'percentage' ? '10' : '5000'}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Minimum Order (₦)"
              type="number"
              value={form.minOrder}
              onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))}
              placeholder="0 for no minimum"
            />
            <Input
              label="Maximum Uses"
              type="number"
              value={form.maxUses}
              onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
              placeholder="Leave blank for unlimited"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editItem ? 'Update Code' : 'Create Code'}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
