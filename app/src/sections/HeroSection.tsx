import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronDown } from 'lucide-react';
import { GoldButton } from '@/components/GoldButton';
import { useAppStore } from '@/stores/appStore';
import { translations } from '@/lib/data';
export function HeroSection() {
  const { lang, theme } = useAppStore();
  const t = translations[lang];

  const lightRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const captionRef = useRef<HTMLSpanElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const rafId = useRef(0);

  // Smooth mouse-driven parallax
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    const tick = () => {
      const m = mouse.current;
      m.x += (m.tx - m.x) * 0.055;
      m.y += (m.ty - m.y) * 0.055;

      // Ambient light blob follows cursor
      if (lightRef.current) {
        gsap.set(lightRef.current, { x: m.x * 50, y: m.y * 35 });
      }
      // Far background drifts subtly opposite to cursor
      if (layer1Ref.current) {
        gsap.set(layer1Ref.current, { x: m.x * -8, y: m.y * -5 });
      }
      // Geometric layer drifts more
      if (layer2Ref.current) {
        gsap.set(layer2Ref.current, { x: m.x * -22, y: m.y * -14 });
      }
      // Text column moves subtly opposite
      if (textRef.current) {
        gsap.set(textRef.current, { x: m.x * -5, y: m.y * -3 });
      }
      // Product image moves most + rotates for 3D feel
      if (imageWrapRef.current) {
        gsap.set(imageWrapRef.current, {
          x: m.x * 28,
          y: m.y * 16,
        });
      }
      if (imgRef.current) {
        gsap.set(imgRef.current, {
          rotationY: m.x * 10,
          rotationX: -m.y * 6,
        });
      }

      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Entrance animations
  useEffect(() => {
    // Geometric shape stagger entrance
    const geoShapes = layer2Ref.current?.querySelectorAll('.geo');
    if (geoShapes?.length) {
      gsap.fromTo(
        geoShapes,
        { opacity: 0, scale: 0, rotationZ: -30 },
        { opacity: 1, scale: 1, rotationZ: 0, stagger: 0.12, duration: 1.4, ease: 'back.out(1.7)', delay: 0.9 }
      );
    }

    // Text timeline
    const tl = gsap.timeline({ delay: 0.35 });
    tl.fromTo(captionRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }
    )
    .fromTo(headlineRef.current,
      { opacity: 0, y: 55, rotationX: -22, transformPerspective: 800 },
      { opacity: 1, y: 0, rotationX: 0, duration: 1, ease: 'power3.out' },
      '-=0.15'
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
      '-=0.5'
    )
    .fromTo(ctaRef.current,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo(statsRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    );

    // Product image 3D entrance
    gsap.fromTo(imageWrapRef.current,
      { opacity: 0, y: 50, rotationY: -18, rotationX: 8, scale: 0.92, transformPerspective: 1200 },
      { opacity: 1, y: 0, rotationY: 0, rotationX: 0, scale: 1, duration: 1.4, ease: 'power3.out', delay: 0.55 }
    );

    // Continuous float
    gsap.to(imageWrapRef.current, {
      y: '-=20',
      duration: 4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      delay: 2,
    });

    return () => { tl.kill(); };
  }, []);

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  const stats = [
    { value: '500+', label: lang === 'fr' ? 'Produits' : 'Products' },
    { value: '2', label: lang === 'fr' ? 'Boutiques' : 'Stores' },
    { value: '100%', label: lang === 'fr' ? 'Authentique' : 'Authentic' },
  ];

  return (
    <section
      id="hero"
      className="relative min-h-[100dvh] overflow-hidden"
      style={{
        background: theme === 'dark'
          ? 'radial-gradient(ellipse 130% 90% at 68% 28%, #1C120A 0%, #150D06 30%, #0F0A06 60%, #080502 100%)'
          : 'radial-gradient(ellipse 130% 90% at 68% 28%, #FDF9F5 0%, #F5EDE4 30%, #ECDBCA 60%, #E0C9B3 100%)',
      }}
    >
      {/* Mouse-following ambient gold light */}
      <div
        ref={lightRef}
        className="absolute pointer-events-none"
        style={{
          top: '18%',
          left: '50%',
          width: '700px',
          height: '700px',
          marginLeft: '-350px',
          marginTop: '-350px',
          background:
            'radial-gradient(circle, rgba(201,169,110,0.14) 0%, rgba(201,169,110,0.05) 50%, transparent 70%)',
          filter: 'blur(50px)',
          borderRadius: '50%',
        }}
      />

      {/* Layer 1 — far atmospheric blobs */}
      <div ref={layer1Ref} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-[10%] -right-[5%] w-[55vw] h-[55vw] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute -bottom-[18%] -left-[12%] w-[45vw] h-[45vw] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212,165,165,0.09) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Layer 2 — geometric wireframe shapes */}
      <div ref={layer2Ref} className="absolute inset-0 pointer-events-none">
        {/* Top-left double diamond */}
        <div
          className="geo absolute top-[11%] left-[5%] w-[72px] h-[72px] opacity-0"
          style={{ transform: 'rotate(45deg)' }}
        >
          <div className="w-full h-full border border-champagne-gold/28 rounded-sm" />
          <div className="absolute inset-[7px] border border-champagne-gold/14 rounded-sm" />
        </div>

        {/* Large ring, top-right */}
        <div
          className="geo absolute top-[7%] right-[9%] w-44 h-44 opacity-0 rounded-full border border-champagne-gold/18"
          style={{ boxShadow: '0 0 0 14px rgba(201,169,110,0.04)' }}
        />

        {/* Small ring inside large ring */}
        <div
          className="geo absolute top-[13%] right-[15%] w-14 h-14 opacity-0 rounded-full border border-champagne-gold/12"
        />

        {/* Dot grid bottom-left */}
        <div className="geo absolute bottom-[34%] left-[7%] opacity-0">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex gap-[10px] mb-[10px]">
              {[0, 1, 2, 3].map(j => (
                <div
                  key={j}
                  className="w-[3px] h-[3px] rounded-full bg-champagne-gold/22"
                />
              ))}
            </div>
          ))}
        </div>

        {/* Horizontal line accent, top */}
        <div className="geo absolute top-[22%] right-[20%] flex items-center gap-2 opacity-0">
          <div className="w-10 h-[1px] bg-champagne-gold/35" />
          <div className="w-[5px] h-[5px] rounded-full bg-champagne-gold/25" />
          <div className="w-20 h-[1px] bg-champagne-gold/20" />
        </div>

        {/* Rotated small square, mid-right */}
        <div
          className="geo absolute top-[46%] right-[5%] w-9 h-9 opacity-0 border border-champagne-gold/22"
          style={{ transform: 'rotate(22deg)' }}
        />

        {/* Vertical line, bottom-right */}
        <div className="geo absolute bottom-[18%] right-[14%] opacity-0">
          <div className="w-[1px] h-20 bg-gradient-to-b from-champagne-gold/35 to-transparent" />
        </div>

        {/* Large outer ring centered on image area */}
        <div
          className="geo absolute top-1/2 left-[58%] -translate-x-1/2 -translate-y-1/2 opacity-0 rounded-full border border-champagne-gold/08"
          style={{ width: '580px', height: '580px' }}
        />

        {/* Small rose diamond, bottom center */}
        <div
          className="geo absolute bottom-[14%] left-[38%] w-5 h-5 opacity-0 border border-soft-rose/22"
          style={{ transform: 'rotate(45deg)' }}
        />

        {/* Cross accent, top-center */}
        <div className="geo absolute top-[32%] left-[22%] opacity-0">
          <div className="w-[1px] h-8 bg-champagne-gold/20 mx-auto" />
          <div className="w-8 h-[1px] bg-champagne-gold/20 -mt-4" />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 content-max-width content-padding min-h-[100dvh] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center w-full pt-24 pb-16 lg:pt-0 lg:pb-0">

          {/* Text column */}
          <div ref={textRef} className="lg:col-span-5 xl:col-span-5 order-2 lg:order-1">
            <span
              ref={captionRef}
              className="block font-accent text-xs font-semibold uppercase tracking-[0.1em] text-muted-taupe mb-5 opacity-0"
            >
              {t.hero.caption}
            </span>

            <h1
              ref={headlineRef}
              className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-[4.5rem] text-deep-espresso dark:text-champagne-gold leading-[1.05] tracking-[-0.03em] opacity-0"
              style={{
                textShadow:
                  '2px 3px 0 rgba(201,169,110,0.12), 4px 6px 0 rgba(201,169,110,0.06)',
              }}
            >
              {t.hero.headline}
            </h1>

            <p
              ref={subtitleRef}
              className="mt-6 font-body text-lg text-deep-espresso/65 dark:text-champagne-gold/75 max-w-[400px] leading-relaxed opacity-0"
            >
              {t.hero.subtitle}
            </p>

            <div ref={ctaRef} className="mt-8 flex flex-col sm:flex-row gap-4 opacity-0">
              <GoldButton onClick={() => scrollTo('#trending')}>
                {t.hero.ctaPrimary}
              </GoldButton>
              <GoldButton variant="secondary" onClick={() => scrollTo('#categories')}>
                {t.hero.ctaSecondary}
              </GoldButton>
            </div>

            {/* Stats strip */}
            <div ref={statsRef} className="mt-12 flex gap-8 opacity-0">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl font-semibold text-champagne-gold">
                    {s.value}
                  </div>
                  <div className="font-accent text-[10px] uppercase tracking-wider text-muted-taupe mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D product image column */}
          <div className="lg:col-span-5 xl:col-span-6 order-1 lg:order-2 flex justify-center lg:justify-end">
            <div
              ref={imageWrapRef}
              className="relative opacity-0"
              style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
            >
              {/* Ground-plane shadow */}
              <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  width: '65%',
                  height: '28px',
                  background:
                    'radial-gradient(ellipse, rgba(28,18,10,0.22) 0%, transparent 72%)',
                  borderRadius: '50%',
                  filter: 'blur(10px)',
                }}
              />

              {/* Gold ambient glow */}
              <div
                className="absolute pointer-events-none"
                style={{
                  inset: '-15%',
                  borderRadius: '50%',
                  background:
                    'radial-gradient(ellipse at 42% 38%, rgba(201,169,110,0.22) 0%, rgba(201,169,110,0.07) 45%, transparent 68%)',
                  filter: 'blur(32px)',
                }}
              />

              {/* Product image — rotates on mouse for 3D effect */}
              <img
                ref={imgRef}
                src="/images/hero.jpg"
                alt="Luxury handbag"
                className="relative w-[280px] sm:w-[360px] md:w-[450px] lg:w-[500px] xl:w-[560px] h-auto object-contain"
                style={{
                  filter:
                    'drop-shadow(0 40px 80px rgba(28,18,10,0.30)) drop-shadow(0 8px 24px rgba(28,18,10,0.16)) drop-shadow(0 0 100px rgba(201,169,110,0.14))',
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'center center',
                }}
                fetchPriority="high"
              />

              {/* Floating accents around image */}
              <div
                className="absolute -top-4 -right-2 w-3 h-3 rounded-full bg-champagne-gold/40 animate-float-leaf"
              />
              <div
                className="absolute top-1/3 -left-8 w-[2px] h-14 bg-gradient-to-b from-champagne-gold/30 to-transparent animate-float-leaf"
                style={{ animationDelay: '1.2s' }}
              />
              <div
                className="absolute -bottom-1 -right-5 w-5 h-5 border border-champagne-gold/25 animate-float-leaf"
                style={{ transform: 'rotate(45deg)', animationDelay: '2s' }}
              />
              <div
                className="absolute top-[55%] -right-10 w-7 h-[1.5px] bg-champagne-gold/20 animate-float-leaf"
                style={{ animationDelay: '0.7s' }}
              />
              <div
                className="absolute bottom-[30%] -left-5 w-[1.5px] h-6 bg-soft-rose/20 animate-float-leaf"
                style={{ animationDelay: '1.8s' }}
              />
            </div>
          </div>

          {/* Vertical brand text */}
          <div className="hidden xl:flex lg:col-span-2 xl:col-span-1 order-3 flex-col items-end justify-center">
            <span className="font-accent text-[9px] uppercase tracking-[0.22em] text-muted-taupe/38 rotate-90 whitespace-nowrap origin-right translate-y-24">
              GUEST&copy;2026
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="font-accent text-[10px] uppercase tracking-[0.18em] text-muted-taupe/50">
          {t.hero.scroll}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-taupe/50 animate-bounce-scroll" />
      </div>
    </section>
  );
}
