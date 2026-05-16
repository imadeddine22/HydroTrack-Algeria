"use client";
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n/LanguageContext';

export default function Footer() {
  const { t, isRTL } = useLang();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleAnchor = (href: string) => {
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#051532] text-white pt-20 pb-10 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Decorative dark wave at the top */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
        <svg viewBox="0 0 1440 250" preserveAspectRatio="none" className="relative block w-full h-[150px] md:h-[250px]">
          <path fill="#ffffff" fillOpacity="1" d="M0,0 L1440,0 L1440,100 C1100,120 850,0 600,0 C350,0 200,180 0,150 Z"></path>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10">

        {/* Top CTA Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            <span className="text-[#00D4FF]">{t.footer.cta.slice(0, 4)}</span>{t.footer.cta.slice(4)}
          </h2>
          <a
            href="tel:+213698694461"
            className="inline-flex items-center gap-2 bg-[#00D4FF] text-white px-8 py-4 rounded-full font-bold hover:bg-[#00b4d8] transition-colors shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            +213 (0) 698 69 44 61
          </a>
        </div>

        {/* Decorative Squiggly Divider */}
        <div className="relative flex items-center justify-center mb-16">
          <div className="absolute w-full border-t border-white/10"></div>
          <div className="relative bg-[#051532] px-4 text-white/20">
            <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 10 Q 10 0, 20 10 T 40 10 T 60 10 T 80 10 T 100 10 T 120 10" stroke="currentColor" strokeWidth="1" fill="none" />
            </svg>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1: Brand & Info */}
          <div data-gsap="footer-brand" className="flex flex-col gap-6">
            <a href="#home" onClick={() => handleAnchor('#home')} className="flex items-center gap-2 cursor-pointer">
              <img src="/logo.png" alt="HydroTrack Algeria" className="h-28 w-auto object-contain" />
            </a>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t.footer.newsletterDesc}
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[
                { label: 'LinkedIn', href: 'https://www.linkedin.com/', path: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
                { label: 'Facebook', href: 'https://www.facebook.com/jamal.messaoudi.2025', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
                { label: 'WhatsApp', href: 'https://wa.me/213698694461', path: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-[#00D4FF] hover:text-[#00D4FF] transition-colors text-white/60">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Address */}
          <div data-gsap="footer-col" className="flex flex-col gap-6">
            <h3 className="text-xl font-bold">{t.footer.coordinates}</h3>
            <ul className="flex flex-col gap-4 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#00D4FF" className="w-5 h-5 shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span>{t.footer.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#00D4FF" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <a href="tel:+213698694461" className="hover:text-[#00D4FF] transition-colors">
                  +213 (0) 698 69 44 61
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#00D4FF" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:Jamalmessaoudi2020@gmail.com" className="hover:text-[#00D4FF] transition-colors">
                  Jamalmessaoudi2020@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Useful Links */}
          <div data-gsap="footer-col" className="flex flex-col gap-6">
            <h3 className="text-xl font-bold">{t.footer.links}</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-400">
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); handleAnchor('#home'); }}
                  className="hover:text-[#00D4FF] transition-colors flex items-center gap-2">
                  <span className="text-[#00D4FF]">›</span> {t.nav.home}
                </a>
              </li>
              <li>
                <a href="#features" onClick={(e) => { e.preventDefault(); handleAnchor('#features'); }}
                  className="hover:text-[#00D4FF] transition-colors flex items-center gap-2">
                  <span className="text-[#00D4FF]">›</span> {t.nav.features}
                </a>
              </li>
              <li>
                <a href="#explore" onClick={(e) => { e.preventDefault(); handleAnchor('#explore'); }}
                  className="hover:text-[#00D4FF] transition-colors flex items-center gap-2">
                  <span className="text-[#00D4FF]">›</span> {t.nav.explore}
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); handleAnchor('#about'); }}
                  className="hover:text-[#00D4FF] transition-colors flex items-center gap-2">
                  <span className="text-[#00D4FF]">›</span> {t.nav.about}
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); handleAnchor('#contact'); }}
                  className="hover:text-[#00D4FF] transition-colors flex items-center gap-2">
                  <span className="text-[#00D4FF]">›</span> {t.nav.contact}
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div data-gsap="footer-col" className="flex flex-col gap-6">
            <h3 className="text-xl font-bold">{t.footer.newsletter}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{t.footer.newsletterDesc}</p>
            <form className="flex mt-2" onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder={t.footer.emailPlaceholder}
                className="w-full px-4 py-3 rounded-l-md text-gray-800 focus:outline-none text-sm" />
              <button type="submit"
                className="bg-[#00D4FF] px-4 py-3 rounded-r-md flex items-center justify-center hover:bg-[#00b4d8] transition-colors shrink-0"
                title={t.footer.newsletter}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} HydroTrack Algeria. {t.footer.rights}</p>
          <p><span className="text-[#00D4FF] font-semibold">{t.footer.builtFor}</span></p>
          <p className="text-gray-500">
            {isRTL ? 'مطوّر من طرف' : 'Developed by'}{' '}
            <a
              href="https://wa.me/213675971518"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00D4FF] font-semibold hover:text-[#00b4d8] transition-colors"
            >
              imad developer
            </a>
          </p>
        </div>
      </div>

      {/* Scroll-to-top — fixed, always visible once scrolled */}
      {showTop && (
        <button
          onClick={scrollToTop}
          title={t.footer.backToTop}
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}
          className="bg-[#00D4FF] p-3 rounded-full shadow-lg hover:bg-[#00b4d8] active:scale-95 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}
    </footer>
  );
}
