import { useState, useRef, useCallback } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';
import { GoldBadge } from './GoldBadge';
import { IdbImage } from './IdbImage';
import { IdbMedia } from './IdbMedia';
import { useAppStore } from '@/stores/appStore';
import { translations } from '@/lib/data';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onOpen: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, onOpen, className }: ProductCardProps) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [fav, setFav] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const lang = useAppStore((s) => s.lang);
  const t = translations[lang];
  const addItem = useCartStore((s) => s.addItem);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -12, y: x * 12 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  }, []);

  const isSold = product.badges.includes('sold');
  const name = product.name[lang];

  return (
    <div
      ref={cardRef}
      className={cn(
        'group relative rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300',
        'bg-pale-linen dark:bg-warm-brown shadow-card dark:shadow-card-dark',
        hovered && !isSold && 'shadow-card-hover',
        isSold && 'opacity-60',
        className
      )}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${hovered ? 18 : 0}px) scale(${hovered ? 1.02 : 1})`,
        transition: 'transform 0.25s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.25s ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onOpen(product)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <IdbImage
          src={product.image}
          alt={name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-400',
            hovered && 'scale-[1.03]',
            isSold && 'grayscale-[80%] group-hover:grayscale-[40%]'
          )}
          loading="lazy"
        />

        {/* ── Video hover overlay ── */}
        {product.videos && product.videos.length > 0 && (
          <>
            <div
              className="absolute inset-0 transition-opacity duration-500 ease-in-out pointer-events-none z-[5]"
              style={{ opacity: hovered ? 1 : 0 }}
            >
              <IdbMedia
                src={product.videos[0]}
                className="w-full h-full object-cover"
                autoPlay muted loop playsInline
              />
            </div>
            {!hovered && (
              <div className="absolute bottom-10 right-3 z-10 w-5 h-5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-2.5 h-2.5 ml-0.5"><path d="M8 5v14l11-7z"/></svg>
              </div>
            )}
          </>
        )}

        {/* ── Favourite button — always visible top-left ── */}
        <button
          onClick={(e) => { e.stopPropagation(); setFav(!fav); }}
          className={cn(
            'absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10',
            fav
              ? 'bg-soft-rose text-white scale-110 shadow-md'
              : 'bg-white/75 text-deep-espresso hover:bg-white hover:scale-105 shadow-sm'
          )}
          aria-label="Favourite"
        >
          <Heart className={cn('w-3.5 h-3.5', fav && 'fill-current')} />
        </button>

        {/* ── Badges — top-right ── */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end z-10">
          {product.badges.map((b) => (
            <GoldBadge key={b} variant={b} />
          ))}
        </div>

        {/* ── Eye + Cart — bottom-right on hover ── */}
        <div className={cn(
          'absolute bottom-3 right-3 flex gap-2 transition-all duration-200 z-10',
          hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        )}>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(product); }}
            className="w-8 h-8 rounded-full bg-white/85 text-deep-espresso flex items-center justify-center hover:bg-white hover:scale-105 transition-all shadow-sm"
            aria-label="View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!product.inStock) return;
              const itemName = product.name[lang];
              const store = product.store === 'kribi' ? 'kribi' : 'yaounde';
              addItem({ productId: product.id, name: itemName, price: product.price, qty: 1, image: product.image, store });
            }}
            disabled={!product.inStock}
            aria-label={t.product.addToCart ?? 'Add to cart'}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm',
              product.inStock
                ? 'bg-white/85 text-deep-espresso hover:bg-white hover:scale-105'
                : 'bg-white/40 text-deep-espresso/40 cursor-not-allowed'
            )}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Sizes strip — top of image, full width ── */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-1 px-2 py-1.5 bg-gradient-to-b from-black/60 to-transparent overflow-x-auto scrollbar-none">
            {product.sizes.map((s) => (
              <span
                key={s}
                className="flex-shrink-0 text-[9px] font-accent font-bold text-white/90 bg-white/15 backdrop-blur-sm border border-white/20 rounded px-1.5 py-0.5 leading-none uppercase tracking-wide"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* ── Stock indicator — bottom-left ── */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5 z-10">
          <span className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            product.inStock ? 'bg-green-400' : 'bg-red-400'
          )} />
          <span className="text-[10px] font-body text-white/80">
            {product.inStock ? t.product.inStock : t.product.outOfStock}
          </span>
        </div>

        {/* Sold stamp */}
        {isSold && (
          <div className="sold-stamp">
            <span>{t.soldProducts.soldOut}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h4 className="font-display text-lg text-deep-espresso dark:text-light-cream truncate">
          {name}
        </h4>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <p className="font-body text-champagne-gold font-medium">
            {product.price.toLocaleString()} {t.currency}
          </p>
          {product.isPromo && product.originalPrice && (
            <>
              <span className="font-body text-muted-taupe line-through text-sm">
                {product.originalPrice.toLocaleString()}
              </span>
              <span className="text-[10px] font-accent font-semibold bg-soft-rose/20 dark:bg-soft-rose/30 text-soft-rose px-1.5 py-0.5 rounded uppercase tracking-wide">
                Promo
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
