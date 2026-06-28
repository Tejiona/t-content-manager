'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const router = useRouter();

  const T = {
    fr: {
      title: 'Content Manager IA',
      subtitle: 'Gestion autonome de vos réseaux sociaux',
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      login: 'Se connecter',
      error: 'Identifiants incorrects',
      loading: 'Connexion...',
      powered: 'Propulsé par TEJIONA AI Solutions',
    },
    en: {
      title: 'AI Content Manager',
      subtitle: 'Autonomous social media management',
      email: 'Email address',
      password: 'Password',
      login: 'Sign in',
      error: 'Invalid credentials',
      loading: 'Signing in...',
      powered: 'Powered by TEJIONA AI Solutions',
    },
  };
  const t = T[lang];

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(t.error);
      }
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
        <button onClick={() => setLang('fr')} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${lang === 'fr' ? '#6366f1' : '#334155'}`, background: lang === 'fr' ? 'rgba(99,102,241,0.15)' : 'transparent', color: lang === 'fr' ? '#6366f1' : '#94a3b8', cursor: 'pointer', fontSize: 13 }}>FR</button>
        <button onClick={() => setLang('en')} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${lang === 'en' ? '#6366f1' : '#334155'}`, background: lang === 'en' ? 'rgba(99,102,241,0.15)' : 'transparent', color: lang === 'en' ? '#6366f1' : '#94a3b8', cursor: 'pointer', fontSize: 13 }}>EN</button>
      </div>

      <div className="animate-slide-up" style={{ width: '100%', maxWidth: 420, padding: 20 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="https://tejiona.com/logo.png" alt="TEJIONA AI" style={{ height: 72, marginBottom: 16 }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            T-<span style={{ color: '#6366f1' }}>Content Manager</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>{t.subtitle}</p>
        </div>

        <form onSubmit={handleLogin} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{t.email}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', color: '#fff', padding: '12px 14px', borderRadius: 8, fontSize: 15, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#334155'} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{t.password}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', color: '#fff', padding: '12px 14px', borderRadius: 8, fontSize: 15, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#334155'} />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', background: loading ? '#4f46e5' : '#6366f1', color: '#fff', padding: '12px 0', borderRadius: 8, border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? (
              <><span style={{ width: 18, height: 18, border: '2px solid #334155', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" /> {t.loading}</>
            ) : (
              <><i className="fas fa-sign-in-alt" /> {t.login}</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#475569' }}>
          {t.powered}<br />&copy; 2026 NTER Group
        </p>
      </div>
    </div>
  );
}
