'use client';
import { useEffect, useState } from 'react';
import { Activity, Droplets, Waves, Database, AlertTriangle, CheckCircle, Bell, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n/LanguageContext';

interface AlertItem { _id:string; type:string; severity:string; message:string; createdAt:string; resolved:boolean; infrastructureId?:{name:string;type:string}; }

const SEV_CFG:Record<string,{bg:string;border:string;text:string;badge:string;badgeText:string}> = {
  critical:{bg:'#fff1f2',border:'#fecdd3',text:'#be123c',badge:'#fecdd3',badgeText:'#be123c'},
  warning: {bg:'#fffbeb',border:'#fde68a',text:'#b45309',badge:'#fde68a',badgeText:'#b45309'},
  info:    {bg:'#eff6ff',border:'#bfdbfe',text:'#1d4ed8',badge:'#bfdbfe',badgeText:'#1d4ed8'},
};

function MiniGauge({value,max,color,label}:{value:number;max:number;color:string;label:string}){
  const pct = Math.min((value/max)*100,100);
  return(
    <div style={{textAlign:'center'}}>
      <svg viewBox="0 0 80 50" style={{width:80,height:50}}>
        <path d="M10 45 A30 30 0 0 1 70 45" fill="none" stroke="#f3f4f6" strokeWidth="8" strokeLinecap="round"/>
        <path d="M10 45 A30 30 0 0 1 70 45" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${94.2*pct/100} 94.2`}/>
        <text x="40" y="44" textAnchor="middle" fontSize="11" fontWeight="800" fill="#112347">{value}</text>
      </svg>
      <p style={{fontSize:10,color:'#9ca3af',margin:0,fontWeight:600}}>{label}</p>
    </div>
  );
}

export default function MonitoringPage(){
  const { t, isRTL } = useLang();
  const w = t.monitorPage;
  const [alerts,setAlerts]=useState<AlertItem[]>([]);
  const [summary,setSummary]=useState({total:0,critical:0,warning:0,info:0});
  const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState<'all'|'critical'|'warning'|'info'>('all');
  const [resolving,setResolving]=useState<string|null>(null);

  const load=()=>{
    setLoading(true);
    Promise.all([
      api.get('/api/alerts?resolved=false'),
      api.get('/api/alerts/summary'),
    ]).then(([a,s])=>{
      if(Array.isArray(a))setAlerts(a);
      if(s&&!s.error)setSummary(s);
    }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>{load();},[]);

  const resolve=(id:string)=>{
    setResolving(id);
    api.put(`/api/alerts/${id}/resolve`,{}).then(()=>{ setAlerts(p=>p.filter(a=>a._id!==id)); setSummary(p=>({...p,total:p.total-1})); }).catch(()=>{}).finally(()=>setResolving(null));
  };

  const filtered = filter==='all' ? alerts : alerts.filter(a=>a.severity===filter);

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:'white',borderBottom:'1px solid #f3f4f6',padding:'20px 28px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:800,color:'#112347',margin:'0 0 4px'}}>{w.title}</h1>
          <p style={{fontSize:13,color:'#9ca3af',margin:0}}>{w.desc}</p>
        </div>
        <button onClick={load} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:10,border:'1px solid #e5e7eb',background:'white',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151'}}>
          <RefreshCw size={14} color="#00b4d8"/> {w.refresh}
        </button>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:24}}>
        {/* Summary KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
          {[
            {label:w.totalAlerts,val:summary.total,icon:Bell,bg:'#fff7ed',color:'#ea580c'},
            {label:w.critical,val:summary.critical,icon:AlertTriangle,bg:'#fff1f2',color:'#dc2626'},
            {label:w.warnings,val:summary.warning,icon:Activity,bg:'#fffbeb',color:'#b45309'},
            {label:w.info,val:summary.info,icon:CheckCircle,bg:'#eff6ff',color:'#2563eb'},
          ].map(({label,val,icon:Icon,bg,color})=>(
            <div key={label} style={{background:'white',borderRadius:18,padding:'16px 20px',display:'flex',alignItems:'center',gap:14,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6'}}>
              <div style={{width:44,height:44,background:bg,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <Icon size={20} color={color}/>
              </div>
              <div><p style={{fontSize:10,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',margin:'0 0 2px'}}>{label}</p>
              <p style={{fontSize:26,fontWeight:800,color:'#112347',margin:0}}>{val}</p></div>
            </div>
          ))}
        </div>

        {/* Live gauges */}
        <div style={{background:'white',borderRadius:18,padding:20,marginBottom:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6'}}>
          <h2 style={{fontSize:14,fontWeight:700,color:'#112347',margin:'0 0 16px',display:'flex',alignItems:'center',gap:8}}>
            <Activity size={16} color="#00b4d8"/> {w.networkIndicators}
          </h2>
          <div style={{display:'flex',gap:32,justifyContent:'center',flexWrap:'wrap'}}>
            <MiniGauge value={62} max={100} color="#0096c7" label={w.waterLevel}/>
            <MiniGauge value={32} max={50} color="#ef476f" label={w.temp}/>
            <MiniGauge value={18} max={50} color="#0077b6" label={w.pressure}/>
            <MiniGauge value={85} max={100} color="#059669" label={w.compliance}/>
            <MiniGauge value={12} max={30} color="#8b5cf6" label={w.flowRate}/>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {(['all','critical','warning','info'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 18px',borderRadius:99,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,
              background:filter===f?(f==='critical'?'#dc2626':f==='warning'?'#b45309':f==='info'?'#2563eb':'#0077b6'):'#f3f4f6',
              color:filter===f?'white':'#6b7280'}}>
              {f==='all'?`${w.all} (${alerts.length})`:f==='critical'?`${w.critical} (${summary.critical})`:f==='warning'?`${w.warnings} (${summary.warning})`:`${w.info} (${summary.info})`}
            </button>
          ))}
        </div>

        {/* Alert list */}
        {loading?(
          <div style={{display:'flex',justifyContent:'center',padding:60}}>
            <div style={{width:36,height:36,border:'3px solid #e0f7ff',borderTopColor:'#00b4d8',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ):filtered.length===0?(
          <div style={{textAlign:'center',padding:'60px 0',color:'#94a3b8'}}>
            <CheckCircle size={40} style={{marginBottom:12}}/>
            <p style={{fontWeight:700,margin:'0 0 4px'}}>{w.noAlerts}</p>
            <p style={{fontSize:13,margin:0}}>{w.networkNormal}</p>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {filtered.map(a=>{
              const cfg=SEV_CFG[a.severity]||SEV_CFG.info;
              const InfIcon = a.infrastructureId?.type==='forage'?Droplets:a.infrastructureId?.type==='dam'?Waves:Database;
              return(
                <div key={a._id} style={{background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:16,padding:'14px 18px',display:'flex',alignItems:'center',gap:16}}>
                  <div style={{width:40,height:40,background:'white',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
                    <InfIcon size={18} color={cfg.text}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:700,color:cfg.text}}>{a.infrastructureId?.name||w.unknownInfra}</span>
                      <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:99,background:cfg.badge,color:cfg.badgeText}}>
                        {a.severity==='critical'?w.critBadge:a.severity==='warning'?w.warnBadge:w.infoBadge}
                      </span>
                      <span style={{fontSize:10,color:'#9ca3af',marginLeft:isRTL?'0':'auto',marginRight:isRTL?'auto':'0'}}>
                        {({'low_level':w.lowLevel,'high_pressure':w.highPressure,'temperature':w.temp,'maintenance':w.maintenance,'flow_anomaly':w.flowAnomaly,'offline':w.offline} as Record<string,string>)[a.type] || a.type}
                      </span>
                    </div>
                    <p style={{fontSize:13,color:cfg.text,margin:0,opacity:0.85}}>{a.message}</p>
                    <p style={{fontSize:10,color:'#9ca3af',margin:'4px 0 0'}}>{new Date(a.createdAt).toLocaleString(isRTL?'ar-DZ':'fr-DZ')}</p>
                  </div>
                  <button onClick={()=>resolve(a._id)} disabled={resolving===a._id}
                    style={{padding:'7px 14px',borderRadius:10,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,
                      background:'white',color:cfg.text,boxShadow:'0 1px 3px rgba(0,0,0,0.08)',opacity:resolving===a._id?0.5:1,flexShrink:0}}>
                    {resolving===a._id?'..':w.resolve}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
