import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Tag, Sparkles } from 'lucide-react';
import { useProductStore } from '@/stores/productStore';
import { useAppStore } from '@/stores/appStore';
import { useCartStore } from '@/stores/cartStore';
import { categories, translations } from '@/lib/data';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { cn } from '@/lib/utils';
import type { Product } from '@/types';

// ─── Golden Confetti ──────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#C9A96E', '#E6C2BF', '#FFD700', '#F5EDE4', '#D4A5A5', '#8B6914', '#FFFACD'];

function GoldenConfetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Piece = {
      x: number; y: number; w: number; h: number;
      r: number; dr: number; speed: number;
      color: string; opacity: number; shape: 'rect' | 'circle' | 'diamond';
    };

    const pieces: Piece[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * (canvas.width || window.innerWidth),
      y: Math.random() * (canvas.height || window.innerHeight) - (canvas.height || window.innerHeight),
      w: Math.random() * 10 + 4,
      h: Math.random() * 5 + 2,
      r: Math.random() * Math.PI * 2,
      dr: (Math.random() - 0.5) * 0.04,
      speed: Math.random() * 1.8 + 0.4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      opacity: Math.random() * 0.6 + 0.25,
      shape: (['rect', 'rect', 'circle', 'diamond'] as const)[Math.floor(Math.random() * 4)],
    }));

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const W = canvas.width;
      const H = canvas.height;

      pieces.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -p.h);
          ctx.lineTo(p.w / 2, 0);
          ctx.lineTo(0, p.h);
          ctx.lineTo(-p.w / 2, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx.restore();

        p.y += p.speed;
        p.r += p.dr;
        p.x += Math.sin(p.y / 60) * 0.6;

        if (p.y > H + 15) {
          p.y = -15;
          p.x = Math.random() * W;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

// ─── Sale Card ────────────────────────────────────────────────────────────────

function SaleCard({ product, lang, onOpen }: { product: Product; lang: 'fr' | 'en'; onOpen: (p: Product) => void }) {
  const t = translations[lang];
  const addItem = useCartStore(s => s.addItem);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    addItem({
      productId: product.id,
      name: product.name[lang],
      price: product.price,
      qty: 1,
      image: product.image,
      store: product.store === 'kribi' ? 'kribi' : 'yaounde',
    });
  };

  return (
    <div
      onClick={() => onOpen(product)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer bg-white dark:bg-warm-brown border border-champagne-gold/20 hover:border-champagne-gold/50 hover:shadow-gold transition-all duration-300 hover:-translate-y-1"
      style={{ position: 'relative', zIndex: 2 }}
    >
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-soft-rose text-white text-xs font-accent font-bold px-2.5 py-1 rounded-full shadow-sm">
            -{discount}%
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name[lang]}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] font-accent uppercase tracking-wider text-muted-taupe dark:text-champagne-gold/60 mb-1">
          {categories.find(c => c.id === product.category)?.name[lang]}
        </p>
        <h4 className="font-display text-deep-espresso dark:text-light-cream text-base truncate">{product.name[lang]}</h4>

        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="font-body font-semibold text-champagne-gold text-lg">
            {product.price.toLocaleString()} {t.currency}
          </span>
          {product.originalPrice && (
            <span className="font-body text-muted-taupe line-through text-sm">
              {product.originalPrice.toLocaleString()} {t.currency}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={!product.inStock}
          className={cn(
            'mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-accent font-semibold text-xs uppercase tracking-wider transition-all',
            product.inStock
              ? 'bg-champagne-gold text-deep-espresso hover:bg-champagne-gold/90 hover:scale-[1.02]'
              : 'bg-muted-taupe/20 text-muted-taupe cursor-not-allowed'
          )}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          {product.inStock ? (lang === 'fr' ? 'Ajouter au panier' : 'Add to cart') : (lang === 'fr' ? 'Épuisé' : 'Sold out')}
        </button>
      </div>
    </div>
  );
}

// ─── SalesPage ────────────────────────────────────────────────────────────────

export function SalesPage() {
  const { lang } = useAppStore();
  const { products, seed } = useProductStore();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);
  useMemo(() => { seed(); }, [seed]);

  const saleProducts = useMemo(
    () => products.filter(p => p.isPromo && !p.badges.includes('sold')),
    [products]
  );

  const saleCategories = useMemo(
    () => categories.filter(c => saleProducts.some(p => p.category === c.id)),
    [saleProducts]
  );

  const filtered = useMemo(
    () => activeCategory ? saleProducts.filter(p => p.category === activeCategory) : saleProducts,
    [saleProducts, activeCategory]
  );

  const totalSavings = useMemo(
    () => saleProducts.reduce((acc, p) => acc + ((p.originalPrice ?? p.price) - p.price), 0),
    [saleProducts]
  );

  return (
    <div className="dark min-h-screen bg-deep-espresso relative">
      <GoldenConfetti />

      <Navbar />

      {/* Hero */}
      <div className="relative pt-28 pb-16 px-6 text-center overflow-hidden" style={{ zIndex: 2 }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
            style={{ background: 'radial-gradient(ellipse, rgba(201,169,110,0.10) 0%, transparent 70%)' }} />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-champagne-gold/10 border border-champagne-gold/30 rounded-full px-5 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-champagne-gold" />
            <span className="font-accent text-xs font-semibold uppercase tracking-[0.15em] text-champagne-gold">
              {lang === 'fr' ? 'Offres spéciales' : 'Special Offers'}
            </span>
            <Sparkles className="w-4 h-4 text-champagne-gold" />
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-light-cream tracking-[-0.02em] mb-4">
            {lang === 'fr' ? (
              <>Ventes <span className="gold-gradient-text">Exclusives</span></>
            ) : (
              <>Exclusive <span className="gold-gradient-text">Sales</span></>
            )}
          </h1>
          <p className="font-body text-muted-taupe max-w-md mx-auto text-sm leading-relaxed">
            {lang === 'fr'
              ? 'Des pièces d\'exception à prix réduit, pour une durée limitée.'
              : 'Exceptional pieces at reduced prices, for a limited time.'}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="font-display text-3xl text-champagne-gold">{saleProducts.length}</p>
              <p className="font-accent text-[10px] uppercase tracking-wider text-muted-taupe mt-1">
                {lang === 'fr' ? 'articles en promo' : 'items on sale'}
              </p>
            </div>
            {totalSavings > 0 && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="font-display text-3xl text-champagne-gold">
                    {totalSavings.toLocaleString()}
                  </p>
                  <p className="font-accent text-[10px] uppercase tracking-wider text-muted-taupe mt-1">
                    FCFA {lang === 'fr' ? 'd\'économies' : 'in savings'}
                  </p>
                </div>
              </>
            )}
            {saleCategories.length > 0 && (
              <>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="font-display text-3xl text-champagne-gold">{saleCategories.length}</p>
                  <p className="font-accent text-[10px] uppercase tracking-wider text-muted-taupe mt-1">
                    {lang === 'fr' ? 'catégories' : 'categories'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-champagne-gold/40 to-transparent mx-6 md:mx-16" style={{ zIndex: 2, position: 'relative' }} />

      {/* Category filters */}
      {saleCategories.length > 0 && (
        <div className="content-max-width content-padding py-8" style={{ position: 'relative', zIndex: 2 }}>
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
              {lang === 'fr' ? 'Tout' : 'All'} ({saleProducts.length})
            </button>
            {saleCategories.map(cat => {
              const count = saleProducts.filter(p => p.category === cat.id).length;
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
      <div className="content-max-width content-padding pb-24" style={{ position: 'relative', zIndex: 2 }}>
        {filtered.length === 0 ? (
          <div className="text-center py-32">
            <Tag className="w-16 h-16 text-muted-taupe/20 mx-auto mb-4" />
            <p className="font-display text-xl text-light-cream/50">
              {lang === 'fr' ? 'Aucune promotion en cours' : 'No promotions currently'}
            </p>
            <p className="font-body text-muted-taupe text-sm mt-2">
              {lang === 'fr' ? 'Revenez bientôt pour découvrir nos offres.' : 'Come back soon for our offers.'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-8 inline-flex items-center gap-2 bg-champagne-gold text-deep-espresso rounded-full px-8 py-3.5 font-accent font-semibold text-sm uppercase tracking-wider hover:scale-[1.03] hover:shadow-gold transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              {lang === 'fr' ? 'Voir tous les articles' : 'Browse all items'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {filtered.map(p => (
              <SaleCard key={p.id} product={p} lang={lang} onOpen={setSelectedProduct} />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-16 text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 border border-champagne-gold/30 text-champagne-gold rounded-full px-8 py-3.5 font-accent font-semibold text-sm uppercase tracking-wider hover:bg-champagne-gold/10 hover:scale-[1.02] transition-all"
            >
              {lang === 'fr' ? 'Voir tous les articles' : 'Browse all items'}
            </button>
          </div>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Footer />
      </div>
      <CartDrawer />
    </div>
  );
}
