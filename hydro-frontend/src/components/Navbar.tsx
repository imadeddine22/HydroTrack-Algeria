'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Search, Globe } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';
import type { Lang } from '@/lib/i18n/translations';

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'ar', label: 'العربية',  flag: '🇩🇿' },
];

export default function Navbar() {
  const { t, lang, setLang, isRTL } = useLang();
  const [open, setOpen]         = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnchor = (href: string) => {
    setOpen(false);
    setLangOpen(false);
    if (href.startsWith('#')) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const links = [
    { href: '#home',     label: t.nav.home      },
    { href: '#explore',  label: t.nav.explore   },
    { href: '#features', label: t.nav.features  },
    { href: '#about',    label: t.nav.about     },
    { href: '#contact',  label: t.nav.contact   },
  ];

  const current = LANGS.find(l => l.code === lang);

  return (
    <header
      data-gsap="navbar"
      className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-4'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        <a href="#home" onClick={() => handleAnchor('#home')} className="flex items-center gap-2 shrink-0 cursor-pointer">
          <img src="/logo.png" alt="HydroTrack Algeria" className="h-16 md:h-20 w-auto object-contain" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8 text-[15px] font-semibold">
          {links.map(l => (
            <a key={l.href} href={l.href}
              onClick={(e) => { e.preventDefault(); handleAnchor(l.href); }}
              className="transition-colors hover:text-[#00D4FF] text-[#0B1E40]">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(o => !o)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-gray-200 hover:border-[#00D4FF] text-sm font-semibold text-[#0B1E40] transition-all"
            >
              <Globe className="w-4 h-4 text-[#00b4d8]" />
              <span>{current?.flag} {current?.code.toUpperCase()}</span>
            </button>
            {langOpen && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 min-w-[140px]">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors hover:bg-[#EBF5FF] ${lang === l.code ? 'text-[#00b4d8]' : 'text-[#0B1E40]'}`}>
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a href="#explore" onClick={(e) => { e.preventDefault(); handleAnchor('#explore'); }}
            className="text-[#0B1E40] hover:text-[#00D4FF] transition-colors" title={t.nav.search}>
            <Search className="w-5 h-5" />
          </a>
          <a href="#contact"
            onClick={(e) => { e.preventDefault(); handleAnchor('#contact'); }}
            className="ml-2 px-6 py-2.5 rounded-full bg-[#00D4FF] text-white text-sm font-bold hover:bg-[#00b4d8] shadow-md shadow-[#00D4FF]/40 transition-colors">
            {t.nav.contact}
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Mobile lang switcher */}
          <div className="relative">
            <button onClick={() => setLangOpen(o => !o)}
              className="p-2 flex items-center gap-1 text-[#0B1E40] text-xs font-bold">
              <Globe className="w-4 h-4 text-[#00b4d8]" />
              {current?.code.toUpperCase()}
            </button>
            {langOpen && (
              <div className="absolute top-full mt-1 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 min-w-[130px]">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center gap-2 hover:bg-[#EBF5FF] ${lang === l.code ? 'text-[#00b4d8]' : 'text-[#0B1E40]'}`}>
                    <span>{l.flag}</span> {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="p-2 text-[#0B1E40]" onClick={() => setOpen(o => !o)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 text-sm font-semibold shadow-lg">
          {links.map(l => (
            <a key={l.href} href={l.href}
              onClick={(e) => { e.preventDefault(); handleAnchor(l.href); }}
              className="text-[#0B1E40] hover:text-[#00D4FF] py-2 border-b border-gray-50">
              {l.label}
            </a>
          ))}
          <a href="#contact"
            onClick={(e) => { e.preventDefault(); handleAnchor('#contact'); setOpen(false); }}
            className="mt-2 px-6 py-3 rounded-full bg-[#00D4FF] text-white text-sm font-bold text-center hover:bg-[#00b4d8] transition-colors">
            {t.nav.contact}
          </a>
        </div>
      )}
    </header>
  );
}
