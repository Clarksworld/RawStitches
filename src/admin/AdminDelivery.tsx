import { useState } from 'react';
import { Button, Modal, Input, Toggle } from '../components/ui';

const DELIVERY_ZONES = [
  { id: 'z1', name: 'Uyo & Environs', fee: 1500, freeThreshold: 50000, time: '1–2 business days', active: true },
  { id: 'z2', name: 'Akwa Ibom (Other)', fee: 2500, freeThreshold: 50000, time: '2–3 business days', active: true },
  { id: 'z3', name: 'Abuja (FCT)', fee: 5000, freeThreshold: 80000, time: '3–5 business days', active: true },
  { id: 'z4', name: 'Lagos', fee: 5000, freeThreshold: 80000, time: '3–5 business days', active: true },
  { id: 'z5', name: 'Rivers State', fee: 4000, freeThreshold: 60000, time: '2–4 business days', active: true },
  { id: 'z6', name: 'Other States', fee: 6000, freeThreshold: 100000, time: '4–7 business days', active: true },
];

const PICKUP_LOCATIONS = [
  { id: 'p1', name: 'Raw Stitches Studio', address: 'No. 62 Enwe Street, Uyo, Akwa Ibom State', active: true },
];

export default function AdminDelivery() {
  const [zoneModal, setZoneModal] = useState(false);
  const [pickupModal, setPickupModal] = useState(false);
  const [form, setForm] = useState({ name: '', fee: '', freeThreshold: '', time: '', active: true });

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-charcoal">Delivery Settings</h1>

      <div className="bg-ivory-dark border border-border px-4 py-3 text-xs text-stone font-sans">
        ⚙️ These delivery zones and fees are examples. Edit them to match your actual delivery pricing and coverage. These settings are editable by the admin and not hard-coded.
      </div>

      {/* Delivery Zones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-medium text-sm text-charcoal">Delivery Zones</h2>
          <Button size="sm" onClick={() => setZoneModal(true)}>+ Add Zone</Button>
        </div>
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm font-sans min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-ivory/50">
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Zone</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Fee</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Free Above</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Delivery Time</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Active</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DELIVERY_ZONES.map(zone => (
                <tr key={zone.id} className="hover:bg-ivory/40">
                  <td className="px-4 py-3 font-medium text-charcoal">{zone.name}</td>
                  <td className="px-4 py-3 text-stone">₦{zone.fee.toLocaleString()}</td>
                  <td className="px-4 py-3 text-stone">₦{zone.freeThreshold.toLocaleString()}</td>
                  <td className="px-4 py-3 text-stone">{zone.time}</td>
                  <td className="px-4 py-3">
                    <div className={`w-8 h-4 rounded-full ${zone.active ? 'bg-gold' : 'bg-border'} relative`}>
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${zone.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </div>
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button className="text-xs text-gold hover:underline">Edit</button>
                    <button className="text-xs text-error hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pickup Locations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sans font-medium text-sm text-charcoal">Store Pickup Locations</h2>
          <Button size="sm" variant="ghost" onClick={() => setPickupModal(true)}>+ Add Location</Button>
        </div>
        <div className="space-y-3">
          {PICKUP_LOCATIONS.map(loc => (
            <div key={loc.id} className="bg-white border border-border p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-charcoal font-sans">{loc.name}</p>
                <p className="text-xs text-stone font-sans">{loc.address}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Modal */}
      <Modal open={zoneModal} onClose={() => setZoneModal(false)} title="Add Delivery Zone" size="sm">
        <div className="space-y-4">
          <Input label="Zone Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Lagos" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Delivery Fee (₦)" type="number" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} />
            <Input label="Free Delivery Above (₦)" type="number" value={form.freeThreshold} onChange={e => setForm(f => ({ ...f, freeThreshold: e.target.value }))} />
          </div>
          <Input label="Estimated Time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} placeholder="e.g. 3–5 business days" />
          <Toggle checked={form.active} onChange={v => setForm(f => ({ ...f, active: v }))} label="Active" />
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => setZoneModal(false)}>Save Zone</Button>
            <Button variant="ghost" onClick={() => setZoneModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Pickup Modal */}
      <Modal open={pickupModal} onClose={() => setPickupModal(false)} title="Add Pickup Location" size="sm">
        <div className="space-y-4">
          <Input label="Location Name" placeholder="e.g. Raw Stitches Studio" />
          <Input label="Address" placeholder="Full address..." />
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => setPickupModal(false)}>Save Location</Button>
            <Button variant="ghost" onClick={() => setPickupModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
