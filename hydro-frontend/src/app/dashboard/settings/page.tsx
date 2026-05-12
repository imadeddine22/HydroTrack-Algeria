'use client';
import { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';
import CyberButton from '@/components/CyberButton';

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 24, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6', marginBottom: 24 }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, color: '#112347', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color="#0077b6" />
        </div>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, value, type = 'text', onChange, placeholder, icon: Icon }: { label: string; value: string; type?: string; onChange: (v: string) => void; placeholder?: string; icon?: any }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  const finalType = isPass ? (show ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: '#4b5563', display: 'block', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />}
        <input type={finalType} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: `12px 16px 12px ${Icon ? '42px' : '16px'}`, paddingRight: isPass ? '42px' : '16px', fontSize: 14, color: '#112347', outline: 'none', boxSizing: 'border-box', background: '#fcfcfc', transition: 'all 0.2s', fontWeight: 500 }}
          onFocus={e => { e.target.style.borderColor = '#00b4d8'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(0,180,216,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#fcfcfc'; e.target.style.boxShadow = 'none'; }} />
        {isPass && (
          <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { t, isRTL } = useLang();
  const w = t.settingsPage;

  // Initialize from localStorage or defaults
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ht_admin_email') || 'jamaleddinehedro@gmail.com';
    }
    return 'jamaleddinehedro@gmail.com';
  });

  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (pass && pass !== confirmPass) {
      setError(isRTL ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ht_admin_email', email);
        if (pass) {
          localStorage.setItem('ht_admin_pass', pass);
        }
      }
      setSaving(false);
      setSuccess(true);
      setPass('');
      setConfirmPass('');
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', padding: '24px 32px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#03045e', margin: '0 0 4px' }}>{w.title}</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>{w.desc}</p>
        </div>
        <CyberButton onClick={handleSave} disabled={saving}>
          {saving ? w.saving : (success ? w.saved : w.save)}
        </CyberButton>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        <div style={{ maxWidth: 540, margin: '0 auto' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px 16px', borderRadius: 12, color: '#dc2626', fontSize: 14, fontWeight: 600, marginBottom: 20, textAlign: 'center' }}>
              ⚠ {error}
            </div>
          )}

          <Section icon={Shield} title={w.loginInfo}>
            <Field label={w.email} value={email} type="email" icon={Mail} onChange={setEmail} placeholder="admin@example.com" />
          </Section>

          <Section icon={Lock} title={w.password}>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: -12, marginBottom: 20 }}>{w.passwordHelp}</p>
            <Field label={w.password} value={pass} type="password" icon={Lock} onChange={setPass} placeholder="••••••••" />
            <Field label={w.confirmPassword} value={confirmPass} type="password" icon={Lock} onChange={setConfirmPass} placeholder="••••••••" />
          </Section>
        </div>
      </div>
    </div>
  );
}
