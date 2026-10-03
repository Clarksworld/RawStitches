'use client';

import { useState } from 'react';
import { useParams, Link, useNavigate } from '../components/router-adapter';
import { PRODUCTS, formatPrice, type Product } from '../data';
import { Button, Badge, Accordion, StarRating, Breadcrumb, Modal } from '../components/ui';
import { useCart, useWishlist, useToast } from '../store';
import ProductCard from '../components/ProductCard';

interface ProductDetailProps {
  initialProduct?: Product | null;
}

export default function ProductDetail({ initialProduct }: ProductDetailProps = {}) {
  const { slug } = useParams<{ slug: string }>();
  const product = initialProduct ?? (slug ? PRODUCTS.find(p => p.slug === slug) : null);
  const navigate = useNavigate();
  const toast = useToast();
  const { dispatch: cartDispatch } = useCart();
  const { ids, dispatch: wishDispatch } = useWishlist();

  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] ?? '');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-charcoal mb-4">Product Not Found</h2>
          <Link to="/shop"><Button variant="ghost">Back to Shop</Button></Link>
        </div>
      </div>
    );
  }

  const wishlisted = ids.includes(product.id);
  const outOfStock = product.stock === 0;
  const lowStock = !outOfStock && product.stock <= product.lowStockThreshold;

  function addToCart() {
    if (!product) return;
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    cartDispatch({ type: 'ADD_TO_CART', item: { product, color: selectedColor, size: selectedSize, qty } });
    toast(`${product.name} added to your bag`);
  }

  function buyNow() {
    if (!product) return;
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    cartDispatch({ type: 'ADD_TO_CART', item: { product, color: selectedColor, size: selectedSize, qty } });
    navigate('/checkout');
  }

  const related = PRODUCTS.filter(p => p.id !== product.id && (p.category === product.category || p.collection === product.collection)).slice(0, 4);

  return (
    <div className="bg-ivory">
      {/* Breadcrumb */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 pt-8 pb-4">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop' }, { label: product.category, href: `/shop?category=${product.category.toLowerCase().replace(/ /g, '-')}` }, { label: product.name }]} />
      </div>

      {/* Product */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div
              className="relative overflow-hidden bg-ivory-dark cursor-zoom-in aspect-[4/5]"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={product.images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-20 overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-gold' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-stone uppercase tracking-widest font-sans">{product.category}</span>
                {product.isNewArrival && <Badge variant="new">New</Badge>}
                {product.isBestSeller && <Badge variant="bestseller">Best Seller</Badge>}
              </div>
              <h1 className="font-serif text-3xl lg:text-4xl text-charcoal mb-3">{product.name}</h1>
              <StarRating rating={product.rating} count={product.reviewCount} />
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className={`font-serif text-2xl ${product.salePrice ? 'text-gold' : 'text-charcoal'}`}>
                {formatPrice(product.salePrice ?? product.price)}
              </span>
              {product.salePrice && (
                <span className="text-base text-stone line-through font-sans">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Availability */}
            <div className="text-sm font-sans">
              {outOfStock ? <span className="text-stone">Out of stock</span>
                : lowStock ? <span className="text-warning">Only {product.stock} left — order soon</span>
                : <span className="text-success">In stock</span>}
            </div>

            <div className="w-12 border-t border-border" />

            <p className="text-stone text-sm leading-relaxed font-sans">{product.description}</p>

            {/* Color */}
            <div>
              <p className="text-xs uppercase tracking-widest font-medium text-charcoal mb-3 font-sans">
                Colour: <span className="text-gold">{selectedColor}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === color ? 'border-gold scale-110' : 'border-transparent hover:border-stone'}`}
                    style={{ backgroundColor: product.colorHex[color] ?? '#ccc' }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs uppercase tracking-widest font-medium font-sans ${sizeError ? 'text-error' : 'text-charcoal'}`}>
                  {sizeError ? 'Please select a size' : 'Size'}
                </p>
                <button className="text-xs text-stone hover:text-gold transition-colors font-sans underline underline-offset-2">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => { setSelectedSize(size); setSizeError(false); }}
                    className={`h-10 px-4 text-xs font-sans border transition-colors ${selectedSize === size ? 'border-gold bg-gold text-black' : 'border-border text-stone hover:border-gold'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-xs uppercase tracking-widest font-medium text-charcoal mb-3 font-sans">Quantity</p>
              <div className="flex items-center border border-border w-fit">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-stone hover:text-charcoal transition-colors">−</button>
                <span className="w-12 text-center text-sm font-sans text-charcoal">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center text-stone hover:text-charcoal transition-colors">+</button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                disabled={outOfStock}
                onClick={addToCart}
              >
                {outOfStock ? 'Out of Stock' : 'Add to Bag'}
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={outOfStock}
                onClick={buyNow}
              >
                Buy Now
              </Button>
            </div>

            {/* Wishlist */}
            <button
              onClick={() => { wishDispatch({ type: 'TOGGLE_WISHLIST', productId: product.id }); toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist'); }}
              className={`flex items-center gap-2 text-sm transition-colors font-sans ${wishlisted ? 'text-gold' : 'text-stone hover:text-gold'}`}
            >
              <svg className={`w-4.5 h-4.5 ${wishlisted ? 'fill-gold' : 'fill-none'}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {wishlisted ? 'In your wishlist' : 'Add to wishlist'}
            </button>

            {/* Accordion details */}
            <div className="border-t border-border pt-4">
              <Accordion items={[
                {
                  title: 'Product Details',
                  content: <ul className="list-disc pl-4 space-y-1">{product.details.map(d => <li key={d}>{d}</li>)}</ul>,
                },
                {
                  title: 'Delivery Information',
                  content: 'We deliver across Nigeria. Delivery times and fees vary by location and are configured by the store. For enquiries, contact us on 0803 689 5862 or WhatsApp +234 803 689 5862.',
                },
                {
                  title: 'Returns & Exchange',
                  content: 'Our return and exchange policy is available on request. Please contact us within 7 days of receipt. Items must be unworn, unwashed, and in original condition with tags attached.',
                },
                {
                  title: 'Care Instructions',
                  content: <ul className="space-y-1">{product.care.map(c => <li key={c}>• {c}</li>)}</ul>,
                },
              ]} />
            </div>

            {/* SKU */}
            <p className="text-xs text-stone/50 font-sans">SKU: {product.sku}</p>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Modal open={lightboxOpen} onClose={() => setLightboxOpen(false)} size="xl">
        <img src={product.images[activeImage]} alt={product.name} className="w-full object-contain max-h-[70vh]" />
        {product.images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImage(i)} className={`w-12 h-14 overflow-hidden border-2 ${activeImage === i ? 'border-gold' : 'border-border'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </Modal>

      {/* Related */}
      {related.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-20 border-t border-border mt-10">
          <h2 className="font-serif text-2xl text-charcoal mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
