'use client';
import { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, Phone, AtSign, Clock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useLang } from '@/lib/i18n/LanguageContext';

interface Msg { _id:string; name:string; email:string; phone?:string; subject?:string; message:string; read:boolean; createdAt:string; }

export default function MessagesPage() {
  const { t, isRTL } = useLang();
  const w = t.messagesPage;
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<string|null>(null);
  const [filter, setFilter] = useState<'all'|'unread'|'read'>('all');

  const load = () => {
    setLoading(true);
    api.get('/api/messages').then(d => { if(Array.isArray(d)) setMsgs(d); }).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(()=>{ load(); },[]);

  const markRead = async (id:string) => {
    await api.patch(`/api/messages/${id}/read`, {}).catch(()=>{});
    setMsgs(p => p.map(m => m._id===id ? {...m, read:true} : m));
  };

  const del = async (id:string) => {
    await api.delete(`/api/messages/${id}`).catch(()=>{});
    setMsgs(p => p.filter(m => m._id!==id));
    if(open===id) setOpen(null);
  };

  const toggle = (id:string, wasRead:boolean) => {
    setOpen(prev => prev===id ? null : id);
    if(!wasRead) markRead(id);
  };

  const filtered = filter==='all' ? msgs : filter==='unread' ? msgs.filter(m=>!m.read) : msgs.filter(m=>m.read);
  const unreadCount = msgs.filter(m=>!m.read).length;

  return (
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Header */}
      <div style={{background:'white',borderBottom:'1px solid #f3f4f6',padding:'20px 28px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:800,color:'#112347',margin:'0 0 4px',display:'flex',alignItems:'center',gap:10}}>
              {w.title}
              {unreadCount>0 && <span style={{background:'#ef4444',color:'white',fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:99}}>{unreadCount} {w.newCount}</span>}
            </h1>
            <p style={{fontSize:13,color:'#9ca3af',margin:0}}>{w.desc}</p>
          </div>
        </div>
        <button onClick={load} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 16px',borderRadius:10,border:'1px solid #e5e7eb',background:'white',cursor:'pointer',fontSize:12,fontWeight:600,color:'#374151'}}>
          <RefreshCw size={14} color="#00b4d8"/> {w.refresh}
        </button>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:24}}>
        {/* Stats row */}
        <div style={{display:'flex',gap:12,marginBottom:20}}>
          {[
            {label:w.total,val:msgs.length,bg:'#dbeafe',color:'#2563eb'},
            {label:w.unread,val:unreadCount,bg:'#fee2e2',color:'#dc2626'},
            {label:w.read,val:msgs.filter(m=>m.read).length,bg:'#d1fae5',color:'#059669'},
          ].map(({label,val,bg,color})=>(
            <div key={label} style={{background:bg,borderRadius:14,padding:'10px 20px',textAlign:'center'}}>
              <span style={{fontSize:24,fontWeight:800,color,display:'block'}}>{val}</span>
              <span style={{fontSize:11,color,fontWeight:600}}>{label}</span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {(['all','unread','read'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 18px',borderRadius:99,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,
              background:filter===f?'#0077b6':'#f3f4f6',color:filter===f?'white':'#6b7280'}}>
              {f==='all'?w.all:f==='unread'?w.unread:w.read}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{display:'flex',justifyContent:'center',padding:60}}>
            <div style={{width:36,height:36,border:'3px solid #e0f7ff',borderTopColor:'#00b4d8',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length===0 ? (
          <div style={{textAlign:'center',padding:'60px 0',color:'#94a3b8'}}>
            <Mail size={44} style={{marginBottom:14}}/>
            <p style={{fontWeight:700,fontSize:16,margin:'0 0 4px'}}>{w.noMessages}</p>
            <p style={{fontSize:13,margin:0}}>{w.noMessagesDesc}</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {filtered.map(m=>(
              <div key={m._id} style={{background:'white',borderRadius:16,border:`1px solid ${m.read?'#f3f4f6':'#bfdbfe'}`,
                boxShadow:m.read?'0 1px 3px rgba(0,0,0,0.04)':'0 2px 8px rgba(0,100,200,0.08)',overflow:'hidden'}}>

                {/* Header row */}
                <div onClick={()=>toggle(m._id, m.read)} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px',cursor:'pointer'}}>
                  <div style={{width:36,height:36,borderRadius:10,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
                    background:m.read?'#f3f4f6':'#dbeafe'}}>
                    {m.read ? <MailOpen size={17} color="#9ca3af"/> : <Mail size={17} color="#2563eb"/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                      <span style={{fontSize:14,fontWeight:m.read?600:800,color:'#112347'}}>{m.name}</span>
                      {!m.read && <span style={{background:'#2563eb',color:'white',fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:99}}>{w.newBadge}</span>}
                      {m.subject && <span style={{fontSize:12,color:'#6b7280',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>— {m.subject}</span>}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginTop:2}}>
                      <span style={{fontSize:11,color:'#9ca3af',display:'flex',alignItems:'center',gap:4}}><AtSign size={10}/>{m.email}</span>
                      {m.phone && <span style={{fontSize:11,color:'#9ca3af',display:'flex',alignItems:'center',gap:4}}><Phone size={10}/>{m.phone}</span>}
                      <span style={{fontSize:11,color:'#9ca3af',display:'flex',alignItems:'center',gap:4,[isRTL ? 'marginRight' : 'marginLeft']:'auto'}}><Clock size={10}/>{new Date(m.createdAt).toLocaleString(isRTL ? 'ar-DZ' : 'fr-DZ')}</span>
                    </div>
                  </div>
                  {open===m._id ? <ChevronUp size={16} color="#9ca3af"/> : <ChevronDown size={16} color="#9ca3af"/>}
                </div>

                {/* Message body */}
                {open===m._id && (
                  <div style={{borderTop:'1px solid #f3f4f6',padding:'16px 18px',background:'#fafbfc'}}>
                    <p style={{fontSize:14,color:'#374151',lineHeight:1.7,margin:'0 0 14px',whiteSpace:'pre-wrap'}}>{m.message}</p>
                    <div style={{display:'flex',gap:10}}>
                      <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject||'Votre message')}`}
                        style={{display:'flex',alignItems:'center',gap:6,padding:'7px 16px',borderRadius:10,background:'#0077b6',color:'white',fontSize:12,fontWeight:700,textDecoration:'none'}}>
                        <Mail size={13}/> {w.replyEmail}
                      </a>
                      {m.phone && (
                        <a href={`tel:${m.phone}`}
                          style={{display:'flex',alignItems:'center',gap:6,padding:'7px 16px',borderRadius:10,background:'#059669',color:'white',fontSize:12,fontWeight:700,textDecoration:'none'}}>
                          <Phone size={13}/> {w.call}
                        </a>
                      )}
                      <button onClick={()=>del(m._id)}
                        style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:10,border:'1px solid #fee2e2',background:'white',color:'#dc2626',fontSize:12,fontWeight:700,cursor:'pointer',[isRTL ? 'marginRight' : 'marginLeft']:'auto'}}>
                        <Trash2 size={13}/> {w.delete}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
