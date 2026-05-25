import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Search, Mic } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { translations } from '@/lib/data';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

export function SearchSection() {
  const { lang } = useAppStore();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleVoice = () => {
    setVoiceActive(true);
    setTimeout(() => setVoiceActive(false), 3000);
  };

  return (
    <section id="search" ref={sectionRef} className="section-padding bg-pale-linen dark:bg-dark-cocoa opacity-0">
      <div className="content-max-width content-padding">
        <div className="text-center max-w-[700px] mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-deep-espresso dark:text-light-cream tracking-[-0.02em] mb-8">
            {t.search.headline}
          </h2>

          {/* Search bar */}
          <div className={cn(
            'relative flex items-center bg-warm-cream dark:bg-warm-brown rounded-2xl border transition-all duration-300',
            focused ? 'border-champagne-gold shadow-[0_0_0_3px_rgba(201,169,110,0.15)] scale-[1.01]' : 'border-deep-espresso/10 dark:border-light-cream/10'
          )}>
            <Search className="absolute left-4 w-5 h-5 text-champagne-gold" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={t.search.placeholder}
              className="w-full bg-transparent py-4 pl-12 pr-14 font-body text-base text-deep-espresso dark:text-light-cream placeholder:text-muted-taupe/50 outline-none"
            />
            <button
              onClick={handleVoice}
              className="absolute right-4 flex items-center gap-1 text-muted-taupe hover:text-champagne-gold transition-colors"
              aria-label={t.search.voice}
            >
              {voiceActive ? (
                <div className="flex items-end gap-0.5 h-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1 bg-champagne-gold rounded-full animate-voice-wave"
                      style={{ animationDelay: `${i * 0.15}s`, height: '4px' }}
                    />
                  ))}
                </div>
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {t.search.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-4 py-1.5 rounded-full bg-deep-espresso/[0.04] dark:bg-light-cream/[0.04] text-sm font-body text-deep-espresso/70 dark:text-light-cream/70 hover:bg-deep-espresso/[0.08] dark:hover:bg-light-cream/[0.08] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
