'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

type Lang = 'fr' | 'en';

const T: Record<string, Record<Lang, string>> = {
  title: { fr: 'Configurez vos réseaux sociaux', en: 'Set up your social accounts' },
  subtitle: { fr: 'Remplissez ce formulaire pour permettre à notre IA de gérer vos comptes.', en: 'Fill out this form to allow our AI to manage your accounts.' },
  companyInfo: { fr: 'Informations de l\'entreprise', en: 'Company information' },
  socialInfo: { fr: 'Comptes réseaux sociaux', en: 'Social media accounts' },
  brandDesc: { fr: 'Décrivez votre entreprise, ses valeurs, son public cible...', en: 'Describe your company, values, target audience...' },
  keywords: { fr: 'Mots-clés et hashtags récurrents', en: 'Recurring keywords and hashtags' },
  tone: { fr: 'Ton de communication préféré', en: 'Preferred communication tone' },
  company: { fr: 'Nom de l\'entreprise', en: 'Company name' },
  industry: { fr: 'Industrie / Secteur', en: 'Industry / Sector' },
  city: { fr: 'Ville', en: 'City' },
  username: { fr: 'Nom d\'utilisateur / URL du profil', en: 'Username / Profile URL' },
  pageId: { fr: 'ID de page (Facebook/Instagram Business)', en: 'Page ID (Facebook/Instagram Business)' },
  accessToken: { fr: 'Token d\'accès (si disponible)', en: 'Access token (if available)' },
  accessNote: { fr: 'Si vous ne disposez pas de tokens, notre équipe vous contactera pour configurer l\'accès.', en: 'If you don\'t have tokens, our team will contact you to set up access.' },
  submit: { fr: 'Envoyer la configuration', en: 'Submit configuration' },
  submitting: { fr: 'Envoi en cours...', en: 'Submitting...' },
  success: { fr: 'Configuration enregistrée avec succès !', en: 'Configuration saved successfully!' },
  successDesc: { fr: 'Notre équipe va configurer vos comptes sous 24h. Vous recevrez une confirmation par email.', en: 'Our team will set up your accounts within 24h. You\'ll receive a confirmation email.' },
  error: { fr: 'Erreur lors de l\'envoi. Réessayez ou contactez-nous.', en: 'Error submitting. Please retry or contact us.' },
  invalid: { fr: 'Lien invalide ou expiré.', en: 'Invalid or expired link.' },
  alreadyDone: { fr: 'Vous avez déjà complété cette configuration.', en: 'You\'ve already completed this setup.' },
  alreadyDoneDesc: { fr: 'Si vous souhaitez modifier vos informations, contactez-nous à solutions@tejiona.com', en: 'If you\'d like to update your information, contact us at solutions@tejiona.com' },
  loading: { fr: 'Chargement...', en: 'Loading...' },
  plan: { fr: 'Plan', en: 'Plan' },
};

const TONES_FR = ['Professionnel', 'Décontracté', 'Inspirant', 'Humoristique', 'Éducatif', 'Promotionnel'];
const TONES_EN = ['Professional', 'Casual', 'Inspiring', 'Humorous', 'Educational', 'Promotional'];

