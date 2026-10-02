import { Link, useNavigate } from 'react-router';
import { useCart, useToast } from '../store';
import { formatPrice } from '../data';
import { Button, EmptyState } from '../components/ui';

const DELIVERY_FEE = 3500;
const FREE_THRESHOLD = 50000;

export default function Cart() {
  const { items, total, dispatch } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const delivery = total >= FREE_THRESHOLD ? 0 : DELIVERY_FEE;
  const grandTotal = total + delivery;

  function remove(productId: string, color: string, size: string) {
    dispatch({ type: 'REMOVE_FROM_CART', productId, color, size });
    toast('Item removed from bag', 'info');
  }

  function updateQty(productId: string, color: string, size: string, qty: number) {
    if (qty < 1) return;
    dispatch({ type: 'UPDATE_QTY', productId, color, size, qty });
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-ivory flex items-center justify-center">
        <EmptyState
          icon={<svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
          title="Your shopping bag is empty"
          description="Discover our collection of beautifully crafted Nigerian fashion pieces."
          action={<Link to="/shop"><Button size="lg">Explore Collection</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">
      <div className="max-w-screen-lg mx-auto px-6 lg:px-12 py-12">
        <h1 className="font-serif text-3xl text-charcoal mb-10">Shopping Bag ({items.length})</h1>

        <div className="grid lg:grid-cols-[1fr_340px] gap-10">
          {/* Items */}
          <div className="space-y-6">
            {items.map((item, i) => {
              const price = (item.product.salePrice ?? item.product.price) * item.qty;
              return (
                <div key={i} className="flex gap-5 border-b border-border pb-6">
                  <Link to={`/shop/${item.product.slug}`} className="shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-24 h-28 md:w-28 md:h-36 object-cover bg-ivory-dark"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <Link to={`/shop/${item.product.slug}`} className="font-serif text-lg text-charcoal hover:text-gold transition-colors leading-snug block">
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-stone mt-1 font-sans">{item.color} · {item.size}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                      {/* Quantity */}
                      <div className="flex items-center border border-border">
                        <button onClick={() => updateQty(item.product.id, item.color, item.size, item.qty - 1)} className="w-8 h-8 text-stone hover:text-charcoal transition-colors flex items-center justify-center">−</button>
                        <span className="w-8 text-center text-sm font-sans">{item.qty}</span>
                        <button onClick={() => updateQty(item.product.id, item.color, item.size, item.qty + 1)} className="w-8 h-8 text-stone hover:text-charcoal transition-colors flex items-center justify-center">+</button>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-base text-charcoal">{formatPrice(price)}</p>
                        {item.product.salePrice && <p className="text-xs text-stone font-sans">{formatPrice(item.product.salePrice)} each</p>}
                      </div>
                      <button onClick={() => remove(item.product.id, item.color, item.size)} className="text-xs text-stone hover:text-error transition-colors font-sans">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white border border-border p-6 sticky top-8">
              <h2 className="font-serif text-xl text-charcoal mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm font-sans border-b border-border pb-4 mb-4">
                <div className="flex justify-between text-stone">
                  <span>Subtotal</span>
                  <span className="text-charcoal">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-stone">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? 'text-success' : 'text-charcoal'}>{delivery === 0 ? 'Free' : formatPrice(delivery)}</span>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-stone/70">Free delivery on orders above {formatPrice(FREE_THRESHOLD)}</p>
                )}
                <div className="flex items-center gap-2">
                  <input type="text" placeholder="Promo code" className="flex-1 px-3 py-2 text-xs border border-border focus:border-gold focus:outline-none font-sans" />
                  <button className="px-3 py-2 text-xs border border-border hover:border-gold text-stone hover:text-gold transition-colors font-sans">Apply</button>
                </div>
              </div>
              <div className="flex justify-between font-serif text-xl text-charcoal mb-6">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
              <Button size="lg" className="w-full mb-3" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </Button>
              <Link to="/shop">
                <Button variant="ghost" size="md" className="w-full">Continue Shopping</Button>
              </Link>
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-stone font-sans">
                  <span>🔒</span> Secure checkout · Paystack / Flutterwave
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-stone font-sans">
                  <span>📦</span> Delivery across Nigeria
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
