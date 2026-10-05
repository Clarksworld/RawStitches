'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge, Button } from '../components/ui';

interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  body: string;
  status: string;
  featured: boolean;
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function doAction(id: string, action: string) {
    setActionLoading(`${id}:${action}`);
    try {
      await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      await fetchReviews();
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review permanently?')) return;
    setActionLoading(`${id}:delete`);
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      await fetchReviews();
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);
  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  const statusBadge = (s: string) =>
    s === 'approved' ? <Badge variant="success">Approved</Badge>
    : s === 'rejected' ? <Badge variant="error">Rejected</Badge>
    : <Badge variant="warning">Pending</Badge>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl text-charcoal">Reviews</h1>
          {pendingCount > 0 && (
            <p className="text-xs text-stone font-sans mt-0.5">
              {pendingCount} pending {pendingCount === 1 ? 'review' : 'reviews'} awaiting approval
            </p>
          )}
        </div>
        <button
          onClick={fetchReviews}
          className="text-xs text-stone hover:text-gold transition-colors font-sans flex items-center gap-1"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-sans uppercase tracking-wider transition-colors border-b-2 -mb-px ${
              filter === f ? 'border-gold text-gold' : 'border-transparent text-stone hover:text-charcoal'
            }`}
          >
            {f}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-warning text-white text-[10px] rounded-full px-1.5 py-0.5">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-border p-5 animate-pulse">
              <div className="h-4 bg-ivory-dark rounded w-48 mb-3" />
              <div className="h-3 bg-ivory-dark rounded w-full mb-2" />
              <div className="h-3 bg-ivory-dark rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-stone font-sans">
          <p className="text-3xl mb-3">★</p>
          <p className="text-sm">No {filter === 'all' ? '' : filter} reviews yet.</p>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-xs text-gold mt-2 hover:underline">View all</button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <div
              key={review.id}
              className={`bg-white border p-5 ${review.status === 'pending' ? 'border-warning/40' : 'border-border'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {/* Stars */}
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < review.rating ? 'text-gold' : 'text-border'}`}>★</span>
                      ))}
                    </div>
                    <span className="font-medium text-sm text-charcoal font-sans">{review.customerName}</span>
                    {review.customerEmail && (
                      <span className="text-xs text-stone/60 font-sans">{review.customerEmail}</span>
                    )}
                    <span className="text-stone text-xs font-sans">
                      on <strong>{review.productName || review.productId}</strong>
                    </span>
                    {review.featured && <Badge variant="info">Featured</Badge>}
                  </div>
                  <p className="text-sm text-stone font-sans leading-relaxed italic">"{review.body}"</p>
                  <p className="text-xs text-stone/50 mt-2 font-sans">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {statusBadge(review.status)}
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {review.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          loading={actionLoading === `${review.id}:approve`}
                          onClick={() => doAction(review.id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={actionLoading === `${review.id}:reject`}
                          onClick={() => doAction(review.id, 'reject')}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {review.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={actionLoading === `${review.id}:${review.featured ? 'unfeature' : 'feature'}`}
                        onClick={() => doAction(review.id, review.featured ? 'unfeature' : 'feature')}
                      >
                        {review.featured ? 'Unfeature' : 'Feature'}
                      </Button>
                    )}
                    {review.status === 'rejected' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={actionLoading === `${review.id}:approve`}
                        onClick={() => doAction(review.id, 'approve')}
                      >
                        Re-approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      loading={actionLoading === `${review.id}:delete`}
                      onClick={() => deleteReview(review.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
