import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Clock } from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import { useAppStore } from '@/stores/appStore';
import { categories } from '@/lib/data';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

function timeSinceSold(soldAt: string | undefined, lang: 'fr' | 'en'): string {
  if (!soldAt) return lang === 'fr' ? 'Article vendu' : 'Item sold';
  const diff = Date.now() - new Date(soldAt).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return lang === 'fr' ? `Il y a ${mins} min` : `${mins}min ago`;
  if (hours < 24) return lang === 'fr' ? `Il y a ${hours}h` : `${hours}h ago`;
  if (days === 1) return lang === 'fr' ? 'Hier' : 'Yesterday';
  if (days < 7) return lang === 'fr' ? `Il y a ${days} jours` : `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return lang === 'fr' ? `Il y a ${weeks} sem.` : `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return lang === 'fr' ? `Il y a ${months} mois` : `${months}mo ago`;
}

function SoldCard({ product, lang }: { product: Product; lang: 'fr' | 'en' }) {
  const cat = categories.find(c => c.id === product.category);

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-deep-espresso border border-white/5 hover:border-champagne-gold/20 transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name[lang]}
          className="w-full h-full object-cover grayscale brightness-50 group-hover:brightness-40 transition-all duration-500"
          loading="lazy"
        />

        {/* VENDU stamp */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="rotate-[-18deg] border-4 border-soft-rose/60 rounded-lg px-4 py-2 opacity-80 group-hover:opacity-90 transition-opacity"
            style={{ boxShadow: '0 0 20px rgba(212,165,165,0.2)' }}
          >
            <span className="font-display text-2xl md:text-3xl font-bold text-soft-rose/80 tracking-[0.15em] uppercase select-none">
              {lang === 'fr' ? 'VENDU' : 'SOLD'}
            </span>
          </div>
        </div>

        {/* Category badge */}
        {cat && (
          <div className="absolute top-3 left-3">
            <span className="text-[9px] font-accent uppercase tracking-wider bg-black/60 text-white/60 px-2 py-1 rounded-full backdrop-blur-sm">
              {cat.name[lang]}
            </span>
          </div>
        )}

        {/* Time badge */}
        <div className="absolute bottom-3 right-3">
          <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Clock className="w-3 h-3 text-champagne-gold/70" />
            <span className="text-[10px] font-body text-light-cream/60">
              {timeSinceSold(product.soldAt, lang)}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-display text-light-cream/70 text-sm truncate group-hover:text-light-cream/90 transition-colors">
          {product.name[lang]}
        </h4>
        <p className="mt-1 font-body text-light-cream/40 line-through text-sm">
          {product.price.toLocaleString()} FCFA
        </p>
      </div>
    </div>
  );
}

export function SoldPage() {
  const { lang } = useAppStore();
  const { products, seed } = useProductStore();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useMemo(() => { seed(); }, [seed]);

  const soldProducts = useMemo(
    () => products.filter(p => p.badges.includes('sold') || !p.inStock),
    [products]
  );

  const filtered = useMemo(() =>
    activeCategory ? soldProducts.filter(p => p.category === activeCategory) : soldProducts,
    [soldProducts, activeCategory]
  );

  // Categories that have sold products
  const soldCategories = useMemo(() =>
    categories.filter(c => soldProducts.some(p => p.category === c.id)),
    [soldProducts]
  );

  return (
    <div className="dark min-h-screen bg-deep-espresso">
      <Navbar />

      {/* Hero header */}
      <div className="pt-28 pb-16 px-6 text-center relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]"
            style={{ background: 'radial-gradient(ellipse, rgba(201,169,110,0.06) 0%, transparent 70%)' }} />
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-body text-muted-taupe hover:text-champagne-gold transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {lang === 'fr' ? 'Retour à la boutique' : 'Back to shop'}
        </button>

        <div className="relative z-10">
          <span className="block font-accent text-xs font-semibold uppercase tracking-[0.15em] text-champagne-gold/60 mb-4">
            {lang === 'fr' ? 'ARCHIVE' : 'ARCHIVE'}
          </span>
          <h1 className="font-display text-4xl md:text-6xl text-light-cream tracking-[-0.02em] mb-4">
            {lang === 'fr' ? 'Pièces Vendues' : 'Sold Items'}
          </h1>
          <p className="font-body text-muted-taupe max-w-md mx-auto text-sm leading-relaxed">
            {lang === 'fr'
              ? 'Ces pièces exclusives ont trouvé leur maison. Découvrez nos articles disponibles.'
              : 'These exclusive pieces found their home. Discover our available items.'}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <p className="font-display text-3xl text-champagne-gold">{soldProducts.length}</p>
              <p className="font-accent text-[10px] uppercase tracking-wider text-muted-taupe mt-1">
                {lang === 'fr' ? 'articles vendus' : 'items sold'}
              </p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <p className="font-display text-3xl text-champagne-gold">{soldCategories.length}</p>
              <p className="font-accent text-[10px] uppercase tracking-wider text-muted-taupe mt-1">
                {lang === 'fr' ? 'catégories' : 'categories'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-champagne-gold/30 to-transparent mx-6 md:mx-16" />

      {/* Category filters */}
      {soldCategories.length > 0 && (
        <div className="content-max-width content-padding py-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-accent font-semibold uppercase tracking-wider transition-all',
                !activeCategory
                  ? 'bg-champagne-gold text-deep-espresso'
                  : 'border border-white/10 text-muted-taupe hover:text-light-cream hover:border-champagne-gold/30'
              )}
            >
              {lang === 'fr' ? 'Tout' : 'All'} ({soldProducts.length})
            </button>
            {soldCategories.map(cat => {
              const count = soldProducts.filter(p => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-accent font-semibold uppercase tracking-wider transition-all',
                    activeCategory === cat.id
                      ? 'bg-champagne-gold text-deep-espresso'
                      : 'border border-white/10 text-muted-taupe hover:text-light-cream hover:border-champagne-gold/30'
                  )}
                >
                  {cat.name[lang]} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className="content-max-width content-padding pb-20">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 text-muted-taupe/20 mx-auto mb-4" />
            <p className="font-display text-xl text-light-cream/50">
              {lang === 'fr' ? 'Aucun article vendu' : 'No sold items'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(p => (
              <SoldCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="font-body text-muted-taupe text-sm mb-4">
            {lang === 'fr'
              ? 'Vous cherchez quelque chose de disponible ?'
              : 'Looking for something available?'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 bg-champagne-gold text-deep-espresso rounded-full px-8 py-3.5 font-accent font-semibold text-sm uppercase tracking-wider hover:scale-[1.03] hover:shadow-gold transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            {lang === 'fr' ? 'Voir les articles disponibles' : 'See available items'}
          </button>
        </div>
      </div>

      <Footer />
      <CartDrawer />
    </div>
  );
}
