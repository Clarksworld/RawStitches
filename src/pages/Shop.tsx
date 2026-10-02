import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { PRODUCTS, CATEGORIES } from '../data';
import ProductCard from '../components/ProductCard';
import { SearchInput, EmptyState, Button } from '../components/ui';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['Black', 'White', 'Ivory', 'Burgundy', 'Sage', 'Cobalt', 'Terracotta', 'Dusty Rose', 'Camel', 'Emerald', 'Midnight Blue'];

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'bestselling';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') ?? '';
  const initialCategory = searchParams.get('category') ?? '';
  const initialQ = searchParams.get('q') ?? '';

  const [search, setSearch] = useState(initialQ);
  const [sort, setSort] = useState<SortKey>('newest');
  const [filterCategory, setFilterCategory] = useState(initialCategory);
  const [filterSizes, setFilterSizes] = useState<string[]>([]);
  const [filterColors, setFilterColors] = useState<string[]>([]);
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let items = [...PRODUCTS];
    if (initialFilter === 'new') items = items.filter(p => p.isNewArrival);
    if (initialFilter === 'bestsellers') items = items.filter(p => p.isBestSeller);
    if (search) items = items.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
    if (filterCategory) items = items.filter(p => p.category.toLowerCase().replace(/ /g, '-') === filterCategory || p.category === filterCategory);
    if (filterSizes.length) items = items.filter(p => filterSizes.some(s => p.sizes.includes(s)));
    if (filterColors.length) items = items.filter(p => filterColors.some(c => p.colors.includes(c)));
    if (filterAvailable) items = items.filter(p => p.stock > 0);
    if (filterMinPrice) items = items.filter(p => (p.salePrice ?? p.price) >= Number(filterMinPrice));
    if (filterMaxPrice) items = items.filter(p => (p.salePrice ?? p.price) <= Number(filterMaxPrice));
    switch (sort) {
      case 'price-asc': items.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)); break;
      case 'price-desc': items.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)); break;
      case 'bestselling': items.sort((a, b) => b.reviewCount - a.reviewCount); break;
    }
    return items;
  }, [search, sort, filterCategory, filterSizes, filterColors, filterAvailable, filterMinPrice, filterMaxPrice, initialFilter]);

  function toggleSize(s: string) {
    setFilterSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }
  function toggleColor(c: string) {
    setFilterColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-charcoal font-medium font-sans mb-3">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-stone cursor-pointer hover:text-charcoal">
            <input type="radio" name="cat" checked={!filterCategory} onChange={() => setFilterCategory('')} className="accent-gold" />
            <span className="font-sans">All</span>
          </label>
          {CATEGORIES.filter(c => c.enabled).map(cat => (
            <label key={cat.id} className="flex items-center gap-2 text-sm text-stone cursor-pointer hover:text-charcoal">
              <input type="radio" name="cat" checked={filterCategory === cat.slug} onChange={() => setFilterCategory(cat.slug)} className="accent-gold" />
              <span className="font-sans">{cat.name} ({cat.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-charcoal font-medium font-sans mb-3">Price (₦)</h4>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filterMinPrice} onChange={e => setFilterMinPrice(e.target.value)} className="w-full px-3 py-2 text-xs border border-border focus:border-gold focus:outline-none font-sans" />
          <input type="number" placeholder="Max" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} className="w-full px-3 py-2 text-xs border border-border focus:border-gold focus:outline-none font-sans" />
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="text-xs uppercase tracking-widest text-charcoal font-medium font-sans mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`w-10 h-10 text-xs font-sans border transition-colors ${filterSizes.includes(s) ? 'border-gold bg-gold text-black' : 'border-border text-stone hover:border-gold'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={filterAvailable} onChange={e => setFilterAvailable(e.target.checked)} className="accent-gold" />
        <span className="text-sm text-stone font-sans">In stock only</span>
      </label>

      {/* Clear */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => { setFilterCategory(''); setFilterSizes([]); setFilterColors([]); setFilterAvailable(false); setFilterMinPrice(''); setFilterMaxPrice(''); }}
      >
        Clear Filters
      </Button>
    </div>
  );

  const pageTitle = initialFilter === 'new' ? 'New Arrivals' : initialFilter === 'bestsellers' ? 'Best Sellers' : 'Shop';
  const pageSubtitle = initialFilter === 'new' ? 'The latest additions to our collection.'
    : initialFilter === 'bestsellers' ? 'Our most celebrated pieces.'
    : 'Explore the Raw Stitches collection.';

  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-black text-ivory py-16 px-6 lg:px-12 text-center">
        <h1 className="font-serif text-4xl lg:text-5xl mb-3">{pageTitle}</h1>
        <p className="text-ivory/50 font-sans text-sm">{pageSubtitle}</p>
        {search && <p className="text-gold text-sm mt-2 font-sans">Showing results for "{search}"</p>}
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-12 py-10">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products..." className="w-60" />
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border text-sm font-sans hover:border-gold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filters {(filterSizes.length + filterColors.length + (filterCategory ? 1 : 0) + (filterAvailable ? 1 : 0)) > 0 && `(${filterSizes.length + filterColors.length + (filterCategory ? 1 : 0) + (filterAvailable ? 1 : 0)})`}
          </button>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-stone font-sans hidden md:block">{filtered.length} products</span>
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)} className="text-sm border border-border px-3 py-2.5 focus:border-gold focus:outline-none font-sans bg-white">
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="bestselling">Best Selling</option>
            </select>
          </div>
        </div>

        <div className="flex gap-10">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-52 shrink-0">
            <FilterPanel />
          </aside>

          {/* Mobile Filters */}
          {filtersOpen && (
            <div className="lg:hidden fixed inset-0 z-40 flex">
              <div className="w-72 bg-ivory overflow-y-auto p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-lg">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)} className="text-stone hover:text-charcoal">✕</button>
                </div>
                <FilterPanel />
              </div>
              <div className="flex-1 bg-black/40" onClick={() => setFiltersOpen(false)} />
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                title="No products found"
                description="Try adjusting your search or filters to find what you're looking for."
                action={<Button variant="ghost" onClick={() => { setSearch(''); setFilterCategory(''); setFilterSizes([]); setFilterColors([]); setFilterAvailable(false); }}>Clear All Filters</Button>}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 lg:gap-7">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
