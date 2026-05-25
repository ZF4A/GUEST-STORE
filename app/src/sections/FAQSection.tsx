import { useState, useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Search, X } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { translations, faqItems } from '@/lib/data';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

// ─── Typewriter hook ──────────────────────────────────────────────────────────

function useTypewriter(phrases: string[], typingSpeed = 60, deletingSpeed = 30, pauseMs = 2400) {
  const [displayed, setDisplayed] = useState('');
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx % phrases.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayed === current) {
      timeout = setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
    } else {
      timeout = setTimeout(() => {
        setDisplayed(
          isDeleting
            ? current.slice(0, displayed.length - 1)
            : current.slice(0, displayed.length + 1)
        );
      }, isDeleting ? deletingSpeed : typingSpeed);
    }
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return displayed;
}

// ─── Placeholder suggestions built from real FAQ questions ───────────────────

const PLACEHOLDERS_FR = faqItems.slice(0, 6).map((f) => f.question.fr + '...');
const PLACEHOLDERS_EN = faqItems.slice(0, 6).map((f) => f.question.en + '...');

// ─── FAQSection ───────────────────────────────────────────────────────────────

export function FAQSection() {
  const { lang } = useAppStore();
  const t = translations[lang];
  const sectionRef = useRef<HTMLElement>(null);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const placeholders = lang === 'fr' ? PLACEHOLDERS_FR : PLACEHOLDERS_EN;
  const typewriterText = useTypewriter(placeholders);

  // Filter FAQ by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqItems;
    return faqItems.filter(
      (item) =>
        item.question[lang].toLowerCase().includes(q) ||
        item.answer[lang].toLowerCase().includes(q)
    );
  }, [query, lang]);

  // Reset open accordion when filter changes
  useEffect(() => {
    setOpenIndex(null);
  }, [query]);

  // Scroll-triggered entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current?.querySelectorAll('.faq-item') ?? [],
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" ref={sectionRef} className="section-padding bg-pale-linen dark:bg-dark-cocoa">
      <div className="content-max-width content-padding max-w-[800px] mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="block font-accent text-xs font-semibold uppercase tracking-[0.08em] text-muted-taupe dark:text-champagne-gold/60 mb-3">
            {t.faq.caption}
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-deep-espresso dark:text-light-cream tracking-[-0.02em] mb-8">
            {t.faq.headline}
          </h2>

          {/* Typewriter search bar */}
          <div className={cn(
            'relative flex items-center bg-warm-cream dark:bg-warm-brown rounded-2xl border transition-all duration-300',
            focused
              ? 'border-champagne-gold shadow-[0_0_0_3px_rgba(201,169,110,0.15)] scale-[1.01]'
              : 'border-deep-espresso/10 dark:border-light-cream/10'
          )}>
            <Search className="absolute left-4 w-4 h-4 text-champagne-gold shrink-0" />

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="w-full bg-transparent py-3.5 pl-11 pr-10 font-body text-sm text-deep-espresso dark:text-light-cream placeholder:text-muted-taupe/0 outline-none"
            />

            {/* Typewriter placeholder — visible only when input is empty */}
            {!query && (
              <span
                className="absolute left-11 right-10 flex items-center pointer-events-none font-body text-sm text-muted-taupe/55 overflow-hidden whitespace-nowrap"
                aria-hidden
              >
                <span>{typewriterText}</span>
                <span className="ml-[1px] inline-block w-[1.5px] h-[1em] bg-champagne-gold/60 align-middle animate-[caret-blink_1s_ease-out_infinite]" />
              </span>
            )}

            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 text-muted-taupe hover:text-deep-espresso dark:hover:text-light-cream transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Result count when filtering */}
          {query && (
            <p className="mt-3 text-xs font-body text-muted-taupe">
              {filtered.length} {lang === 'fr' ? 'question(s) trouvée(s)' : 'question(s) found'}
            </p>
          )}
        </div>

        {/* Accordion */}
        {filtered.length === 0 ? (
          <p className="text-center text-muted-taupe font-body text-sm py-8">
            {lang === 'fr' ? 'Aucune question trouvée.' : 'No questions found.'}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="faq-item bg-warm-cream dark:bg-warm-brown rounded-xl overflow-hidden opacity-0"
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-body font-medium text-base text-deep-espresso dark:text-light-cream pr-4">
                      {item.question[lang]}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-muted-taupe flex-shrink-0 transition-transform duration-300',
                        isOpen && 'rotate-180'
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-400 ease-out',
                      isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                    )}
                  >
                    <p className="px-5 pb-5 font-body text-[15px] text-deep-espresso/70 dark:text-light-cream/70 leading-relaxed">
                      {item.answer[lang]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
