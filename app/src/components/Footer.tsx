import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/appStore';
import { translations } from '@/lib/data';
import { useProductStore } from '@/stores/productStore';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.33 6.34 6.34 6.34 0 006.33-6.33V8.73a8.23 8.23 0 004.78 1.53v-3.4a4.85 4.85 0 01-1-.17z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export function Footer() {
  const { lang } = useAppStore();
  const t = translations[lang];
  const navigate = useNavigate();
  const { products } = useProductStore();

  const soldCount  = products.filter(p => p.badges.includes('sold')).length;
  const salesCount = products.filter(p => p.isPromo && !p.badges.includes('sold')).length;

  const anchorLinks = [
    { label: t.nav.home,     href: '#hero' },
    { label: t.nav.products, href: '#trending' },
    { label: t.nav.about,    href: '#about' },
    { label: 'FAQ',          href: '#faq' },
    { label: t.nav.contact,  href: '#location' },
  ];

  const routeLinks = [
    { label: lang === 'fr' ? 'Ventes' : 'Sales', href: '/sales', badge: salesCount > 0 ? salesCount : null, color: 'text-champagne-gold' },
    { label: lang === 'fr' ? 'Vendus' : 'Sold',  href: '/sold',  badge: soldCount  > 0 ? soldCount  : null, color: 'text-soft-rose' },
  ];

  const handleAnchorClick = (href: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.querySelector(href);
        if (el) window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 64), behavior: 'smooth' });
      }, 350);
    } else {
      const el = document.querySelector(href);
      if (el) window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 64), behavior: 'smooth' });
    }
  };

  const handleRouteClick = (href: string) => {
    navigate(href);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-deep-espresso text-light-cream border-t border-light-cream/[0.08]">
      <div className="content-max-width content-padding py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/images/logo.jpg"
                alt="Guest Store"
                className="w-16 h-16 rounded-full object-contain bg-black border border-champagne-gold/40 flex-shrink-0"
              />
              <h3 className="font-display text-xl text-light-cream">Guest Store</h3>
            </div>
            <p className="text-sm font-body text-light-cream/50 leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-accent text-xs font-semibold uppercase tracking-[0.08em] text-light-cream/50 mb-4">
              {t.footer.navigation}
            </h4>
            <ul className="space-y-2.5">
              {anchorLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleAnchorClick(link.href)}
                    className="text-sm font-body text-light-cream/70 hover:text-light-cream transition-colors relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-champagne-gold transition-all duration-250 group-hover:w-full" />
                  </button>
                </li>
              ))}
              {routeLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleRouteClick(link.href)}
                    className={`text-sm font-body ${link.color} hover:opacity-80 transition-opacity relative group flex items-center gap-1.5`}
                  >
                    {link.label}
                    {link.badge !== null && (
                      <span className="text-[10px] font-accent bg-white/10 px-1.5 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-current transition-all duration-250 group-hover:w-full" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-accent text-xs font-semibold uppercase tracking-[0.08em] text-light-cream/50 mb-4">
              {t.footer.contact}
            </h4>
            <div className="space-y-2 text-sm font-body text-light-cream/70">
              <p>Yaoundé — Essos, United-Select</p>
              <p>Kribi — Dombe 2ème route face les brasseries, immeuble blanc jaune à côté de la cave de Guyso</p>
              <a
                href="https://wa.me/237695165425"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <WhatsAppIcon />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-accent text-xs font-semibold uppercase tracking-[0.08em] text-light-cream/50 mb-4">
              {t.footer.followUs}
            </h4>
            <div className="flex items-center gap-4">
                {[
                { icon: <TikTokIcon />, label: 'TikTok', href: 'https://www.tiktok.com/@gueststore237?_r=1&_t=ZS-96IXJQSQZ2T' },
                { icon: <InstagramIcon />, label: 'Instagram', href: 'https://www.instagram.com/gueststore237?igsh=YjZjMmNhNGZ2NmJ6&utm_source=qr' },
                { icon: <FacebookIcon />, label: 'Facebook', href: 'https://www.facebook.com/share/18owDNBhM5/?mibextid=wwXIfr' },
                { icon: <WhatsAppIcon />, label: 'WhatsApp', href: 'https://wa.me/237695165425' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-light-cream/70 hover:text-champagne-gold hover:scale-110 transition-all duration-200"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-light-cream/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-body text-light-cream/40">
            © 2026 Guest Store. All rights reserved.
          </p>

          {/* Subtle admin lock — positioned quietly at bottom-right */}
          <button
            onClick={() => navigate('/admin')}
            aria-label="Admin"
            title="Espace administration"
            className="opacity-[0.18] hover:opacity-[0.38] transition-opacity duration-300 text-light-cream/60 p-1"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
