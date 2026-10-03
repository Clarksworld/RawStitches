import ProductDetail from '@/views/ProductDetail';
import { getProductBySlug, getProducts } from '@/db/queries';
import { PRODUCTS } from '@/data';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const products = await getProducts();
    if (products && products.length > 0) {
      return products.map((p) => ({ slug: p.slug }));
    }
  } catch (error) {
    console.warn('generateStaticParams fallback:', error);
  }
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found | Raw Stitches' };

  return {
    title: `${product.name} | Raw Stitches`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Raw Stitches`,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return <ProductDetail initialProduct={product} />;
}
