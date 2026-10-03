import { NextResponse, type NextRequest } from 'next/server';
import { PRODUCTS } from '@/data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const query = searchParams.get('q');
  const filter = searchParams.get('filter');

  let results = [...PRODUCTS];

  if (category) {
    results = results.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (filter === 'new') {
    results = results.filter(p => p.isNewArrival);
  } else if (filter === 'bestsellers') {
    results = results.filter(p => p.isBestSeller);
  }

  return NextResponse.json({
    count: results.length,
    products: results,
  });
}
