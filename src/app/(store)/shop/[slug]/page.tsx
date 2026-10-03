import ProductDetail from '@/views/ProductDetail';
import { PRODUCTS } from '@/data';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return PRODUCTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find(p => p.slug === slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Raw Stitches`,
      description: product.description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default function ProductDetailPage() {
  return <ProductDetail />;
}
