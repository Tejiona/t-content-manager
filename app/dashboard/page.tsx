'use client';

import { useState, useEffect, useCallback } from 'react';

type Lang = 'fr' | 'en';
type Page = 'dashboard' | 'create' | 'calendar' | 'library' | 'clients' | 'reports' | 'settings';
type Client = any;
type Post = any;

// ═══════════════════════════════════════════
// I18N — all UI strings
// ═══════════════════════════════════════════
const T: Record<string, Record<Lang, string>> = {
  'nav.dashboard': { fr: 'Tableau de bord', en: 'Dashboard' },
  'nav.create': { fr: 'Créer', en: 'Create' },
  'nav.calendar': { fr: 'Calendrier', en: 'Calendar' },
  'nav.library': { fr: 'Bibliothèque', en: 'Library' },
  'nav.clients': { fr: 'Clients', en: 'Clients' },
  'nav.reports': { fr: 'Rapports', en: 'Reports' },
  'nav.settings': { fr: 'Paramètres', en: 'Settings' },
  'nav.main': { fr: 'Principal', en: 'Main' },
  'nav.management': { fr: 'Gestion', en: 'Management' },
  'dash.posts': { fr: 'Posts créés', en: 'Posts created' },
  'dash.published': { fr: 'Publiés', en: 'Published' },
  'dash.scheduled': { fr: 'Programmés', en: 'Scheduled' },
  'dash.clients': { fr: 'Clients actifs', en: 'Active clients' },
  'dash.upcoming': { fr: 'Posts à venir', en: 'Upcoming posts' },
  'dash.activity': { fr: 'Activité récente', en: 'Recent activity' },
  'dash.noScheduled': { fr: 'Aucun post programmé', en: 'No scheduled posts' },
  'dash.noActivity': { fr: 'Aucune activité', en: 'No activity' },
  'create.title': { fr: 'Générateur IA', en: 'AI Generator' },
  'create.selectClient': { fr: '— Sélectionner un client —', en: '— Select a client —' },
  'create.platforms': { fr: 'Plateformes cibles', en: 'Target platforms' },
  'create.topic': { fr: 'Sujet / Thème du post', en: 'Post topic / theme' },
  'create.topicPh': { fr: 'Ex: Lancement de notre nouveau produit bio...', en: 'e.g.: Launch of our new organic product...' },
  'create.tone': { fr: 'Ton', en: 'Tone' },
  'create.lang': { fr: 'Langue du post', en: 'Post language' },
  'create.extra': { fr: 'Instructions supplémentaires (optionnel)', en: 'Additional instructions (optional)' },
  'create.emojis': { fr: 'Emojis', en: 'Emojis' },
  'create.generate': { fr: 'Générer avec l\'IA', en: 'Generate with AI' },
  'create.generating': { fr: 'Génération...', en: 'Generating...' },
  'create.preview': { fr: 'Aperçu par plateforme', en: 'Platform preview' },
  'create.schedule': { fr: 'Programmer', en: 'Schedule' },
  'create.save': { fr: 'Sauvegarder', en: 'Save' },
  'create.newPost': { fr: 'Nouveau post', en: 'New post' },
  'create.ready': { fr: 'Prêt à créer', en: 'Ready to create' },
  'create.readyDesc': { fr: 'Remplissez le formulaire et cliquez sur « Générer ».', en: 'Fill in the form and click "Generate".' },
  'create.copy': { fr: 'Copier', en: 'Copy' },
  'create.edit': { fr: 'Modifier', en: 'Edit' },
  'lib.title': { fr: 'Bibliothèque de contenus', en: 'Content library' },
  'lib.all': { fr: 'Tous', en: 'All' },
  'lib.drafts': { fr: 'Brouillons', en: 'Drafts' },
  'lib.allClients': { fr: 'Tous les clients', en: 'All clients' },
  'lib.empty': { fr: 'Aucun contenu', en: 'No content' },
  'lib.emptyDesc': { fr: 'Créez votre premier post.', en: 'Create your first post.' },
  'status.draft': { fr: 'Brouillon', en: 'Draft' },
  'status.scheduled': { fr: 'Programmé', en: 'Scheduled' },
  'status.published': { fr: 'Publié', en: 'Published' },
  'status.failed': { fr: 'Échoué', en: 'Failed' },
  'clients.title': { fr: 'Profils Clients', en: 'Client Profiles' },
  'clients.add': { fr: 'Ajouter un client', en: 'Add a client' },
  'clients.new': { fr: 'Nouveau client', en: 'New client' },
  'clients.name': { fr: 'Nom de l\'entreprise', en: 'Company name' },
  'clients.industry': { fr: 'Industrie', en: 'Industry' },
  'clients.city': { fr: 'Ville', en: 'City' },
  'clients.email': { fr: 'Email', en: 'Email' },
  'clients.brandDesc': { fr: 'Description de la marque', en: 'Brand description' },
  'clients.tone': { fr: 'Ton préféré', en: 'Preferred tone' },
  'clients.keywords': { fr: 'Mots-clés / Hashtags', en: 'Keywords / Hashtags' },
  'clients.plan': { fr: 'Plan', en: 'Plan' },
  'clients.sendCheckout': { fr: 'Envoyer lien Stripe', en: 'Send Stripe link' },
  'reports.title': { fr: 'Rapports de performance', en: 'Performance Reports' },
  'reports.generate': { fr: 'Générer', en: 'Generate' },
  'reports.send': { fr: 'Envoyer', en: 'Send' },
  'reports.sendAll': { fr: 'Envoyer tous', en: 'Send all' },
  'reports.frequency': { fr: 'Fréquence', en: 'Frequency' },
  'reports.weekly': { fr: 'Hebdomadaire', en: 'Weekly' },
  'reports.biweekly': { fr: 'Bi-mensuel', en: 'Bi-weekly' },
  'reports.monthly': { fr: 'Mensuel', en: 'Monthly' },
  'reports.mode': { fr: 'Mode d\'envoi', en: 'Send mode' },
  'reports.auto': { fr: 'Automatique', en: 'Automatic' },
  'reports.manual': { fr: 'Manuel', en: 'Manual' },
  'reports.noReports': { fr: 'Aucun rapport', en: 'No reports' },
  'settings.gemini': { fr: 'Clé API Gemini', en: 'Gemini API Key' },
  'settings.social': { fr: 'Comptes Réseaux Sociaux', en: 'Social Media Accounts' },
  'settings.connected': { fr: 'Connecté', en: 'Connected' },
  'settings.notConnected': { fr: 'Non connecté', en: 'Not connected' },
  'settings.n8n': { fr: 'Intégration n8n', en: 'n8n Integration' },
  'settings.language': { fr: 'Langue', en: 'Language' },
  'settings.reportConfig': { fr: 'Configuration rapports', en: 'Report configuration' },
  'common.save': { fr: 'Enregistrer', en: 'Save' },
  'common.cancel': { fr: 'Annuler', en: 'Cancel' },
  'common.delete': { fr: 'Supprimer', en: 'Delete' },
  'common.close': { fr: 'Fermer', en: 'Close' },
  'common.copied': { fr: 'Copié !', en: 'Copied!' },
  'common.logout': { fr: 'Déconnexion', en: 'Log out' },
  'cal.today': { fr: 'Aujourd\'hui', en: 'Today' },
  'tone.professionnel': { fr: 'Professionnel', en: 'Professional' },
  'tone.decontracte': { fr: 'Décontracté', en: 'Casual' },
  'tone.inspirant': { fr: 'Inspirant', en: 'Inspiring' },
  'tone.humoristique': { fr: 'Humoristique', en: 'Humorous' },
  'tone.educatif': { fr: 'Éducatif', en: 'Educational' },
  'tone.promotionnel': { fr: 'Promotionnel', en: 'Promotional' },
};

