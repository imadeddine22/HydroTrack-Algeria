'use client';
import { Droplet, Waves, MapPin, Anchor, Edit2, Trash2, Building2 } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';

export interface InfraItem {
  _id: string;
  name: string;
  name_ar?: string;
  name_en?: string;
  type: string;
  subType?: string;
  sousType?: string;
  status: string;
  depth?: number | null;
  capacity?: number | null;
  capacite?: number | null;
  volumeTotal?: number | null;
  volumeActuel?: number | null;
  fillPercentage?: number | null;
  tauxRemplissage?: number | null;
  niveauActuel?: number | null;
  hauteur?: number | null;
  profondeur?: number | null;
  anneeMiseEnService?: number | null;
  debitJournalier?: number | null;
  commune?: string;
  zoneId?: { name?: string; communeId?: { name?: string; wilayaId?: { name?: string } } };
}

const TYPE_ICONS: Record<string, any> = {
  forage: Droplet,
  tank: Building2,
  dam: Waves,
  chateau_eau: Building2,
  barrage: Waves,
};

interface Props {
  item: InfraItem;
  onEdit?: (item: InfraItem) => void;
  onDelete?: (id: string) => void;
  deleting?: boolean;
  onClick?: () => void;
}

export default function CyberInfraCard({ item, onEdit, onDelete, deleting, onClick }: Props) {
  const { t } = useLang();
  const c = t.cyberCard;
  const Icon = TYPE_ICONS[item.type] || TYPE_ICONS.forage;
  const label = c[item.type as keyof typeof c] || item.type;
  const active = item.status === 'active';
  const sousType = item.sousType || item.subType || '';
  const sousLabel = sousType ? (c[sousType as keyof typeof c] || sousType) : '';
  const fillVal = item.fillPercentage ?? item.tauxRemplissage ?? item.niveauActuel ?? 0;
  const capVal = item.capacity ?? item.capacite;
  const zoneLabel = item.zoneId?.name || item.commune || item.zoneId?.communeId?.name;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

        /* ═══════════════════════════════════════════════
           BRIGHT CYAN SPLASH CARD 
        ═══════════════════════════════════════════════ */
        .splash-card {
          font-family: 'Inter', sans-serif;
          position: relative;
          border-radius: 36px;
          overflow: hidden;
          /* Bright, refreshing cyan gradient */
          background: linear-gradient(135deg, #81d5f9 0%, #34aadc 100%);
          /* Glossy 3D border and shadow */
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.4),
            inset 2px 2px 6px rgba(255, 255, 255, 0.8),
            inset -3px -3px 8px rgba(0, 100, 150, 0.3),
            0 15px 35px rgba(0, 120, 180, 0.25);
          padding: 26px;
          color: white;
          cursor: ${onClick ? 'pointer' : 'default'};
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          z-index: 1;
        }

        .splash-card:hover {
          transform: translateY(-5px);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.6),
            inset 2px 2px 8px rgba(255, 255, 255, 0.9),
            inset -3px -3px 10px rgba(0, 100, 150, 0.4),
            0 20px 45px rgba(0, 120, 180, 0.35);
        }

        /* ── ABSTRACT WATER SPLASHES (CSS approximations) ── */
        .water-splash {
          position: absolute;
          background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(52,170,220,0.4) 100%);
          backdrop-filter: blur(4px);
          pointer-events: none;
          z-index: 5;
          box-shadow: 
            inset 2px 2px 5px rgba(255,255,255,0.7),
            inset -2px -2px 5px rgba(0, 100, 150, 0.2);
        }

        /* Left splash wrapping around the panel */
        .splash-left {
          top: 25%; left: 0px;
          width: 35px; height: 110px;
          border-radius: 50% 60% 40% 70% / 70% 30% 60% 40%;
          transform: rotate(15deg);
        }
        .splash-left-2 {
          bottom: 12px; left: 10px;
          width: 70px; height: 28px;
          border-radius: 40% 60% 70% 30% / 50% 40% 60% 50%;
          transform: rotate(-20deg);
        }

        /* Right splash contained within card */
        .splash-right {
          top: 16px; right: 0px;
          width: 90px; height: 90px;
          border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%;
          transform: rotate(-45deg);
          z-index: 1;
        }
        .splash-right-2 {
          bottom: 28%; right: 0px;
          width: 28px; height: 72px;
          border-radius: 30% 70% 40% 60% / 40% 50% 60% 50%;
          transform: rotate(10deg);
        }

        /* Small droplets */
        .droplet {
          position: absolute;
          background: rgba(255,255,255,0.5);
          border-radius: 50%;
          box-shadow: inset -1px -1px 3px rgba(0, 100, 150, 0.3), 0 2px 4px rgba(0,0,0,0.1);
          z-index: 6;
        }

        /* ── MAIN CONTENT ── */
        .splash-body {
          position: relative;
          z-index: 10;
        }

        /* ── HEADER ROW ── */
        .splash-header {
          display: flex;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }

        .splash-header-top {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        /* Icon box: cyan rounded square with embossed inner shadow */
        .splash-icon-box {
          width: 52px; height: 52px;
          border-radius: 16px;
          flex-shrink: 0;
          background: linear-gradient(135deg, #7ad5fb 0%, #31a4d4 100%);
          box-shadow:
            inset 3px 3px 8px rgba(255, 255, 255, 0.8),
            inset -3px -3px 8px rgba(0, 100, 150, 0.3),
            0 8px 16px rgba(0, 120, 180, 0.2);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .splash-icon-box::before {
          content: ''; position: absolute; inset: 3px; border-radius: 13px;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .splash-title-col {
          flex: 1; min-width: 0;
        }
        .splash-name {
          font-size: 18px; font-weight: 800;
          color: #ffffff;
          margin: 0 0 3px 0;
          line-height: 1.2;
          overflow: hidden; text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          text-shadow: 0 2px 4px rgba(0, 100, 150, 0.2);
        }
        .splash-sub {
          font-size: 10px; font-weight: 700;
          color: rgba(255, 255, 255, 0.85);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin: 0;
        }

        /* Status pill — inline (not absolute) so it never overlaps */
        .splash-status {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px; font-weight: 600;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: inset 1px 1px 3px rgba(255,255,255,0.5);
          color: white;
          white-space: nowrap;
          flex-shrink: 0;
          align-self: flex-start;
        }
        /* Concentric dot */
        .splash-ring-dot {
          width: 14px; height: 14px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,0.8);
          box-shadow: inset 1px 1px 2px rgba(0,0,0,0.1);
        }
        .splash-ring-dot::after {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
        }
        .splash-status.inactive .splash-ring-dot::after { background: #ff6b6b; }
        .splash-status.active .splash-ring-dot::after { background: #4ade80; }

        /* ── DATA PANEL: frosted cyan glass ── */
        .splash-panel {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 24px;
          padding: 22px 24px;
          display: flex; flex-direction: column; gap: 14px;
          /* Strong white highlight on top/left to give 3D depth */
          box-shadow:
            inset 2px 2px 6px rgba(255, 255, 255, 0.6),
            inset -2px -2px 6px rgba(0, 100, 150, 0.1),
            0 10px 20px rgba(0, 100, 150, 0.1);
          position: relative;
          z-index: 10;
        }

        /* Each data row */
        .splash-row {
          display: flex; justify-content: space-between; align-items: center;
        }
        .splash-row-left {
          display: flex; align-items: center; gap: 14px;
          font-size: 15px; font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 1px 2px rgba(0, 100, 150, 0.1);
        }
        .splash-row-right {
          font-size: 18px; font-weight: 800;
          color: #ffffff;
          text-shadow: 0 1px 2px rgba(0, 100, 150, 0.1);
        }
        .splash-row-right.is-bold { font-size: 19px; }

        /* Very thin faint separator */
        .splash-separator {
          height: 1px;
          background: rgba(255, 255, 255, 0.25);
          margin: 0 -4px;
        }

        /* ── LIQUID PROGRESS BAR ── */
        .splash-bar-track {
          width: 100%;
          height: 38px;
          border-radius: 19px;
          background: rgba(0, 120, 180, 0.15);
          box-shadow:
            inset 2px 2px 6px rgba(0, 100, 150, 0.3),
            inset -2px -2px 6px rgba(255, 255, 255, 0.5),
            0 2px 4px rgba(255, 255, 255, 0.2);
          padding: 3px;
          overflow: hidden;
          position: relative;
          margin-top: 2px;
          margin-bottom: 6px;
        }

        .splash-bar-fill {
          height: 100%;
          border-radius: 16px;
          background: linear-gradient(180deg, #7ce0ff 0%, #26a0d6 100%);
          box-shadow:
            inset 0 2px 4px rgba(255, 255, 255, 0.8),
            0 2px 6px rgba(0, 100, 150, 0.3);
          position: relative;
          overflow: hidden;
          transition: width 1s ease-in-out;
        }

        /* Wave surface on fill */
        .splash-bar-fill::after {
          content: '';
          position: absolute;
          top: -3px; left: 0; width: 200%; height: 20px;
          background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg"><path d="M0 10 Q 25 15 50 10 T 100 10 L 100 0 L 0 0Z" fill="rgba(255,255,255,0.4)"/></svg>') repeat-x;
          background-size: 50% 100%;
          animation: splashWave 2.5s linear infinite;
        }
        @keyframes splashWave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* Tiny bubbles inside bar */
        .splash-bar-bubble {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), transparent);
          box-shadow: inset -1px -1px 2px rgba(0, 100, 150, 0.2);
          animation: splashBubbleFloat 2.5s ease-in-out infinite;
        }
        @keyframes splashBubbleFloat {
          0%, 100% { transform: translateY(0); opacity: 0.6; }
          50%       { transform: translateY(-4px); opacity: 1; }
        }

        /* ── EDIT / DELETE ── */
        .splash-actions { position: absolute; top: 0; right: 0; display: flex; gap: 7px; z-index: 20; }
        .splash-btn {
          width: 30px; height: 30px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);
          color: white; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: 0.2s;
        }
        .splash-btn:hover { background: rgba(255,255,255,0.4); transform: scale(1.05); }
        .splash-btn-del:hover { background: rgba(255,60,60,0.5); border-color: rgba(255,80,80,0.6); }
      `}</style>

      <div className="splash-card" onClick={onClick}>
        
        {/* CSS Approximated Splashes */}
        <div className="water-splash splash-left" />
        <div className="water-splash splash-left-2" />
        <div className="water-splash splash-right" />
        <div className="water-splash splash-right-2" />
        
        {/* Decorative external droplets */}
        <div className="droplet" style={{ width: 12, height: 12, top: '20%', left: '8%' }} />
        <div className="droplet" style={{ width: 8, height: 8, top: '15%', right: '12%' }} />
        <div className="droplet" style={{ width: 14, height: 14, bottom: '15%', right: '5%' }} />
        <div className="droplet" style={{ width: 6, height: 6, bottom: '8%', left: '20%' }} />

        <div className="splash-body">
          
          {/* ── HEADER ── */}
          <div className="splash-header">
            <div className="splash-header-top">
              <div className="splash-icon-box">
                <Icon size={24} color="#ffffff" strokeWidth={2.5} />
              </div>

              <div className="splash-title-col">
                <h3 className="splash-name">{item.name}</h3>
                <p className="splash-sub">
                  {String(label).toUpperCase()}{sousLabel ? ` • ${sousLabel.toUpperCase()}` : ''}
                </p>
              </div>
            </div>

            {/* Status pill — inline, no absolute positioning */}
            <div className={`splash-status ${active ? 'active' : 'inactive'}`}>
              <div className="splash-ring-dot" />
              {active ? c.active : c.inactive}
            </div>
          </div>

          {/* ── DATA PANEL ── */}
          <div className="splash-panel">
            
            {/* Edit/Delete actions floating inside panel */}
            {(onEdit || onDelete) && (
              <div className="splash-actions">
                {onEdit && <button className="splash-btn" onClick={e => { e.stopPropagation(); onEdit(item); }}><Edit2 size={13}/></button>}
                {onDelete && <button className="splash-btn splash-btn-del" disabled={deleting} onClick={e => { e.stopPropagation(); onDelete(item._id); }}><Trash2 size={13}/></button>}
              </div>
            )}

            {/* Depth / Débit */}
            {(item.depth != null || item.debitJournalier != null) && (
              <>
                <div className="splash-row">
                  <div className="splash-row-left">
                    <Anchor size={20} color="#ffffff" strokeWidth={2} />
                    {item.depth != null ? c.depth : c.flow}
                  </div>
                  <div className="splash-row-right">
                    {item.depth != null ? `${item.depth} m` : `${item.debitJournalier} m³/j`}
                  </div>
                </div>
                <div className="splash-separator" />
              </>
            )}

            {/* Capacity */}
            {capVal != null && (
              <>
                <div className="splash-row">
                  <div className="splash-row-left">
                    <Droplet size={20} color="#ffffff" strokeWidth={2} />
                    {c.capacity}
                  </div>
                  <div className="splash-row-right">{Number(capVal).toLocaleString()} m³</div>
                </div>
                <div className="splash-separator" />
              </>
            )}

            {/* Filling */}
            <div className="splash-row" style={{ marginBottom: -4 }}>
              <div className="splash-row-left">
                <Waves size={20} color="#ffffff" strokeWidth={2} />
                {c.filling}
              </div>
              <div className="splash-row-right">{fillVal}%</div>
            </div>

            {/* Exact Liquid Bar */}
            <div className="splash-bar-track">
              <div className="splash-bar-fill" style={{ width: `${Math.max(fillVal, 4)}%` }}>
                <div className="splash-bar-bubble" style={{ width:7, height:7, left:'15%', top:'35%', animationDelay:'0s' }} />
                <div className="splash-bar-bubble" style={{ width:5, height:5, left:'35%', top:'55%', animationDelay:'1s' }} />
                <div className="splash-bar-bubble" style={{ width:6, height:6, left:'60%', top:'25%', animationDelay:'0.5s' }} />
                <div className="splash-bar-bubble" style={{ width:4, height:4, left:'80%', top:'50%', animationDelay:'1.5s' }} />
              </div>
            </div>

            {/* Zone */}
            {zoneLabel && (
              <>
                <div className="splash-separator" style={{ marginTop: -2 }} />
                <div className="splash-row">
                  <div className="splash-row-left">
                    <MapPin size={20} color="#ffffff" strokeWidth={2} />
                    {c.zone}
                  </div>
                  <div className="splash-row-right is-bold">{zoneLabel}</div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
