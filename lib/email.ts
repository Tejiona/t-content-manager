import { Resend } from 'resend';
import { PLANS, PlanKey } from './stripe';
import { t } from './i18n';

const resend = new Resend(process.env.RESEND_API_KEY || 'placeholder');
const FROM = process.env.EMAIL_FROM || 'TEJIONA AI Solutions <solutions@tejiona.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ─── Subscription confirmation + onboarding link ───
export async function sendSubscriptionEmail(to: string, data: {
  clientName: string;
  plan: PlanKey;
  lang: string;
  onboardingToken: string;
}) {
  const { clientName, plan, lang, onboardingToken } = data;
  const l = lang === 'en' ? 'en' : 'fr';
  const planInfo = PLANS[plan];
  const onboardingUrl = `${APP_URL}/onboarding/${onboardingToken}`;

  const subject = l === 'fr'
    ? `Bienvenue chez TEJIONA AI Solutions — Votre abonnement Content Manager IA (${planInfo.name[l]})`
    : `Welcome to TEJIONA AI Solutions — Your AI Content Manager subscription (${planInfo.name[l]})`;

  const html = buildSubscriptionEmailHtml(clientName, plan, l, onboardingUrl);

  return resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Performance report email ───
export async function sendReportEmail(to: string, data: {
  clientName: string;
  lang: string;
  periodLabel: string;
  stats: { totalPosts: number; published: number; engagement: number };
  reportUrl?: string;
}) {
  const l = data.lang === 'en' ? 'en' : 'fr';
  const subject = l === 'fr'
    ? `Rapport de performance — ${data.periodLabel}`
    : `Performance Report — ${data.periodLabel}`;

  const html = buildReportEmailHtml(data.clientName, l, data.periodLabel, data.stats, data.reportUrl);

  return resend.emails.send({ from: FROM, to, subject, html });
}

// ─── Onboarding reminder ───
export async function sendOnboardingReminder(to: string, data: {
  clientName: string;
  lang: string;
  onboardingToken: string;
}) {
  const l = data.lang === 'en' ? 'en' : 'fr';
  const url = `${APP_URL}/onboarding/${data.onboardingToken}`;
  const subject = l === 'fr'
    ? 'Rappel : Configurez vos réseaux sociaux — TEJIONA AI'
    : 'Reminder: Set up your social accounts — TEJIONA AI';

  const html = `
  ${emailWrapper(`
    <h1 style="color:#6366f1;margin-bottom:16px">${l === 'fr' ? 'Rappel de configuration' : 'Setup Reminder'}</h1>
    <p>${l === 'fr' ? `Bonjour ${data.clientName},` : `Hello ${data.clientName},`}</p>
    <p>${l === 'fr'
      ? 'Nous n\'avons pas encore reçu vos identifiants de réseaux sociaux. Pour que notre IA puisse gérer vos comptes, veuillez compléter le formulaire ci-dessous.'
      : 'We haven\'t received your social media credentials yet. For our AI to manage your accounts, please complete the form below.'
    }</p>
    <div style="text-align:center;margin:30px 0">
      <a href="${url}" style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
        ${l === 'fr' ? 'Compléter la configuration' : 'Complete Setup'}
      </a>
    </div>
  `)}`;

  return resend.emails.send({ from: FROM, to, subject, html });
}

// ─── n8n webhook notification ───
export async function notifyN8n(event: string, data: any) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.N8N_API_KEY ? { 'Authorization': `Bearer ${process.env.N8N_API_KEY}` } : {}),
      },
      body: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
    });
  } catch (e) {
    console.error('[n8n] Webhook failed:', e);
  }
}

