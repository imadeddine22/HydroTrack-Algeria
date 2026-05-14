'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home, BarChart2,
  Database, Settings, LogOut, Droplets, MessageSquare, Layers, Globe,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n/LanguageContext';

const getNav = (t: any) => [
  { icon: Home,           label: t.nav.home,         href: '/' },
  { icon: BarChart2,      label: t.nav.dashboard,    href: '/dashboard' },
  { icon: Layers,         label: t.nav.wilaya,       href: '/dashboard/wilaya-infra' },
  { icon: Database,       label: t.nav.data,         href: '/dashboard/data' },
  { icon: MessageSquare,  label: t.nav.messages,     href: '/dashboard/messages' },
  { icon: Settings,       label: t.nav.settings,     href: '/dashboard/settings' },
];

const LANGS = [
  { code: 'fr' as const, flag: '🇫🇷', label: 'Français' },
  { code: 'en' as const, flag: '🇬🇧', label: 'English' },
  { code: 'ar' as const, flag: '🇩🇿', label: 'العربية' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const path     = usePathname();
  const router   = useRouter();
  const { t, lang, setLang, isRTL } = useLang();
  const NAV = getNav(t);
  const [unread, setUnread]     = useState(0);
  const [authed, setAuthed]     = useState<boolean | null>(null);
  const [langOpen, setLangOpen] = useState(false);

  /* ── Auth guard ──────────────────────────────── */
  useEffect(() => {
    if (path === '/dashboard/login') { setAuthed(true); return; }

    const ok = sessionStorage.getItem('ht_auth') === '1';
    if (!ok) {
      router.replace('/dashboard/login');
    } else {
      setAuthed(true);
    }
  }, [path, router]);

  /* ── Unread messages poll ────────────────────── */
  useEffect(() => {
    if (!authed || path === '/dashboard/login') return;
    const fetchUnread = () => {
      api.get('/api/messages/unread-count').then(d => { if (d?.count != null) setUnread(d.count); }).catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [authed, path]);

  /* ── Logout ──────────────────────────────────── */
  const handleLogout = () => {
    sessionStorage.removeItem('ht_auth');
    router.replace('/dashboard/login');
  };

  /* Show blank while checking auth (prevents flash) */
  if (authed === null) return null;

  /* For the login page, render children without the sidebar shell */
  if (path === '/dashboard/login') return <>{children}</>;

  const currentLang = LANGS.find(l => l.code === lang) || LANGS[0];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'#f0f6fb', overflow:'hidden', display:'flex' }}>

      {/* Sidebar */}
      <aside style={{ width:64, background:'#0d1b2a', display:'flex', flexDirection:'column',
        alignItems:'center', padding:'24px 0', gap:8, boxShadow:'4px 0 24px rgba(0,0,0,0.3)', zIndex:10, flexShrink:0 }}>

        {/* Logo */}
        <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.08)',
          display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
          <Droplets size={20} color="#48cae4" />
        </div>

        {/* Nav */}
        <nav style={{ display:'flex', flexDirection:'column', gap:6, flex:1 }}>
          {NAV.map(({ icon: Icon, label, href }) => {
            const active = href === '/dashboard' ? path === '/dashboard' : path.startsWith(href) && href !== '/';
            return (
              <Link key={href} href={href} title={label}
                style={{
                  width:40, height:40, borderRadius:12,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: active ? 'rgba(72,202,228,0.18)' : 'transparent',
                  color: active ? '#48cae4' : '#4b5563',
                  transition:'all 0.2s', position:'relative',
                  textDecoration:'none',
                }}
                onMouseEnter={e => { if(!active)(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if(!active)(e.currentTarget as HTMLElement).style.background='transparent'; }}
              >
                <Icon size={20} />
                {href === '/dashboard/messages' && unread > 0 && (
                  <span style={{ position:'absolute', top:4, right:4, minWidth:16, height:16,
                    background:'#ef4444', borderRadius:99, fontSize:9, fontWeight:700,
                    color:'white', display:'flex', alignItems:'center', justifyContent:'center',
                    padding:'0 3px', border:'1.5px solid #0d1b2a' }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
                <span style={{
                  position:'absolute', [isRTL ? 'right' : 'left']:52, background:'#0d1b2a', color:'#e5e7eb',
                  fontSize:12, padding:'4px 10px', borderRadius:8, whiteSpace:'nowrap',
                  pointerEvents:'none', opacity:0, transition:'opacity 0.15s',
                  border:'1px solid rgba(255,255,255,0.08)', zIndex:50,
                }} className="sidebar-tooltip">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Language Switcher ─────────────────── */}
        <div style={{ position:'relative' }}>
          <button
            title={currentLang.label}
            onClick={() => setLangOpen(o => !o)}
            style={{
              width:40, height:40, borderRadius:12, display:'flex', alignItems:'center',
              justifyContent:'center', flexDirection:'column', gap:2,
              cursor:'pointer', border:'none',
              background: langOpen ? 'rgba(72,202,228,0.18)' : 'transparent',
              color: langOpen ? '#48cae4' : '#6b7280',
              transition:'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.color='#48cae4'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = langOpen ? 'rgba(72,202,228,0.18)' : 'transparent'; (e.currentTarget as HTMLElement).style.color = langOpen ? '#48cae4' : '#6b7280'; }}
          >
          <Globe size={16} />
          <span style={{ fontSize:9, fontWeight:800, lineHeight:1, letterSpacing:0.5 }}>
            {lang.toUpperCase()}
          </span>
          </button>

          {langOpen && (
            <div style={{
              position:'absolute', bottom:0, [isRTL ? 'right' : 'left']:52,
              background:'#1a2e42', border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:12, overflow:'hidden', zIndex:200, minWidth:136,
              boxShadow:'0 8px 24px rgba(0,0,0,0.5)',
            }}>
              {LANGS.map(l => (
                <button key={l.code}
                  onClick={() => { setLang(l.code); setLangOpen(false); }}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap:10,
                    padding:'10px 14px', border:'none', cursor:'pointer', fontSize:13,
                    fontWeight: lang === l.code ? 700 : 500,
                    background: lang === l.code ? 'rgba(72,202,228,0.15)' : 'transparent',
                    color: lang === l.code ? '#48cae4' : '#9ca3af', transition:'all 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = lang === l.code ? 'rgba(72,202,228,0.15)' : 'transparent')}
                >
                  <span style={{ fontSize:13, fontWeight:700, color: lang===l.code ? '#48cae4':'#9ca3af', minWidth:24 }}>
                    {l.code.toUpperCase()}
                  </span>
                  <span>{l.label}</span>
                  {lang === l.code && <span style={{ marginLeft:'auto', color:'#48cae4', fontSize:11 }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          title={t.nav.logout || "Déconnexion"}
          onClick={handleLogout}
          style={{
            width:40, height:40, borderRadius:12, display:'flex', alignItems:'center',
            justifyContent:'center', background:'transparent', border:'none',
            color:'#4b5563', cursor:'pointer', transition:'color 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color='#f87171')}
          onMouseLeave={e => (e.currentTarget.style.color='#4b5563')}
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* Page content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, overflow:'hidden' }}>
        {children}
      </div>

      <style>{`
        a:hover .sidebar-tooltip { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