const PLATFORMS = [
  { key: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: '#e4405f' },
  { key: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: '#1877f2' },
  { key: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0a66c2' },
  { key: 'x', name: 'X (Twitter)', icon: 'fab fa-x-twitter', color: '#ffffff' },
];

export default function OnboardingPage() {
  const params = useParams();
  const token = params.token as string;

  const [lang, setLang] = useState<Lang>('fr');
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [company, setCompany] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [tone, setTone] = useState('Professionnel');
  const [keywords, setKeywords] = useState('');
  const [socialForms, setSocialForms] = useState<Record<string, { accountName: string; pageId: string; accessToken: string }>>({
    instagram: { accountName: '', pageId: '', accessToken: '' },
    facebook: { accountName: '', pageId: '', accessToken: '' },
    linkedin: { accountName: '', pageId: '', accessToken: '' },
    x: { accountName: '', pageId: '', accessToken: '' },
  });

  useEffect(() => {
    if (!token) return;
    fetch(`/api/onboarding?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setClient(data);
        setLang(data.lang === 'en' ? 'en' : 'fr');
        setCompany(data.company || data.name || '');
        setIndustry(data.industry || '');
        setCity(data.city || '');
        setBrandDescription(data.brandDescription || '');
        setTone(data.tone || 'Professionnel');
        setKeywords(data.keywords || '');
        if (data.socialAccounts) {
          const forms: any = { ...socialForms };
          for (const sa of data.socialAccounts) {
            if (forms[sa.platform]) forms[sa.platform].accountName = sa.accountName || '';
          }
          setSocialForms(forms);
        }
        setLoading(false);
      })
      .catch(() => { setError('Network error'); setLoading(false); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const socialAccounts = PLATFORMS.map(p => ({
      platform: p.key,
      ...socialForms[p.key],
    })).filter(sa => sa.accountName || sa.accessToken);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, company, industry, city, brandDescription, tone, keywords, socialAccounts }),
      });
      const data = await res.json();
      if (data.success) setSuccess(true);
      else setError(data.error || 'Error');
    } catch { setError('Network error'); }
    finally { setSubmitting(false); }
  };

  const t = (key: string) => T[key]?.[lang] || key;
  const inputStyle = { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid #334155', color: '#fff', padding: '12px 14px', borderRadius: 8, fontSize: 15, outline: 'none' };
  const labelStyle = { display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 600 as const };

  // Loading
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto 16px' }} className="animate-spin" />
        <p style={{ color: '#94a3b8' }}>{t('loading')}</p>
      </div>
    </div>
  );

  // Error / Invalid token
  if (error && !client) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <img src="https://tejiona.com/logo.png" alt="TEJIONA" style={{ height: 60, marginBottom: 20 }} />
        <h1 style={{ color: '#ef4444', fontSize: 20, marginBottom: 8 }}>{t('invalid')}</h1>
        <p style={{ color: '#94a3b8' }}>solutions@tejiona.com</p>
      </div>
    </div>
  );

  // Already completed
  if (client?.onboardingDone && !success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center', maxWidth: 450 }}>
        <img src="https://tejiona.com/logo.png" alt="TEJIONA" style={{ height: 60, marginBottom: 20 }} />
        <i className="fas fa-check-circle" style={{ color: '#10b981', fontSize: 48, marginBottom: 16, display: 'block' }} />
        <h1 style={{ color: '#fff', fontSize: 22, marginBottom: 8 }}>{t('alreadyDone')}</h1>
        <p style={{ color: '#94a3b8' }}>{t('alreadyDoneDesc')}</p>
      </div>
    </div>
  );

  // Success
  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ textAlign: 'center', maxWidth: 450 }} className="animate-slide-up">
        <img src="https://tejiona.com/logo.png" alt="TEJIONA" style={{ height: 60, marginBottom: 20 }} />
        <i className="fas fa-check-circle" style={{ color: '#10b981', fontSize: 64, marginBottom: 16, display: 'block' }} />
        <h1 style={{ color: '#fff', fontSize: 24, marginBottom: 12 }}>{t('success')}</h1>
        <p style={{ color: '#94a3b8', lineHeight: 1.7 }}>{t('successDesc')}</p>
      </div>
    </div>
  );

  // ═══ ONBOARDING FORM ═══
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', padding: '40px 20px' }}>
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 8 }}>
        <button onClick={() => setLang('fr')} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${lang === 'fr' ? '#6366f1' : '#334155'}`, background: lang === 'fr' ? 'rgba(99,102,241,0.15)' : 'transparent', color: lang === 'fr' ? '#6366f1' : '#94a3b8', cursor: 'pointer', fontSize: 13 }}>FR</button>
        <button onClick={() => setLang('en')} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${lang === 'en' ? '#6366f1' : '#334155'}`, background: lang === 'en' ? 'rgba(99,102,241,0.15)' : 'transparent', color: lang === 'en' ? '#6366f1' : '#94a3b8', cursor: 'pointer', fontSize: 13 }}>EN</button>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="https://tejiona.com/logo.png" alt="TEJIONA AI" style={{ height: 64, marginBottom: 12 }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#fff' }}>
            T-<span style={{ color: '#6366f1' }}>Content Manager</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>{t('subtitle')}</p>
          {client && <p style={{ color: '#6366f1', fontSize: 13, marginTop: 8 }}>{t('plan')}: <strong>{client.plan === 'growth' ? 'Growth — $699/mois' : 'Starter — $349/mois'}</strong></p>}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Company Info */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#fff' }}>
              <i className="fas fa-building" style={{ color: '#6366f1', marginRight: 8 }} />
              {t('companyInfo')}
            </h2>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{t('company')}</label>
              <input style={inputStyle} value={company} onChange={e => setCompany(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>{t('industry')}</label>
                <input style={inputStyle} value={industry} onChange={e => setIndustry(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>{t('city')}</label>
                <input style={inputStyle} value={city} onChange={e => setCity(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{lang === 'fr' ? 'Description de la marque' : 'Brand description'}</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' as const, fontFamily: 'inherit' }} value={brandDescription} onChange={e => setBrandDescription(e.target.value)} placeholder={t('brandDesc')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>{t('tone')}</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={tone} onChange={e => setTone(e.target.value)}>
                  {(lang === 'fr' ? TONES_FR : TONES_EN).map(tn => <option key={tn} value={tn}>{tn}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>{t('keywords')}</label>
                <input style={inputStyle} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="#bio #local" />
              </div>
            </div>
          </div>

          {/* Social Media Accounts */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#fff' }}>
              <i className="fas fa-share-alt" style={{ color: '#6366f1', marginRight: 8 }} />
              {t('socialInfo')}
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>{t('accessNote')}</p>

            {PLATFORMS.map(p => (
              <div key={p.key} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className={p.icon} style={{ color: p.color }} /> {p.name}
                </h3>

                <div style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>{t('username')}</label>
                  <input style={inputStyle} value={socialForms[p.key]?.accountName || ''} onChange={e => setSocialForms(prev => ({ ...prev, [p.key]: { ...prev[p.key], accountName: e.target.value } }))} placeholder={`@${p.key === 'x' ? 'username' : 'votre.compte'}`} />
                </div>

                {(p.key === 'facebook' || p.key === 'instagram') && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={labelStyle}>{t('pageId')}</label>
                    <input style={inputStyle} value={socialForms[p.key]?.pageId || ''} onChange={e => setSocialForms(prev => ({ ...prev, [p.key]: { ...prev[p.key], pageId: e.target.value } }))} />
                  </div>
                )}

                <div>
                  <label style={labelStyle}>{t('accessToken')}</label>
                  <input type="password" style={inputStyle} value={socialForms[p.key]?.accessToken || ''} onChange={e => setSocialForms(prev => ({ ...prev, [p.key]: { ...prev[p.key], accessToken: e.target.value } }))} />
                </div>
              </div>
            ))}
          </div>

          <button type="submit" disabled={submitting} style={{ width: '100%', background: '#6366f1', color: '#fff', padding: '16px 0', borderRadius: 12, border: 'none', fontSize: 16, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {submitting ? <><span style={{ width: 20, height: 20, border: '2px solid #334155', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" /> {t('submitting')}</> : <><i className="fas fa-paper-plane" /> {t('submit')}</>}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#475569' }}>
          &copy; 2026 TEJIONA AI Solutions (NTER Group) &middot; Ottawa, Canada
        </p>
      </div>
    </div>
  );
}
