import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ProductCard } from '@/components/ProductCard';
import { useAppStore } from '@/stores/appStore';
import { translations } from '@/lib/data';
import type { Product } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface PremiumSectionProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
}

export function PremiumSection({ products, onOpenProduct }: PremiumSectionProps) {
  const { lang } = useAppStore();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const premiumProducts = products.filter((p) => p.badges.includes('premium'));
  const featured = premiumProducts[0];
  const others = premiumProducts.slice(1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(featuredRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );
      const cards = gridRef.current?.children;
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 40, rotateX: -8 },
          {
            opacity: 1, y: 0, rotateX: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
            scrollTrigger: { trigger: gridRef.current, start: 'top 85%' },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!featured) return null;

  return (
    <section id="premium" ref={sectionRef} className="section-padding bg-deep-espresso">
      <div className="content-max-width content-padding">
        <div className="text-center mb-12">
          <span className="block font-accent text-xs font-semibold uppercase tracking-[0.08em] text-light-cream/50 mb-3">
            {t.premium.caption}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-light-cream tracking-[-0.02em]">
            {t.premium.headline}
          </h2>
        </div>

        {/* Featured card */}
        <div ref={featuredRef} className="mb-6 opacity-0">
          <button
            onClick={() => onOpenProduct(featured)}
            className="group relative w-full rounded-2xl overflow-hidden shadow-gold-deep hover:shadow-gold transition-shadow duration-300"
          >
            <div className="aspect-[16/9] md:aspect-[21/9]">
              <img
                src={featured.image}
                alt={featured.name[lang]}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-espresso/80 via-deep-espresso/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <span className="inline-block bg-champagne-gold text-deep-espresso font-accent text-[11px] font-semibold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3">
                  {t.badges.premium}
                </span>
                <h3 className="font-display text-2xl md:text-3xl text-light-cream">{featured.name[lang]}</h3>
                <p className="mt-1 font-body text-champagne-gold text-lg">
                  {featured.price.toLocaleString()} {t.currency}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* 3 smaller cards */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {others.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={onOpenProduct} />
          ))}
        </div>
      </div>
    </section>
  );
}
