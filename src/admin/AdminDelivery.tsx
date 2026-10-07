'use client';

import { useState, useEffect } from 'react';
import { Button, Modal, Input, Toggle } from '../components/ui';
import StudioMap from '../components/StudioMap';
import { formatPrice } from '../data';

type Zone = {
  id: string;
  name: string;
  fee: number;
  freeThreshold: number;
  time: string;
  active: boolean;
};

const emptyForm = { name: '', fee: '', freeThreshold: '', time: '', active: true };

export default function AdminDelivery() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoneModal, setZoneModal] = useState(false);
  const [editZone, setEditZone] = useState<Zone | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  async function loadZones() {
    try {
      const res = await fetch('/api/delivery');
      const data = await res.json();
      setZones(Array.isArray(data.zones) ? data.zones : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditZone(null);
    setForm(emptyForm);
    setError('');
    setZoneModal(true);
  }

  function openEdit(z: Zone) {
    setEditZone(z);
    setForm({
      name: z.name,
      fee: String(z.fee),
      freeThreshold: String(z.freeThreshold),
      time: z.time,
      active: z.active,
    });
    setError('');
    setZoneModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Zone name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...(editZone ? { id: editZone.id } : {}),
        name: form.name.trim(),
        fee: Number(form.fee) || 0,
        freeThreshold: Number(form.freeThreshold) || 0,
        time: form.time || '3-5 business days',
        active: form.active,
      };
      const method = editZone ? 'PATCH' : 'POST';
      const res = await fetch('/api/delivery', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); return; }
      await loadZones();
      setZoneModal(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/delivery?id=${id}`, { method: 'DELETE' });
      setZones(prev => prev.filter(z => z.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeleteId(null);
    }
  }

  async function handleToggle(zone: Zone) {
    setToggling(zone.id);
    try {
      await fetch('/api/delivery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: zone.id, active: !zone.active }),
      });
      setZones(prev => prev.map(z => z.id === zone.id ? { ...z, active: !z.active } : z));
    } catch (e) {
      console.error(e);
    } finally {
      setToggling(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-ivory-dark w-48 rounded" />
        <div className="h-48 bg-ivory-dark rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-charcoal">Delivery Settings</h1>

      <div className="bg-ivory-dark border border-border px-4 py-3 text-xs text-stone font-sans">
        ⚙️ Delivery fees are applied live at checkout based on the customer's selected state. Edit fees and free-delivery thresholds below. Changes take effect immediately.
      </div>

      {/* Delivery Zones Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-sans font-semibold text-sm text-charcoal">Delivery Zones</h2>
            <p className="text-xs text-stone font-sans">{zones.length} active zones</p>
          </div>
          <Button size="sm" onClick={openCreate}>+ Add Zone</Button>
        </div>

        <div className="bg-white border border-border overflow-x-auto shadow-xs">
          <table className="w-full text-sm font-sans min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-ivory/50">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Zone</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Delivery Fee</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Free Above</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Est. Time</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Active</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {zones.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone font-sans text-sm">
                    No delivery zones configured. Add your first zone.
                  </td>
                </tr>
              )}
              {zones.map(zone => (
                <tr key={zone.id} className={`hover:bg-ivory/40 transition-colors ${!zone.active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-charcoal">{zone.name}</td>
                  <td className="px-4 py-3 text-charcoal font-medium">
                    {zone.fee === 0 ? <span className="text-emerald-600 font-semibold">Free</span> : formatPrice(zone.fee)}
                  </td>
                  <td className="px-4 py-3 text-stone">
                    {zone.freeThreshold > 0 ? (
                      <span className="text-xs">{formatPrice(zone.freeThreshold)} <span className="text-stone/60">(free above)</span></span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-stone text-xs">{zone.time}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(zone)}
                      disabled={toggling === zone.id}
                      className={`w-10 h-5 rounded-full relative transition-colors ${zone.active ? 'bg-gold' : 'bg-border'}`}
                      title={zone.active ? 'Click to disable' : 'Click to enable'}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${zone.active ? 'translate-x-5' : 'translate-x-0.5'}`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button onClick={() => openEdit(zone)} className="text-xs text-gold hover:underline font-medium">Edit</button>
                    {deleteId === zone.id ? (
                      <>
                        <button onClick={() => handleDelete(zone.id)} className="text-xs text-error hover:underline font-medium">Confirm</button>
                        <button onClick={() => setDeleteId(null)} className="text-xs text-stone hover:underline">Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => setDeleteId(zone.id)} className="text-xs text-error/70 hover:text-error hover:underline">Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store Pickup */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-sans font-semibold text-sm text-charcoal">Store Pickup Location</h2>
            <p className="text-xs text-stone font-sans">Free pickup at atelier — always available at checkout</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="bg-white border border-border p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-charcoal font-sans">Raw Stitches Atelier & Studio</p>
              <p className="text-xs text-stone font-sans mt-0.5">No. 62 Enwe Street, Uyo, Akwa Ibom State, Nigeria</p>
              <p className="text-xs text-gold font-sans mt-1">Free collection — Mon–Sat, 9am–5pm</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-5 rounded-full bg-gold relative">
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow translate-x-5" />
              </div>
              <span className="text-xs text-emerald-600 font-sans font-medium">Active</span>
            </div>
          </div>
          <StudioMap heightClass="h-48 sm:h-56" />
        </div>
      </div>

      {/* Zone Modal */}
      <Modal open={zoneModal} onClose={() => setZoneModal(false)} title={editZone ? 'Edit Delivery Zone' : 'Add Delivery Zone'} size="sm">
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-xs font-sans rounded">
              {error}
            </div>
          )}
          <Input
            label="Zone Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Lagos"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Delivery Fee (₦)"
              type="number"
              value={form.fee}
              onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
              placeholder="e.g. 5000"
            />
            <Input
              label="Free Delivery Above (₦)"
              type="number"
              value={form.freeThreshold}
              onChange={e => setForm(f => ({ ...f, freeThreshold: e.target.value }))}
              placeholder="e.g. 80000"
            />
          </div>
          <Input
            label="Estimated Delivery Time"
            value={form.time}
            onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
            placeholder="e.g. 3–5 business days"
          />
          <Toggle
            checked={form.active}
            onChange={v => setForm(f => ({ ...f, active: v }))}
            label="Zone is Active"
          />
          <div className="flex gap-3 pt-1">
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editZone ? 'Update Zone' : 'Save Zone'}
            </Button>
            <Button variant="ghost" onClick={() => setZoneModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
