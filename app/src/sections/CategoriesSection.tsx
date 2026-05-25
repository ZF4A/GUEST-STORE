import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ShoppingBag, Watch, Gem, Wallet, Shirt, Key, Droplets,
  Sparkles, Glasses, Wind, Crown, CircleDot, Scissors,
  Briefcase, Footprints, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { translations, categories, CATEGORY_META } from '@/lib/data';
import { useProductStore } from '@/stores/productStore';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag, Watch, Gem, Wallet, Shirt, Key, Droplets,
  Sparkles, Glasses, Wind, Crown, CircleDot, Scissors,
  Briefcase, Footprints,
};

interface CategoriesSectionProps {
  onSelectCategory: (id: string | null) => void;
  selectedCategory: string | null;
}

function CategoryCard({
  cat,
  count,
  selected,
  lang,
  onClick,
}: {
  cat: Category;
  count: number;
  selected: boolean;
  lang: 'fr' | 'en';
  onClick: () => void;
}) {
  const meta = CATEGORY_META[cat.id] ?? { gradient: ['#3D2A1A', '#8B7355'], icon: 'ShoppingBag' };
  const Icon = ICON_MAP[meta.icon] ?? ShoppingBag;
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale(1.04) translateZ(8px)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = selected
        ? 'perspective(600px) scale(1.04) translateZ(6px)'
        : 'perspective(600px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0px)';
    }
  };

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'relative group flex flex-col justify-between p-4 rounded-2xl overflow-hidden cursor-pointer text-left',
        'transition-shadow duration-300',
        selected
          ? 'ring-2 ring-champagne-gold shadow-[0_0_0_2px_rgba(201,169,110,0.4)]'
          : 'ring-1 ring-white/10 hover:shadow-card-hover'
      )}
      style={{
        transition: 'transform 0.2s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease',
        minHeight: '160px',
      }}
    >
      {/* Photo background */}
      <div className="absolute inset-0">
        {cat.image ? (
          <img
            src={cat.image}
            alt={cat.name[lang]}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(145deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }} />
        )}
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        {/* Gold tint when selected */}
        {selected && <div className="absolute inset-0 bg-champagne-gold/15" />}
      </div>

      {/* Small icon badge top-right */}
      <div className={cn(
        'relative z-10 self-end w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors',
        selected ? 'bg-champagne-gold/40' : 'bg-white/10 group-hover:bg-white/20'
      )}>
        <Icon className="w-4 h-4 text-white" />
      </div>

      {/* Text content — bottom */}
      <div className="relative z-10 mt-auto">
        <p className="font-display text-sm text-white leading-tight drop-shadow-md">
          {cat.name[lang]}
        </p>
        {count > 0 ? (
          <p className="mt-0.5 font-accent text-[10px] text-champagne-gold uppercase tracking-wider">
            {count} {count === 1 ? 'article' : 'articles'}
          </p>
        ) : (
          <p className="mt-0.5 font-accent text-[10px] text-white/40 uppercase tracking-wider">
            {lang === 'fr' ? 'À venir' : 'Coming soon'}
          </p>
        )}
      </div>

      {/* Bottom arrow */}
      <div className={cn(
        'absolute bottom-3 right-3 z-10 transition-all',
        selected ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-70 translate-x-1 group-hover:translate-x-0'
      )}>
        <ChevronRight className="w-4 h-4 text-champagne-gold" />
      </div>
    </button>
  );
}

export function CategoriesSection({ onSelectCategory, selectedCategory }: CategoriesSectionProps) {
  const { lang } = useAppStore();
  const t = translations[lang];
  const { products } = useProductStore();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Count products per category
  const countByCategory = categories.reduce<Record<string, number>>((acc, cat) => {
    acc[cat.id] = products.filter(p => p.category === cat.id).length;
    return acc;
  }, {});

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.children;
      if (!cards) return;
      gsap.fromTo(cards,
        { opacity: 0, y: 40, scale: 0.92 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.55, stagger: 0.06, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleClick = (id: string) => {
    onSelectCategory(selectedCategory === id ? null : id);
    if (selectedCategory !== id) {
      setTimeout(() => {
        const el = document.getElementById('category-browse');
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 64;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <section id="categories" ref={sectionRef} className="section-padding bg-warm-cream dark:bg-dark-cocoa">
      <div className="content-max-width content-padding">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="block font-accent text-xs font-semibold uppercase tracking-[0.08em] text-muted-taupe mb-3">
              {t.categories.caption}
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-deep-espresso dark:text-light-cream tracking-[-0.02em]">
              {t.categories.headline}
            </h2>
          </div>
          {selectedCategory && (
            <button
              onClick={() => onSelectCategory(null)}
              className="flex items-center gap-1.5 text-sm font-body text-champagne-gold hover:text-champagne-gold/70 transition-colors"
            >
              {t.categories.all}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
        >
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              count={countByCategory[cat.id] ?? 0}
              selected={selectedCategory === cat.id}
              lang={lang}
              onClick={() => handleClick(cat.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
