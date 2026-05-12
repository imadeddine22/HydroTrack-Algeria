'use client';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';

interface Item { _id: string; name: string }
interface Props {
  onFilterChange: (f: { wilayaId: string; communeId: string; zoneId: string }) => void;
}

const sel =
  'w-full appearance-none bg-white border border-gray-200 rounded-full px-5 py-3 pr-10 text-sm font-semibold text-[#112347] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00b4d8] transition-all cursor-pointer disabled:opacity-40';

export default function HierarchicalFilter({ onFilterChange }: Props) {
  const [wilayas, setWilayas] = useState<Item[]>([]);
  const [communes, setCommunes] = useState<Item[]>([]);
  const [zones, setZones] = useState<Item[]>([]);

  const [wid, setWid] = useState('');
  const [cid, setCid] = useState('');
  const [zid, setZid] = useState('');

  // load wilayas on mount
  useEffect(() => {
    api.get('/api/wilayas').then(setWilayas).catch(() => { });
  }, []);

  // load communes when wilaya changes
  useEffect(() => {
    setCid(''); setZid(''); setZones([]);
    if (wid) api.get(`/api/communes?wilayaId=${wid}`).then(setCommunes).catch(() => { });
    else setCommunes([]);
  }, [wid]);

  // load zones when commune changes
  useEffect(() => {
    setZid('');
    if (cid) api.get(`/api/zones?communeId=${cid}`).then(setZones).catch(() => { });
    else setZones([]);
  }, [cid]);

  // propagate upward
  useEffect(() => {
    onFilterChange({ wilayaId: wid, communeId: cid, zoneId: zid });
  }, [wid, cid, zid]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Toutes les Wilayas', val: wid, set: setWid, items: wilayas, disabled: false },
        { label: 'Toutes les Communes', val: cid, set: setCid, items: communes, disabled: !wid },
        { label: 'Toutes les Zones', val: zid, set: setZid, items: zones, disabled: !cid },
      ].map(({ label, val, set, items, disabled }) => (
        <div className="relative" key={label}>
          <select className={sel} value={val} disabled={disabled}
            onChange={e => set(e.target.value)}>
            <option value="">{label}</option>
            {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      ))}
    </div>
  );
}
