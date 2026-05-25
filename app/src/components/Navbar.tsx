import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Sun, Moon, Menu, X, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/appStore';
import { useCartStore } from '@/stores/cartStore';
import { translations } from '@/lib/data';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, theme, toggleTheme, setLang, setSearchOpen } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleCart, totalItems } = useCartStore();
  const t = translations[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { label: t.nav.home, href: '#hero' },
    { label: t.nav.products, href: '#trending' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.contact, href: '#location' },
    { label: lang === 'fr' ? 'Ventes' : 'Sales', href: '/sales', isRoute: true },
    { label: lang === 'fr' ? 'Vendus' : 'Sold', href: '/sold', isRoute: true },
  ];

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }
  };

  const handleNavClick = (href: string, isRoute?: boolean) => {
    setMobileOpen(false);
    if (isRoute) { navigate(href); window.scrollTo(0, 0); return; }
    const isHome = location.pathname === '/';
    if (isHome) {
      scrollToSection(href);
    } else {
      navigate('/');
      setTimeout(() => scrollToSection(href), 350);
    }
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300',
          scrolled ? 'glass-nav shadow-sm' : 'bg-transparent'
        )}
      >
        <div className="content-max-width content-padding h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 z-10">
            <img
              src="/images/logo.jpg"
              alt="Guest Store"
              className="w-9 h-9 rounded-full object-contain bg-black border border-champagne-gold/30 flex-shrink-0"
            />
            <span className="font-display text-xl md:text-2xl text-deep-espresso dark:text-light-cream tracking-tight">
              Guest Store
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href, link.isRoute)}
                className={cn(
                  'relative font-body text-sm transition-colors group',
                  'text-deep-espresso/80 dark:text-light-cream/80 hover:text-deep-espresso dark:hover:text-light-cream'
                )}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-champagne-gold transition-all duration-250 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-deep-espresso/70 dark:text-light-cream/70 hover:text-deep-espresso dark:hover:text-light-cream hover:bg-deep-espresso/5 dark:hover:bg-light-cream/5 transition-all"
              aria-label={t.nav.search}
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            <button
              onClick={toggleCart}
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-deep-espresso/70 dark:text-light-cream/70 hover:text-deep-espresso dark:hover:text-light-cream hover:bg-deep-espresso/5 dark:hover:bg-light-cream/5 transition-all"
              aria-label={t.nav.cart}
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full bg-soft-rose text-white text-[11px] font-bold flex items-center justify-center animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-deep-espresso/70 dark:text-light-cream/70 hover:text-deep-espresso dark:hover:text-light-cream hover:bg-deep-espresso/5 dark:hover:bg-light-cream/5 transition-all"
              aria-label="Toggle language"
            >
              <Globe className="w-[18px] h-[18px]" />
              <span className="ml-0.5 text-[11px] font-accent font-semibold uppercase">{lang}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center text-deep-espresso/70 dark:text-light-cream/70 hover:text-deep-espresso dark:hover:text-light-cream hover:bg-deep-espresso/5 dark:hover:bg-light-cream/5 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-full flex items-center justify-center text-deep-espresso dark:text-light-cream"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-warm-cream/95 dark:bg-dark-cocoa/95 backdrop-blur-lg md:hidden">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href, link.isRoute)}
                className="font-display text-2xl text-deep-espresso dark:text-light-cream hover:text-champagne-gold transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-1 font-accent text-sm uppercase text-deep-espresso/60 dark:text-light-cream/60"
              >
                <Globe className="w-4 h-4" />
                {lang === 'fr' ? 'Français' : 'English'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
