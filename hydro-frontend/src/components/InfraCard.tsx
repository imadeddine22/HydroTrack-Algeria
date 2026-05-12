'use client';
import { Droplets, Building2, Waves, CheckCircle2, XCircle } from 'lucide-react';

export interface Infra {
  _id: string;
  name: string;
  type: 'forage' | 'tank' | 'dam';
  subType?: string;
  status: 'active' | 'inactive';
  depth?: number;
  capacity?: number;
  fillPercentage?: number;
  zoneId?: any;
}

const CFG = {
  forage: { Icon: Droplets,  label: "Forage",         bg: 'bg-cyan-50',   color: 'text-[#00b4d8]' },
  tank:   { Icon: Building2, label: "Château d'eau",  bg: 'bg-blue-50',   color: 'text-[#0077b6]' },
  dam:    { Icon: Waves,     label: "Barrage",        bg: 'bg-indigo-50', color: 'text-[#03045e]' },
};

export default function InfraCard({ item, onClick }: { item: Infra; onClick?: () => void }) {
  const { Icon, label, bg, color } = CFG[item.type];
  const active = item.status === 'active';

  return (
    <div onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group">
      {/* top bar */}
      <div className={`h-1 w-full ${active ? 'bg-gradient-to-r from-[#00b4d8] to-[#0077b6]' : 'bg-gray-200'}`} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {active ? 'Active' : 'Inactive'}
          </span>
        </div>

        <h3 className="font-bold text-[#112347] mb-1 group-hover:text-[#00b4d8] transition-colors">{item.name}</h3>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4">
          {label}{item.subType ? ` · ${item.subType}` : ''}
        </p>

        <div className="space-y-2 text-sm">
          {item.depth     !== undefined && <Row k="Depth"    v={`${item.depth} m`} />}
          {item.capacity  !== undefined && <Row k="Capacity" v={`${Number(item.capacity).toLocaleString()} m³`} />}
          {item.fillPercentage !== undefined && (
            <div>
              <Row k="Fill" v={`${item.fillPercentage}%`} />
              <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full bg-gradient-to-r from-[#00b4d8] to-[#0077b6]"
                  style={{ width: `${item.fillPercentage}%` }} />
              </div>
            </div>
          )}
          {item.zoneId?.name && <Row k="Zone" v={item.zoneId.name} />}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{k}</span>
      <span className="font-bold text-[#112347]">{v}</span>
    </div>
  );
}
