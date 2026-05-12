'use client';
import { useEffect, useState, useMemo } from 'react';
import { Droplets, Waves, Database, Search, ChevronDown, X, Filter, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { api } from '@/lib/api';
import CyberInfraCard from '@/components/CyberInfraCard';
import { useLang } from '@/lib/i18n/LanguageContext';

interface GeoItem { _id: string; name: string; }
interface Infra {
  _id: string; name: string; type: string;
  subType?: string; status: string;
  depth?: number; capacity?: number; fillPercentage?: number; zoneId?: any;
}

const TCFG: Record<string, { label: string; bg: string; color: string; bar: string }> = {
  forage: { label: 'Forage', bg: '#e0f7ff', color: '#0096c7', bar: '#48cae4' },
  tank:   { label: "Château d'eau", bg: '#dbeafe', color: '#2563eb', bar: '#3b82f6' },
  dam:    { label: 'Barrage', bg: '#ede9fe', color: '#7c3aed', bar: '#8b5cf6' },
};

const emptyForm = { name: '', type: 'forage', subType: '', status: 'active', depth: '', capacity: '', fillPercentage: '' };

function Sel({ label, value, onChange, items, disabled }: { label: string; value: string; onChange: (v: string) => void; items: GeoItem[]; disabled?: boolean }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} disabled={disabled} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', appearance: 'none', background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 36px 10px 14px', fontSize: 13, fontWeight: 600, color: '#112347', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
        <option value="">{label}</option>
        {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
      </select>
      <ChevronDown size={14} color="#9ca3af" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, letterSpacing: '0.05em' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '9px 12px', fontSize: 13, color: '#112347', outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => (e.target.style.borderColor = '#00b4d8')}
        onBlur={e => (e.target.style.borderColor = '#e5e7eb')} />
    </div>
  );
}

