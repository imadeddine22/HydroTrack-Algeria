'use client';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Save, Droplets, Building2, Waves, ChevronDown, Trash2, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n/LanguageContext';
import { type Lang } from '@/lib/i18n/translations';
import CyberInfraCard from '@/components/CyberInfraCard';
import CyberButton from '@/components/CyberButton';

interface Wilaya { _id: string; name: string; code?: string; }
interface WInfra {
  _id: string; wilayaId: { _id: string; name: string } | string;
  name: string; type: 'forage' | 'chateau_eau' | 'barrage';
  status: string; depth?: number; debitJournalier?: number;
  capacite?: number; hauteur?: number; niveauActuel?: number;
  volumeTotal?: number; volumeActuel?: number; tauxRemplissage?: number;
  sousType?: string;
  commune?: string; localisation?: string; anneeConstruction?: number; notes?: string;
}

const TYPES = [
  { value: 'forage',      labelFr: 'Forage',         labelEn: 'Borewell',      labelAr: 'آبار الحفر',      Icon: Droplets,  color: '#0096c7', bg: '#e0f7ff' },
  { value: 'chateau_eau', labelFr: "Château d'eau",  labelEn: 'Water Tower',   labelAr: 'خزان مياه',       Icon: Building2, color: '#2563eb', bg: '#dbeafe' },
  { value: 'barrage',     labelFr: 'Barrage',         labelEn: 'Dam',           labelAr: 'سد',              Icon: Waves,     color: '#7c3aed', bg: '#ede9fe' },
];

const STATUSES = [
  { value: 'active',          labelFr: 'Actif',            labelEn: 'Active',         labelAr: 'نشط',            color: '#059669', bg: '#d1fae5' },
  { value: 'inactive',        labelFr: 'Inactif',          labelEn: 'Inactive',       labelAr: 'غير نشط',        color: '#dc2626', bg: '#fee2e2' },
  { value: 'en_construction', labelFr: 'En construction',  labelEn: 'Under construction', labelAr: 'قيد الإنشاء', color: '#d97706', bg: '#fef3c7' },
  { value: 'en_maintenance',  labelFr: 'En maintenance',   labelEn: 'Under maintenance',  labelAr: 'تحت الصيانة', color: '#7c3aed', bg: '#ede9fe' },
];

const getLabel = (item: { labelFr: string; labelEn: string; labelAr: string }, lang: Lang) =>
  lang === 'ar' ? item.labelAr : lang === 'en' ? item.labelEn : item.labelFr;

const empty = {
  name:'', name_ar:'', name_en:'',
  type:'forage' as 'forage' | 'chateau_eau' | 'barrage', status:'active', sousType:'',
  commune:'', commune_ar:'', commune_en:'',
  localisation:'', localisation_ar:'', localisation_en:'',
  anneeConstruction:'',
  notes:'', notes_ar:'', notes_en:'',
  depth:'', debitJournalier:'', capacite:'', hauteur:'', niveauActuel:'', volumeTotal:'', volumeActuel:'', tauxRemplissage:''
};

const SOUS_TYPES: Record<string, { value: string; labelFr: string; labelAr: string }[]> = {
  forage: [
    { value: 'deep',    labelFr: 'Profond',     labelAr: 'عميقة' },
    { value: 'shallow', labelFr: 'Superficiel', labelAr: 'سطحية' },
  ],
  chateau_eau: [
    { value: 'elevated', labelFr: 'Surélevé', labelAr: 'مرتفع' },
    { value: 'ground',   labelFr: 'Sol',       labelAr: 'عادي'  },
  ],
};

