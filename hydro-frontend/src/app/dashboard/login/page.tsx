'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Droplets, Eye, EyeOff } from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';

const ADMIN_EMAIL = 'jamaleddinehedro@gmail.com';
const ADMIN_PASS  = 'jamal12345@';

export default function LoginPage() {
  const router = useRouter();
  const { t, isRTL } = useLang();
  const L = t.login;
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('ht_admin_email') : null;
      const storedPass  = typeof window !== 'undefined' ? localStorage.getItem('ht_admin_pass') : null;
      
      const targetEmail = storedEmail || ADMIN_EMAIL;
      const targetPass  = storedPass  || ADMIN_PASS;

      if (email === targetEmail && password === targetPass) {
        sessionStorage.setItem('ht_auth', '1');
        router.replace('/dashboard');
      } else {
        setError(L.error);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f7ff 0%, #caf0f8 40%, #ade8f4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '1rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .ht-form {
          background-color: #fff;
          display: block;
          padding: 2rem 1.75rem;
          width: 100%;
          max-width: 380px;
          border-radius: 1rem;
          box-shadow:
            0 10px 15px -3px rgba(0,0,0,0.1),
            0 4px 6px -2px rgba(0,0,0,0.05),
            0 0 0 1px rgba(0,180,216,0.08);
          position: relative;
        }

        .ht-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 1.5rem;
        }
        .ht-logo-icon {
          width: 44px; height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #48cae4, #0077b6);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,150,200,0.3);
        }
        .ht-logo-text {
          font-size: 1.1rem;
          font-weight: 800;
          color: #03045e;
          line-height: 1.2;
        }
        .ht-logo-sub {
          font-size: 0.7rem;
          font-weight: 500;
          color: #0077b6;
          letter-spacing: 0.5px;
        }

        .ht-title {
          font-size: 1.25rem;
          line-height: 1.75rem;
          font-weight: 700;
          text-align: center;
          color: #03045e;
          margin: 0 0 1.5rem;
        }

        .ht-input-container {
          position: relative;
          margin: 10px 0;
        }

        .ht-input-container input {
          outline: none;
          border: 1.5px solid #e5e7eb;
          background-color: #f9fafb;
          padding: 0.85rem 1rem;
          padding-right: 3rem;
          font-size: 0.9rem;
          line-height: 1.25rem;
          width: 100%;
          border-radius: 0.625rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
          color: #111827;
          font-family: 'Inter', sans-serif;
        }

        .ht-input-container input:focus {
          border-color: #0096c7;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(0,150,200,0.12);
        }

        .ht-input-container input::placeholder {
          color: #9ca3af;
        }

        .ht-eye-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .ht-eye-btn:hover { color: #0077b6; }

        .ht-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.5rem;
          padding: 0.6rem 0.875rem;
          font-size: 0.82rem;
          color: #dc2626;
          font-weight: 500;
          margin: 8px 0;
          text-align: center;
        }

        .ht-submit {
          display: block;
          padding: 0.85rem 1.25rem;
          background: linear-gradient(135deg, #4cc9f0 0%, #4361ee 100%);
          color: #ffffff;
          font-size: 0.9rem;
          line-height: 1.25rem;
          font-weight: 700;
          width: 100%;
          border-radius: 9999px; /* Pill shape */
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          letter-spacing: 0.5px;
          margin-top: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(67, 97, 238, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3);
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .ht-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(67, 97, 238, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.4);
        }
        .ht-submit:active:not(:disabled) { transform: translateY(0) scale(0.98); }
        .ht-submit:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }

        .ht-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 1.5rem 0 1rem;
        }

        .ht-back-link {
          color: #6B7280;
          font-size: 0.82rem;
          line-height: 1.25rem;
          text-align: center;
          margin: 0;
        }
        .ht-back-link a {
          color: #0077b6;
          font-weight: 600;
          text-decoration: none;
        }
        .ht-back-link a:hover { text-decoration: underline; }

        .ht-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
          vertical-align: middle;
          margin-right: 8px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Water ripple decoration */
        .ht-bg-circle {
          position: fixed;
          border-radius: 50%;
          background: rgba(0,150,200,0.06);
          pointer-events: none;
          animation: ripple 8s ease-in-out infinite;
        }
        @keyframes ripple {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50%       { transform: scale(1.08); opacity: 0.8; }
        }
      `}</style>

      {/* Decorative background circles */}
      <div className="ht-bg-circle" style={{ width: 500, height: 500, top: -200, left: -200, animationDelay: '0s' }} />
      <div className="ht-bg-circle" style={{ width: 400, height: 400, bottom: -150, right: -100, animationDelay: '3s' }} />
      <div className="ht-bg-circle" style={{ width: 250, height: 250, top: '30%', right: '5%', animationDelay: '5s' }} />

      <form className="ht-form" onSubmit={handleSubmit}>

        {/* Logo */}
        <div className="ht-logo">
          <div className="ht-logo-icon">
            <Droplets size={22} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div className="ht-logo-text">HydroTrack</div>
            <div className="ht-logo-sub">Algeria — Admin</div>
          </div>
        </div>

        <p className="ht-title">{L.title}</p>

        {/* Email */}
        <div className="ht-input-container">
          <input
            id="login-email"
            type="email"
            placeholder={L.emailPlaceholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        {/* Password */}
        <div className="ht-input-container">
          <input
            id="login-password"
            type={showPass ? 'text' : 'password'}
            placeholder={L.passPlaceholder}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="ht-eye-btn"
            onClick={() => setShowPass(v => !v)}
            tabIndex={-1}
          >
            {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        {/* Error */}
        {error && <div className="ht-error">⚠ {error}</div>}

        {/* Submit */}
        <button id="login-submit" type="submit" className="ht-submit" disabled={loading}>
          {loading && <span className="ht-spinner" />}
          {loading ? L.loading : L.submit}
        </button>

        <div className="ht-divider" />

        <p className="ht-back-link">
          {L.backLink} ·{' '}
          <a href="/">{L.homePage}</a>
        </p>
      </form>
    </div>
  );
}