function t(key: string, lang: Lang): string { return T[key]?.[lang] || key; }

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_FR = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const DAYS_EN = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const PLATFORM_ICONS: Record<string, string> = { instagram: 'fab fa-instagram', facebook: 'fab fa-facebook', linkedin: 'fab fa-linkedin', x: 'fab fa-x-twitter' };
const PLATFORM_COLORS: Record<string, string> = { instagram: '#e4405f', facebook: '#1877f2', linkedin: '#0a66c2', x: '#ffffff' };
const PLATFORM_LIMITS: Record<string, number> = { instagram: 2200, facebook: 63206, linkedin: 3000, x: 280 };

const TONES = ['professionnel','decontracte','inspirant','humoristique','educatif','promotionnel'];
const EMOJI_OPTIONS = [
  { value: 'oui, modérément', fr: 'Oui, modérément', en: 'Yes, moderately' },
  { value: 'oui, beaucoup', fr: 'Oui, beaucoup', en: 'Yes, lots' },
  { value: 'non', fr: 'Non', en: 'No' },
];
const POST_LANGS = [
  { value: 'français', fr: 'Français', en: 'French' },
  { value: 'anglais', fr: 'Anglais', en: 'English' },
  { value: 'espagnol', fr: 'Espagnol', en: 'Spanish' },
  { value: 'bilingue FR/EN', fr: 'Bilingue FR/EN', en: 'Bilingual FR/EN' },
];

