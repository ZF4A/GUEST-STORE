import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface ProductGridSectionProps {
  id: string;
  caption: string;
  headline: string;
  products: Product[];
  onOpenProduct: (product: Product) => void;
  bgClass?: string;
  seeAll?: { label: string; onClick: () => void };
  pauseScroll?: boolean;
}

// ─── River Strip (for > 5 products) ──────────────────────────────────────────

function RiverStrip({
  products,
  onOpenProduct,
  pauseScroll = false,
}: {
  products: Product[];
  onOpenProduct: (p: Product) => void;
  pauseScroll?: boolean;
}) {
  const [hoverPaused, setHoverPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Resume hover-pause when the modal closes
  useEffect(() => {
    if (!pauseScroll) setHoverPaused(false);
  }, [pauseScroll]);

  const shouldPause = pauseScroll || hoverPaused;

  // Duplicate cards for seamless infinite loop (3× so short lists still fill width)
  const copies = products.length < 8 ? 4 : 2;
  const tiles = Array.from({ length: copies }, () => products).flat();

  // Duration scales with list length — longer lists move at the same apparent speed
  const duration = Math.max(18, products.length * 5);

  const handleOpen = (product: Product) => {
    setHoverPaused(true);
    onOpenProduct(product);
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        // Fade edges for luxury depth effect
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <div
        ref={trackRef}
        className={`river-track flex gap-5 w-max${shouldPause ? ' paused' : ''}`}
        style={{ '--river-duration': `${duration}s` } as React.CSSProperties}
        onMouseEnter={() => setHoverPaused(true)}
        onMouseLeave={() => { if (!pauseScroll) setHoverPaused(false); }}
      >
        {tiles.map((product, i) => (
          <div
            key={`${product.id}-${i}`}
            className="flex-shrink-0 w-[220px] sm:w-[260px] md:w-[280px]"
          >
            <ProductCard product={product} onOpen={handleOpen} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Static Grid (≤ 5 products) ──────────────────────────────────────────────

function StaticGrid({
  products,
  onOpenProduct,
}: {
  products: Product[];
  onOpenProduct: (p: Product) => void;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gridRef.current?.children;
      if (!cards) return;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 55, rotateX: -18, scale: 0.94, transformPerspective: 900 },
        {
          opacity: 1, y: 0, rotateX: 0, scale: 1,
          duration: 0.85, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: gridRef.current, start: 'top 82%' },
        }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [products]);

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onOpen={onOpenProduct} />
      ))}
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function ProductGridSection({
  id, caption, headline, products, onOpenProduct,
  bgClass = 'bg-pale-linen dark:bg-dark-cocoa',
  seeAll,
  pauseScroll = false,
}: ProductGridSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const useRiver = products.length > 5;

  // Animate header in on scroll
  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (products.length === 0) return null;

  return (
    <section id={id} ref={sectionRef} className={`section-padding ${bgClass}`}>
      {/* Header — full width padding */}
      <div className="content-max-width content-padding">
        <div ref={headerRef} className="flex items-end justify-between mb-10 opacity-0">
          <div>
            <span className="block font-accent text-xs font-semibold uppercase tracking-[0.08em] text-muted-taupe dark:text-champagne-gold/60 mb-3">
              {caption}
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-deep-espresso dark:text-light-cream tracking-[-0.02em]">
              {headline}
            </h2>
          </div>
          {seeAll && (
            <button
              onClick={seeAll.onClick}
              className="hidden md:block font-body text-sm text-deep-espresso/70 dark:text-light-cream/70 hover:text-champagne-gold transition-colors relative group"
            >
              {seeAll.label} &rarr;
              <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-champagne-gold transition-all duration-250 group-hover:w-full" />
            </button>
          )}
        </div>
      </div>

      {/* Content — river uses full viewport width; grid uses padding */}
      {useRiver ? (
        <div className="pl-[clamp(24px,5vw,80px)]">
          <RiverStrip
            products={products}
            onOpenProduct={onOpenProduct}
            pauseScroll={pauseScroll}
          />
        </div>
      ) : (
        <div className="content-max-width content-padding">
          <StaticGrid products={products} onOpenProduct={onOpenProduct} />
        </div>
      )}
    </section>
  );
}
