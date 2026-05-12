'use client';
import { X, Droplets, Building2, Waves, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import type { InfraItem } from './CyberInfraCard';

const CFG: Record<string, any> = {
  forage: { Icon: Droplets,  label: "Forage (Well)",  bg: 'bg-cyan-50',   color: 'text-[#00b4d8]' },
  tank:   { Icon: Building2, label: "Château d'eau",  bg: 'bg-blue-50',   color: 'text-[#0077b6]' },
  dam:    { Icon: Waves,     label: "Barrage",        bg: 'bg-indigo-50', color: 'text-[#03045e]' },
  chateau_eau: { Icon: Building2, label: "Château d'eau",  bg: 'bg-blue-50',   color: 'text-[#0077b6]' },
  barrage: { Icon: Waves,     label: "Barrage",        bg: 'bg-indigo-50', color: 'text-[#03045e]' },
};

export default function InfraModal({ item, onClose }: { item: InfraItem; onClose: () => void }) {
  const { Icon, label, bg, color } = CFG[item.type] || CFG.forage;
  const active = item.status === 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6]" />
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
            <Icon className={`w-8 h-8 ${color}`} />
          </div>

          <h2 className="text-xl font-extrabold text-[#112347] mb-1">{item.name}</h2>
          <p className="text-sm text-gray-400 uppercase tracking-wider font-bold mb-4">
            {label}{item.subType ? ` · ${item.subType}` : ''}
          </p>

          <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full mb-5 ${active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {active ? 'Active' : 'Inactive'}
          </span>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
            {item.depth     !== undefined && <Row k="Depth"    v={`${item.depth} m`} />}
            {item.capacity  !== undefined && <Row k="Capacity" v={`${Number(item.capacity).toLocaleString()} m³`} />}
            {item.fillPercentage !== undefined && (
              <>
                <Row k="Fill Level" v={`${item.fillPercentage}%`} />
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6]"
                    style={{ width: `${item.fillPercentage}%` }} />
                </div>
              </>
            )}
            {item.zoneId?.name        && <Row k="Zone"    v={item.zoneId.name} />}
            {item.zoneId?.communeId?.name    && <Row k="Commune" v={item.zoneId.communeId.name} />}
            {item.zoneId?.communeId?.wilayaId?.name && <Row k="Wilaya"  v={item.zoneId.communeId.wilayaId.name} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500 font-medium">{k}</span>
      <span className="font-bold text-[#112347]">{v}</span>
    </div>
  );
}
