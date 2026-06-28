# T-Content Manager

**AI-Powered Social Media Management** by TEJIONA AI Solutions

## Architecture

```
T-Content-Manager/
├── app/
│   ├── page.tsx                    # Login page (FR/EN)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind + custom styles
│   ├── dashboard/
│   │   ├── layout.tsx              # Auth guard
│   │   └── page.tsx                # Main dashboard (all pages in SPA)
│   ├── onboarding/[token]/page.tsx # Client onboarding form (public)
│   ├── subscription/
│   │   ├── success/page.tsx        # Post-checkout success page
│   │   └── cancel/page.tsx         # Checkout cancelled page
│   └── api/
│       ├── auth/route.ts           # Login/logout/session
│       ├── clients/route.ts        # CRUD clients
│       ├── content/route.ts        # AI content generation + posts
│       ├── content/weekly-plan/    # Weekly plan generation
│       ├── reports/route.ts        # Report generation + email
│       ├── reports/send-all/       # Batch report sending (cron)
│       ├── onboarding/route.ts     # Onboarding form submission
│       ├── settings/route.ts       # App settings
│       ├── activity/route.ts       # Activity log
│       └── stripe/
│           ├── checkout/route.ts   # Create Stripe checkout
│           └── webhook/route.ts    # Stripe webhook handler
├── lib/
│   ├── prisma.ts       # Database client
│   ├── stripe.ts       # Stripe config + plans
│   ├── email.ts        # Resend email templates (FR/EN)
│   ├── auth.ts         # JWT auth + bcrypt
│   ├── ai.ts           # Gemini AI content generation
│   ├── i18n.ts         # Full translation dictionary
│   └── crypto.ts       # AES encryption for tokens
├── prisma/
│   └── schema.prisma   # Database schema (PostgreSQL)
├── vercel.json         # Cron job for auto-reports
└── package.json
```

## Setup — Deploiement Vercel

### 1. Prérequis

- Compte Vercel (gratuit)
- Compte Stripe avec produits configurés
- Compte Resend (resend.com) pour les emails
- Clé API Google Gemini
- (Optionnel) Instance n8n

### 2. Database

Ajouter **Vercel Postgres** depuis le dashboard Vercel :
- Aller dans le projet → Storage → Create Database → Postgres
- Les variables `DATABASE_URL` et `DIRECT_URL` sont auto-configurées

### 3. Stripe Setup

Dans Stripe Dashboard :
1. Créer 2 produits avec prix récurrents :
   - **Content Manager IA Starter** → $349 CAD/mois
   - **Content Manager IA Growth** → $699 CAD/mois
2. Copier les Price IDs (`price_xxx`)
3. Configurer le webhook :
   - URL : `https://your-domain.vercel.app/api/stripe/webhook`
   - Events : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
4. Copier le Webhook Secret (`whsec_xxx`)

### 4. Variables d'environnement

Dans Vercel → Settings → Environment Variables, ajouter :

```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
JWT_SECRET=<random-32-chars>
ADMIN_EMAIL=solutions@tejiona.com
ADMIN_PASSWORD=<your-admin-password>

DATABASE_URL=<auto-from-vercel-postgres>
DIRECT_URL=<auto-from-vercel-postgres>

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...

RESEND_API_KEY=re_...
EMAIL_FROM=TEJIONA AI Solutions <solutions@tejiona.com>

GEMINI_API_KEY=AIza...

N8N_WEBHOOK_URL=https://your-n8n.com/webhook/t-content-manager
CRON_SECRET=<random-string-for-cron-auth>
```

### 5. Deploy

```bash
cd T-Content-Manager
npm install
npx vercel link
npx vercel env pull     # Pull env vars locally
npx prisma db push      # Create tables
npm run dev              # Test locally
npx vercel --prod        # Deploy to production
```

### 6. Premier admin

Au premier login, l'admin par défaut est créé automatiquement avec :
- Email : `ADMIN_EMAIL` (default: solutions@tejiona.com)
- Password : `ADMIN_PASSWORD` (default: admin123 — **changez-le !**)

## Flux de fonctionnement

### Souscription client

```
Client → tejiona.com → Choisir plan → Stripe Checkout
  → Paiement réussi
  → Webhook Stripe → /api/stripe/webhook
    → Création du client en DB
    → Génération token d'onboarding
    → Envoi email de confirmation (FR/EN) avec lien formulaire
    → Notification n8n
  → Client reçoit email → Remplit formulaire onboarding
    → Identifiants sociaux enregistrés (chiffrés AES)
    → Notification n8n (onboarding_completed)
```

### Génération de contenu

```
Admin → Dashboard → Créer
  → Sélectionner client + plateformes + sujet
  → API Gemini génère le contenu adapté par plateforme
  → Aperçu + édition + sauvegarde en brouillon
  → Programmation avec date/heure
```

### Rapports

```
Mode automatique :
  → Vercel Cron (lundi 8h) → /api/reports/send-all
  → Pour chaque client actif en mode "auto" :
    → Génère rapport (posts, stats, engagement)
    → Envoie par email
    → Log dans DB

Mode manuel :
  → Admin → Rapports → Clic "Envoyer" par client
  → Rapport généré et envoyé à la demande

Fréquence réglable par client :
  → Hebdomadaire / Bi-mensuel / Mensuel
```

## Intégration n8n

L'app envoie des webhooks à n8n pour chaque événement :

| Événement | Données |
|-----------|---------|
| `subscription.created` | clientId, email, plan |
| `subscription.updated` | subscriptionId, plan, status |
| `subscription.canceled` | clientId, subscriptionId |
| `payment.failed` | clientId, invoiceId |
| `content.generated` | clientId, topic, platforms |
| `post.published` | postId, platform, clientId |
| `report.sent` | clientId, reportId, type |
| `client.onboarding_completed` | clientId, name, email, plan |
| `reports.batch_sent` | results array |

### Workflows n8n suggérés

1. **Auto-publish** : Quand un post est programmé → publier via APIs sociales
2. **Rappel onboarding** : Si onboarding non complété après 48h → envoyer rappel
3. **Alertes** : Paiement échoué → Slack/email interne
4. **Veille** : Scraper tendances → générer contenu automatiquement

## Support

solutions@tejiona.com | https://tejiona.com
