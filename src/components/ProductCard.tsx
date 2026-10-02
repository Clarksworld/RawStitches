import { useState } from 'react';
import { Link } from 'react-router';
import { Badge, Button } from './ui';
import { useCart, useWishlist, useToast } from '../store';
import { formatPrice, type Product } from '../data';

export default function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const { dispatch: cartDispatch } = useCart();
  const { ids, dispatch: wishDispatch } = useWishlist();
  const toast = useToast();
  const wishlisted = ids.includes(product.id);
  const outOfStock = product.stock === 0;

  function quickAdd() {
    if (outOfStock) return;
    cartDispatch({
      type: 'ADD_TO_CART',
      item: { product, color: product.colors[0], size: product.sizes[1] ?? product.sizes[0], qty: 1 },
    });
    toast(`${product.name} added to bag`);
  }

  function toggleWish(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    wishDispatch({ type: 'TOGGLE_WISHLIST', productId: product.id });
    toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  }

  const displayPrice = product.salePrice ?? product.price;
  const img = hovered && product.images[1] ? product.images[1] : product.images[0];

  return (
    <Link to={`/shop/${product.slug}`} className="group flex flex-col">
      {/* Image container */}
      <div
        className="relative overflow-hidden bg-ivory-dark aspect-[4/5]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && <Badge variant="new">New</Badge>}
          {product.isBestSeller && <Badge variant="bestseller">Best Seller</Badge>}
          {product.salePrice && <Badge variant="sale">Sale</Badge>}
          {outOfStock && <Badge variant="outofstock">Out of Stock</Badge>}
          {!outOfStock && product.stock <= product.lowStockThreshold && <Badge variant="lowstock">Low Stock</Badge>}
        </div>

        {/* Wishlist */}
        <button
          onClick={toggleWish}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-all hover:bg-white"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-gold text-gold' : 'fill-none text-charcoal'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Quick Add */}
        <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <button
            onClick={e => { e.preventDefault(); quickAdd(); }}
            disabled={outOfStock}
            className="w-full py-3 bg-black text-ivory text-xs font-medium uppercase tracking-widest hover:bg-gold hover:text-black transition-all duration-200 disabled:opacity-50"
          >
            {outOfStock ? 'Out of Stock' : 'Quick Add'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-3 flex flex-col gap-1.5">
        <h3 className="text-sm font-medium text-charcoal group-hover:text-gold transition-colors leading-snug">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${product.salePrice ? 'text-gold' : 'text-charcoal'}`}>{formatPrice(displayPrice)}</span>
          {product.salePrice && <span className="text-xs text-stone line-through">{formatPrice(product.price)}</span>}
        </div>
        {/* Color dots */}
        <div className="flex gap-1.5 mt-0.5">
          {product.colors.slice(0, 4).map(color => (
            <div
              key={color}
              className="w-3.5 h-3.5 rounded-full border border-border"
              style={{ backgroundColor: product.colorHex[color] ?? '#ccc' }}
              title={color}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