// ─── Email HTML builders ───
function emailWrapper(content: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',system-ui,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#1e293b;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px">
  <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:24px;text-align:center">
    <img src="https://tejiona.com/logo.png" alt="TEJIONA AI" style="height:48px;margin-bottom:8px">
    <div style="color:#fff;font-size:12px;opacity:0.9">TEJIONA AI Solutions</div>
  </div>
  <div style="padding:32px;color:#e2e8f0;line-height:1.7;font-size:15px">
    ${content}
  </div>
  <div style="padding:20px 32px;border-top:1px solid #334155;text-align:center;font-size:12px;color:#64748b">
    <p>&copy; 2026 TEJIONA AI Solutions (NTER Group) &middot; Ottawa, Canada</p>
    <p><a href="https://tejiona.com" style="color:#6366f1;text-decoration:none">tejiona.com</a> &middot; <a href="mailto:solutions@tejiona.com" style="color:#6366f1;text-decoration:none">solutions@tejiona.com</a></p>
  </div>
</div>
</body></html>`;
}

function buildSubscriptionEmailHtml(name: string, plan: PlanKey, lang: 'fr' | 'en', onboardingUrl: string) {
  const planInfo = PLANS[plan];
  const features = planInfo.features[lang].map(f => `<li style="padding:4px 0">${f}</li>`).join('');

  if (lang === 'fr') {
    return emailWrapper(`
      <h1 style="color:#6366f1;margin-bottom:16px">Bienvenue, ${name} !</h1>
      <p>Merci pour votre confiance. Votre abonnement <strong>Content Manager IA — ${planInfo.name.fr}</strong> est maintenant actif.</p>

      <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:20px;margin:20px 0">
        <h3 style="color:#a855f7;margin-bottom:12px">Votre plan : ${planInfo.name.fr} — $${planInfo.priceCAD} CAD/mois</h3>
        <ul style="list-style:none;padding:0;margin:0;color:#94a3b8">${features}</ul>
      </div>

      <h2 style="color:#f8fafc;font-size:18px;margin-top:28px">Comment ca marche ?</h2>
      <ol style="color:#cbd5e1;padding-left:20px">
        <li><strong>Remplissez le formulaire</strong> ci-dessous pour connecter vos réseaux sociaux</li>
        <li><strong>Notre IA analyse</strong> votre marque, votre audience et votre secteur</li>
        <li><strong>Du contenu est généré et publié</strong> automatiquement selon votre calendrier</li>
        <li><strong>Recevez des rapports</strong> de performance réguliers</li>
      </ol>

      <div style="text-align:center;margin:30px 0">
        <a href="${onboardingUrl}" style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">
          Configurer mes réseaux sociaux
        </a>
      </div>

      <p style="font-size:13px;color:#64748b">Ce lien est unique et sécurisé. Vous pouvez y revenir à tout moment.</p>
    `);
  }

  return emailWrapper(`
    <h1 style="color:#6366f1;margin-bottom:16px">Welcome, ${name}!</h1>
    <p>Thank you for your trust. Your <strong>AI Content Manager — ${planInfo.name.en}</strong> subscription is now active.</p>

    <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:20px;margin:20px 0">
      <h3 style="color:#a855f7;margin-bottom:12px">Your plan: ${planInfo.name.en} — $${planInfo.priceCAD} CAD/month</h3>
      <ul style="list-style:none;padding:0;margin:0;color:#94a3b8">${features}</ul>
    </div>

    <h2 style="color:#f8fafc;font-size:18px;margin-top:28px">How it works</h2>
    <ol style="color:#cbd5e1;padding-left:20px">
      <li><strong>Fill out the form</strong> below to connect your social media accounts</li>
      <li><strong>Our AI analyzes</strong> your brand, audience, and industry</li>
      <li><strong>Content is generated and published</strong> automatically on your schedule</li>
      <li><strong>Receive regular performance</strong> reports</li>
    </ol>

    <div style="text-align:center;margin:30px 0">
      <a href="${onboardingUrl}" style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block">
        Set up my social accounts
      </a>
    </div>

    <p style="font-size:13px;color:#64748b">This link is unique and secure. You can return to it at any time.</p>
  `);
}

function buildReportEmailHtml(name: string, lang: 'fr' | 'en', period: string, stats: any, reportUrl?: string) {
  if (lang === 'fr') {
    return emailWrapper(`
      <h1 style="color:#6366f1;margin-bottom:16px">Rapport de performance</h1>
      <p>Bonjour ${name},</p>
      <p>Voici votre rapport pour la période : <strong>${period}</strong></p>

      <div style="display:flex;gap:12px;margin:20px 0;flex-wrap:wrap">
        <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;flex:1;min-width:120px;text-align:center">
          <div style="font-size:28px;font-weight:800;color:#6366f1">${stats.totalPosts}</div>
          <div style="font-size:12px;color:#94a3b8">Posts créés</div>
        </div>
        <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;flex:1;min-width:120px;text-align:center">
          <div style="font-size:28px;font-weight:800;color:#10b981">${stats.published}</div>
          <div style="font-size:12px;color:#94a3b8">Publiés</div>
        </div>
        <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;flex:1;min-width:120px;text-align:center">
          <div style="font-size:28px;font-weight:800;color:#a855f7">${stats.engagement}%</div>
          <div style="font-size:12px;color:#94a3b8">Engagement</div>
        </div>
      </div>

      ${reportUrl ? `<div style="text-align:center;margin:24px 0">
        <a href="${reportUrl}" style="background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
          Voir le rapport complet
        </a>
      </div>` : ''}

      <p style="font-size:13px;color:#64748b">Ce rapport est généré automatiquement par TEJIONA AI Solutions.</p>
    `);
  }

  return emailWrapper(`
    <h1 style="color:#6366f1;margin-bottom:16px">Performance Report</h1>
    <p>Hello ${name},</p>
    <p>Here is your report for the period: <strong>${period}</strong></p>

    <div style="display:flex;gap:12px;margin:20px 0;flex-wrap:wrap">
      <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:28px;font-weight:800;color:#6366f1">${stats.totalPosts}</div>
        <div style="font-size:12px;color:#94a3b8">Posts created</div>
      </div>
      <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:28px;font-weight:800;color:#10b981">${stats.published}</div>
        <div style="font-size:12px;color:#94a3b8">Published</div>
      </div>
      <div style="background:#0f172a;border:1px solid #334155;border-radius:8px;padding:16px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:28px;font-weight:800;color:#a855f7">${stats.engagement}%</div>
        <div style="font-size:12px;color:#94a3b8">Engagement</div>
      </div>
    </div>

    ${reportUrl ? `<div style="text-align:center;margin:24px 0">
      <a href="${reportUrl}" style="background:#6366f1;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
        View full report
      </a>
    </div>` : ''}

    <p style="font-size:13px;color:#64748b">This report is automatically generated by TEJIONA AI Solutions.</p>
  `);
}