// ═══════════════════════════════════════════
// STYLES — inline for single-file simplicity
// ═══════════════════════════════════════════
const S = {
  sidebar: { width: 240, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' as const, flexShrink: 0, overflowY: 'auto' as const, height: '100vh' },
  logo: { padding: 20, display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' },
  navSection: { padding: '16px 12px 6px', fontSize: 11, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: 1.5, fontWeight: 700 },
  navItem: (active: boolean) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', color: active ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', borderRadius: 8, margin: '2px 8px', fontSize: 14, background: active ? 'rgba(99,102,241,0.15)' : 'transparent', fontWeight: active ? 600 : 400, border: 'none', width: 'calc(100% - 16px)', textAlign: 'left' as const }),
  main: { flex: 1, display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' },
  topbar: { padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', background: 'rgba(15,23,42,0.95)', flexShrink: 0 },
  content: { flex: 1, overflowY: 'auto' as const, padding: 28 },
  btn: (variant: string = 'primary', size: string = 'md') => {
    const bg = variant === 'primary' ? 'var(--accent)' : variant === 'success' ? 'var(--success)' : variant === 'danger' ? 'var(--danger)' : 'transparent';
    const border = variant === 'outline' ? '1px solid var(--border)' : 'none';
    const color = variant === 'outline' ? 'var(--muted)' : '#fff';
    const pad = size === 'sm' ? '6px 12px' : '8px 18px';
    const font = size === 'sm' ? 12 : 14;
    return { padding: pad, borderRadius: 8, border, background: bg, color, fontWeight: 600, cursor: 'pointer', fontSize: font, display: 'inline-flex', alignItems: 'center', gap: 6 };
  },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 20 },
  statCard: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16 },
  statIcon: (color: string) => ({ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: `${color}22`, color }),
  input: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border)', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none' },
  select: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border)', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none', cursor: 'pointer' },
  textarea: { width: '100%', background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border)', color: '#fff', padding: '10px 14px', borderRadius: 8, fontSize: 14, outline: 'none', minHeight: 80, resize: 'vertical' as const, fontFamily: 'inherit' },
  label: { display: 'block', fontSize: 12, color: 'var(--muted)', marginBottom: 5, fontWeight: 600 },
  chip: (selected: boolean) => ({ padding: '8px 14px', borderRadius: 20, border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`, background: selected ? 'rgba(99,102,241,0.15)' : 'transparent', color: selected ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: selected ? 600 : 400 }),
  badge: (status: string) => {
    const colors: Record<string, string> = { draft: 'var(--muted)', scheduled: 'var(--accent)', published: 'var(--success)', failed: 'var(--danger)' };
    const c = colors[status] || 'var(--muted)';
    return { padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: `${c}22`, color: c };
  },
  modal: { position: 'fixed' as const, inset: 0, background: 'rgba(8,15,30,0.88)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { background: 'var(--card2)', borderRadius: 16, border: '1px solid var(--border)', maxWidth: 550, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' as const },
  toast: (show: boolean, isError: boolean) => ({ position: 'fixed' as const, bottom: 24, right: 24, background: 'var(--card)', border: `1px solid ${isError ? 'var(--danger)' : 'var(--success)'}`, padding: '14px 22px', borderRadius: 10, fontSize: 14, zIndex: 99999, boxShadow: '0 8px 30px rgba(0,0,0,0.5)', transform: show ? 'translateY(0)' : 'translateY(120px)', opacity: show ? 1 : 0, transition: '0.4s', display: 'flex', alignItems: 'center', gap: 10 }),
};

// ═══════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════
export default function DashboardPage() {
  const [lang, setLang] = useState<Lang>('fr');
  const [page, setPage] = useState<Page>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState('');
  const [toastErr, setToastErr] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Create page state
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'facebook', 'linkedin']);
  const [createClient, setCreateClient] = useState('');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professionnel');
  const [postLang, setPostLang] = useState('français');
  const [emojis, setEmojis] = useState('oui, modérément');
  const [extra, setExtra] = useState('');
  const [generated, setGenerated] = useState<Record<string, any> | null>(null);
  const [generating, setGenerating] = useState(false);

  // Calendar state
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  // Modal state
  const [clientModal, setClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm] = useState({ name: '', email: '', industry: '', city: '', brandDescription: '', tone: 'professionnel', keywords: '', plan: 'starter' });

  // Schedule modal
  const [scheduleModal, setScheduleModal] = useState(false);
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('09:00');

  // Library filters
  const [libFilter, setLibFilter] = useState('all');
  const [libClientFilter, setLibClientFilter] = useState('all');

  // ── Toast ──
  const toast = useCallback((msg: string, error = false) => {
    setToastMsg(msg); setToastErr(error); setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }, []);

  // ── Data fetching ──
  const fetchClients = useCallback(async () => {
    try { const r = await fetch('/api/clients'); if (r.ok) setClients(await r.json()); } catch {}
  }, []);

  const fetchPosts = useCallback(async () => {
    try { const r = await fetch('/api/content'); if (r.ok) setPosts(await r.json()); } catch {}
  }, []);

  const fetchActivities = useCallback(async () => {
    try { const r = await fetch('/api/activity'); if (r.ok) setActivities(await r.json()); } catch {}
  }, []);

  const fetchReports = useCallback(async () => {
    try { const r = await fetch('/api/reports'); if (r.ok) setReports(await r.json()); } catch {}
  }, []);

  useEffect(() => {
    fetchClients(); fetchPosts(); fetchActivities();
    // Get admin lang preference
    fetch('/api/auth').then(r => r.json()).then(d => { if (d.admin?.lang) setLang(d.admin.lang); });
  }, [fetchClients, fetchPosts, fetchActivities]);

  useEffect(() => { if (page === 'reports') fetchReports(); }, [page, fetchReports]);

  // ── Logout ──
  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    window.location.href = '/';
  };

  // ── Generate content ──
  const handleGenerate = async () => {
    if (!topic) { toast(lang === 'fr' ? 'Entrez un sujet' : 'Enter a topic', true); return; }
    if (!selectedPlatforms.length) { toast(lang === 'fr' ? 'Sélectionnez une plateforme' : 'Select a platform', true); return; }
    setGenerating(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: createClient || undefined, topic, platforms: selectedPlatforms, tone, language: postLang, emojis, extra, saveAsDraft: !!createClient }),
      });
      const data = await res.json();
      if (data.error) { toast(data.error, true); return; }
      setGenerated(data.generated);
      if (data.saved) { fetchPosts(); toast(lang === 'fr' ? `${data.saved.length} brouillons sauvegardés` : `${data.saved.length} drafts saved`); }
      else toast(lang === 'fr' ? 'Contenu généré !' : 'Content generated!');
    } catch (e: any) { toast(e.message, true); }
    finally { setGenerating(false); }
  };

  // ── Save client ──
  const handleSaveClient = async () => {
    if (!clientForm.name || !clientForm.email) { toast(lang === 'fr' ? 'Nom et email requis' : 'Name and email required', true); return; }
    const method = editingClient ? 'PUT' : 'POST';
    const body = editingClient ? { id: editingClient.id, ...clientForm } : clientForm;
    try {
      const res = await fetch('/api/clients', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { fetchClients(); fetchActivities(); setClientModal(false); toast(lang === 'fr' ? 'Client enregistré' : 'Client saved'); }
      else { const d = await res.json(); toast(d.error, true); }
    } catch (e: any) { toast(e.message, true); }
  };

  // ── Schedule posts ──
  const handleSchedule = async () => {
    if (!schedDate) { toast(lang === 'fr' ? 'Choisissez une date' : 'Choose a date', true); return; }
    if (!generated) return;
    const dt = `${schedDate}T${schedTime}:00`;
    let count = 0;
    for (const [platform, content] of Object.entries(generated)) {
      await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: createClient || undefined, topic, platforms: [platform], tone, language: postLang, emojis, extra, saveAsDraft: true }),
      });
      count++;
    }
    fetchPosts(); setScheduleModal(false);
    toast(lang === 'fr' ? `${count} posts programmés` : `${count} posts scheduled`);
  };

  // ── Generate report ──
  const handleGenerateReport = async (clientId: string, sendNow = false) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, sendNow }),
      });
      if (res.ok) { fetchReports(); toast(sendNow ? (lang === 'fr' ? 'Rapport envoyé' : 'Report sent') : (lang === 'fr' ? 'Rapport généré' : 'Report generated')); }
    } catch (e: any) { toast(e.message, true); }
  };

  // ── Update report settings ──
  const handleUpdateReportSettings = async (clientId: string, frequency?: string, sendMode?: string) => {
    await fetch('/api/reports', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, frequency, sendMode }),
    });
    toast(lang === 'fr' ? 'Paramètres mis à jour' : 'Settings updated');
  };

  // ── Stats ──
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p: Post) => p.status === 'published').length;
  const scheduledPosts = posts.filter((p: Post) => p.status === 'scheduled').length;
  const activeClients = clients.filter((c: Client) => c.planStatus === 'active').length;

  // ── Filtered library posts ──
  const filteredPosts = posts
    .filter((p: Post) => libFilter === 'all' || p.status === libFilter)
    .filter((p: Post) => libClientFilter === 'all' || p.clientId === libClientFilter);

  // ── Page title ──
  const pageTitle = t(`nav.${page}`, lang);

  // ═══════════ RENDER ═══════════
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── SIDEBAR ── */}
      <aside style={S.sidebar}>
        <div style={S.logo}>
          <img src="https://tejiona.com/logo.png" alt="Logo" style={{ height: 36 }} onError={(e) => (e.currentTarget.style.display = 'none')} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>T-<span style={{ color: 'var(--accent)' }}>Content</span></div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Manager</div>
          </div>
        </div>

        <div style={S.navSection}>{t('nav.main', lang)}</div>
        {(['dashboard', 'create', 'calendar', 'library'] as Page[]).map(p => (
          <button key={p} style={S.navItem(page === p)} onClick={() => setPage(p)}>
            <i className={`fas fa-${p === 'dashboard' ? 'home' : p === 'create' ? 'magic' : p === 'calendar' ? 'calendar-alt' : 'folder-open'}`} style={{ width: 20, textAlign: 'center' }} />
            <span>{t(`nav.${p}`, lang)}</span>
            {p === 'library' && posts.length > 0 && <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>{posts.length}</span>}
          </button>
        ))}

        <div style={S.navSection}>{t('nav.management', lang)}</div>
        {(['clients', 'reports', 'settings'] as Page[]).map(p => (
          <button key={p} style={S.navItem(page === p)} onClick={() => setPage(p)}>
            <i className={`fas fa-${p === 'clients' ? 'building' : p === 'reports' ? 'chart-line' : 'cog'}`} style={{ width: 20, textAlign: 'center' }} />
            <span>{t(`nav.${p}`, lang)}</span>
          </button>
        ))}

        <div style={{ marginTop: 'auto', padding: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, justifyContent: 'center' }}>
            <button onClick={() => setLang('fr')} style={{ ...S.btn('outline', 'sm'), background: lang === 'fr' ? 'rgba(99,102,241,0.15)' : 'transparent', color: lang === 'fr' ? 'var(--accent)' : 'var(--muted)', padding: '4px 10px', fontSize: 11 }}>FR</button>
            <button onClick={() => setLang('en')} style={{ ...S.btn('outline', 'sm'), background: lang === 'en' ? 'rgba(99,102,241,0.15)' : 'transparent', color: lang === 'en' ? 'var(--accent)' : 'var(--muted)', padding: '4px 10px', fontSize: 11 }}>EN</button>
          </div>
          <div style={{ fontSize: 11, color: '#475569', textAlign: 'center' }}>&copy; 2026 TEJIONA AI</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={S.main}>
        <div style={S.topbar}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>{pageTitle}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {page !== 'create' && <button style={S.btn()} onClick={() => setPage('create')}><i className="fas fa-plus" /> {t('create.newPost', lang)}</button>}
            <button style={S.btn('outline', 'sm')} onClick={handleLogout}><i className="fas fa-sign-out-alt" /> {t('common.logout', lang)}</button>
          </div>
        </div>

        <div style={S.content}>
          {/* ═══ DASHBOARD ═══ */}
          {page === 'dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                {[
                  { icon: 'fa-file-alt', color: 'var(--accent)', value: totalPosts, label: t('dash.posts', lang) },
                  { icon: 'fa-check-circle', color: 'var(--success)', value: publishedPosts, label: t('dash.published', lang) },
                  { icon: 'fa-clock', color: 'var(--purple)', value: scheduledPosts, label: t('dash.scheduled', lang) },
                  { icon: 'fa-users', color: 'var(--warning)', value: activeClients, label: t('dash.clients', lang) },
                ].map((stat, i) => (
                  <div key={i} style={S.statCard}>
                    <div style={S.statIcon(stat.color)}><i className={`fas ${stat.icon}`} /></div>
                    <div><div style={{ fontSize: 24, fontWeight: 800 }}>{stat.value}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{stat.label}</div></div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={S.card}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{t('dash.upcoming', lang)}</h2>
                  {posts.filter((p: Post) => p.status === 'scheduled').length === 0 ? (
                    <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 30 }}>{t('dash.noScheduled', lang)}</p>
                  ) : posts.filter((p: Post) => p.status === 'scheduled').slice(0, 5).map((p: Post) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
                      <i className={PLATFORM_ICONS[p.platform]} style={{ color: PLATFORM_COLORS[p.platform], width: 24, textAlign: 'center' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13 }}>{p.topic || p.content?.substring(0, 40)}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.client?.name}</div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--accent)' }}>{p.scheduledAt ? new Date(p.scheduledAt).toLocaleDateString() : ''}</div>
                    </div>
                  ))}
                </div>

                <div style={S.card}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{t('dash.activity', lang)}</h2>
                  {activities.length === 0 ? (
                    <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 30 }}>{t('dash.noActivity', lang)}</p>
                  ) : activities.slice(0, 8).map((a: any) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(51,65,85,0.2)' }}>
                      <i className="fas fa-circle" style={{ fontSize: 5, color: 'var(--accent)' }} />
                      <span style={{ fontSize: 13, flex: 1 }}>{a.action}: {a.details}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ CREATE ═══ */}
          {page === 'create' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={S.card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-magic" style={{ color: 'var(--accent)' }} /> {t('create.title', lang)}
                </h2>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Client</label>
                  <select style={S.select} value={createClient} onChange={e => setCreateClient(e.target.value)}>
                    <option value="">{t('create.selectClient', lang)}</option>
                    {clients.map((c: Client) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>{t('create.platforms', lang)}</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['instagram', 'facebook', 'linkedin', 'x'].map(p => (
                      <button key={p} style={S.chip(selectedPlatforms.includes(p))} onClick={() => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}>
                        <i className={PLATFORM_ICONS[p]} style={{ color: PLATFORM_COLORS[p] }} /> {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>{t('create.topic', lang)}</label>
                  <input style={S.input} value={topic} onChange={e => setTopic(e.target.value)} placeholder={t('create.topicPh', lang)} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label style={S.label}>{t('create.tone', lang)}</label>
                    <select style={S.select} value={tone} onChange={e => setTone(e.target.value)}>
                      {TONES.map(tn => <option key={tn} value={tn}>{t(`tone.${tn}`, lang)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={S.label}>{t('create.lang', lang)}</label>
                    <select style={S.select} value={postLang} onChange={e => setPostLang(e.target.value)}>
                      {POST_LANGS.map(l => <option key={l.value} value={l.value}>{l[lang]}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>{t('create.extra', lang)}</label>
                  <textarea style={S.textarea} value={extra} onChange={e => setExtra(e.target.value)} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>{t('create.emojis', lang)}</label>
                  <select style={S.select} value={emojis} onChange={e => setEmojis(e.target.value)}>
                    {EMOJI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o[lang]}</option>)}
                  </select>
                </div>

                <button style={{ ...S.btn(), width: '100%', justifyContent: 'center', padding: '12px 0' }} onClick={handleGenerate} disabled={generating}>
                  {generating ? <><span style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" /> {t('create.generating', lang)}</> : <><i className="fas fa-bolt" /> {t('create.generate', lang)}</>}
                </button>
              </div>

              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>{t('create.preview', lang)}</h2>
                  {generated && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button style={S.btn('outline', 'sm')} onClick={() => { const d = new Date(); d.setDate(d.getDate() + 1); setSchedDate(d.toISOString().split('T')[0]); setScheduleModal(true); }}>
                        <i className="fas fa-clock" /> {t('create.schedule', lang)}
                      </button>
                    </div>
                  )}
                </div>

                {!generated ? (
                  <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
                    <i className="fas fa-wand-magic-sparkles" style={{ fontSize: 48, opacity: 0.3, marginBottom: 16, display: 'block' }} />
                    <h3 style={{ color: '#fff', marginBottom: 8 }}>{t('create.ready', lang)}</h3>
                    <p>{t('create.readyDesc', lang)}</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {Object.entries(generated).map(([platform, content]: [string, any]) => {
                      const full = content.text + (content.hashtags ? '\n\n' + content.hashtags : '');
                      const len = full.length;
                      const limit = PLATFORM_LIMITS[platform] || 2200;
                      return (
                        <div key={platform} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid var(--border)' }}>
                            <i className={PLATFORM_ICONS[platform]} style={{ color: PLATFORM_COLORS[platform], fontSize: 18 }} />
                            <span style={{ fontWeight: 700, fontSize: 13 }}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                            <span style={{ marginLeft: 'auto', fontSize: 11, color: len > limit ? 'var(--danger)' : 'var(--muted)' }}>{len}/{limit}</span>
                          </div>
                          <div style={{ padding: 16, fontSize: 13, lineHeight: 1.6, color: '#cbd5e1', whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>{full}</div>
                          <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                            <button style={S.btn('outline', 'sm')} onClick={() => { navigator.clipboard.writeText(full); toast(t('common.copied', lang)); }}>
                              <i className="fas fa-copy" /> {t('create.copy', lang)}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ CALENDAR ═══ */}
          {page === 'calendar' && (
            <div style={S.card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <button style={{ ...S.btn('outline', 'sm'), width: 32, height: 32, padding: 0, justifyContent: 'center' }} onClick={() => { let m = calMonth - 1, y = calYear; if (m < 0) { m = 11; y--; } setCalMonth(m); setCalYear(y); }}>
                  <i className="fas fa-chevron-left" />
                </button>
                <h2 style={{ fontSize: 18, minWidth: 200 }}>{(lang === 'fr' ? MONTHS_FR : MONTHS_EN)[calMonth]} {calYear}</h2>
                <button style={{ ...S.btn('outline', 'sm'), width: 32, height: 32, padding: 0, justifyContent: 'center' }} onClick={() => { let m = calMonth + 1, y = calYear; if (m > 11) { m = 0; y++; } setCalMonth(m); setCalYear(y); }}>
                  <i className="fas fa-chevron-right" />
                </button>
                <button style={S.btn('outline', 'sm')} onClick={() => { setCalMonth(new Date().getMonth()); setCalYear(new Date().getFullYear()); }}>{t('cal.today', lang)}</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {(lang === 'fr' ? DAYS_FR : DAYS_EN).map(d => (
                  <div key={d} style={{ padding: 10, textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>{d}</div>
                ))}
                {(() => {
                  const first = new Date(calYear, calMonth, 1);
                  const last = new Date(calYear, calMonth + 1, 0);
                  const startDay = (first.getDay() + 6) % 7;
                  const todayStr = new Date().toISOString().split('T')[0];
                  const cells = [];

                  // Previous month days
                  const prevLast = new Date(calYear, calMonth, 0).getDate();
                  for (let i = startDay - 1; i >= 0; i--) {
                    cells.push(<div key={`prev-${i}`} style={{ background: 'var(--card2)', minHeight: 90, padding: '6px 8px', borderRadius: 4, opacity: 0.3 }}><div style={{ fontSize: 12, fontWeight: 700 }}>{prevLast - i}</div></div>);
                  }

                  // Current month days
                  for (let d = 1; d <= last.getDate(); d++) {
                    const ds = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isToday = ds === todayStr;
                    const dayPosts = posts.filter((p: Post) => p.scheduledAt?.startsWith(ds));
                    cells.push(
                      <div key={d} style={{ background: 'var(--card2)', minHeight: 90, padding: '6px 8px', borderRadius: 4, border: isToday ? '1px solid var(--accent)' : '1px solid transparent', cursor: 'pointer' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{d}</div>
                        {dayPosts.slice(0, 3).map((p: Post) => (
                          <div key={p.id} style={{ fontSize: 10, padding: '2px 5px', borderRadius: 3, marginBottom: 2, background: `${PLATFORM_COLORS[p.platform]}33`, color: PLATFORM_COLORS[p.platform], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.topic?.substring(0, 15) || p.platform}
                          </div>
                        ))}
                        {dayPosts.length > 3 && <div style={{ fontSize: 9, color: 'var(--muted)' }}>+{dayPosts.length - 3}</div>}
                      </div>
                    );
                  }

                  return cells;
                })()}
              </div>
            </div>
          )}

          {/* ═══ LIBRARY ═══ */}
          {page === 'library' && (
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>{t('lib.title', lang)}</h2>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select style={{ ...S.select, width: 'auto', padding: '6px 10px', fontSize: 12 }} value={libFilter} onChange={e => setLibFilter(e.target.value)}>
                    <option value="all">{t('lib.all', lang)}</option>
                    <option value="draft">{t('lib.drafts', lang)}</option>
                    <option value="scheduled">{t('status.scheduled', lang)}</option>
                    <option value="published">{t('status.published', lang)}</option>
                  </select>
                  <select style={{ ...S.select, width: 'auto', padding: '6px 10px', fontSize: 12 }} value={libClientFilter} onChange={e => setLibClientFilter(e.target.value)}>
                    <option value="all">{t('lib.allClients', lang)}</option>
                    {clients.map((c: Client) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {filteredPosts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--muted)' }}>
                  <i className="fas fa-folder-open" style={{ fontSize: 48, opacity: 0.3, marginBottom: 16, display: 'block' }} />
                  <h3 style={{ color: '#fff', marginBottom: 8 }}>{t('lib.empty', lang)}</h3>
                  <p>{t('lib.emptyDesc', lang)}</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Platform', 'Content', 'Client', 'Status', 'Date', ''].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid var(--border)', fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((p: Post) => (
                      <tr key={p.id}>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
                          <i className={PLATFORM_ICONS[p.platform]} style={{ color: PLATFORM_COLORS[p.platform], fontSize: 18 }} />
                        </td>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(51,65,85,0.4)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13 }}>
                          {p.content?.substring(0, 80)}...
                        </td>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(51,65,85,0.4)', fontSize: 13 }}>{p.client?.name || '—'}</td>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
                          <span style={S.badge(p.status)}>{t(`status.${p.status}`, lang)}</span>
                        </td>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(51,65,85,0.4)', fontSize: 12, color: 'var(--muted)' }}>
                          {new Date(p.scheduledAt || p.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
                          <button style={S.btn('outline', 'sm')} onClick={() => { navigator.clipboard.writeText(p.content + (p.hashtags ? '\n\n' + p.hashtags : '')); toast(t('common.copied', lang)); }}>
                            <i className="fas fa-copy" />
                          </button>
                          {p.status === 'draft' && (
                            <button style={{ ...S.btn('success', 'sm'), marginLeft: 4 }} onClick={async () => { await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, status: 'published' }) }); fetchPosts(); toast(t('status.published', lang)); }}>
                              <i className="fas fa-check" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ═══ CLIENTS ═══ */}
          {page === 'clients' && (
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>{t('clients.title', lang)}</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {clients.map((c: Client) => (
                  <div key={c.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, cursor: 'pointer' }}
                    onClick={() => { setEditingClient(c); setClientForm({ name: c.name, email: c.email, industry: c.industry || '', city: c.city || '', brandDescription: c.brandDescription || '', tone: c.tone || 'professionnel', keywords: c.keywords || '', plan: c.plan || 'starter' }); setClientModal(true); }}>
                    <h3 style={{ fontSize: 16, marginBottom: 4 }}>{c.name}</h3>
                    <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 8 }}>{c.industry || '—'} &middot; {c.city || '—'}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
                      <span><i className="fas fa-file-alt" /> {c._count?.posts || 0} posts</span>
                      <span><i className="fas fa-gem" /> {c.plan === 'growth' ? 'Growth' : 'Starter'}</span>
                      <span style={S.badge(c.planStatus === 'active' ? 'published' : 'failed')}>{c.planStatus}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {c.socialAccounts?.map((sa: any) => (
                        <i key={sa.platform} className={PLATFORM_ICONS[sa.platform]} style={{ color: sa.connected ? PLATFORM_COLORS[sa.platform] : '#475569', fontSize: 14 }} />
                      ))}
                    </div>
                  </div>
                ))}

                <div style={{ border: '2px dashed var(--border)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--muted)', minHeight: 120, cursor: 'pointer', padding: 20 }}
                  onClick={() => { setEditingClient(null); setClientForm({ name: '', email: '', industry: '', city: '', brandDescription: '', tone: 'professionnel', keywords: '', plan: 'starter' }); setClientModal(true); }}>
                  <i className="fas fa-plus" style={{ fontSize: 24 }} />
                  <span>{t('clients.add', lang)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ═══ REPORTS ═══ */}
          {page === 'reports' && (
            <>
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>{t('reports.title', lang)}</h2>
                  <button style={S.btn('primary', 'sm')} onClick={async () => {
                    for (const c of clients.filter((cl: Client) => cl.planStatus === 'active')) {
                      await handleGenerateReport(c.id, true);
                    }
                  }}>
                    <i className="fas fa-paper-plane" /> {t('reports.sendAll', lang)}
                  </button>
                </div>

                {clients.filter((c: Client) => c.planStatus === 'active').length === 0 ? (
                  <p style={{ color: 'var(--muted)', textAlign: 'center', padding: 30 }}>{t('reports.noReports', lang)}</p>
                ) : (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {clients.filter((c: Client) => c.planStatus === 'active').map((c: Client) => {
                      const clientReports = reports.filter((r: any) => r.clientId === c.id);
                      const lastReport = clientReports[0];
                      return (
                        <div key={c.id} style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <div>
                              <h3 style={{ fontSize: 15, marginBottom: 2 }}>{c.name}</h3>
                              <span style={{ fontSize: 12, color: 'var(--muted)' }}>{c.email}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <select style={{ ...S.select, width: 'auto', padding: '4px 8px', fontSize: 11 }} defaultValue="weekly" onChange={e => handleUpdateReportSettings(c.id, e.target.value)}>
                                <option value="weekly">{t('reports.weekly', lang)}</option>
                                <option value="biweekly">{t('reports.biweekly', lang)}</option>
                                <option value="monthly">{t('reports.monthly', lang)}</option>
                              </select>
                              <select style={{ ...S.select, width: 'auto', padding: '4px 8px', fontSize: 11 }} defaultValue="auto" onChange={e => handleUpdateReportSettings(c.id, undefined, e.target.value)}>
                                <option value="auto">{t('reports.auto', lang)}</option>
                                <option value="manual">{t('reports.manual', lang)}</option>
                              </select>
                              <button style={S.btn('outline', 'sm')} onClick={() => handleGenerateReport(c.id, false)}><i className="fas fa-file-alt" /> {t('reports.generate', lang)}</button>
                              <button style={S.btn('primary', 'sm')} onClick={() => handleGenerateReport(c.id, true)}><i className="fas fa-paper-plane" /> {t('reports.send', lang)}</button>
                            </div>
                          </div>
                          {lastReport && (
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {lang === 'fr' ? 'Dernier rapport' : 'Last report'}: {lastReport.sentAt ? new Date(lastReport.sentAt).toLocaleDateString() : (lang === 'fr' ? 'Non envoyé' : 'Not sent')} &middot; {(lastReport.data as any)?.totalPosts || 0} posts
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══ SETTINGS ═══ */}
          {page === 'settings' && (
            <>
              <div style={S.card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                  <i className="fas fa-globe" style={{ color: 'var(--accent)', marginRight: 8 }} />
                  {t('settings.language', lang)}
                </h2>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setLang('fr')} style={{ ...S.btn(lang === 'fr' ? 'primary' : 'outline'), padding: '10px 20px' }}>Francais</button>
                  <button onClick={() => setLang('en')} style={{ ...S.btn(lang === 'en' ? 'primary' : 'outline'), padding: '10px 20px' }}>English</button>
                </div>
              </div>

              <div style={S.card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                  <i className="fas fa-share-alt" style={{ color: 'var(--accent)', marginRight: 8 }} />
                  {t('settings.social', lang)}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                  {lang === 'fr' ? 'État des connexions aux APIs sociales. Les identifiants sont collectés via le formulaire d\'onboarding client.' : 'Social API connection status. Credentials are collected via the client onboarding form.'}
                </p>
                {[
                  { platform: 'instagram', name: 'Instagram / Facebook', icon: 'fab fa-instagram', color: '#e4405f', api: 'Meta Business API' },
                  { platform: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0a66c2', api: 'LinkedIn Marketing API' },
                  { platform: 'x', name: 'X (Twitter)', icon: 'fab fa-x-twitter', color: '#fff', api: 'X API v2' },
                ].map(item => (
                  <div key={item.platform} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
                    <div>
                      <h4 style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className={item.icon} style={{ color: item.color }} /> {item.name}
                      </h4>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>{item.api}</p>
                    </div>
                    <span style={S.badge('draft')}>{t('settings.notConnected', lang)}</span>
                  </div>
                ))}
              </div>

              <div style={S.card}>
                <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
                  <i className="fas fa-plug" style={{ color: 'var(--accent)', marginRight: 8 }} />
                  {t('settings.n8n', lang)}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                  {lang === 'fr' ? 'Configurez l\'URL du webhook n8n dans les variables d\'environnement (N8N_WEBHOOK_URL). Événements envoyés : subscription.created, content.generated, post.published, report.sent, client.onboarding_completed' : 'Configure the n8n webhook URL in environment variables (N8N_WEBHOOK_URL). Events sent: subscription.created, content.generated, post.published, report.sent, client.onboarding_completed'}
                </p>
                <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border)', borderRadius: 8, padding: 14, fontSize: 12, color: '#94a3b8', fontFamily: 'monospace' }}>
                  N8N_WEBHOOK_URL={'{your-n8n-instance}/webhook/t-content-manager'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── CLIENT MODAL ── */}
      {clientModal && (
        <div style={S.modal} onClick={() => setClientModal(false)}>
          <div style={S.modalBox} className="animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16 }}>{editingClient ? `${t('create.edit', lang)}: ${editingClient.name}` : t('clients.new', lang)}</h3>
              <button onClick={() => setClientModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              {[
                { key: 'name', label: t('clients.name', lang), type: 'text', required: true },
                { key: 'email', label: t('clients.email', lang), type: 'email', required: true },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={S.label}>{f.label} {f.required && '*'}</label>
                  <input style={S.input} type={f.type} value={(clientForm as any)[f.key]} onChange={e => setClientForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>{t('clients.industry', lang)}</label>
                  <input style={S.input} value={clientForm.industry} onChange={e => setClientForm(prev => ({ ...prev, industry: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>{t('clients.city', lang)}</label>
                  <input style={S.input} value={clientForm.city} onChange={e => setClientForm(prev => ({ ...prev, city: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>{t('clients.brandDesc', lang)}</label>
                <textarea style={S.textarea} value={clientForm.brandDescription} onChange={e => setClientForm(prev => ({ ...prev, brandDescription: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>{t('clients.tone', lang)}</label>
                  <select style={S.select} value={clientForm.tone} onChange={e => setClientForm(prev => ({ ...prev, tone: e.target.value }))}>
                    {TONES.map(tn => <option key={tn} value={tn}>{t(`tone.${tn}`, lang)}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>{t('clients.plan', lang)}</label>
                  <select style={S.select} value={clientForm.plan} onChange={e => setClientForm(prev => ({ ...prev, plan: e.target.value }))}>
                    <option value="starter">Starter — 3 posts/sem</option>
                    <option value="growth">Growth — 1 post/jour</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>{t('clients.keywords', lang)}</label>
                <input style={S.input} value={clientForm.keywords} onChange={e => setClientForm(prev => ({ ...prev, keywords: e.target.value }))} placeholder="#bio #local #artisanal" />
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={S.btn('outline')} onClick={() => setClientModal(false)}>{t('common.cancel', lang)}</button>
              <button style={S.btn()} onClick={handleSaveClient}><i className="fas fa-save" /> {t('common.save', lang)}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEDULE MODAL ── */}
      {scheduleModal && (
        <div style={S.modal} onClick={() => setScheduleModal(false)}>
          <div style={{ ...S.modalBox, maxWidth: 400 }} className="animate-slide-up" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16 }}>{t('create.schedule', lang)}</h3>
              <button onClick={() => setScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer' }}>&times;</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>Date</label>
                <input type="date" style={S.input} value={schedDate} onChange={e => setSchedDate(e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={S.label}>{lang === 'fr' ? 'Heure' : 'Time'}</label>
                <input type="time" style={S.input} value={schedTime} onChange={e => setSchedTime(e.target.value)} />
              </div>
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={S.btn('outline')} onClick={() => setScheduleModal(false)}>{t('common.cancel', lang)}</button>
              <button style={S.btn()} onClick={handleSchedule}><i className="fas fa-clock" /> {t('create.schedule', lang)}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      <div style={S.toast(showToast, toastErr)}>
        <i className={`fas fa-${toastErr ? 'exclamation-circle' : 'check-circle'}`} style={{ color: toastErr ? 'var(--danger)' : 'var(--success)' }} />
        {toastMsg}
      </div>
    </div>
  );
}
