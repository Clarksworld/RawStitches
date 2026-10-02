import { useState } from 'react';
import { Button, Badge, Modal, Input, Select } from '../components/ui';

const SAMPLE_CODES = [
  { id: 'd1', code: 'WELCOME10', type: 'percentage', value: 10, min: 20000, uses: 5, maxUses: 100, start: '2024-11-01', end: '2024-12-31', status: 'active' },
  { id: 'd2', code: 'NEWYEAR5K', type: 'fixed', value: 5000, min: 30000, uses: 12, maxUses: 50, start: '2025-01-01', end: '2025-01-07', status: 'scheduled' },
  { id: 'd3', code: 'FLASH20', type: 'percentage', value: 20, min: 0, uses: 48, maxUses: 50, start: '2024-10-01', end: '2024-10-31', status: 'expired' },
];

export default function AdminDiscounts() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', min: '', maxUses: '', start: '', end: '' });

  const statusBadge = (s: string) => s === 'active' ? <Badge variant="active">Active</Badge> : s === 'scheduled' ? <Badge variant="scheduled">Scheduled</Badge> : <Badge variant="warning">Expired</Badge>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-charcoal">Discounts</h1>
        <Button onClick={() => setOpen(true)}>+ Create Discount</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Codes', value: String(SAMPLE_CODES.filter(c => c.status === 'active').length) },
          { label: 'Scheduled', value: String(SAMPLE_CODES.filter(c => c.status === 'scheduled').length) },
          { label: 'Expired', value: String(SAMPLE_CODES.filter(c => c.status === 'expired').length) },
        ].map(s => (
          <div key={s.label} className="bg-white border border-border p-4 text-center">
            <p className="font-serif text-2xl text-charcoal">{s.value}</p>
            <p className="text-xs text-stone font-sans mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border overflow-x-auto">
        <table className="w-full text-sm font-sans min-w-[700px]">
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
            {SAMPLE_CODES.map(code => (
              <tr key={code.id} className="hover:bg-ivory/40">
                <td className="px-4 py-3 font-mono font-medium text-charcoal">{code.code}</td>
                <td className="px-4 py-3 text-charcoal">{code.type === 'percentage' ? `${code.value}% off` : `₦${code.value.toLocaleString()} off`}</td>
                <td className="px-4 py-3 text-stone">{code.min > 0 ? `₦${code.min.toLocaleString()}` : 'No minimum'}</td>
                <td className="px-4 py-3 text-charcoal">{code.uses} / {code.maxUses}</td>
                <td className="px-4 py-3 text-stone text-xs">{code.start} → {code.end}</td>
                <td className="px-4 py-3">{statusBadge(code.status)}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="text-xs text-gold hover:underline">Edit</button>
                  <button className="text-xs text-error hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Discount Code" size="md">
        <div className="space-y-4">
          <Input label="Discount Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. WELCOME10" hint="Customers will enter this at checkout" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} options={[{ value: 'percentage', label: 'Percentage (%)' }, { value: 'fixed', label: 'Fixed Amount (₦)' }]} />
            <Input label={form.type === 'percentage' ? 'Percentage (%)' : 'Amount (₦)'} type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === 'percentage' ? '10' : '5000'} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Minimum Order (₦)" type="number" value={form.min} onChange={e => setForm(f => ({ ...f, min: e.target.value }))} placeholder="0 for no minimum" />
            <Input label="Maximum Uses" type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="Unlimited if blank" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))} />
            <Input label="End Date" type="date" value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={() => setOpen(false)}>Create Code</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
