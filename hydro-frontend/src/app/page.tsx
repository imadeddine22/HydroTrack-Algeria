'use client';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import {
  Activity, TrendingUp, ShieldCheck, MapPin,
  Droplets, Building2, Waves,
  CheckCircle2, XCircle,
  Search, Filter, X, ChevronDown, ChevronRight,
  BarChart2, AlertTriangle, Database, LayoutDashboard, MessageSquare,
} from 'lucide-react';
import InfraModal from '@/components/InfraModal';
import CyberInfraCard, { InfraItem } from '@/components/CyberInfraCard';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n/LanguageContext';

/* Feature icons in order */
const FEATURE_ICONS = [Activity, MapPin, TrendingUp, ShieldCheck];

/* ── Infra config ─────────────────────────────────────── */
const CFG = {
  forage: { Icon: Droplets, label: 'Forage', bg: 'bg-cyan-50', color: 'text-[#00b4d8]', bar: 'from-cyan-400 to-cyan-600' },
  tank: { Icon: Building2, label: "Château d'eau", bg: 'bg-blue-50', color: 'text-[#0077b6]', bar: 'from-blue-400 to-blue-600' },
  dam: { Icon: Waves, label: 'Barrage', bg: 'bg-indigo-50', color: 'text-[#03045e]', bar: 'from-indigo-400 to-indigo-600' },
} as const;

/* ── Helpers ──────────────────────────────────────────── */
interface Item { _id: string; name: string }

const SEL = 'w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-[#112347] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

