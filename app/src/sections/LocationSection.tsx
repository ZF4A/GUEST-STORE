import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { translations, storeLocations } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export function LocationSection() {
  const { lang } = useAppStore();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current?.querySelectorAll('.store-card') || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="location" ref={sectionRef} className="section-padding bg-warm-cream dark:bg-dark-cocoa">
      <div className="content-max-width content-padding">
        <div className="text-center mb-10">
          <span className="block font-accent text-xs font-semibold uppercase tracking-[0.08em] text-muted-taupe dark:text-champagne-gold/60 mb-3">
            {t.location.caption}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-deep-espresso dark:text-light-cream tracking-[-0.02em]">
            {t.location.headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map placeholder */}
          <div className="rounded-2xl overflow-hidden bg-pale-linen dark:bg-warm-brown h-[300px] md:h-[400px] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pale-linen to-warm-cream dark:from-warm-brown dark:to-dark-cocoa" />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <MapPin className="w-10 h-10 text-champagne-gold animate-bounce" />
              <p className="font-display text-lg text-deep-espresso dark:text-light-cream">Yaoundé & Kribi, Cameroun</p>
              <p className="font-body text-sm text-muted-taupe dark:text-light-cream/50 text-center max-w-[300px]">
                Guest Store — Livraison disponible partout
              </p>
            </div>
          </div>

          {/* Store cards */}
          <div className="flex flex-col gap-4">
            {storeLocations.map((store) => (
              <div
                key={store.id}
                className="store-card bg-pale-linen dark:bg-warm-brown rounded-2xl p-6 shadow-card dark:shadow-card-dark opacity-0"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-champagne-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-display text-lg text-deep-espresso dark:text-light-cream">
                      {store.name[lang]}
                    </h4>
                    <p className="mt-1 font-body text-sm text-deep-espresso/70 dark:text-light-cream/70 leading-relaxed">
                      {store.address[lang]}
                    </p>
                    <a
                      href={`https://wa.me/${store.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full border border-[#25D366]/40 text-[#25D366] text-sm font-body hover:bg-[#25D366]/10 transition-colors"
                    >
                      <WhatsAppIcon />
                      {t.location.whatsapp}
                    </a>
                  </div>
                </div>
              </div>
            ))}

            <div className="store-card mt-2 p-4 rounded-xl bg-champagne-gold/10 text-center opacity-0">
              <p className="font-body text-sm text-deep-espresso/80 dark:text-light-cream/80">
                {t.location.selectStore}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