export default function WilayaInfraPage() {
  const { t, lang, isRTL } = useLang();
  const w = t.wilayaInfraPage;
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [wid, setWid] = useState('');
  const [items, setItems] = useState<WInfra[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WInfra | null>(null);
  const [form, setForm] = useState<typeof empty>({ ...empty });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Geo Management state
  const [isAddingWilaya, setIsAddingWilaya] = useState(false);
  const [newWilayaName, setNewWilayaName] = useState('');
  const [newWilayaCode, setNewWilayaCode] = useState('');
  const [editingWilaya, setEditingWilaya] = useState<Wilaya | null>(null);
  const [isGeoLoading, setIsGeoLoading] = useState(false);
  const [communes, setCommunes] = useState<{_id:string, name:string}[]>([]);
  const [selectedCid, setSelectedCid] = useState('');
  const [zones, setZones] = useState<{_id:string, name:string}[]>([]);
  const [isAddingCommune, setIsAddingCommune] = useState(false);
  const [newCommuneName, setNewCommuneName] = useState('');
  const [editingCommune, setEditingCommune] = useState<{_id:string, name:string} | null>(null);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [editingZone, setEditingZone] = useState<{_id:string, name:string} | null>(null);

  useEffect(() => { api.get('/api/wilayas').then(setWilayas).catch(() => {}); }, []);

  const loadItems = (wilayaId: string) => {
    if (!wilayaId) { setItems([]); return; }
    setLoading(true);
    api.get(`/api/wilaya-infra/by-wilaya/${wilayaId}`)
      .then(d => setItems([...(d.grouped?.forages||[]), ...(d.grouped?.chateaux_eau||[]), ...(d.grouped?.barrages||[])]))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleWilaya = (id: string) => { 
    setWid(id); 
    setSelectedCid('');
    setZones([]);
    loadItems(id);
    if (id) {
      api.get(`/api/communes?wilayaId=${id}`).then(setCommunes).catch(() => {});
    } else {
      setCommunes([]);
    }
  };

  const handleCommune = (id: string) => {
    setSelectedCid(id);
    if (id) {
      api.get(`/api/zones?communeId=${id}`).then(setZones).catch(() => {});
    } else {
      setZones([]);
    }
  };

  const handleCreateWilaya = async () => {
    if (!newWilayaName.trim()) return;
    setIsGeoLoading(true);
    try {
      const res = await api.post('/api/wilayas', { 
        name: newWilayaName.trim(), 
        code: newWilayaCode.trim() 
      });
      const all = await api.get('/api/wilayas');
      setWilayas(all);
      setIsAddingWilaya(false);
      setNewWilayaName('');
      setNewWilayaCode('');
      handleWilaya(res._id);
    } catch (e) {}
    setIsGeoLoading(false);
  };

  const handleUpdateWilaya = async () => {
    if (!editingWilaya || !newWilayaName.trim()) return;
    setIsGeoLoading(true);
    try {
      await api.put(`/api/wilayas/${editingWilaya._id}`, { 
        name: newWilayaName.trim(), 
        code: newWilayaCode.trim() 
      });
      const all = await api.get('/api/wilayas');
      setWilayas(all);
      setEditingWilaya(null);
      setNewWilayaName('');
      setNewWilayaCode('');
    } catch (e) {}
    setIsGeoLoading(false);
  };

  const startEditWilaya = (wil: Wilaya) => {
    setEditingWilaya(wil);
    setNewWilayaName(wil.name);
    setNewWilayaCode(wil.code || '');
    setIsAddingWilaya(true);
  };

  const handleDeleteWilaya = async () => {
    if (!wid) return;
    const name = wilayas.find(x => x._id === wid)?.name;
    if (!confirm(t.geoPage.confirmDeleteWilaya)) return;
    setIsGeoLoading(true);
    try {
      await api.delete(`/api/wilayas/${wid}`);
      const all = await api.get('/api/wilayas');
      setWilayas(all);
      handleWilaya('');
    } catch (e) {}
    setIsGeoLoading(false);
  };

  const handleCreateCommune = async () => {
    if (!newCommuneName.trim() || !wid) return;
    setIsGeoLoading(true);
    try {
      if (editingCommune) {
        await api.put(`/api/communes/${editingCommune._id}`, { name: newCommuneName.trim() });
      } else {
        await api.post('/api/communes', { name: newCommuneName.trim(), wilayaId: wid });
      }
      const res = await api.get(`/api/communes?wilayaId=${wid}`);
      setCommunes(res);
      setIsAddingCommune(false);
      setEditingCommune(null);
      setNewCommuneName('');
    } catch (e) {}
    setIsGeoLoading(false);
  };

  const handleDeleteCommune = async (id: string) => {
    if (!confirm(t.geoPage.confirmDeleteCommune)) return;
    setIsGeoLoading(true);
    try {
      await api.delete(`/api/communes/${id}`);
      const res = await api.get(`/api/communes?wilayaId=${wid}`);
      setCommunes(res);
      if (selectedCid === id) {
        setSelectedCid('');
        setZones([]);
      }
    } catch (e) {}
    setIsGeoLoading(false);
  };

  const handleCreateZone = async () => {
    if (!newZoneName.trim() || !selectedCid) return;
    setIsGeoLoading(true);
    try {
      if (editingZone) {
        await api.put(`/api/zones/${editingZone._id}`, { name: newZoneName.trim() });
      } else {
        await api.post('/api/zones', { name: newZoneName.trim(), communeId: selectedCid });
      }
      const res = await api.get(`/api/zones?communeId=${selectedCid}`);
      setZones(res);
      setIsAddingZone(false);
      setEditingZone(null);
      setNewZoneName('');
    } catch (e) {}
    setIsGeoLoading(false);
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm(t.geoPage.confirmDeleteZone || 'Supprimer cette zone ?')) return;
    setIsGeoLoading(true);
    try {
      await api.delete(`/api/zones/${id}`);
      const res = await api.get(`/api/zones?communeId=${selectedCid}`);
      setZones(res);
    } catch (e) {}
    setIsGeoLoading(false);
  };

  const openAdd = () => { setEditing(null); setForm({ ...empty }); setShowForm(true); };
  const openEdit = (item: WInfra) => {
    setEditing(item);
    setForm({
      name: item.name, name_ar: (item as any).name_ar||'', name_en: (item as any).name_en||'',
      type: item.type, status: item.status, sousType: item.sousType||'',
      commune: item.commune||'', commune_ar: (item as any).commune_ar||'', commune_en: (item as any).commune_en||'',
      localisation: item.localisation||'', localisation_ar: (item as any).localisation_ar||'', localisation_en: (item as any).localisation_en||'',
      notes: item.notes||'', notes_ar: (item as any).notes_ar||'', notes_en: (item as any).notes_en||'',
      anneeConstruction: item.anneeConstruction?.toString()||'',
      depth: item.depth?.toString()||'', debitJournalier: item.debitJournalier?.toString()||'',
      capacite: item.capacite?.toString()||'', hauteur: item.hauteur?.toString()||'',
      niveauActuel: item.niveauActuel?.toString()||'',
      volumeTotal: item.volumeTotal?.toString()||'', volumeActuel: item.volumeActuel?.toString()||'',
      tauxRemplissage: item.tauxRemplissage?.toString()||'',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !wid) return;
    setSaving(true);
    const num = (v: string) => v !== '' ? Number(v) : null;
    const body: any = {
      wilayaId: wid, name: form.name.trim(), name_ar: form.name_ar.trim()||null, name_en: form.name_en.trim()||null,
      type: form.type, status: form.status,
      sousType: form.sousType || null,
      commune: form.commune||null, commune_ar: form.commune_ar||null, commune_en: form.commune_en||null,
      localisation: form.localisation||null, localisation_ar: form.localisation_ar||null, localisation_en: form.localisation_en||null,
      notes: form.notes||null, notes_ar: form.notes_ar||null, notes_en: form.notes_en||null,
      anneeConstruction: num(form.anneeConstruction),
      depth: num(form.depth), debitJournalier: num(form.debitJournalier),
      capacite: num(form.capacite), hauteur: num(form.hauteur), niveauActuel: num(form.niveauActuel),
      volumeTotal: num(form.volumeTotal), volumeActuel: num(form.volumeActuel), tauxRemplissage: num(form.tauxRemplissage),
    };
    try {
      if (editing) { await api.put(`/api/wilaya-infra/${editing._id}`, body); }
      else { await api.post('/api/wilaya-infra', body); }
      setShowForm(false); loadItems(wid);
    } catch (e) {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(w.deleteConfirm)) return;
    setDeleting(id);
    await api.delete(`/api/wilaya-infra/${id}`).catch(() => {});
    setDeleting(null); loadItems(wid);
  };

  const filtered = typeFilter === 'all' ? items : items.filter(i => i.type === typeFilter);
  const f = (v: string, k: keyof typeof form) => setForm(p => ({ ...p, [k]: v }));

  const typeInfo = (tp: string) => TYPES.find(x => x.value === tp) || TYPES[0];

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ background:'white', borderBottom:'1px solid #f3f4f6', padding:'20px 28px', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize:20, fontWeight:800, color:'#112347', margin:'0 0 4px' }}>{w.title}</h1>
          <p style={{ fontSize:13, color:'#9ca3af', margin:0 }}>{w.desc}</p>
        </div>
        {wid && (
          <CyberButton onClick={openAdd} icon={Plus}>
            {w.add}
          </CyberButton>
        )}
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        {/* Wilaya selector */}
        <div style={{ background:'white', borderRadius:18, padding:20, marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:'1px solid #f3f4f6' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <p style={{ fontSize:12, fontWeight:700, color:'#112347', margin:0 }}>{w.selectWilaya}</p>
            <div style={{ display:'flex', gap:8 }}>
              {isAddingWilaya ? (
                <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                  <input 
                    placeholder="01"
                    value={newWilayaCode}
                    onChange={e => setNewWilayaCode(e.target.value)}
                    style={{ border:'1px solid #3b82f6', borderRadius:8, padding:'4px 8px', fontSize:12, outline:'none', width:40 }}
                  />
                  <input 
                    autoFocus
                    placeholder={t.geoPage.wilayaName}
                    value={newWilayaName}
                    onChange={e => setNewWilayaName(e.target.value)}
                    style={{ border:'1px solid #3b82f6', borderRadius:8, padding:'4px 8px', fontSize:12, outline:'none' }}
                  />
                  <button onClick={editingWilaya ? handleUpdateWilaya : handleCreateWilaya} disabled={isGeoLoading || !newWilayaName.trim()} 
                    style={{ background:'#059669', color:'white', border:'none', borderRadius:8, padding:'4px 12px', cursor:'pointer', fontWeight:700, fontSize:11, display:'flex', alignItems:'center', gap:4 }}>
                    {isGeoLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
                    {editingWilaya ? t.geoPage.modification : t.geoPage.save}
                  </button>
                  <button onClick={() => {setIsAddingWilaya(false); setEditingWilaya(null); setNewWilayaName(''); setNewWilayaCode('');}} style={{ color:'#ef4444', background:'transparent', border:'none', cursor:'pointer' }}>
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsAddingWilaya(true)} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:700, color:'#3b82f6', background:'#eff6ff', border:'none', padding:'4px 8px', borderRadius:8, cursor:'pointer' }}>
                  <Plus size={14} /> {t.geoPage.addWilaya}
                </button>
              )}
            </div>
          </div>
          
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <div style={{ position:'relative', flex:1, maxWidth:360 }}>
              <select value={wid} onChange={e => handleWilaya(e.target.value)}
                style={{ width:'100%', appearance:'none', background:'white', border:'1.5px solid #e5e7eb', borderRadius:12, padding: isRTL ? '11px 14px 11px 44px' : '11px 44px 11px 14px', fontSize:13, fontWeight:600, color:'#112347', cursor:'pointer' }}>
                <option value="">{w.chooseWilaya}</option>
                {[...wilayas].sort((a,b)=>(Number(a.code)||99)-(Number(b.code)||99)).map(wilaya => (
                  <option key={wilaya._id} value={wilaya._id}>
                    {wilaya.code ? `${wilaya.code} - ` : ''}{wilaya.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} color="#9ca3af" style={{ position:'absolute', [isRTL ? 'left' : 'right']:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
            </div>
            {wid && (
              <div style={{display:'flex', gap:8}}>
                <button onClick={() => startEditWilaya(wilayas.find(x=>x._id===wid)!)} style={{ padding:11, borderRadius:12, background:'#f0f9ff', color:'#0369a1', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <RefreshCw size={18} />
                </button>
                <button onClick={handleDeleteWilaya} disabled={isGeoLoading} style={{ padding:11, borderRadius:12, background:'#fef2f2', color:'#ef4444', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {isGeoLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
            )}
          </div>

          {/* Communes management */}
          {wid && (
            <div style={{ marginTop:24, paddingTop:24, borderTop:'1px solid #f1f5f9' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:800, color:'#1e293b', margin:0 }}>🏘️ {t.geoPage.communeName}</p>
                  <p style={{ fontSize:11, color:'#94a3b8', margin:0 }}>{t.geoPage.desc}</p>
                </div>
                {!isAddingCommune && (
                  <button onClick={() => setIsAddingCommune(true)} 
                    style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'white', background:'#3b82f6', border:'none', padding:'8px 16px', borderRadius:10, cursor:'pointer', boxShadow:'0 4px 12px rgba(59, 130, 246, 0.2)' }}>
                    <Plus size={16} /> {t.geoPage.addCommune}
                  </button>
                )}
              </div>

              {isAddingCommune && (
                <div style={{ background:'#f8fafc', padding:16, borderRadius:16, border:'1px solid #e2e8f0', marginBottom:16 }}>
                  <label style={{ fontSize:11, fontWeight:800, color:'#64748b', display:'block', marginBottom:8 }}>
                    {editingCommune ? t.geoPage.modification : t.geoPage.communeName} {lang === 'ar' && !editingCommune && '(أدخل بلديات متعددة مفصولة بفواصل)'}
                  </label>
                  <div style={{ display:'flex', gap:8 }}>
                    <input 
                      autoFocus
                      placeholder={editingCommune ? "" : "أدرار, تامست, رقان..."}
                      value={newCommuneName}
                      onChange={e => setNewCommuneName(e.target.value)}
                      style={{ flex:1, border:'1.5px solid #e2e8f0', borderRadius:10, padding:'10px 14px', fontSize:13, outline:'none', background:'white' }}
                      onKeyDown={e => e.key === 'Enter' && handleCreateCommune()}
                    />
                    <button onClick={handleCreateCommune} disabled={isGeoLoading || !newCommuneName.trim()} 
                      style={{ padding:'10px 20px', background:'#059669', color:'white', border:'none', borderRadius:10, cursor:'pointer', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                      {isGeoLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                      {t.geoPage.save}
                    </button>
                    <button onClick={() => { setIsAddingCommune(false); setEditingCommune(null); setNewCommuneName(''); }} 
                      style={{ padding:'10px', background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:10, cursor:'pointer', color:'#64748b' }}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {communes.length > 0 ? communes.map(c => (
                  <div key={c._id} 
                    onClick={() => handleCommune(c._id)}
                    style={{ 
                      display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background: selectedCid === c._id ? '#eff6ff' : 'white', 
                      border:`1px solid ${selectedCid === c._id ? '#3b82f6' : '#e2e8f0'}`, borderRadius:10, fontSize:13, color:'#334155', fontWeight:600,
                      transition:'all 0.2s', cursor:'pointer', transform: selectedCid === c._id ? 'scale(1.02)' : 'none',
                      boxShadow: selectedCid === c._id ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none'
                    }}
                  >
                    <span>{c.name}</span>
                    <div style={{display:'flex', gap:4}}>
                      <button onClick={(e) => { e.stopPropagation(); setEditingCommune(c); setNewCommuneName(c.name); setIsAddingCommune(true); }} 
                        style={{ border:'none', background:'transparent', cursor:'pointer', color:'#cbd5e1', padding:0, display:'flex', transition:'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                        onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteCommune(c._id); }} 
                        style={{ border:'none', background:'transparent', cursor:'pointer', color:'#cbd5e1', padding:0, display:'flex', transition:'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div style={{ width:'100%', padding:'32px 0', textAlign:'center', border:'1px dashed #e2e8f0', borderRadius:16 }}>
                    <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>{t.geoPage.noCommunes}</p>
                  </div>
                )}
              </div>

              {/* Zones management */}
              {selectedCid && (
                <div style={{ marginTop:24, padding:'16px 20px', background:'#f8fafc', borderRadius:20, border:'1.5px solid #e2e8f0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <div>
                      <p style={{ fontSize:13, fontWeight:800, color:'#1e293b', margin:0 }}>📍 {t.geoPage.zoneName}s</p>
                      <p style={{ fontSize:11, color:'#94a3b8', margin:0 }}>Zones pour {communes.find(x=>x._id===selectedCid)?.name}</p>
                    </div>
                    {!isAddingZone && (
                      <button onClick={() => setIsAddingZone(true)} 
                        style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700, color:'#3b82f6', background:'white', border:'1px solid #3b82f6', padding:'6px 12px', borderRadius:8, cursor:'pointer' }}>
                        <Plus size={14} /> {t.geoPage.addZone || 'Ajouter Zone'}
                      </button>
                    )}
                  </div>

                  {isAddingZone && (
                    <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                      <input 
                        autoFocus
                        placeholder={editingZone ? "" : "Zone..."}
                        value={newZoneName}
                        onChange={e => setNewZoneName(e.target.value)}
                        style={{ flex:1, border:'1px solid #cbd5e1', borderRadius:8, padding:'8px 12px', fontSize:12, outline:'none' }}
                        onKeyDown={e => e.key === 'Enter' && handleCreateZone()}
                      />
                      <button onClick={handleCreateZone} disabled={isGeoLoading || !newZoneName.trim()} 
                        style={{ padding:'8px 16px', background:'#3b82f6', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:12, display:'flex', alignItems:'center', gap:6 }}>
                        {isGeoLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={16} />}
                        {editingZone ? t.geoPage.modification : t.geoPage.save}
                      </button>
                      <button onClick={() => { setIsAddingZone(false); setEditingZone(null); setNewZoneName(''); }} 
                        style={{ padding:'8px', background:'white', border:'1px solid #cbd5e1', borderRadius:8, cursor:'pointer', color:'#64748b' }}>
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {zones.length > 0 ? zones.map(z => (
                      <div key={z._id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'white', borderRadius:10, border:'1px solid #e2e8f0' }}>
                        <span style={{ fontSize:12, color:'#334155', fontWeight:500 }}>{z.name}</span>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => { setEditingZone(z); setNewZoneName(z.name); setIsAddingZone(true); }}
                            style={{ border:'none', background:'transparent', cursor:'pointer', color:'#94a3b8' }}>
                            <RefreshCw size={14} />
                          </button>
                          <button onClick={() => handleDeleteZone(z._id)} 
                            style={{ border:'none', background:'transparent', cursor:'pointer', color:'#94a3b8' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <p style={{ fontSize:12, color:'#94a3b8', margin:0 }}>{t.geoPage.noZones || 'Aucune zone'}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!wid && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:260, color:'#cbd5e1' }}>
            <Droplets size={48} style={{ marginBottom:14 }} />
            <p style={{ fontSize:16, fontWeight:700, color:'#94a3b8', margin:'0 0 4px' }}>{w.selectWilayaDesc}</p>
            <p style={{ fontSize:13, color:'#cbd5e1', margin:0 }}>{w.selectWilayaSub}</p>
          </div>
        )}

        {wid && loading && (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
            <div style={{ width:36, height:36, border:'3px solid #e0f7ff', borderTopColor:'#00b4d8', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {wid && !loading && (
          <>
            {/* Stats */}
            <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
              {TYPES.map(tp => {
                const count = items.filter(i => i.type === tp.value).length;
                const TIcon = tp.Icon;
                return (
                  <div key={tp.value} style={{ background:tp.bg, borderRadius:14, padding:'10px 20px', display:'flex', alignItems:'center', gap:10 }}>
                    <TIcon size={18} color={tp.color} />
                    <div>
                      <span style={{ fontSize:20, fontWeight:800, color:tp.color, display:'block' }}>{count}</span>
                      <span style={{ fontSize:11, color:tp.color, fontWeight:600 }}>{getLabel(tp, lang)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Type filter */}
            <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
              {['all', ...TYPES.map(tp => tp.value)].map(tp => (
                <button key={tp} onClick={() => setTypeFilter(tp)}
                  style={{ padding:'6px 14px', borderRadius:99, border:'none', cursor:'pointer', fontSize:12, fontWeight:700,
                    background: typeFilter === tp ? '#0077b6' : '#f3f4f6', color: typeFilter === tp ? 'white' : '#6b7280' }}>
                  {tp === 'all' ? w.all : getLabel(typeInfo(tp), lang)}
                </button>
              ))}
            </div>

            {/* Items grid */}
            {filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'50px 0', color:'#94a3b8' }}>
                <Building2 size={36} style={{ marginBottom:10 }} />
                <p style={{ fontWeight:700, margin:'0 0 4px' }}>{w.noInfra}</p>
                <p style={{ fontSize:13, margin:0 }}>{w.clickAdd}</p>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
                {filtered.map(item => (
                  <CyberInfraCard
                    key={item._id}
                    item={item as any}
                    onEdit={(i: any) => openEdit(i as WInfra)}
                    onDelete={handleDelete}
                    deleting={deleting === item._id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal — rendered via portal to escape dashboard overflow:hidden */}
      {showForm && typeof document !== 'undefined' && createPortal(
        <div style={{ position:'fixed', inset:0, zIndex:99999, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background:'white', borderRadius:24, width:'100%', maxWidth:520, height:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
              <h2 style={{ fontSize:17, fontWeight:800, color:'#112347', margin:0 }}>
                {editing ? w.edit : w.addInfra} {w.anInfra}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ width:32, height:32, borderRadius:8, border:'1px solid #e5e7eb', background:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={15} color="#6b7280" />
              </button>
            </div>

            {/* Form body — scrollable container */}
            <div
              style={{ flex:1, overflowY:'auto', padding:24, background:'#fff' }}
            >
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {/* Type selector */}
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#6b7280', display:'block', marginBottom:8 }}>{w.type}</label>
                <div style={{ display:'flex', gap:8 }}>
                  {TYPES.map(tp => {
                    const TIcon = tp.Icon;
                    const active = form.type === tp.value;
                    return (
                      <button key={tp.value} onClick={() => f(tp.value, 'type')}
                        style={{ flex:1, padding:'10px 8px', borderRadius:12, border:`2px solid ${active ? tp.color : '#e5e7eb'}`,
                          background: active ? tp.bg : 'white', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        <TIcon size={18} color={active ? tp.color : '#9ca3af'} />
                        <span style={{ fontSize:10, fontWeight:700, color: active ? tp.color : '#9ca3af' }}>{getLabel(tp, lang)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sous-type */}
              {SOUS_TYPES[form.type] && (
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#6b7280', display:'block', marginBottom:8 }}>{w.subType}</label>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => f('', 'sousType')}
                      style={{ padding:'8px 14px', borderRadius:10, border:`2px solid ${!form.sousType ? '#112347' : '#e5e7eb'}`, background: !form.sousType ? '#112347' : 'white', cursor:'pointer', fontSize:12, fontWeight:700, color: !form.sousType ? 'white' : '#9ca3af' }}>
                      {w.none}
                    </button>
                    {SOUS_TYPES[form.type].map(st => {
                      const tp = TYPES.find(x => x.value === form.type)!;
                      const active = form.sousType === st.value;
                      return (
                        <button key={st.value} onClick={() => f(st.value, 'sousType')}
                          style={{ flex:1, padding:'8px 10px', borderRadius:10, border:`2px solid ${active ? tp.color : '#e5e7eb'}`, background: active ? tp.bg : 'white', cursor:'pointer', textAlign:'center' }}>
                          <span style={{ fontSize:13, fontWeight:700, color: active ? tp.color : '#6b7280', display:'block' }}>{isRTL ? st.labelAr : st.labelFr}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Name — trilingual */}
              <TriField
                label={w.name}
                fr={form.name}       onFr={v => f(v,'name')}
                ar={form.name_ar}    onAr={v => f(v,'name_ar')}
                en={form.name_en}    onEn={v => f(v,'name_en')}
                onAutoFr={v => f(v,'name')}  onAutoAr={v => f(v,'name_ar')} onAutoEn={v => f(v,'name_en')}
              />

              {/* Status */}
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#6b7280', display:'block', marginBottom:8 }}>{w.status}</label>
                <div style={{ position:'relative' }}>
                  <select value={form.status} onChange={e => f(e.target.value,'status')}
                    style={{ width:'100%', appearance:'none', border:'1.5px solid #e5e7eb', borderRadius:10, padding: isRTL ? '10px 12px 10px 36px' : '10px 36px 10px 12px', fontSize:13, fontWeight:600, color:'#112347' }}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{getLabel(s, lang)}</option>)}
                  </select>
                  <ChevronDown size={13} color="#9ca3af" style={{ position:'absolute', [isRTL ? 'left' : 'right']:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                </div>
              </div>

              {/* Shared */}
              <TriField
                label={w.commune}
                fr={form.commune}       onFr={v => f(v,'commune')}
                ar={form.commune_ar}    onAr={v => f(v,'commune_ar')}
                en={form.commune_en}    onEn={v => f(v,'commune_en')}
                onAutoFr={v => f(v,'commune')} onAutoAr={v => f(v,'commune_ar')} onAutoEn={v => f(v,'commune_en')}
              />
              <Field label={w.year} value={form.anneeConstruction} onChange={v => f(v,'anneeConstruction')} placeholder={w.yearPlaceholder} type="number" />
              <TriField
                label={w.location}
                fr={form.localisation}       onFr={v => f(v,'localisation')}
                ar={form.localisation_ar}    onAr={v => f(v,'localisation_ar')}
                en={form.localisation_en}    onEn={v => f(v,'localisation_en')}
                onAutoFr={v => f(v,'localisation')} onAutoAr={v => f(v,'localisation_ar')} onAutoEn={v => f(v,'localisation_en')}
              />

              {/* Forage fields */}
              {form.type === 'forage' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                  <Field label={w.depth} value={form.depth} onChange={v => f(v,'depth')} placeholder="ex: 120" type="number" unit={w.uM} />
                  <Field label={w.flow} value={form.debitJournalier} onChange={v => f(v,'debitJournalier')} placeholder="ex: 500" type="number" unit={w.uM3J} />
                  <Field label={w.level} value={form.niveauActuel} onChange={v => f(v,'niveauActuel')} placeholder="0-100" type="number" unit="%" />
                </div>
              )}

              {/* Château d'eau fields */}
              {form.type === 'chateau_eau' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                  <Field label={w.capacity} value={form.capacite} onChange={v => f(v,'capacite')} placeholder="ex: 1000" type="number" unit={w.uM3} />
                  <Field label={w.height} value={form.hauteur} onChange={v => f(v,'hauteur')} placeholder="ex: 25" type="number" unit={w.uM} />
                  <Field label={w.level} value={form.niveauActuel} onChange={v => f(v,'niveauActuel')} placeholder="0-100" type="number" unit="%" />
                </div>
              )}

              {/* Barrage fields */}
              {form.type === 'barrage' && (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                  <Field label={w.volTotal} value={form.volumeTotal} onChange={v => f(v,'volumeTotal')} placeholder="ex: 150" type="number" unit={w.uMm3} />
                  <Field label={w.volCurrent} value={form.volumeActuel} onChange={v => f(v,'volumeActuel')} placeholder="ex: 90" type="number" unit={w.uMm3} />
                  <Field label={w.fillRate} value={form.tauxRemplissage} onChange={v => f(v,'tauxRemplissage')} placeholder="0-100" type="number" unit="%" />
                </div>
              )}

              <TriField
                label={w.notes}
                fr={form.notes}       onFr={v => f(v,'notes')}
                ar={form.notes_ar}    onAr={v => f(v,'notes_ar')}
                en={form.notes_en}    onEn={v => f(v,'notes_en')}
                onAutoFr={v => f(v,'notes')} onAutoAr={v => f(v,'notes_ar')} onAutoEn={v => f(v,'notes_en')}
              />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding:'16px 24px', borderTop:'1px solid #f3f4f6', display:'flex', gap:10, justifyContent:'flex-end', flexShrink:0 }}>
              <button onClick={() => setShowForm(false)}
                style={{ padding:'10px 20px', borderRadius:10, border:'1px solid #e5e7eb', background:'white', cursor:'pointer', fontWeight:600, fontSize:13, color:'#6b7280' }}>
                {w.cancel}
              </button>
              <CyberButton onClick={handleSave} disabled={saving || !form.name.trim()} icon={Save}>
                {saving ? w.saving : w.save}
              </CyberButton>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type='text', unit }: { label:string; value:string; onChange:(v:string)=>void; placeholder?:string; type?:string; unit?:string }) {
  const { isRTL } = useLang();
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:12, fontWeight:700, color:'#6b7280' }}>{label}</label>
      <div style={{ position:'relative' }}>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width:'100%', padding: unit ? (isRTL ? '12px 16px 12px 40px' : '12px 40px 12px 16px') : '12px 16px', borderRadius:14, border:'1px solid #e5e7eb', fontSize:14, color:'#112347', outline:'none', fontWeight:500, background:'#fdfdfd' }}
          onFocus={e => (e.target.style.borderColor='#00b4d8')}
          onBlur={e => (e.target.style.borderColor='#e5e7eb')} />
        {unit && (
          <span style={{ position:'absolute', [isRTL ? 'left' : 'right']:16, top:'50%', transform:'translateY(-50%)', fontSize:14, fontWeight:700, color:'#9ca3af' }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

/* ── Auto-translate helper (MyMemory free API) ──────────────────── */
async function autoTranslate(text: string, from: string, to: string): Promise<string> {
  if (!text.trim()) return '';
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
    const data = await res.json();
    return data?.responseData?.translatedText || '';
  } catch { return ''; }
}

/* ── Trilingual field component ─────────────────────────────────── */
function TriField({ label, fr, ar, en, onFr, onAr, onEn, onAutoFr, onAutoAr, onAutoEn }: {
  label: string;
  fr: string; ar: string; en: string;
  onFr: (v:string)=>void; onAr: (v:string)=>void; onEn: (v:string)=>void;
  onAutoFr: (v:string)=>void; onAutoAr: (v:string)=>void; onAutoEn: (v:string)=>void;
}) {
  const LANGS_CONFIG = [
    { code:'ar', flag:'🇩🇿', label:'AR', value: ar, setter: onAr, autoFrom:'ar', others:['fr','en'] },
    { code:'fr', flag:'🇫🇷', label:'FR', value: fr, setter: onFr, autoFrom:'fr', others:['ar','en'] },
    { code:'en', flag:'🇬🇧', label:'EN', value: en, setter: onEn, autoFrom:'en', others:['fr','ar'] },
  ];

  const handleTranslate = async (srcCode: string, srcText: string) => {
    if (!srcText.trim()) return;
    const targets = LANGS_CONFIG.filter(l => l.code !== srcCode);
    for (const target of targets) {
      const result = await autoTranslate(srcText, srcCode, target.code);
      if (result) {
        if (target.code === 'fr') onAutoFr(result);
        if (target.code === 'ar') onAutoAr(result);
        if (target.code === 'en') onAutoEn(result);
      }
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:12, fontWeight:700, color:'#6b7280' }}>{label}</label>
      <div style={{ border:'1px solid #e5e7eb', borderRadius:14, overflow:'hidden', background:'#fff' }}>
        {LANGS_CONFIG.map(({ code, flag, label: lbl, value, setter }, idx) => (
          <div key={code} style={{ display:'flex', alignItems:'center', borderTop: idx===0 ? 'none' : '1px solid #f3f4f6' }}>
            <div style={{ width:48, height:42, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc', flexShrink:0, borderRight:'1px solid #f3f4f6' }}>
              <span style={{ fontSize:14 }}>{flag}</span>
              <span style={{ fontSize:10, fontWeight:800, color:'#9ca3af' }}>{lbl}</span>
            </div>
            <input
              value={value}
              onChange={e => setter(e.target.value)}
              onBlur={e => handleTranslate(code, e.target.value)}
              dir={code === 'ar' ? 'rtl' : 'ltr'}
              style={{ flex:1, border:'none', padding:'10px 16px', fontSize:14, color:'#112347', outline:'none', fontWeight:500, background:'transparent' }}
              placeholder={`${lbl}...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
