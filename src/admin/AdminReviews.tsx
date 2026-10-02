import { Badge, Button } from '../components/ui';

const REVIEWS = [
  { id: 'r1', customer: 'Adaeze O.', product: 'The Onyinye Wrap Dress', rating: 5, review: 'Absolutely stunning! The quality is exceptional. I wore it to a formal event and received so many compliments.', date: '2024-11-25', status: 'approved', featured: false },
  { id: 'r2', customer: 'Chisom E.', product: 'Ifunanya Two-Piece Set', rating: 5, review: 'I am obsessed. The fit is perfect and the fabric is luxurious. Fast shipping too!', date: '2024-11-22', status: 'pending', featured: false },
  { id: 'r3', customer: 'Ngozi A.', product: 'Chidinma Maxi Dress', rating: 4, review: 'Beautiful dress, very elegant. The colour in person is even better than the photos. Slightly long for my height but lovely overall.', date: '2024-11-20', status: 'approved', featured: true },
  { id: 'r4', customer: 'Ebere N.', product: 'Adaeze Peplum Top', rating: 5, review: 'My favourite top! I have washed it multiple times and it still looks perfect. Raw Stitches truly understands Nigerian women.', date: '2024-11-18', status: 'pending', featured: false },
];

export default function AdminReviews() {
  const statusBadge = (s: string) => s === 'approved'
    ? <Badge variant="success">Approved</Badge>
    : <Badge variant="warning">Pending</Badge>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-charcoal">Reviews</h1>
        <div className="flex gap-2 text-xs font-sans text-stone">
          <span>{REVIEWS.filter(r => r.status === 'pending').length} pending review</span>
        </div>
      </div>

      <div className="space-y-4">
        {REVIEWS.map(review => (
          <div key={review.id} className={`bg-white border p-5 ${review.status === 'pending' ? 'border-warning/40' : 'border-border'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-sm ${i < review.rating ? 'text-gold' : 'text-border'}`}>★</span>
                    ))}
                  </div>
                  <span className="font-medium text-sm text-charcoal font-sans">{review.customer}</span>
                  <span className="text-stone text-xs font-sans">on <strong>{review.product}</strong></span>
                  {review.featured && <Badge variant="info">Featured</Badge>}
                </div>
                <p className="text-sm text-stone font-sans leading-relaxed italic">"{review.review}"</p>
                <p className="text-xs text-stone/60 mt-2 font-sans">{review.date}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {statusBadge(review.status)}
                <div className="flex gap-1.5 flex-wrap">
                  {review.status === 'pending' && <Button size="sm" variant="success">Approve</Button>}
                  <Button size="sm" variant="ghost">{review.featured ? 'Unfeature' : 'Feature'}</Button>
                  <Button size="sm" variant="ghost">Hide</Button>
                  <Button size="sm" variant="danger">Delete</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
