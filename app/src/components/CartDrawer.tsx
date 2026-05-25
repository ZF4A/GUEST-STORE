import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Plus, Minus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { IdbImage } from './IdbImage';
import { useAppStore } from '@/stores/appStore';
import { useCartStore, DELIVERY_FEES } from '@/stores/cartStore';
import { translations } from '@/lib/data';
import type { DeliveryZone } from '@/types';

const ZONE_LABELS: Record<DeliveryZone, { fr: string; en: string }> = {
  yaounde:       { fr: 'Yaoundé',       en: 'Yaoundé' },
  kribi:         { fr: 'Kribi',         en: 'Kribi' },
  autre_ville:   { fr: 'Autre ville',   en: 'Other city' },
  international: { fr: 'International', en: 'International' },
};

export function CartDrawer() {
  const { lang } = useAppStore();
  const {
    items, isOpen, setCartOpen, removeItem, updateQty,
    subtotal, deliveryFee, total, deliveryZone, setDeliveryZone,
  } = useCartStore();
  const t = translations[lang];
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(backdropRef.current, { opacity: 1, duration: 0.2 });
      gsap.to(drawerRef.current, { x: 0, duration: 0.4, ease: 'power3.out' });
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const close = () => {
    gsap.to(drawerRef.current, { x: '100%', duration: 0.3, ease: 'power3.in' });
    gsap.to(backdropRef.current, {
      opacity: 0, duration: 0.2, delay: 0.1,
      onComplete: () => setCartOpen(false),
    });
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) close();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const STORE_LABELS: Record<string, string> = { yaounde: 'Yaoundé', kribi: 'Kribi' };

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    const lines = items.map((i) => `• ${i.name} ×${i.qty} — ${(i.price * i.qty).toLocaleString()} FCFA (${STORE_LABELS[i.store] ?? i.store})`).join('\n');
    const zoneName = ZONE_LABELS[deliveryZone][lang];
    const message = encodeURIComponent(
      `Bonjour ! Je voudrais passer cette commande :\n\n${lines}\n\n` +
      `Sous-total : ${subtotal.toLocaleString()} FCFA\n` +
      `Livraison (${zoneName}) : ${deliveryFee.toLocaleString()} FCFA\n` +
      `*Total : ${total.toLocaleString()} FCFA*\n\nMerci !`
    );
    window.open(`https://wa.me/237695165425?text=${message}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-deep-espresso/40 backdrop-blur-[8px] opacity-0"
        onClick={close}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute top-0 right-0 h-full w-full max-w-[420px] bg-pale-linen dark:bg-warm-brown shadow-2xl translate-x-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-deep-espresso/5 dark:border-light-cream/5">
          <h3 className="font-display text-xl text-deep-espresso dark:text-light-cream flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {t.cart.title}
            {items.length > 0 && (
              <span className="text-sm font-body text-muted-taupe">({items.reduce((s, i) => s + i.qty, 0)})</span>
            )}
          </h3>
          <button
            onClick={close}
            className="w-9 h-9 rounded-full flex items-center justify-center text-deep-espresso/60 dark:text-light-cream/60 hover:bg-deep-espresso/5 dark:hover:bg-light-cream/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-muted-taupe/30 mb-4" />
              <p className="font-body text-deep-espresso/50 dark:text-light-cream/50">{t.cart.empty}</p>
              <button
                onClick={close}
                className="mt-4 text-sm font-body text-champagne-gold hover:underline"
              >
                {t.cart.discover}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-warm-cream dark:bg-dark-cocoa"
                >
                  <IdbImage
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-medium text-deep-espresso dark:text-light-cream truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-taupe mt-0.5">{item.store === 'yaounde' ? 'Yaoundé' : item.store === 'kribi' ? 'Kribi' : item.store}</p>
                    <p className="font-body text-sm text-champagne-gold mt-1">
                      {item.price.toLocaleString()} {t.currency}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="w-7 h-7 rounded-full bg-deep-espresso/5 dark:bg-light-cream/5 flex items-center justify-center hover:bg-deep-espresso/10 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-body text-sm w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="w-7 h-7 rounded-full bg-deep-espresso/5 dark:bg-light-cream/5 flex items-center justify-center hover:bg-deep-espresso/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-soft-rose/70 hover:text-soft-rose transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-deep-espresso/5 dark:border-light-cream/5 bg-pale-linen dark:bg-warm-brown space-y-4">
            {/* Delivery zone selector */}
            <div>
              <p className="flex items-center gap-1.5 font-accent text-xs font-semibold uppercase tracking-[0.08em] text-muted-taupe mb-3">
                <Truck className="w-3.5 h-3.5" />
                {lang === 'fr' ? 'Zone de livraison' : 'Delivery zone'}
              </p>
              <div className="space-y-2">
                {(Object.keys(DELIVERY_FEES) as DeliveryZone[]).map((zone) => (
                  <label
                    key={zone}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        deliveryZone === zone
                          ? 'border-champagne-gold'
                          : 'border-deep-espresso/20 dark:border-light-cream/20 group-hover:border-champagne-gold/50'
                      }`}>
                        {deliveryZone === zone && (
                          <div className="w-2 h-2 rounded-full bg-champagne-gold" />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="deliveryZone"
                        value={zone}
                        checked={deliveryZone === zone}
                        onChange={() => setDeliveryZone(zone)}
                        className="sr-only"
                      />
                      <span className="font-body text-sm text-deep-espresso dark:text-light-cream">
                        {ZONE_LABELS[zone][lang]}
                      </span>
                    </div>
                    <span className="font-body text-sm text-champagne-gold">
                      {DELIVERY_FEES[zone].toLocaleString()} {t.currency}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 pt-3 border-t border-deep-espresso/5 dark:border-light-cream/5">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-deep-espresso/70 dark:text-light-cream/70">{t.cart.subtotal}</span>
                <span className="font-body text-sm text-deep-espresso dark:text-light-cream">
                  {subtotal.toLocaleString()} {t.currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-deep-espresso/70 dark:text-light-cream/70">
                  {lang === 'fr' ? 'Livraison' : 'Delivery'}
                </span>
                <span className="font-body text-sm text-deep-espresso dark:text-light-cream">
                  {deliveryFee.toLocaleString()} {t.currency}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-deep-espresso/5 dark:border-light-cream/5">
                <span className="font-display text-base text-deep-espresso dark:text-light-cream">Total</span>
                <span className="font-display text-lg text-champagne-gold">
                  {total.toLocaleString()} {t.currency}
                </span>
              </div>
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              className="block w-full bg-champagne-gold text-deep-espresso rounded-full py-3.5 text-center font-body font-semibold text-sm uppercase tracking-wider hover:scale-[1.02] hover:shadow-gold transition-all"
            >
              {t.cart.checkout}
            </button>
            <button
              onClick={close}
              className="block w-full text-center font-body text-sm text-deep-espresso/60 dark:text-light-cream/60 hover:text-deep-espresso dark:hover:text-light-cream transition-colors"
            >
              {t.cart.continue}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
