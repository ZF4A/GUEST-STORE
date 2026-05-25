import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';
import { GoldBadge } from './GoldBadge';
import { IdbImage } from './IdbImage';
import { useAppStore } from '@/stores/appStore';
import { translations } from '@/lib/data';
import type { Product } from '@/types';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function ImageGallery({ product }: { product: Product }) {
  const gallery = (product.images && product.images.length > 0) ? product.images : [product.image];
  const [activeIdx, setActiveIdx] = useState(0);
  const hasMultiple = gallery.length > 1;

  useEffect(() => { setActiveIdx(0); }, [product.id]);

  const prev = () => setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length);
  const next = () => setActiveIdx((i) => (i + 1) % gallery.length);

  return (
    <div className="flex flex-col h-full">
      {/* Main image */}
      <div className="relative flex-1 overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none bg-warm-cream dark:bg-dark-cocoa">
        <IdbImage
          key={activeIdx}
          src={gallery[activeIdx]}
          alt={`${product.name.fr} ${activeIdx + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Badges */}
        {product.badges.length > 0 && (
          <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
            {product.badges.map((b) => (
              <GoldBadge key={b} variant={b} />
            ))}
          </div>
        )}

        {/* Arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <span className="absolute bottom-3 right-3 bg-black/40 text-white text-xs font-accent px-2 py-1 rounded-full">
              {activeIdx + 1} / {gallery.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto p-3 scrollbar-hide">
          {gallery.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                'flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all',
                i === activeIdx ? 'border-champagne-gold' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <IdbImage src={src} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ProductDetailProps {
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
  onOpenProduct: (product: Product) => void;
}

export function ProductDetail({ product, allProducts, onClose, onOpenProduct }: ProductDetailProps) {
  const { lang } = useAppStore();
  const t = translations[lang];
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const defaultStore = (p: Product | null): 'yaounde' | 'kribi' =>
    p?.store === 'kribi' ? 'kribi' : 'yaounde';

  const [selectedStore, setSelectedStore] = useState<'yaounde' | 'kribi'>(() => defaultStore(product));
  const [fav, setFav] = useState(false);
  const { addItem } = useCartStore();

  useEffect(() => {
    setSelectedStore(defaultStore(product));
  }, [product?.id]);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id && p.inStock)
      .slice(0, 4);
  }, [product, allProducts]);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = 'hidden';
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && product) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [product, onClose]);

  const handleClose = () => {
    gsap.to(cardRef.current, { opacity: 0, scale: 0.95, duration: 0.2 });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, delay: 0.1, onComplete: onClose });
  };

  const handleWhatsAppOrder = () => {
    if (!product) return;
    const name = product.name[lang];
    const price = `${product.price.toLocaleString()} FCFA`;
    const store = selectedStore === 'yaounde' ? 'Yaoundé' : 'Kribi';
    const message = encodeURIComponent(`Bonjour! Je souhaite commander:\n\n*${name}*\nPrix: ${price}\nBoutique: ${store}\n\nMerci!`);
    const phone = selectedStore === 'yaounde' ? '237672714400' : '237695165425';
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleAddToCart = () => {
    if (!product || !product.inStock) return;
    const name = product.name[lang];
    addItem({ productId: product.id, name, price: product.price, qty: 1, image: product.image, store: selectedStore });
  };

  if (!product) return null;

  const name = product.name[lang];
  const description = product.description[lang];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 opacity-0"
      style={{ backgroundColor: 'rgba(245, 237, 228, 0.85)', backdropFilter: 'blur(20px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      <div
        ref={cardRef}
        className="relative bg-pale-linen dark:bg-warm-brown rounded-3xl shadow-[0_24px_80px_rgba(28,18,10,0.2)] max-w-[1100px] w-full max-h-[90vh] overflow-y-auto opacity-0"
      >
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-10 w-10 h-10 rounded-full bg-warm-cream/80 dark:bg-dark-cocoa/80 flex items-center justify-center text-deep-espresso dark:text-light-cream hover:bg-warm-cream transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Image gallery */}
          <div className="md:sticky md:top-0 md:max-h-[90vh]">
            <ImageGallery product={product} />
          </div>

          {/* Details */}
          <div className="p-6 md:p-10 flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl md:text-3xl text-deep-espresso dark:text-light-cream">
                  {name}
                </h2>
                <button
                  onClick={() => setFav(!fav)}
                  className={cn(
                    'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all',
                    fav ? 'bg-soft-rose text-white' : 'bg-warm-cream dark:bg-dark-cocoa text-deep-espresso dark:text-light-cream'
                  )}
                >
                  <svg viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              {/* Price */}
              <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-body text-xl text-champagne-gold font-medium">
                  {product.price.toLocaleString()} {t.currency}
                </p>
                {product.isPromo && product.originalPrice && (
                  <>
                    <span className="font-body text-muted-taupe line-through text-base">
                      {product.originalPrice.toLocaleString()} {t.currency}
                    </span>
                    <span className="text-[10px] font-accent font-semibold bg-soft-rose/20 text-soft-rose px-2 py-0.5 rounded uppercase tracking-wide">
                      Promo
                    </span>
                  </>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className={cn('w-2 h-2 rounded-full', product.inStock ? 'bg-green-500' : 'bg-red-400')} />
                <span className="font-body text-sm text-deep-espresso/70 dark:text-light-cream/70">
                  {product.inStock ? t.product.inStock : t.product.outOfStock}
                </span>
              </div>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4">
                  <p className="font-accent text-xs font-semibold uppercase tracking-[0.08em] text-muted-taupe mb-2">
                    {lang === 'fr' ? 'Tailles disponibles' : 'Available sizes'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-lg border border-champagne-gold/40 bg-champagne-gold/10 font-accent text-xs font-bold text-champagne-gold uppercase tracking-wide"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <p className="font-accent text-xs font-semibold uppercase tracking-[0.08em] text-muted-taupe mb-2">
                    {lang === 'fr' ? 'Couleurs disponibles' : 'Available colors'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <span
                        key={c}
                        className="px-3 py-1.5 rounded-lg border border-deep-espresso/15 dark:border-light-cream/15 bg-warm-cream dark:bg-dark-cocoa font-body text-xs text-deep-espresso/80 dark:text-light-cream/80"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-4 font-body text-sm text-deep-espresso/70 dark:text-light-cream/70 leading-relaxed">
                {description}
              </p>

              {/* Store selector */}
              <div className="mt-6">
                <p className="font-accent text-xs font-semibold uppercase tracking-[0.08em] text-muted-taupe mb-3">
                  {t.product.selectStore}
                </p>
                <div className="flex gap-3">
                  {(['yaounde', 'kribi'] as const)
                    .filter((store) => product.store === 'both' || product.store === store)
                    .map((store) => (
                    <button
                      key={store}
                      onClick={() => setSelectedStore(store)}
                      className={cn(
                        'px-5 py-2.5 rounded-full font-body text-sm transition-all',
                        selectedStore === store
                          ? 'bg-champagne-gold text-deep-espresso'
                          : 'bg-warm-cream dark:bg-dark-cocoa text-deep-espresso/70 dark:text-light-cream/70 hover:bg-warm-cream/80'
                      )}
                    >
                      {t.product[store]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleWhatsAppOrder}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-full py-3.5 px-6 font-body font-semibold text-sm uppercase tracking-wider hover:scale-[1.03] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <WhatsAppIcon />
                {t.product.orderWhatsapp}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex items-center justify-center gap-2 rounded-full py-3.5 px-6 font-body font-semibold text-sm uppercase tracking-wider transition-all border bg-champagne-gold text-deep-espresso hover:scale-[1.03] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.product.addToCart ?? 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <div className="p-6 md:p-10 border-t border-deep-espresso/5 dark:border-light-cream/5">
            <h3 className="font-display text-lg text-deep-espresso dark:text-light-cream mb-4">
              {t.product.similar}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similarProducts.map((p) => (
                <button key={p.id} onClick={() => onOpenProduct(p)} className="group text-left">
                  <div className="aspect-square rounded-xl overflow-hidden bg-warm-cream dark:bg-warm-brown">
                    <IdbImage
                      src={p.image}
                      alt={p.name[lang]}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 font-body text-sm text-deep-espresso dark:text-light-cream truncate">{p.name[lang]}</p>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <p className="font-body text-xs text-champagne-gold">{p.price.toLocaleString()} {t.currency}</p>
                    {p.isPromo && p.originalPrice && (
                      <span className="font-body text-[10px] text-muted-taupe line-through">{p.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
