import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10' as any,
});

export const PLANS = {
  starter: {
    name: { fr: 'Starter', en: 'Starter' },
    priceId: process.env.STRIPE_PRICE_STARTER!,
    priceCAD: 349,
    postsPerWeek: 3,
    platforms: 2,
    features: {
      fr: ['3 publications par semaine', 'Texte optimisé + hashtags', 'Calendrier éditorial', '2 plateformes'],
      en: ['3 posts per week', 'Optimized text + hashtags', 'Editorial calendar', '2 platforms'],
    },
  },
  growth: {
    name: { fr: 'Growth', en: 'Growth' },
    priceId: process.env.STRIPE_PRICE_GROWTH!,
    priceCAD: 699,
    postsPerWeek: 7,
    platforms: 4,
    features: {
      fr: ['Publication quotidienne', 'Création visuels IA', 'Multi-plateformes (4)', 'Analyse de performance', 'Rapports personnalisés'],
      en: ['Daily posting', 'AI visual creation', 'Multi-platform (4)', 'Performance analytics', 'Custom reports'],
    },
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function createCheckoutSession(email: string, plan: PlanKey, lang: string = 'fr') {
  const planConfig = PLANS[plan];
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    metadata: { plan, lang },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
    locale: lang === 'fr' ? 'fr' : 'en',
    subscription_data: {
      metadata: { plan, lang },
    },
  });
  return session;
}

export async function createPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
}
