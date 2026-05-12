'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Bell, Droplets, Thermometer as ThermometerIcon, Gauge,
  Waves, AlertTriangle, CheckCircle, Activity, Database,
  ChevronRight, Zap, Wind, TrendingUp,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n/LanguageContext';

interface Stats { totalInfra:number; activeInfra:number; inactiveInfra:number; avgWaterLevel:number; avgTemperature:number; avgPressure:number; }
interface AlertItem { _id:string; severity:string; message:string; infrastructureId?:{ name:string } }
interface Infra { _id:string; name:string; type:string; subType?:string; status:string; fillPercentage?:number; }

function WaterDrop({ pct, levelText }: { pct:number; levelText?:string }) {
  return (
    <div style={{position:'relative',width:112,height:112,margin:'0 auto'}}>
      <svg viewBox="0 0 100 130" style={{width:'100%',height:'100%',filter:'drop-shadow(0 4px 12px rgba(0,150,200,0.3))'}}>
        <defs>
          <clipPath id="dc"><path d="M50 5C50 5 10 55 10 80C10 103 28 120 50 120C72 120 90 103 90 80C90 55 50 5 50 5Z"/></clipPath>
          <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8edff"/><stop offset="100%" stopColor="#0096c7"/>
          </linearGradient>
        </defs>
        <path d="M50 5C50 5 10 55 10 80C10 103 28 120 50 120C72 120 90 103 90 80C90 55 50 5 50 5Z" fill="#e0f7ff" stroke="#90e0ef" strokeWidth="2"/>
        <rect x="10" y={120-(110*pct)/100} width="80" height="110" fill="url(#wg)" clipPath="url(#dc)" opacity="0.85"/>
        <path d={`M10 ${120-(110*pct)/100} Q25 ${115-(110*pct)/100} 40 ${120-(110*pct)/100} T70 ${120-(110*pct)/100} T90 ${120-(110*pct)/100}`} fill="none" stroke="#90e0ef" strokeWidth="1.5" clipPath="url(#dc)"/>
        <text x="50" y="85" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#0077b6">{pct}%</text>
        <text x="50" y="100" textAnchor="middle" fontSize="9" fill="#48cae4">{levelText || 'niveau'}</text>
      </svg>
    </div>
  );
}

function MiniBar({ values, color='#48cae4' }: { values:number[]; color?:string }) {
  const mx = Math.max(...values,1);
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:4,height:48}}>
      {values.map((v,i)=>(
        <div key={i} style={{flex:1,borderRadius:'4px 4px 0 0',backgroundColor:color,
          height:`${(v/mx)*100}%`,opacity:0.55+i*0.06,transition:'height 0.5s'}}/>
      ))}
    </div>
  );
}

const SEV:Record<string,{bg:string;text:string}> = {
  critical:{bg:'#fee2e2',text:'#dc2626'},
  warning:{bg:'#ffedd5',text:'#ea580c'},
  info:{bg:'#dbeafe',text:'#2563eb'},
};

