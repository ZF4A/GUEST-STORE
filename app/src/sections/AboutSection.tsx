import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GoldButton } from '@/components/GoldButton';
import { useAppStore } from '@/stores/appStore';
import { translations } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const { lang } = useAppStore();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(imageRef.current,
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );
      gsap.fromTo(contentRef.current?.children || [],
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="section-padding bg-pale-linen dark:bg-dark-cocoa">
      <div className="content-max-width content-padding">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div ref={imageRef} className="lg:col-span-6 opacity-0">
            <div className="relative">
              {/* Decorative gold offset frame */}
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-[24px] border border-champagne-gold/30 z-0" />
              <div className="relative z-10 rounded-[24px] overflow-hidden shadow-[0_24px_80px_rgba(28,18,10,0.18)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <img
                  src="/images/storepic.jpeg"
                  alt="Guest Store boutique"
                  className="w-full object-cover object-center aspect-[3/4]"
                  loading="lazy"
                />
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="lg:col-span-6">
            <span className="block font-accent text-xs font-semibold uppercase tracking-[0.08em] text-muted-taupe dark:text-champagne-gold/60 mb-4">
              {t.about.caption}
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-deep-espresso dark:text-light-cream leading-[1.1] tracking-[-0.02em]">
              {t.about.headline}
            </h2>
            <p className="mt-6 font-body text-base text-deep-espresso/70 dark:text-light-cream/70 leading-relaxed max-w-[480px]">
              {t.about.body}
            </p>

            {/* Brand signage */}
            <div className="mt-8 flex justify-end">
              <div className="rounded-2xl overflow-hidden border border-champagne-gold/20 shadow-[0_8px_32px_rgba(201,169,110,0.12)] w-[260px] h-[260px] md:w-[300px] md:h-[300px]">
                <img
                  src="/images/n.jpg"
                  alt="Guest Store — By Mich'Am"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="mt-6">
              <GoldButton variant="secondary" onClick={() => { const el = document.querySelector('#trending'); if (el) { const top = el.getBoundingClientRect().top + window.scrollY - 64; window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' }); } }}>
                {t.about.cta}
              </GoldButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