export default function InfrastructuresPage() {
  const { t, isRTL } = useLang();
  const w = t.infrasPage;
  const [wilayas, setWilayas] = useState<GeoItem[]>([]);
  const [communes, setCommunes] = useState<GeoItem[]>([]);
  const [zones, setZones] = useState<GeoItem[]>([]);
  const [wid, setWid] = useState('');
  const [cid, setCid] = useState('');
  const [zid, setZid] = useState('');
  const [infras, setInfras] = useState<Infra[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeF, setTypeF] = useState('all');
  const [statusF, setStatusF] = useState('all');

  // CRUD state
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Infra | null>(null);
  const [form, setForm] = useState<typeof emptyForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { api.get('/api/wilayas').then(setWilayas).catch(() => {}); }, []);
  useEffect(() => { setCid(''); setZid(''); setZones([]); setInfras([]); if (wid) api.get(`/api/communes?wilayaId=${wid}`).then(setCommunes).catch(() => {}); else setCommunes([]); }, [wid]);
  useEffect(() => { setZid(''); setInfras([]); if (cid) api.get(`/api/zones?communeId=${cid}`).then(setZones).catch(() => {}); else setZones([]); }, [cid]);

  const loadInfras = (zoneId: string) => {
    if (!zoneId) { setInfras([]); return; }
    setLoading(true);
    api.get(`/api/infrastructures?zoneId=${zoneId}`)
      .then(d => setInfras(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadInfras(zid); }, [zid]);

  const filtered = useMemo(() => infras.filter(i => {
    if (typeF !== 'all' && i.type !== typeF) return false;
    if (statusF !== 'all' && i.status !== statusF) return false;
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [infras, typeF, statusF, search]);

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setShowForm(true); };
  const openEdit = (item: Infra) => {
    setEditing(item);
    setForm({ name: item.name, type: item.type, subType: item.subType || '', status: item.status, depth: item.depth?.toString() || '', capacity: item.capacity?.toString() || '', fillPercentage: item.fillPercentage?.toString() || '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !zid) return;
    setSaving(true);
    const num = (v: string) => v !== '' ? Number(v) : undefined;
    const body: any = { name: form.name.trim(), type: form.type, subType: form.subType || null, status: form.status, zoneId: zid, depth: num(form.depth), capacity: num(form.capacity), fillPercentage: num(form.fillPercentage) };
    try {
      if (editing) await api.put(`/api/infrastructures/${editing._id}`, body);
      else await api.post('/api/infrastructures', body);
      setShowForm(false);
      loadInfras(zid);
    } catch (e) {}
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(w.deleteConfirm)) return;
    setDeleting(id);
    await api.delete(`/api/infrastructures/${id}`).catch(() => {});
    setDeleting(null);
    loadInfras(zid);
  };

  const f = (v: string, k: keyof typeof emptyForm) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #f3f4f6', padding: '20px 28px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#112347', margin: '0 0 4px' }}>{w.title}</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{w.desc}</p>
        </div>
        {zid && (
          <button onClick={openAdd}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#0077b6,#00b4d8)', color: 'white', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,119,182,0.3)' }}>
            <Plus size={16} /> {w.add}
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {/* Geo filter */}
        <div style={{ background: 'white', borderRadius: 18, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#112347', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}><Filter size={14} color="#00b4d8" />{w.geoFilter}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <Sel label={w.selectWilaya} value={wid} onChange={setWid} items={wilayas} />
            <Sel label={w.selectCommune} value={cid} onChange={setCid} items={communes} disabled={!wid} />
            <Sel label={w.selectZone} value={zid} onChange={setZid} items={zones} disabled={!cid} />
          </div>
        </div>

        {/* Type/Status/Search filters */}
        {zid && (
          <div style={{ background: 'white', borderRadius: 18, padding: '12px 20px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {['all', 'forage', 'tank', 'dam'].map(t => (
              <button key={t} onClick={() => setTypeF(t)} style={{ padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: typeF === t ? '#0077b6' : '#f3f4f6', color: typeF === t ? 'white' : '#6b7280' }}>
                {t === 'all' ? w.allTypes : t === 'forage' ? w.forages : t === 'tank' ? w.tanks : w.dams}
              </button>
            ))}
            <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
            {['all', 'active', 'inactive'].map(s => (
              <button key={s} onClick={() => setStatusF(s)} style={{ padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: statusF === s ? (s === 'active' ? '#059669' : s === 'inactive' ? '#dc2626' : '#0077b6') : '#f3f4f6', color: statusF === s ? 'white' : '#6b7280' }}>
                {s === 'all' ? w.allStates : s === 'active' ? w.active : w.inactive}
              </button>
            ))}
            <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
              <Search size={13} color="#9ca3af" style={{ position: 'absolute', [isRTL ? 'right' : 'left']: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={w.search}
                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 10, padding: isRTL ? '7px 32px 7px 10px' : '7px 10px 7px 32px', fontSize: 12, color: '#112347', outline: 'none', boxSizing: 'border-box' }} />
              {search && <button onClick={() => setSearch('')} style={{ position: 'absolute', [isRTL ? 'left' : 'right']: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={12} color="#9ca3af" /></button>}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!zid && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, color: '#cbd5e1' }}>
            <Droplets size={48} style={{ marginBottom: 14 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', margin: '0 0 4px' }}>{w.selectZonePrompt}</p>
            <p style={{ fontSize: 13, color: '#cbd5e1', margin: 0 }}>{w.selectZoneDesc}</p>
          </div>
        )}

        {/* Loading */}
        {zid && loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180 }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e0f7ff', borderTopColor: '#00b4d8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* No results */}
        {zid && !loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
            <Database size={36} style={{ marginBottom: 10 }} />
            <p style={{ fontWeight: 700, margin: '0 0 4px' }}>{w.noInfra}</p>
            <p style={{ fontSize: 13, margin: 0 }}>{w.clickAdd}</p>
          </div>
        )}

        {/* Cards */}
        {zid && !loading && filtered.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
              {[{ l: w.total, v: filtered.length, bg: '#dbeafe', c: '#2563eb' }, { l: w.actives, v: filtered.filter(i => i.status === 'active').length, bg: '#d1fae5', c: '#059669' }, { l: w.inactives, v: filtered.filter(i => i.status === 'inactive').length, bg: '#fee2e2', c: '#dc2626' }].map(({ l, v, bg, c }) => (
                <div key={l} style={{ background: bg, borderRadius: 14, padding: '8px 18px', textAlign: 'center' }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: c, display: 'block' }}>{v}</span>
                  <span style={{ fontSize: 11, color: c, fontWeight: 600 }}>{l}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
              {filtered.map(item => (
                <CyberInfraCard
                  key={item._id}
                  item={item as any}
                  onEdit={(i: any) => openEdit(i as Infra)}
                  onDelete={handleDelete}
                  deleting={deleting === item._id}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setShowForm(false)}>
          <div style={{ background: 'white', borderRadius: 24, width: '100%', maxWidth: 480, height: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#112347', margin: 0 }}>
                {editing ? w.edit : w.addInfra} {w.anInfra}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} color="#6b7280" />
              </button>
            </div>

            {/* Form body */}
            <div
              style={{ overflowY: 'auto', flex: 1, minHeight: 0, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}
            >

              {/* Type */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 8, letterSpacing: '0.05em' }}>{w.type}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ v: 'forage', l: w.forages, color: '#0096c7', bg: '#e0f7ff' }, { v: 'tank', l: w.tanks, color: '#2563eb', bg: '#dbeafe' }, { v: 'dam', l: w.dams, color: '#7c3aed', bg: '#ede9fe' }].map(t => (
                    <button key={t.v} onClick={() => f(t.v, 'type')}
                      style={{ flex: 1, padding: '10px 6px', borderRadius: 12, border: `2px solid ${form.type === t.v ? t.color : '#e5e7eb'}`, background: form.type === t.v ? t.bg : 'white', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: form.type === t.v ? t.color : '#9ca3af' }}>
                      {t.l}
                    </button>
                  ))}
                </div>
              </div>

              <Field label={w.name} value={form.name} onChange={v => f(v, 'name')} placeholder={w.namePlaceholder} />

              {/* SubType */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, letterSpacing: '0.05em' }}>{w.subType}</label>
                <div style={{ position: 'relative' }}>
                  <select value={form.subType} onChange={e => f(e.target.value, 'subType')}
                    style={{ width: '100%', appearance: 'none', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: isRTL ? '9px 12px 9px 36px' : '9px 36px 9px 12px', fontSize: 13, color: '#112347', fontWeight: 600 }}>
                    <option value="">{w.none}</option>
                    {form.type === 'forage' && <><option value="deep">Deep (Profond)</option><option value="shallow">Shallow (Superficiel)</option></>}
                    {form.type === 'tank' && <><option value="elevated">Elevated (Surélevé)</option><option value="ground">Ground (Sol)</option></>}
                  </select>
                  <ChevronDown size={13} color="#9ca3af" style={{ position: 'absolute', [isRTL ? 'left' : 'right']: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', display: 'block', marginBottom: 5, letterSpacing: '0.05em' }}>{w.status}</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ v: 'active', l: w.active, color: '#059669', bg: '#d1fae5' }, { v: 'inactive', l: w.inactive, color: '#dc2626', bg: '#fee2e2' }].map(s => (
                    <button key={s.v} onClick={() => f(s.v, 'status')}
                      style={{ flex: 1, padding: '8px', borderRadius: 10, border: `2px solid ${form.status === s.v ? s.color : '#e5e7eb'}`, background: form.status === s.v ? s.bg : 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: form.status === s.v ? s.color : '#9ca3af' }}>
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Numeric fields */}
              {form.type === 'forage' && <Field label={w.depth} value={form.depth} onChange={v => f(v, 'depth')} placeholder="ex: 120" type="number" />}
              {(form.type === 'tank' || form.type === 'dam') && <Field label={w.capacity} value={form.capacity} onChange={v => f(v, 'capacity')} placeholder="ex: 500000" type="number" />}
              {form.type === 'dam' && <Field label={w.fillRate} value={form.fillPercentage} onChange={v => f(v, 'fillPercentage')} placeholder="0-100" type="number" />}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={() => setShowForm(false)}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#6b7280' }}>
                {w.cancel}
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()}
                style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0077b6,#00b4d8)', color: 'white', cursor: saving || !form.name.trim() ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, opacity: saving || !form.name.trim() ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={14} />{saving ? w.saving : w.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
