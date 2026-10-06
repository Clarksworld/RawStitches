'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Badge, Modal, SearchInput } from '../components/ui';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

const STATUS_FILTERS = ['all', 'unread', 'read', 'replied', 'archived'] as const;

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'replied' | 'archived'>('all');
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact');
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function updateStatus(id: string, newStatus: 'unread' | 'read' | 'replied' | 'archived') {
    setActionLoading(`${id}:${newStatus}`);
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error('Failed to update message status:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Are you sure you want to delete this message permanently?')) return;
    setActionLoading(`${id}:delete`);
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      setActionLoading(null);
    }
  }

  function openMessageModal(msg: ContactMessage) {
    setSelectedMessage(msg);
    if (msg.status === 'unread') {
      updateStatus(msg.id, 'read');
    }
  }

  const filtered = messages.filter((m) => {
    const matchFilter = filter === 'all' || m.status === filter;
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  const statusBadge = (s: string) => {
    if (s === 'unread') return <Badge variant="warning">Unread</Badge>;
    if (s === 'read') return <Badge variant="info">Read</Badge>;
    if (s === 'replied') return <Badge variant="success">Replied</Badge>;
    return <Badge variant="draft">Archived</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">Customer Inquiries</h1>
          <p className="text-sm text-stone font-sans mt-0.5">
            Messages sent from the storefront Contact Us page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <div className="bg-warning/15 text-charcoal border border-warning/30 text-xs px-3 py-1 font-sans font-medium">
              {unreadCount} unread {unreadCount === 1 ? 'inquiry' : 'inquiries'}
            </div>
          )}
          <button
            onClick={fetchMessages}
            className="text-xs text-stone hover:text-gold transition-colors font-sans flex items-center gap-1 border border-border px-3 py-1.5 bg-white"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2.5 text-xs font-sans uppercase tracking-widest transition-colors border-b-2 -mb-px whitespace-nowrap ${
              filter === s
                ? 'border-gold text-gold font-medium'
                : 'border-transparent text-stone hover:text-charcoal'
            }`}
          >
            {s}
            {s !== 'all' && (
              <span className="ml-1.5 text-[10px] text-stone/60">
                ({messages.filter((m) => m.status === s).length})
              </span>
            )}
            {s === 'all' && (
              <span className="ml-1.5 text-[10px] text-stone/60">({messages.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-border p-4 flex gap-4 items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by customer name, email, phone, keyword..."
          className="w-full sm:w-80"
        />
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="bg-white border border-border p-12 text-center text-stone text-sm font-sans">
          Loading inquiries...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-border p-12 text-center text-stone text-sm font-sans space-y-2">
          <p className="font-serif text-lg text-charcoal">No inquiries found</p>
          <p className="text-xs text-stone/70">
            {search ? 'Try adjusting your search criteria.' : 'When customers submit the Contact Us form, their messages will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-sm font-sans min-w-[750px]">
            <thead>
              <tr className="border-b border-border bg-ivory/50 text-left">
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-stone font-medium">Customer</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-stone font-medium">Subject & Message</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-stone font-medium">Date</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-stone font-medium">Status</th>
                <th className="px-4 py-3 text-xs uppercase tracking-widest text-stone font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((msg) => (
                <tr
                  key={msg.id}
                  onClick={() => openMessageModal(msg)}
                  className={`cursor-pointer transition-colors hover:bg-ivory/50 ${
                    msg.status === 'unread' ? 'bg-gold/5 font-medium' : ''
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <p className="text-charcoal font-medium">{msg.name}</p>
                    <p className="text-xs text-stone">{msg.email}</p>
                    {msg.phone && <p className="text-xs text-stone/60">{msg.phone}</p>}
                  </td>
                  <td className="px-4 py-3.5 max-w-md">
                    <p className="text-xs font-semibold text-charcoal mb-0.5">{msg.subject}</p>
                    <p className="text-xs text-stone line-clamp-2 leading-relaxed">{msg.message}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-stone whitespace-nowrap">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">{statusBadge(msg.status)}</td>
                  <td
                    className="px-4 py-3.5 text-right whitespace-nowrap space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openMessageModal(msg)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={actionLoading === `${msg.id}:delete`}
                      onClick={() => deleteMessage(msg.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        title={selectedMessage?.subject || 'Customer Inquiry'}
        size="lg"
      >
        {selectedMessage && (
          <div className="space-y-6">
            <div className="bg-ivory p-4 border border-border flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-serif text-lg text-charcoal">{selectedMessage.name}</p>
                <div className="flex items-center gap-3 text-xs text-stone font-sans mt-1">
                  <span>✉ {selectedMessage.email}</span>
                  {selectedMessage.phone && <span>📞 {selectedMessage.phone}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge(selectedMessage.status)}
                <span className="text-xs text-stone/70 font-sans">
                  {selectedMessage.createdAt
                    ? new Date(selectedMessage.createdAt).toLocaleString('en-GB')
                    : ''}
                </span>
              </div>
            </div>

            <div className="bg-white border border-border p-5 space-y-2">
              <span className="text-xs uppercase tracking-widest text-stone font-sans font-medium">Customer Message:</span>
              <p className="text-sm text-charcoal font-sans leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-border pt-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {selectedMessage.status !== 'replied' && (
                  <Button
                    size="sm"
                    variant="success"
                    loading={actionLoading === `${selectedMessage.id}:replied`}
                    onClick={() => updateStatus(selectedMessage.id, 'replied')}
                  >
                    Mark as Replied
                  </Button>
                )}
                {selectedMessage.status === 'read' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(selectedMessage.id, 'unread')}
                  >
                    Mark as Unread
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(selectedMessage.id, 'read')}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re:%20${encodeURIComponent(
                    selectedMessage.subject || 'Raw Stitches Inquiry'
                  )}`}
                  className="inline-flex"
                >
                  <Button size="sm" variant="secondary">
                    Reply via Email
                  </Button>
                </a>
                {selectedMessage.phone && (
                  <a
                    href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                      selectedMessage.name
                    )},%20thank%20you%20for%20reaching%20out%20to%20Raw%20Stitches.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <Button size="sm">Reply via WhatsApp</Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
