import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { X, Search, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useProductStore } from '@/stores/productStore';
import { categories, CATEGORY_META } from '@/lib/data';
import {
  ShoppingBag, Watch, Gem, Wallet, Shirt, Key, Droplets,
  Sparkles, Glasses, Wind, Crown, CircleDot, Scissors,
  Briefcase, Footprints,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag, Watch, Gem, Wallet, Shirt, Key, Droplets,
  Sparkles, Glasses, Wind, Crown, CircleDot, Scissors,
  Briefcase, Footprints,
};

function useTypewriter(phrases: string[], typingSpeed = 65, deletingSpeed = 32, pauseMs = 2200) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx % phrases.length];
    let timeout: ReturnType<typeof setTimeout>;
    if (!isDeleting && displayed === current) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    } else {
      timeout = setTimeout(() => {
        setDisplayed(isDeleting
          ? current.slice(0, displayed.length - 1)
          : current.slice(0, displayed.length + 1)
        );
      }, isDeleting ? deletingSpeed : typingSpeed);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

const SUGGESTIONS = {
  fr: [
    'Rechercher un sac à main luxe...',
    'Trouver une montre élégante...',
    'Explorer les chaussures tendance...',
    'Découvrir les nouveautés...',
    'Chercher un bracelet doré...',
    'Trouver un portefeuille premium...',
    'Lunettes de soleil designer...',
    'Parfum exclusif...',
  ],
  en: [
    'Search luxury handbags...',
    'Find an elegant watch...',
    'Browse trending shoes...',
    'Discover new arrivals...',
    'Search gold bracelets...',
    'Find a premium wallet...',
    'Designer sunglasses...',
    'Exclusive perfume...',
  ],
};

function ResultCard({ product, lang, onSelect }: { product: Product; lang: 'fr' | 'en'; onSelect: (p: Product) => void }) {
  const cat = categories.find(c => c.id === product.category);
  return (
    <button
      onClick={() => onSelect(product)}
      className="group flex items-center gap-4 w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-warm-brown shrink-0 relative">
        <img src={product.image} alt={product.name[lang]}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-[8px] text-white font-accent uppercase">Épuisé</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-light-cream truncate text-sm group-hover:text-champagne-gold transition-colors">
          {product.name[lang]}
        </p>
        <p className="text-xs text-muted-taupe font-body mt-0.5">
          {cat?.name[lang] ?? product.category}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-body text-sm text-champagne-gold font-medium">
            {product.price.toLocaleString()} FCFA
          </span>
          {product.isPromo && product.originalPrice && (
            <span className="text-[10px] text-muted-taupe line-through">
              {product.originalPrice.toLocaleString()}
            </span>
          )}
          {product.badges.length > 0 && (
            <span className="text-[9px] bg-champagne-gold/20 text-champagne-gold px-1.5 py-0.5 rounded-full font-accent uppercase">
              {product.badges[0]}
            </span>
          )}
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-taupe/40 group-hover:text-champagne-gold group-hover:translate-x-1 transition-all shrink-0" />
    </button>
  );
}

interface SearchOverlayProps {
  onSelectProduct: (product: Product) => void;
}

export function SearchOverlay({ onSelectProduct }: SearchOverlayProps) {
  const { lang, searchOpen, setSearchOpen } = useAppStore();
  const { products: allProducts } = useProductStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc'>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = SUGGESTIONS[lang];
  const placeholder = useTypewriter(suggestions);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      setQuery('');
      setActiveCategory(null);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = allProducts;

    // Category filter
    if (activeCategory) {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // Text search
    if (q) {
      filtered = filtered.filter(p =>
        p.name[lang].toLowerCase().includes(q) ||
        p.name[lang === 'fr' ? 'en' : 'fr'].toLowerCase().includes(q) ||
        p.description[lang].toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.badges.some(b => b.toLowerCase().includes(q)) ||
        (q === 'promo' && p.isPromo) ||
        (q === 'nouveau' && p.badges.includes('new')) ||
        (q === 'new' && p.badges.includes('new')) ||
        (q === 'premium' && p.badges.includes('premium'))
      );
    }

    // Sort
    if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);

    return filtered;
  }, [query, allProducts, lang, activeCategory, sortBy]);

  // Group by category when no query
  const grouped = useMemo(() => {
    if (query.trim()) return null;
    const groups: Record<string, Product[]> = {};
    results.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [results, query]);

  const handleSelect = useCallback((product: Product) => {
    setSearchOpen(false);
    onSelectProduct(product);
  }, [setSearchOpen, onSelectProduct]);

  // Categories that have products
  const categoriesWithProducts = useMemo(() =>
    categories.filter(c => allProducts.some(p => p.category === c.id)),
    [allProducts]
  );

  if (!searchOpen) return null;

  const hasQuery = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ background: 'rgba(12, 8, 4, 0.94)', backdropFilter: 'blur(24px)' }}>
      {/* Search bar */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-light-cream/[0.07]">
        <Search className="w-5 h-5 text-champagne-gold shrink-0" />
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent font-body text-lg md:text-xl text-light-cream placeholder:text-transparent outline-none"
          />
          {!query && (
            <span className="absolute inset-0 flex items-center pointer-events-none font-body text-lg md:text-xl text-muted-taupe/50" aria-hidden>
              {placeholder}
              <span className="ml-[1px] inline-block w-[2px] h-[1.1em] bg-champagne-gold/70 align-middle animate-[caret-blink_1s_ease-out_infinite]" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-taupe hover:text-light-cream transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center border transition-all',
              showFilters
                ? 'border-champagne-gold/50 text-champagne-gold bg-champagne-gold/10'
                : 'border-light-cream/10 text-muted-taupe hover:text-light-cream hover:border-champagne-gold/30'
            )}
            aria-label="Filtres"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSearchOpen(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-light-cream/10 text-muted-taupe hover:text-light-cream hover:border-champagne-gold/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="flex items-center gap-3 px-6 py-3 border-b border-light-cream/[0.05] bg-white/[0.02]">
          <span className="text-xs text-muted-taupe font-accent uppercase tracking-wider shrink-0">
            {lang === 'fr' ? 'Trier' : 'Sort'}
          </span>
          {[
            { value: 'relevance', label: lang === 'fr' ? 'Pertinence' : 'Relevance' },
            { value: 'price-asc', label: lang === 'fr' ? 'Prix ↑' : 'Price ↑' },
            { value: 'price-desc', label: lang === 'fr' ? 'Prix ↓' : 'Price ↓' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value as typeof sortBy)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-accent transition-all',
                sortBy === opt.value
                  ? 'bg-champagne-gold text-deep-espresso font-semibold'
                  : 'border border-light-cream/10 text-muted-taupe hover:text-light-cream hover:border-champagne-gold/30'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Category chips */}
      <div className="flex gap-2 px-6 py-3 overflow-x-auto border-b border-light-cream/[0.05] scrollbar-hide">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-accent transition-all',
            !activeCategory
              ? 'bg-champagne-gold text-deep-espresso font-semibold'
              : 'border border-light-cream/10 text-muted-taupe hover:text-light-cream hover:border-champagne-gold/30'
          )}
        >
          {lang === 'fr' ? 'Tout' : 'All'}
        </button>
        {categoriesWithProducts.map(cat => {
          const meta = CATEGORY_META[cat.id];
          const Icon = meta ? (ICON_MAP[meta.icon] ?? ShoppingBag) : ShoppingBag;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={cn(
                'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-accent transition-all',
                activeCategory === cat.id
                  ? 'bg-champagne-gold text-deep-espresso font-semibold'
                  : 'border border-light-cream/10 text-muted-taupe hover:text-light-cream hover:border-champagne-gold/30'
              )}
            >
              <Icon className="w-3 h-3" />
              {cat.name[lang]}
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">
          {/* With search query */}
          {hasQuery && (
            <>
              {results.length === 0 ? (
                <div className="text-center py-16">
                  <Search className="w-12 h-12 mx-auto text-muted-taupe/20 mb-4" />
                  <p className="text-muted-taupe font-body text-sm">
                    {lang === 'fr'
                      ? `Aucun résultat pour "${query}"`
                      : `No results for "${query}"`}
                  </p>
                  <p className="text-muted-taupe/50 font-body text-xs mt-2">
                    {lang === 'fr'
                      ? 'Essayez un autre terme ou explorez nos catégories'
                      : 'Try another term or browse our categories'}
                  </p>
                </div>
              ) : (
                <>
                  <p className="font-accent text-[10px] uppercase tracking-wider text-muted-taupe mb-4">
                    {results.length} {lang === 'fr' ? 'résultat(s)' : 'result(s)'}
                    {activeCategory && ` · ${categories.find(c => c.id === activeCategory)?.name[lang]}`}
                  </p>
                  <div className="space-y-1">
                    {results.map(p => (
                      <ResultCard key={p.id} product={p} lang={lang} onSelect={handleSelect} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* No query — show grouped by category or category browse */}
          {!hasQuery && !activeCategory && (
            <div className="space-y-8">
              <div className="text-center pt-6 pb-2">
                <p className="font-body text-muted-taupe/50 text-sm">
                  {lang === 'fr'
                    ? 'Tapez pour chercher · ou sélectionnez une catégorie ci-dessus'
                    : 'Type to search · or select a category above'}
                </p>
              </div>
              {/* Show a few items from each category */}
              {Object.entries(grouped ?? {}).slice(0, 4).map(([catId, prods]) => {
                const cat = categories.find(c => c.id === catId);
                if (!cat || prods.length === 0) return null;
                const meta = CATEGORY_META[catId];
                const Icon = meta ? (ICON_MAP[meta.icon] ?? ShoppingBag) : ShoppingBag;
                return (
                  <div key={catId}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${meta?.gradient[0] ?? '#3D2A1A'}, ${meta?.gradient[1] ?? '#8B7355'})` }}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <p className="font-accent text-[11px] uppercase tracking-wider text-champagne-gold">
                        {cat.name[lang]}
                      </p>
                      <span className="text-[10px] text-muted-taupe font-body">· {prods.length} articles</span>
                    </div>
                    <div className="space-y-1">
                      {prods.slice(0, 3).map(p => (
                        <ResultCard key={p.id} product={p} lang={lang} onSelect={handleSelect} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Category selected, no query */}
          {!hasQuery && activeCategory && (
            <>
              <p className="font-accent text-[10px] uppercase tracking-wider text-muted-taupe mb-4">
                {results.length} {lang === 'fr' ? 'article(s)' : 'item(s)'} · {categories.find(c => c.id === activeCategory)?.name[lang]}
              </p>
              {results.length === 0 ? (
                <p className="text-center text-muted-taupe font-body text-sm py-12">
                  {lang === 'fr' ? 'Aucun article dans cette catégorie.' : 'No items in this category.'}
                </p>
              ) : (
                <div className="space-y-1">
                  {results.map(p => (
                    <ResultCard key={p.id} product={p} lang={lang} onSelect={handleSelect} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