export default function DashboardPage() {
  const { t, isRTL } = useLang();
  const w = t.dashHome;
  const [stats,setStats] = useState<Stats>({totalInfra:0,activeInfra:0,inactiveInfra:0,avgWaterLevel:62,avgTemperature:22.4,avgPressure:3.2});
  const [alerts,setAlerts] = useState<AlertItem[]>([]);
  const [infras,setInfras] = useState<Infra[]>([]);
  const [alertOn,setAlertOn] = useState(true);
  const [now,setNow] = useState<Date|null>(null);

  useEffect(()=>{ setNow(new Date()); },[]);
  useEffect(()=>{
    api.get('/api/wilaya-infra/stats').then(d=>{
      if(d&&!d.error) setStats(p=>({
        ...p,
        totalInfra: d.total,
        activeInfra: d.byStatus?.active || 0,
        inactiveInfra: (d.byStatus?.inactive || 0) + (d.byStatus?.en_construction || 0) + (d.byStatus?.en_maintenance || 0),
        avgWaterLevel: d.avgFillBarrage || 62
      }));
    }).catch(()=>{});
    api.get('/api/alerts?resolved=false').then(d=>{if(Array.isArray(d))setAlerts(d.slice(0,5));}).catch(()=>{});
    api.get('/api/wilaya-infra').then(d=>{if(Array.isArray(d))setInfras(d.slice(0,6));}).catch(()=>{});
  },[]);

  const wl = stats.avgWaterLevel||62;
  const temp = stats.avgTemperature||22.4;
  const pres = stats.avgPressure||3.2;

  const kpis = [
    {label:w.totalInfra,val:stats.totalInfra,icon:Database,light:'#dbeafe',color:'#2563eb'},
    {label:w.actives,val:stats.activeInfra,icon:CheckCircle,light:'#d1fae5',color:'#059669'},
    {label:w.inactives,val:stats.inactiveInfra,icon:AlertTriangle,light:'#fee2e2',color:'#dc2626'},
    {label:w.activeAlerts,val:alerts.length,icon:Bell,light:'#ffedd5',color:'#ea580c'},
  ];

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Hero banner */}
      <div style={{background:'linear-gradient(135deg,#caf0f8,#ade8f4,#90e0ef)',padding:'20px 32px',
        display:'flex',alignItems:'center',justifyContent:'space-between',position:'relative',overflow:'hidden',flexShrink:0}}>
        <svg style={{position:'absolute',bottom:0,left:0,width:'100%',opacity:0.15}} viewBox="0 0 800 60" preserveAspectRatio="none">
          <path d="M0,30 Q200,5 400,30 T800,30 V60 H0Z" fill="#0096c7"/>
        </svg>
        <div style={{position:'relative',zIndex:1}}>
          <h1 style={{fontSize:22,fontWeight:800,color:'#03045e',margin:0}}>{w.hello}</h1>
          <p style={{fontSize:13,color:'#0077b6',margin:'4px 0 0',fontWeight:500}}>{w.quote}</p>
        </div>
        <div style={{position:'relative',zIndex:1,display:'flex',alignItems:'center',gap:20}}>
          <svg viewBox="0 0 80 100" style={{width:56,height:70,filter:'drop-shadow(0 4px 12px rgba(0,100,200,0.25))'}}>
            <path d="M40 5C40 5 15 40 15 60C15 78 26 92 40 92C54 92 65 78 65 60C65 40 40 5 40 5Z" fill="#48cae4"/>
            <circle cx="30" cy="58" r="5" fill="white"/><circle cx="50" cy="58" r="5" fill="white"/>
            <circle cx="31" cy="57" r="2.5" fill="#023e8a"/><circle cx="51" cy="57" r="2.5" fill="#023e8a"/>
            <path d="M33 70Q40 76 47 70" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <ellipse cx="22" cy="52" rx="4" ry="7" fill="#90e0ef" opacity="0.7"/>
            <ellipse cx="58" cy="52" rx="4" ry="7" fill="#90e0ef" opacity="0.7"/>
          </svg>
          <div style={{textAlign:isRTL ? 'left' : 'right'}}>
            <p style={{fontSize:11,fontWeight:700,color:'#0077b6',textTransform:'uppercase',letterSpacing:1,margin:0}}>HydroTrack Algeria</p>
            <p style={{fontSize:15,fontWeight:800,color:'#03045e',margin:'2px 0'}}>{now?now.toLocaleTimeString(isRTL ? 'ar-DZ' : 'fr-DZ',{hour:'2-digit',minute:'2-digit'}):'--:--'}</p>
            <p style={{fontSize:11,color:'#0096c7',margin:0}}>{now?now.toLocaleDateString(isRTL ? 'ar-DZ' : 'fr-DZ',{year:'numeric',month:'2-digit',day:'2-digit'}):'--/--/----'}</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{flex:1,overflowY:'auto',padding:20,display:'grid',gridTemplateColumns:'repeat(12,1fr)',gap:16,alignContent:'start'}}>

        {/* KPI Row */}
        {kpis.map(({label,val,icon:Icon,light,color})=>(
          <div key={label} style={{gridColumn:'span 3',background:'white',borderRadius:18,padding:'16px 20px',
            display:'flex',alignItems:'center',gap:14,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6'}}>
            <div style={{width:44,height:44,background:light,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Icon size={20} color={color}/>
            </div>
            <div>
              <p style={{fontSize:10,color:'#9ca3af',fontWeight:600,textTransform:'uppercase',letterSpacing:0.8,margin:'0 0 2px'}}>{label}</p>
              <p style={{fontSize:26,fontWeight:800,color:'#112347',margin:0}}>{val}</p>
            </div>
          </div>
        ))}

        {/* Water Level */}
        <div style={{gridColumn:'span 4',background:'white',borderRadius:18,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
            <Droplets size={16} color="#00b4d8"/>
            <h2 style={{fontSize:13,fontWeight:700,color:'#112347',margin:0}}>{w.avgWaterLevel}</h2>
          </div>
          <WaterDrop pct={wl} levelText={w.level} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:12}}>
            {[{l:w.today,v:'250 L'},{l:w.thisMonth,v:'15 m³'}].map(({l,v})=>(
              <div key={l} style={{background:'#e0f7ff',borderRadius:12,padding:'8px',textAlign:'center'}}>
                <p style={{fontSize:11,color:'#64748b',margin:'0 0 2px'}}>{l}</p>
                <p style={{fontSize:13,fontWeight:700,color:'#0077b6',margin:0}}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Temp + Pressure */}
        <div style={{gridColumn:'span 4',display:'flex',flexDirection:'column',gap:12}}>
          <div style={{background:'white',borderRadius:18,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6',flex:1,display:'flex',alignItems:'center',gap:16}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <ThermometerIcon size={16} color="#ef476f"/>
                <h2 style={{fontSize:13,fontWeight:700,color:'#112347',margin:0}}>{w.temp}</h2>
              </div>
              <p style={{fontSize:28,fontWeight:800,color:'#112347',margin:0}}>{temp}<span style={{fontSize:16,color:'#9ca3af'}}>°C</span></p>
              <p style={{fontSize:11,color:'#9ca3af',margin:'4px 0 0'}}>{w.avgNet}</p>
            </div>
            <svg viewBox="0 0 40 100" style={{width:28,height:72,flexShrink:0}}>
              <rect x="15" y="5" width="10" height="70" rx="5" fill="#fde8ee"/>
              <rect x="15" y={5+70-(70*Math.min(temp/50,1))} width="10" height={70*Math.min(temp/50,1)} rx="5" fill="#ef476f"/>
              <circle cx="20" cy="85" r="10" fill="#ef476f"/>
              <circle cx="20" cy="85" r="6" fill="#ff6b9d"/>
            </svg>
          </div>
          <div style={{background:'white',borderRadius:18,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6',flex:1,display:'flex',alignItems:'center',gap:16}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <Gauge size={16} color="#0077b6"/>
                <h2 style={{fontSize:13,fontWeight:700,color:'#112347',margin:0}}>{w.pressure}</h2>
              </div>
              <p style={{fontSize:28,fontWeight:800,color:'#112347',margin:0}}>{pres}<span style={{fontSize:16,color:'#9ca3af'}}> bar</span></p>
              <p style={{fontSize:11,color:'#9ca3af',margin:'4px 0 0'}}>{w.avgPressure}</p>
            </div>
            <svg viewBox="0 0 80 80" style={{width:64,height:64,flexShrink:0}}>
              <circle cx="40" cy="40" r="34" fill="none" stroke="#e0f7ff" strokeWidth="8"/>
              <circle cx="40" cy="40" r="34" fill="none" stroke="#0096c7" strokeWidth="8"
                strokeDasharray={`${213.6*Math.min(pres/10,1)} 213.6`} strokeLinecap="round" transform="rotate(-90 40 40)"/>
              <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#112347">{pres}</text>
              <text x="40" y="55" textAnchor="middle" fontSize="8" fill="#94a3b8">bar</text>
            </svg>
          </div>
        </div>

        {/* Alerts */}
        <div style={{gridColumn:'span 4',background:'white',borderRadius:18,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6',display:'flex',flexDirection:'column'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <Bell size={16} color="#ea580c"/>
              <h2 style={{fontSize:13,fontWeight:700,color:'#112347',margin:0}}>{w.recentAlerts}</h2>
            </div>
            <span style={{background:'#ffedd5',color:'#ea580c',fontSize:11,fontWeight:700,padding:'2px 10px',borderRadius:99}}>{alerts.length}</span>
          </div>
          <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column',gap:8}}>
            {alerts.length===0?(
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:80,color:'#d1d5db'}}>
                <CheckCircle size={28}/><p style={{fontSize:11,marginTop:6}}>{w.noAlerts}</p>
              </div>
            ):alerts.map(a=>{
              const s=SEV[a.severity]||SEV.info;
              return(
                <div key={a._id} style={{background:s.bg,borderRadius:12,padding:'10px 12px'}}>
                  <p style={{fontSize:12,fontWeight:700,color:s.text,margin:'0 0 2px'}}>{a.infrastructureId?.name||'Infrastructure'}</p>
                  <p style={{fontSize:11,color:s.text,opacity:0.8,margin:0,overflow:'hidden',WebkitLineClamp:2,display:'-webkit-box',WebkitBoxOrient:'vertical'}}>{a.message}</p>
                </div>
              );
            })}
          </div>
          <div style={{borderTop:'1px solid #f3f4f6',marginTop:16,paddingTop:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <p style={{fontSize:12,fontWeight:700,color:'#112347',margin:0}}>{w.autoAlerts}</p>
              <p style={{fontSize:11,color:'#9ca3af',margin:0}}>{w.ecoMode}</p>
            </div>
            <button onClick={()=>setAlertOn(v=>!v)} style={{
              position:'relative',width:44,height:24,borderRadius:99,border:'none',cursor:'pointer',
              background:alertOn?'#00b4d8':'#d1d5db',transition:'background 0.3s',padding:0
            }}>
              <span style={{position:'absolute',top:3,left:alertOn?22:3,width:18,height:18,background:'white',
                borderRadius:'50%',boxShadow:'0 1px 3px rgba(0,0,0,0.2)',transition:'left 0.3s',display:'block'}}/>
            </button>
          </div>
        </div>

        {/* Stats chart */}
        <div style={{gridColumn:'span 5',background:'white',borderRadius:18,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <TrendingUp size={16} color="#00b4d8"/>
              <h2 style={{fontSize:13,fontWeight:700,color:'#112347',margin:0}}>{w.weeklyStats}</h2>
            </div>
            <span style={{background:'#e0f7ff',color:'#0077b6',fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:99}}>{w.week}</span>
          </div>
          <p style={{fontSize:11,color:'#9ca3af',margin:'0 0 2px'}}>{w.avg}</p>
          <p style={{fontSize:18,fontWeight:800,color:'#112347',margin:'0 0 16px'}}>{wl} L / {w.perDay}</p>
          <MiniBar values={[45,60,38,72,55,80,65]}/>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:6}}>
            {w.days.map((d: string)=>(
              <span key={d} style={{fontSize:10,color:'#d1d5db'}}>{d}</span>
            ))}
          </div>
        </div>

        {/* Infrastructure list */}
        <div style={{gridColumn:'span 7',background:'white',borderRadius:18,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <Waves size={16} color="#0077b6"/>
              <h2 style={{fontSize:13,fontWeight:700,color:'#112347',margin:0}}>{w.recentInfra}</h2>
            </div>
            <Link href="/dashboard/infrastructures" style={{fontSize:11,color:'#00b4d8',fontWeight:700,display:'flex',alignItems:'center',gap:4,textDecoration:'none'}}>
              {w.viewAll} <ChevronRight size={12}/>
            </Link>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6,overflowY:'auto',maxHeight:200}}>
            {infras.length===0?(
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:120,color:'#d1d5db'}}>
                <Database size={28}/><p style={{fontSize:11,margin:'8px 0 4px'}}>{w.noInfra}</p>
                <Link href="/#explore" style={{fontSize:11,color:'#00b4d8'}}>{w.exploreNet}</Link>
              </div>
            ):infras.map(inf=>{
              const tKey = inf.type === 'chateau_eau' ? 'tank' : inf.type === 'barrage' ? 'dam' : inf.type;
              const typeColor:Record<string,string>={forage:'#e0f7ff',tank:'#dbeafe',dam:'#ede9fe'};
              const typeText:Record<string,string>={forage:'#00b4d8',tank:'#2563eb',dam:'#7c3aed'};
              const typeLabel:Record<string,string>={forage:t.explore.forages,tank:t.explore.tanks,dam:t.explore.dams};
              const subTypeAr:Record<string,string>={deep:'عميقة',shallow:'سطحية',elevated:'مرتفع',ground:'عادي'};
              return(
                <div key={inf._id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 10px',borderRadius:12,transition:'background 0.15s',cursor:'default'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='#f9fafb'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <div style={{width:34,height:34,borderRadius:10,background:typeColor[tKey]||'#f3f4f6',
                    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {inf.type==='forage'?<Droplets size={16} color={typeText[tKey]}/>:
                     inf.type==='barrage'?<Waves size={16} color={typeText[tKey]}/>:
                     <Database size={16} color={typeText[tKey]}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:12,fontWeight:700,color:'#112347',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{inf.name}</p>
                    <p style={{fontSize:11,color:'#9ca3af',margin:0,display:'flex',alignItems:'center',gap:4}}>
                      {typeLabel[tKey]||inf.type}
                      {inf.subType&&subTypeAr[inf.subType]&&(
                        <span style={{fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:99,background:typeColor[tKey],color:typeText[tKey]}}>
                          {isRTL ? subTypeAr[inf.subType] : inf.subType}
                        </span>
                      )}
                    </p>
                  </div>
                  {inf.fillPercentage!=null&&(
                    <div style={{width:60}}>
                      <div style={{height:5,background:'#f3f4f6',borderRadius:99}}>
                        <div style={{height:5,borderRadius:99,background:'linear-gradient(to right,#48cae4,#0077b6)',width:`${inf.fillPercentage}%`}}/>
                      </div>
                      <p style={{fontSize:10,color:'#9ca3af',textAlign:'right',margin:'2px 0 0'}}>{inf.fillPercentage}%</p>
                    </div>
                  )}
                  <span style={{width:8,height:8,borderRadius:'50%',background:inf.status==='active'?'#10b981':'#ef4444',flexShrink:0}}/>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom KPIs */}
        {[
          {icon:Zap,label:w.avgFlow,val:'12.4 m³/h',light:'#fef9c3',color:'#ca8a04'},
          {icon:Wind,label:w.turbidity,val:'1.2 NTU',light:'#ccfbf1',color:'#0d9488'},
          {icon:Activity,label:w.avgPh,val:'7.3',light:'#f3e8ff',color:'#9333ea'},
          {icon:CheckCircle,label:w.compliance,val:'98%',light:'#d1fae5',color:'#059669'},
        ].map(({icon:Icon,label,val,light,color})=>(
          <div key={label} style={{gridColumn:'span 3',background:'white',borderRadius:18,padding:'14px 18px',
            display:'flex',alignItems:'center',gap:12,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6'}}>
            <div style={{width:40,height:40,background:light,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <Icon size={20} color={color}/>
            </div>
            <div>
              <p style={{fontSize:10,color:'#9ca3af',margin:'0 0 2px'}}>{label}</p>
              <p style={{fontSize:18,fontWeight:800,color:'#112347',margin:0}}>{val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
