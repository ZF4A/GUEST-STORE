import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          onComplete: () => {
            setVisible(false);
            onComplete();
          },
        });
      },
    });

    tl.fromTo(logoRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .fromTo(lineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, '-=0.2')
      .to({}, { duration: 0.8 });

    return () => { tl.kill(); };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-warm-cream dark:bg-dark-cocoa"
    >
      <div ref={logoRef} className="flex flex-col items-center gap-4">
        <h1 className="font-display text-3xl md:text-4xl text-deep-espresso dark:text-light-cream tracking-tight">
          Guest Store
        </h1>
        <div
          ref={lineRef}
          className="h-[1px] w-32 bg-gradient-to-r from-transparent via-champagne-gold to-transparent origin-left"
        />
      </div>
    </div>
  );
}