function SelectBox({ label, value, onChange, items, disabled }: {
  label: string; value: string; onChange: (v: string) => void; items: Item[]; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select className={SEL} value={value} disabled={disabled} onChange={e => onChange(e.target.value)}>
        <option value="">{label}</option>
        {items.sort((a,b)=>(Number((a as any).code)||99)-(Number((b as any).code)||99)).map(i => (
          <option key={i._id} value={i._id}>
            {(i as any).code ? `${(i as any).code} - ` : ''}{i.name}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-[#112347]">{value}</p>
      </div>
    </div>
  );
}



function AquaRow({ k, v, accent }: { k: string; v: string; accent?: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[11px] text-white/60 font-medium">{k}</span>
      <span className={`text-[11px] font-bold ${accent ? '' : 'text-white'} drop-shadow-sm`} style={{ color: accent || '#ffffff' }}>{v}</span>
    </div>
  );
}

function RowKV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{k}</span>
      <span className="font-bold text-[#112347]">{v}</span>
    </div>
  );
}

function CategorySection({ title, icon: Icon, items, color, onCardClick }: {
  title: string; icon: any; items: InfraItem[]; color: string; onCardClick: (i: InfraItem) => void;
}) {
  const { t } = useLang();
  if (items.length === 0) return null;
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-[#112347]">{title}</h3>
          <p className="text-xs text-gray-400 font-semibold">{items.length} {t.explore.found}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {items.map(item => (
          <CyberInfraCard key={item._id} item={item} onClick={() => onCardClick(item)} />
        ))}
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────── */
export default function HomePage() {
  const { t, isRTL } = useLang();
  /* Geo */
  const [wilayas, setWilayas] = useState<Item[]>([]);
  const [communes, setCommunes] = useState<Item[]>([]);
  const [zones, setZones] = useState<Item[]>([]);
  const [wid, setWid] = useState('');
  const [cid, setCid] = useState('');
  const [zid, setZid] = useState('');

  /* Data */
  const [allInfras, setAllInfras] = useState<InfraItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* Filters */
  const [typeFilter, setTypeFilter] = useState<'all' | 'forage' | 'tank' | 'dam'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [search, setSearch] = useState('');

  /* Modal */
  const [selected, setSelected] = useState<InfraItem | null>(null);

  /* Geo loading */
  useEffect(() => { api.get('/api/wilayas').then(setWilayas).catch(() => { }); }, []);
  useEffect(() => {
    setCid(''); setZid(''); setZones([]);
    if (wid) api.get(`/api/communes?wilayaId=${wid}`).then(setCommunes).catch(() => { });
    else setCommunes([]);
  }, [wid]);
  useEffect(() => {
    setZid('');
    if (cid) api.get(`/api/zones?communeId=${cid}`).then(setZones).catch(() => { });
    else setZones([]);
  }, [cid]);

  /* Fetch Data */
  useEffect(() => {
    setLoading(true); setError('');
    
    // Construct query
    let url = '/api/wilaya-infra';
    const params = new URLSearchParams();
    if (wid) params.append('wilayaId', wid);
    // Note: We don't filter by status in the API call here to allow client-side switching,
    // but the default client-side filter is 'active'.
    
    if (params.toString()) url += `?${params.toString()}`;

    api.get(url)
      .then(d => setAllInfras(Array.isArray(d) ? d : []))
      .catch(() => setError('Failed to load infrastructures.'))
      .finally(() => setLoading(false));
  }, [wid]);

  /* Filtered */
  const filtered = useMemo(() => {
    return allInfras.filter(i => {
      // 1. Type matching
      let matchType = (typeFilter === 'all');
      if (!matchType) {
        if (typeFilter === 'forage') matchType = i.type === 'forage';
        else if (typeFilter === 'tank') matchType = (i.type === 'tank' || i.type === 'chateau_eau');
        else if (typeFilter === 'dam') matchType = (i.type === 'dam' || i.type === 'barrage');
      }
      
      // 2. Status matching
      const matchStatus = statusFilter === 'all' || i.status === statusFilter;
      
      // 3. Search matching
      const s = search.toLowerCase();
      const matchSearch = !search || 
        i.name.toLowerCase().includes(s) || 
        (i.name_ar && i.name_ar.includes(s)) ||
        i._id.toLowerCase().includes(s);
        
      return matchType && matchStatus && matchSearch;
    });
  }, [allInfras, typeFilter, statusFilter, search]);

  /* Stats */
  const stats = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter(i => i.status === 'active').length;
    const inactive = total - active;
    const capacity = filtered.reduce((a, i) => {
      const val = i.capacity ?? i.capacite ?? i.volumeTotal ?? 0;
      return a + Number(val);
    }, 0);
    return { total, active, inactive, capacity };
  }, [filtered]);

  /* Categorization */
  const forages = useMemo(() => filtered.filter(i => i.type === 'forage'), [filtered]);
  const tanks = useMemo(() => filtered.filter(i => i.type === 'tank' || i.type === 'chateau_eau'), [filtered]);
  const dams = useMemo(() => filtered.filter(i => i.type === 'dam' || i.type === 'barrage'), [filtered]);
  const others = useMemo(() => filtered.filter(i => 
    i.type !== 'forage' && i.type !== 'tank' && i.type !== 'chateau_eau' && i.type !== 'dam' && i.type !== 'barrage'
  ), [filtered]);

  const hasZone = true; // Show national data by default

  return (
    <main className="overflow-x-hidden w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section id="home" className="relative min-h-[100vh] flex items-center pt-28 pb-40 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 bg-[#E3F2FD]">
          <img src="/hero-bg.png" alt="Water Background" className="w-full h-full object-cover object-center mix-blend-multiply opacity-60" />
        </div>

        {/* Top Wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="relative block w-full h-[120px] md:h-[280px]">
            <path fill="#ffffff" fillOpacity="1" d="M0,256L80,240C160,224,320,192,480,181.3C640,171,800,181,960,165.3C1120,149,1280,107,1360,85.3L1440,64L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" />
          </svg>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="relative block w-full h-[80px] md:h-[200px]">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L80,117.3C160,139,320,181,480,170.7C640,160,800,96,960,85.3C1120,75,1280,117,1360,138.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" />
          </svg>
        </div>

        {/* Water image — hidden on mobile, shown on md+ */}
        <div
          className={`hidden md:block absolute top-1/2 -translate-y-[45%] z-10 pointer-events-none ${isRTL ? 'left-0' : 'right-0'}`}
          style={{ width: 'clamp(340px, 52vw, 780px)' }}
        >
          <img
            src="/hero-water-mass-transparent.png"
            alt=""
            className="w-full h-auto object-contain"
            style={{
              mixBlendMode: 'multiply',
              WebkitMaskImage: isRTL
                ? `linear-gradient(to left, transparent 0%, black 18%, black 100%), linear-gradient(to bottom, transparent 0%, black 20%, black 100%)`
                : `linear-gradient(to right, transparent 0%, black 18%, black 100%), linear-gradient(to bottom, transparent 0%, black 20%, black 100%)`,
              WebkitMaskComposite: 'destination-in',
              maskImage: isRTL
                ? `linear-gradient(to left, transparent 0%, black 18%, black 100%), linear-gradient(to bottom, transparent 0%, black 20%, black 100%)`
                : `linear-gradient(to right, transparent 0%, black 18%, black 100%), linear-gradient(to bottom, transparent 0%, black 20%, black 100%)`,
              maskComposite: 'intersect',
            }}
          />
        </div>

        {/* ── HERO CONTENT ─────────────────────────────────── */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 pb-10">
          <div className={`w-full md:w-1/2 pt-6 md:pt-0 ${isRTL ? 'pr-0 md:pr-16 text-right' : 'pl-0 md:pl-16 text-left'}`}>
            
            {/* Mobile-Only Badge */}
            <div className="inline-flex md:hidden items-center gap-2 bg-[#00D4FF]/10 border border-[#00D4FF]/20 rounded-full px-3 py-1 mb-6 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-[#00D4FF]" />
              <span className="text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider">
                {t.hero.badge}
              </span>
            </div>

            <h1 className="text-[2.2rem] sm:text-[2.8rem] md:text-[3.5rem] font-extrabold text-[#0B1E40] leading-[1.1] tracking-tight mb-6">
              <span className="block">{t.hero.title1}</span>
              <span className="bg-gradient-to-r from-[#00D4FF] to-[#0077B6] bg-clip-text text-transparent">
                {t.hero.title2}
              </span>
              <span className="block mt-1">{t.hero.title3}</span>
            </h1>
            
            <p className="text-[#4A5568] text-base sm:text-lg md:text-xl mb-8 max-w-lg leading-relaxed opacity-90">
              {t.hero.desc}
            </p>

            {/* Premium Mobile Image Section — Liquid Blob Design */}
            <div className="block md:hidden relative mb-12 mt-4 flex justify-center">
              {/* Animated Glow behind blob */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00D4FF]/20 blur-[60px] rounded-full animate-pulse" />
              
              <div className="relative w-full max-w-[300px] aspect-square group">
                {/* Liquid Blob Container */}
                <div className="absolute inset-0 bg-[#00D4FF]/10 backdrop-blur-xl rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] border-2 border-white/60 shadow-[0_20px_50px_rgba(0,212,255,0.3)] overflow-hidden animate-liquid transition-all duration-700">
                  <img
                    src="/hero-water-mass-transparent.png"
                    alt=""
                    className="w-full h-full object-cover opacity-90 scale-125 translate-y-4 transition-transform duration-700 group-hover:scale-150"
                    style={{
                      mixBlendMode: 'multiply',
                    }}
                  />
                </div>

                {/* Floating Status Indicator on Blob */}
                <div className={`absolute -bottom-2 -right-2 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white flex items-center gap-3 animate-float z-20`}>
                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-cyan-500" />
                  </div>
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{isRTL ? 'حالة الشبكة' : 'Network Status'}</p>
                    <p className="text-xs font-bold text-green-500">{isRTL ? 'متصل ومستقر' : 'Stable & Active'}</p>
                  </div>
                </div>

                {/* Secondary Decorative Blob Stroke */}
                <div className="absolute inset-0 border-2 border-[#00D4FF]/30 rounded-[40%_60%_60%_40%_/_40%_40%_60%_60%] scale-110 -z-10 animate-liquid-slow opacity-50" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center">
              <a href="#explore"
                className="group relative overflow-hidden px-8 py-4 bg-[#00D4FF] text-white font-bold rounded-2xl shadow-[0_10px_25px_rgba(0,212,255,0.3)] hover:shadow-[0_15px_35px_rgba(0,212,255,0.5)] transition-all text-center">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t.hero.cta1}
                  <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
              <a href="#contact"
                className="px-8 py-4 bg-white/80 backdrop-blur-md text-[#0B1E40] font-bold rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all text-center flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00D4FF]" />
                {t.hero.cta2}
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-[2.5rem] font-bold text-[#0B1E40] mb-4">
              {t.features.heading}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-4 relative">
            {t.features.items.map((feat, idx) => {
              const Icon = FEATURE_ICONS[idx];
              return (
                <div key={`feat-${idx}`} className="flex-1 flex flex-col items-center text-center px-4 w-full relative z-10">
                  <div className="mb-6">
                    <Icon className="w-16 h-16 text-[#00D4FF]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-semibold text-[#0B1E40] mb-4">{feat.t}</h3>
                  <p className="text-[#64748B] text-sm leading-relaxed max-w-[250px]">{feat.d}</p>
                </div>
              );
            })}
            {[25, 50, 75].map(pos => (
              <div key={pos} className="hidden md:block absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-gray-200 z-0" style={{ left: `${pos}%` }}>
                <svg width="12" height="120" viewBox="0 0 12 120" fill="none">
                  <path d="M6 0 Q12 15 6 30 T6 60 T6 90 T6 120" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── INFRASTRUCTURE EXPLORER ───────────────────────── */}
      <section id="explore" className="relative py-32 bg-[#EBF5FF] overflow-hidden">
        {/* Top Wave Mask */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="relative block w-full h-[100px] md:h-[150px]">
            <path fill="#ffffff" fillOpacity="1" d="M0,160L80,176C160,192,320,224,480,213.3C640,203,800,149,960,122.7C1120,96,1280,96,1360,96L1440,96L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className={`flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mb-12 md:mb-20 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            <div className={`w-full lg:w-1/2 ${isRTL ? 'text-right' : ''}`}>
              <h2 className="text-[1.8rem] sm:text-[2.2rem] md:text-[3rem] lg:text-[3.5rem] font-extrabold text-[#0B1E40] leading-[1.1] tracking-tight mb-4 md:mb-6">
                {t.explore.title1}<br />
                {t.explore.title2}<br />
                {t.explore.title3}
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed max-w-lg">
                {t.explore.desc}
              </p>
            </div>
            <div className="w-full lg:w-1/2 relative flex items-center justify-center py-4 lg:py-8">
              <img
                src="/algeria-infra.jpg"
                alt="Oued Dib Bridge, Beni Haroun Dam - Algeria"
                className="tri alt"
                style={{ width: 'clamp(180px, 45vw, 360px)' }}
              />
              <img
                src="/algeria-infra2.jpg"
                alt="Water Infrastructure Algeria"
                className="tri"
                style={{ width: 'clamp(150px, 38vw, 300px)' }}
              />
            </div>
          </div>

          {/* Filter Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-5 h-5 text-[#00b4d8]" />
              <span className="font-bold text-[#112347]">{t.explore.geoFilter}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <SelectBox label={t.explore.selectWilaya} value={wid} onChange={v => { setWid(v); }} items={wilayas} />
              <SelectBox label={t.explore.selectCommune} value={cid} onChange={v => { setCid(v); }} items={communes} disabled={!wid} />
              <SelectBox label={t.explore.selectZone} value={zid} onChange={v => { setZid(v); }} items={zones} disabled={!cid} />
            </div>

            {/* Sub-filters */}
            <div className="border-t border-gray-100 pt-5 flex flex-col md:flex-row gap-4 items-start md:items-center flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-500">{t.explore.filterBy}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(['all', 'forage', 'tank', 'dam'] as const).map(tp => (
                  <button key={tp} onClick={() => setTypeFilter(tp)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${typeFilter === tp ? 'bg-[#0077b6] text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {tp === 'all' ? t.explore.allTypes : tp === 'forage' ? t.explore.forages : tp === 'tank' ? t.explore.tanks : t.explore.dams}
                  </button>
                ))}
              </div>

              <div className="w-px h-6 bg-gray-200 hidden md:block" />

              <div className="flex flex-wrap gap-2">
                {(['all', 'active', 'inactive'] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${statusFilter === s
                      ? s === 'active' ? 'bg-green-500 text-white' : s === 'inactive' ? 'bg-red-400 text-white' : 'bg-[#0077b6] text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {s === 'all' ? t.explore.allStatus : s === 'active' ? t.explore.active : t.explore.inactive}
                  </button>
                ))}
              </div>

              <div className="relative flex-1 md:max-w-xs md:ml-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder={t.explore.searchPlaceholder} value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00b4d8] text-[#112347] bg-gray-50" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {hasZone && filtered.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Database} label={t.explore.total} value={stats.total} color="bg-[#0077b6]" />
              <StatCard icon={CheckCircle2} label={t.explore.actives} value={stats.active} color="bg-green-500" />
              <StatCard icon={AlertTriangle} label={t.explore.inactives} value={stats.inactive} color="bg-red-400" />
              <StatCard icon={BarChart2} label={t.explore.capacity} value={stats.capacity.toLocaleString()} color="bg-indigo-500" />
            </div>
          )}

          {/* States */}
          {!hasZone && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-5">
                <MapPin className="w-10 h-10 text-[#00b4d8]" />
              </div>
              <h3 className="text-xl font-bold text-[#112347] mb-2">{t.explore.selectLocation}</h3>
              <p className="text-gray-400 max-w-sm">{t.explore.selectLocationDesc}</p>
            </div>
          )}

          {hasZone && loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin mb-5" />
              <p className="text-gray-400 font-semibold">{t.explore.loading}</p>
            </div>
          )}

          {hasZone && !loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {hasZone && !loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                <Activity className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-[#112347] mb-2">{t.explore.noResults}</h3>
              <p className="text-gray-400 max-w-sm">
                {search || typeFilter !== 'all' || statusFilter !== 'all'
                  ? t.explore.noResultsFilter
                  : t.explore.noResultsZone}
              </p>
            </div>
          )}

          {/* Infrastructure groups */}
          {hasZone && !loading && !error && filtered.length > 0 && (
            <>
              <CategorySection title={t.explore.forages} icon={Droplets} color="bg-[#00b4d8]" items={forages} onCardClick={setSelected} />
              <CategorySection title={t.explore.tanks} icon={Building2} color="bg-[#0077b6]" items={tanks} onCardClick={setSelected} />
              <CategorySection title={t.explore.dams} icon={Waves} color="bg-indigo-700" items={dams} onCardClick={setSelected} />
              <CategorySection title={t.explore.others || "Autres"} icon={Database} color="bg-gray-500" items={others} onCardClick={setSelected} />
            </>
          )}
        </div>
      </section>

      {/* ── ABOUT / EXPERT SECTION ────────────────────────── */}
      <section id="about" className="relative py-0 bg-white overflow-hidden">
        {/* Top wave */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[80px]">
            <path fill="#EBF5FF" fillOpacity="1" d="M0,40L120,50C240,60,480,80,720,70C960,60,1200,30,1320,20L1440,10L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z" />
          </svg>
        </div>

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex flex-col items-center gap-0 min-h-[540px] py-12 md:py-20 ${isRTL ? 'md:flex-row-reverse' : 'md:flex-row'}`}>

          {/* Expert Image */}
          <div className={`w-full md:w-[42%] relative flex justify-center items-center ${isRTL ? 'md:justify-end' : 'md:justify-start'}`}>
            <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-[#EBF5FF] rounded-full -translate-x-16" />
            <div className="hidden md:block absolute left-20 top-1/2 -translate-y-1/2 w-52 h-52 bg-[#00D4FF]/10 rounded-full" />
            <img
              src="/expert-man.png"
              alt="HydroTrack Expert"
              className="relative z-10 w-full max-w-[240px] sm:max-w-[300px] md:max-w-[380px] h-auto object-contain object-center select-none"
              style={{ filter: 'drop-shadow(0 20px 60px rgba(0,180,216,0.20))' }}
            />
          </div>

          {/* Text Content */}
          <div className={`w-full md:w-[58%] flex flex-col justify-center ${isRTL ? 'md:pr-16 text-right' : 'md:pl-16'}`}>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#00b4d8] mb-3">
              {t.about.badge}
            </span>
            <h2 className="text-[1.5rem] sm:text-[1.9rem] md:text-[2.8rem] font-extrabold text-[#0B1E40] leading-[1.15] mb-5 break-words">
              {t.about.title1}<br />
              {t.about.title2}<br />
              <span className="text-[#00D4FF]">{t.about.title3}</span>
            </h2>
            <p className="text-[#64748B] text-base md:text-lg leading-relaxed mb-6 max-w-xl">
              {t.about.desc}
            </p>

            {/* Checklist */}
            <ul className="space-y-3 mb-8">
              {[t.about.check1, t.about.check2, t.about.check3].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-[#0B1E40] font-medium text-sm md:text-base">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#00D4FF] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Expert bio card */}
            <div className="bg-[#EBF5FF] rounded-2xl p-5 flex items-start gap-5 max-w-xl border border-[#00D4FF]/20">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#00D4FF]/40 shadow">
                <img src="/expert-man.png" alt="Jamal Eddine Massaoudi" className="h-full w-full object-cover object-top scale-[1.6] translate-y-6" />
              </div>
              <div>
                <p className="font-extrabold text-[#0B1E40] text-base">Jamal Eddine Massaoudi</p>
                <p className="text-xs text-[#00b4d8] font-bold uppercase tracking-wide mb-2">
                  {t.about.expertTitle}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  {t.about.expertBio}
                </p>
                <div className="flex gap-3">
                  <a href="https://www.facebook.com/jamal.messaoudi.2025" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/in/jamal-eddine-massaoudi/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-800 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
                  </a>
                  <a href="https://wa.me/213698694461" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600 transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10 pointer-events-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="relative block w-full h-[60px] md:h-[80px]">
            <path fill="#f8fafc" fillOpacity="1" d="M0,40L120,30C240,20,480,0,720,10C960,20,1200,50,1320,60L1440,70L1440,80L1320,80C1200,80,960,80,720,80C480,80,240,80,120,80L0,80Z" />
          </svg>
        </div>
      </section>

      {/* ── CONTACT FORM SECTION ──────────────────────────── */}
      <section id="contact" className="relative pt-24 pb-32 bg-[#F4F9FC] overflow-hidden">
        
        {/* White Wave Background at the bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-0 pointer-events-none">
            <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="relative block w-full h-[150px] md:h-[250px]">
                <path fill="#ffffff" fillOpacity="1" d="M0,256L80,240C160,224,320,192,480,181.3C640,171,800,181,960,165.3C1120,149,1280,107,1360,85.3L1440,64L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
            </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`flex flex-col items-center gap-8 md:gap-16 lg:gap-24 ${isRTL ? 'md:flex-row-reverse' : 'md:flex-row'}`}>

            {/* Left – Text */}
            <div className={`w-full md:w-1/2 lg:w-[45%] ${isRTL ? 'text-right' : ''}`}>
              <h2 className="text-[1.6rem] sm:text-[2rem] md:text-[2.8rem] font-extrabold text-[#112347] leading-[1.2] mb-4 md:mb-6">
                {t.contact.title1}<br />
                {t.contact.title2}<br />
                {t.contact.title3}
              </h2>
              <p className="text-[#6B7280] text-sm md:text-base leading-relaxed">
                {t.contact.desc}
              </p>
            </div>

            {/* Right – Form */}
            <div className="w-full md:w-1/2 lg:w-[55%]">
              <ContactForm />
            </div>

          </div>
        </div>
      </section>

      {/* Modal */}
      {selected && <InfraModal item={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

/* ── Contact Form Component ───────────────────────────────────────────────── */
function ContactForm() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setStatus('sending');
    try {
      const res = await api.post('/api/messages', form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  const inp = 'w-full border border-gray-100 rounded-sm px-4 py-3.5 text-sm text-[#112347] placeholder-gray-400 focus:outline-none focus:border-[#00D4FF] transition-all bg-white';

  return (
    <div className="bg-white p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-50/50">
      {status === 'success' && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
          <CheckCircle2 className="text-green-500 shrink-0" size={20}/>
          <p className="text-green-700 text-sm font-semibold">{t.contact.success}</p>
        </div>
      )}
      {status === 'error' && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
          <XCircle className="text-red-500 shrink-0" size={20}/>
          <p className="text-red-700 text-sm font-semibold">{t.contact.error}</p>
        </div>
      )}
      <form className="flex flex-col gap-5" onSubmit={submit}>
        <input required type="text" placeholder={t.contact.name} value={form.name} onChange={e => set('name', e.target.value)} className={inp} />
        <div className="flex flex-col sm:flex-row gap-5">
          <input required type="email" placeholder={t.contact.email} value={form.email} onChange={e => set('email', e.target.value)} className={`flex-1 ${inp}`} />
          <input type="tel" placeholder={t.contact.phone} value={form.phone} onChange={e => set('phone', e.target.value)} className={`flex-1 ${inp}`} />
        </div>
        <input type="text" placeholder={t.contact.subject} value={form.subject} onChange={e => set('subject', e.target.value)} className={inp} />
        <textarea required rows={5} placeholder={t.contact.message} value={form.message} onChange={e => set('message', e.target.value)} className={`${inp} resize-none`} />
        <div className="pt-2">
          <button type="submit" disabled={status==='sending'}
            className="px-8 py-3.5 bg-[#00D4FF] text-white font-bold rounded-full hover:bg-[#00b4d8] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2">
            {status==='sending' ? (
              <><span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> {t.contact.sending}</>
            ) : t.contact.send}
          </button>
        </div>
      </form>
    </div>
  );
}
