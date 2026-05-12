'use client';
import { useEffect, useState } from 'react';
import { Database, Droplets, Waves, TrendingUp, BarChart2, RefreshCw, Download } from 'lucide-react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n/LanguageContext';

interface InfraStats { total:number; active:number; inactive:number; byType:{forage:number;tank:number;dam:number}; avgFill:number; }

function Bar({label,value,max,color}:{label:string;value:number;max:number;color:string}){
  const pct = max>0?(value/max)*100:0;
  return(
    <div style={{marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}>
        <span style={{fontWeight:600,color:'#374151'}}>{label}</span>
        <span style={{fontWeight:800,color:'#112347'}}>{value}</span>
      </div>
      <div style={{height:10,background:'#f3f4f6',borderRadius:99}}>
        <div style={{height:10,borderRadius:99,background:color,width:`${pct}%`,transition:'width 0.8s ease'}}/>
      </div>
    </div>
  );
}

export default function DataPage(){
  const { t, isRTL } = useLang();
  const w = t.dataPage;
  const [stats,setStats]=useState<InfraStats|null>(null);
  const [wilayas,setWilayas]=useState<any[]>([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    setLoading(true);
    Promise.all([api.get('/api/wilaya-infra/stats'),api.get('/api/wilayas')])
      .then(([s,w])=>{ 
        if(s&&!s.error) {
          setStats({
            total: s.total,
            active: s.byStatus?.active || 0,
            inactive: (s.byStatus?.inactive || 0) + (s.byStatus?.en_construction || 0) + (s.byStatus?.en_maintenance || 0),
            byType: {
              forage: s.byType?.forage || 0,
              tank: s.byType?.chateau_eau || 0,
              dam: s.byType?.barrage || 0
            },
            avgFill: s.avgFillBarrage || 0
          });
        }
        if(Array.isArray(w))setWilayas(w); 
      })
      .catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const max = stats ? Math.max(stats.byType.forage,stats.byType.tank,stats.byType.dam,1):1;

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      <div style={{background:'white',borderBottom:'1px solid #f3f4f6',padding:'20px 28px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:800,color:'#112347',margin:'0 0 4px'}}>{w.title}</h1>
          <p style={{fontSize:13,color:'#9ca3af',margin:0}}>{w.desc}</p>
        </div>
        <button style={{display:'flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:10,border:'1px solid #e5e7eb',background:'white',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151'}}>
          <Download size={14} color="#00b4d8"/> {w.export}
        </button>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:24}}>
        {loading?(
          <div style={{display:'flex',justifyContent:'center',padding:80}}>
            <div style={{width:36,height:36,border:'3px solid #e0f7ff',borderTopColor:'#00b4d8',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ):(
          <>
            {/* Main stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
              {[
                {label:w.totalInfras,val:stats?.total??0,icon:Database,bg:'#dbeafe',color:'#2563eb'},
                {label:w.actives,val:stats?.active??0,icon:TrendingUp,bg:'#d1fae5',color:'#059669'},
                {label:w.inactives,val:stats?.inactive??0,icon:BarChart2,bg:'#fee2e2',color:'#dc2626'},
                {label:w.coveredWilayas,val:wilayas.length,icon:Droplets,bg:'#e0f7ff',color:'#0096c7'},
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

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              {/* By type chart */}
              <div style={{background:'white',borderRadius:18,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6'}}>
                <h2 style={{fontSize:14,fontWeight:700,color:'#112347',margin:'0 0 18px',display:'flex',alignItems:'center',gap:8}}>
                  <BarChart2 size={16} color="#00b4d8"/> {w.typeDistribution}
                </h2>
                <Bar label={w.forages} value={stats?.byType.forage??0} max={max} color="#48cae4"/>
                <Bar label={w.tanks} value={stats?.byType.tank??0} max={max} color="#3b82f6"/>
                <Bar label={w.dams} value={stats?.byType.dam??0} max={max} color="#8b5cf6"/>

                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginTop:18}}>
                  {[
                    {label:w.forages,val:stats?.byType.forage??0,total:stats?.total??1,color:'#48cae4',bg:'#e0f7ff'},
                    {label:w.tanksShort,val:stats?.byType.tank??0,total:stats?.total??1,color:'#3b82f6',bg:'#dbeafe'},
                    {label:w.dams,val:stats?.byType.dam??0,total:stats?.total??1,color:'#8b5cf6',bg:'#ede9fe'},
                  ].map(({label,val,total,color,bg})=>(
                    <div key={label} style={{background:bg,borderRadius:14,padding:'10px 12px',textAlign:'center'}}>
                      <p style={{fontSize:18,fontWeight:800,color,margin:0}}>{val}</p>
                      <p style={{fontSize:10,color,opacity:0.8,margin:'2px 0',fontWeight:600}}>{label}</p>
                      <p style={{fontSize:10,color:'#6b7280',margin:0}}>{total>0?Math.round((val/total)*100):0}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status + Dam fill */}
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{background:'white',borderRadius:18,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6',flex:1}}>
                  <h2 style={{fontSize:14,fontWeight:700,color:'#112347',margin:'0 0 16px',display:'flex',alignItems:'center',gap:8}}>
                    <TrendingUp size={16} color="#059669"/> {w.activityRate}
                  </h2>
                  <div style={{position:'relative',width:120,height:120,margin:'0 auto'}}>
                    <svg viewBox="0 0 120 120" style={{width:'100%',height:'100%'}}>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="12"/>
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#059669" strokeWidth="12"
                        strokeDasharray={`${314*(stats?.active??0)/(stats?.total||1)} 314`}
                        strokeLinecap="round" transform="rotate(-90 60 60)"/>
                    </svg>
                    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                      <span style={{fontSize:22,fontWeight:800,color:'#112347'}}>{stats?.total?Math.round((stats.active/stats.total)*100):0}%</span>
                      <span style={{fontSize:10,color:'#9ca3af'}}>{w.activesLow}</span>
                    </div>
                  </div>
                </div>

                <div style={{background:'white',borderRadius:18,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6',flex:1}}>
                  <h2 style={{fontSize:14,fontWeight:700,color:'#112347',margin:'0 0 12px',display:'flex',alignItems:'center',gap:8}}>
                    <Waves size={16} color="#8b5cf6"/> {w.avgDamFill}
                  </h2>
                  <div style={{textAlign:'center'}}>
                    <p style={{fontSize:36,fontWeight:800,color:'#8b5cf6',margin:'0 0 8px'}}>{stats?.avgFill??0}<span style={{fontSize:18,color:'#9ca3af'}}>%</span></p>
                    <div style={{height:10,background:'#f3f4f6',borderRadius:99}}>
                      <div style={{height:10,borderRadius:99,background:'linear-gradient(to right,#a78bfa,#8b5cf6)',width:`${stats?.avgFill??0}%`,transition:'width 1s ease'}}/>
                    </div>
                    <p style={{fontSize:11,color:'#9ca3af',marginTop:6}}>{w.avgFillLevel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wilayas table */}
            <div style={{background:'white',borderRadius:18,padding:20,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',border:'1px solid #f3f4f6'}}>
              <h2 style={{fontSize:14,fontWeight:700,color:'#112347',margin:'0 0 16px',display:'flex',alignItems:'center',gap:8}}>
                <Database size={16} color="#0077b6"/> {w.savedWilayas} ({wilayas.length})
              </h2>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:8}}>
                {wilayas.map((wil,i)=>(
                  <div key={wil._id} style={{background:'#f8fafc',borderRadius:10,padding:'8px 12px',display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:22,height:22,borderRadius:6,background:'#e0f7ff',color:'#0096c7',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</span>
                    <span style={{fontSize:12,fontWeight:600,color:'#374151',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{wil.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
