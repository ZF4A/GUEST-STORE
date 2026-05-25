import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { translations } from '@/lib/data';

interface GoldBadgeProps {
  variant: 'trending' | 'new' | 'premium' | 'sold';
  className?: string;
}

export function GoldBadge({ variant, className }: GoldBadgeProps) {
  const lang = useAppStore((s) => s.lang);
  const t = translations[lang];

  const styles = {
    trending: 'bg-champagne-gold text-deep-espresso',
    new: 'bg-green-600 text-white',
    premium: 'bg-champagne-gold text-deep-espresso',
    sold: 'bg-soft-rose/80 text-white',
  };

  return (
    <span
      className={cn(
        'inline-block rounded-full px-3.5 py-1 font-accent text-[11px] font-semibold uppercase tracking-wider',
        variant === 'new' && 'animate-pulse-badge',
        styles[variant],
        className
      )}
    >
      {t.badges[variant]}
    </span>
  );
}
