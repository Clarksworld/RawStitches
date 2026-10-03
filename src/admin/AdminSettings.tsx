'use client';

import { useState } from 'react';
import { Tabs, Button, Input, Toggle, Badge, Modal } from '../components/ui';

const TABS = ['Business', 'Payments', 'Notifications', 'Security', 'Admin Users'];

const ADMIN_USERS = [
  { id: 'u1', name: 'Admin', email: 'admin@rawstitches.ng', role: 'owner', active: true, last: '28 Nov 2024' },
];

const ROLES = [
  { id: 'owner', label: 'Owner', desc: 'Full access to all features' },
  { id: 'manager', label: 'Manager', desc: 'Products, Orders, Inventory, Customers, Analytics' },
  { id: 'staff', label: 'Staff', desc: 'Orders and Inventory only' },
];

export default function AdminSettings() {
  const [tab, setTab] = useState('Business');
  const [userModal, setUserModal] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl text-charcoal">Settings</h1>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="max-w-2xl">

        {/* Business */}
        {tab === 'Business' && (
          <div className="space-y-6">
            <div className="bg-white border border-border p-5 space-y-4">
              <h3 className="font-sans font-medium text-sm text-charcoal">Business Information</h3>
              <Input label="Business Name" defaultValue="Raw Stitches Nigeria Enterprise" />
              <Input label="Email Address" type="email" defaultValue="info@rawstitches.ng" />
              <Input label="Phone Number" defaultValue="0803 689 5862" />
              <Input label="WhatsApp" defaultValue="+234 803 689 5862" />
            </div>
            <div className="bg-white border border-border p-5 space-y-4">
              <h3 className="font-sans font-medium text-sm text-charcoal">Address</h3>
              <Input label="Street Address" defaultValue="No. 62 Enwe Street" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" defaultValue="Uyo" />
                <Input label="State" defaultValue="Akwa Ibom" />
              </div>
              <Input label="Country" defaultValue="Nigeria" />
            </div>
            <div className="bg-white border border-border p-5 space-y-4">
              <h3 className="font-sans font-medium text-sm text-charcoal">Social Media</h3>
              <Input label="Facebook Page URL" defaultValue="https://www.facebook.com/rawstitchesnigeria" />
              <Input label="Instagram (optional)" placeholder="https://instagram.com/..." />
            </div>
            <div className="bg-white border border-border p-5 space-y-4">
              <h3 className="font-sans font-medium text-sm text-charcoal">Currency</h3>
              <div className="flex items-center gap-3 text-sm font-sans">
                <div className="border border-gold px-4 py-2 text-charcoal font-medium">NGN — ₦</div>
                <p className="text-stone text-xs">Nigerian Naira is the default currency.</p>
              </div>
            </div>
            <Button>Save Business Settings</Button>
          </div>
        )}

        {/* Payments */}
        {tab === 'Payments' && (
          <div className="space-y-5">
            <div className="bg-white border border-border p-5 space-y-4">
              <h3 className="font-sans font-medium text-sm text-charcoal">Payment Gateway</h3>
              <p className="text-xs text-stone font-sans leading-relaxed">
                Connect a payment provider to accept online payments. Raw Stitches supports Paystack and Flutterwave. Card details are never stored by Raw Stitches — all payment processing happens on the provider's secure servers.
              </p>
              <div className="space-y-3">
                {[
                  { name: 'Paystack', status: 'Not connected', desc: 'Accept cards, bank transfer, USSD' },
                  { name: 'Flutterwave', status: 'Not connected', desc: 'Accept cards, mobile money, bank transfer' },
                ].map(gw => (
                  <div key={gw.name} className="border border-border p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-charcoal font-sans">{gw.name}</p>
                      <p className="text-xs text-stone font-sans">{gw.desc}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-stone font-sans">{gw.status}</span>
                      <Button size="sm">Connect</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white border border-border p-5 space-y-3">
              <h3 className="font-sans font-medium text-sm text-charcoal">Payment Methods</h3>
              {['Card (Visa, Mastercard, Verve)', 'Bank Transfer', 'USSD', 'Mobile Money'].map(m => (
                <div key={m} className="flex items-center justify-between">
                  <span className="text-sm text-charcoal font-sans">{m}</span>
                  <Toggle checked={true} onChange={() => {}} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        {tab === 'Notifications' && (
          <div className="bg-white border border-border p-5 space-y-4">
            <h3 className="font-sans font-medium text-sm text-charcoal">Email Notifications</h3>
            <div className="space-y-3">
              {[
                { label: 'New order received', desc: 'Get notified when a new order is placed' },
                { label: 'Payment confirmed', desc: 'Get notified when payment is received' },
                { label: 'Low stock alert', desc: 'Get notified when a product hits the low stock threshold' },
                { label: 'Out of stock', desc: 'Get notified when a product runs out of stock' },
                { label: 'Order delivered', desc: 'Get notified when an order is marked as delivered' },
              ].map(n => (
                <div key={n.label} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-charcoal font-sans">{n.label}</p>
                    <p className="text-xs text-stone font-sans">{n.desc}</p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <Input label="Notification Email" defaultValue="admin@rawstitches.ng" hint="Where to send admin notifications" />
            </div>
            <Button>Save Notification Settings</Button>
          </div>
        )}

        {/* Security */}
        {tab === 'Security' && (
          <div className="space-y-5">
            <div className="bg-white border border-border p-5 space-y-4">
              <h3 className="font-sans font-medium text-sm text-charcoal">Change Admin Password</h3>
              <Input label="Current Password" type="password" />
              <Input label="New Password" type="password" />
              <Input label="Confirm New Password" type="password" />
              <Button>Update Password</Button>
            </div>
            <div className="bg-white border border-border p-5">
              <h3 className="font-sans font-medium text-sm text-charcoal mb-3">Two-Factor Authentication</h3>
              <p className="text-xs text-stone font-sans mb-3">Add an extra layer of security to your admin account.</p>
              <Button variant="ghost" size="sm">Enable 2FA (coming soon)</Button>
            </div>
          </div>
        )}

        {/* Admin Users */}
        {tab === 'Admin Users' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-stone font-sans">Manage who has access to the admin panel and their permissions.</p>
              <Button size="sm" onClick={() => setUserModal(true)}>+ Add User</Button>
            </div>

            {/* Roles */}
            <div className="bg-white border border-border p-4 space-y-3">
              <h3 className="font-sans font-medium text-xs uppercase tracking-widest text-stone mb-3">Roles</h3>
              {ROLES.map(role => (
                <div key={role.id} className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-charcoal font-sans capitalize">{role.label}</p>
                    <p className="text-xs text-stone font-sans">{role.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Users */}
            <div className="bg-white border border-border overflow-hidden">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-border bg-ivory/50">
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">User</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Role</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Last Login</th>
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-stone font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ADMIN_USERS.map(u => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <p className="font-medium text-charcoal">{u.name}</p>
                        <p className="text-xs text-stone">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 capitalize"><Badge variant="info">{u.role}</Badge></td>
                      <td className="px-4 py-3"><Badge variant="active">Active</Badge></td>
                      <td className="px-4 py-3 text-stone">{u.last}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <button className="text-xs text-gold hover:underline">Edit</button>
                        <button className="text-xs text-stone hover:underline">Reset Password</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add user modal */}
            <Modal open={userModal} onClose={() => setUserModal(false)} title="Add Admin User" size="sm">
              <div className="space-y-4">
                <Input label="Full Name" placeholder="Admin name" />
                <Input label="Email Address" type="email" placeholder="admin@rawstitches.ng" />
                <div>
                  <p className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans mb-2">Role</p>
                  <div className="space-y-2">
                    {ROLES.map(role => (
                      <label key={role.id} className="flex items-center gap-3 cursor-pointer border border-border p-3 hover:border-gold transition-colors">
                        <input type="radio" name="role" value={role.id} className="accent-gold" />
                        <div>
                          <p className="text-sm font-medium text-charcoal font-sans capitalize">{role.label}</p>
                          <p className="text-xs text-stone font-sans">{role.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" onClick={() => setUserModal(false)}>Add User</Button>
                  <Button variant="ghost" onClick={() => setUserModal(false)}>Cancel</Button>
                </div>
              </div>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
}
