import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendSubscriptionEmail, notifyN8n } from '@/lib/email';
import { v4 as uuid } from 'uuid';
import Stripe from 'stripe';

// Disable body parsing — Stripe needs raw body
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('[Stripe] Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ─── New subscription created ───
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription') break;

        const email = session.customer_email || '';
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const plan = (session.metadata?.plan as string) || 'starter';
        const lang = session.metadata?.lang || 'fr';
        const onboardingToken = uuid();

        // Retrieve customer name from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        const customerName = (customer as Stripe.Customer).name || email.split('@')[0];

        // Create or update client in database
        const client = await prisma.client.upsert({
          where: { email },
          create: {
            email,
            name: customerName,
            stripeCustomerId: customerId,
            stripeSubId: subscriptionId,
            plan,
            planStatus: 'active',
            lang,
            onboardingToken,
            onboardingDone: false,
          },
          update: {
            stripeCustomerId: customerId,
            stripeSubId: subscriptionId,
            plan,
            planStatus: 'active',
            onboardingToken,
            onboardingDone: false,
          },
        });

        // Create default social accounts
        for (const platform of ['instagram', 'facebook', 'linkedin', 'x']) {
          await prisma.socialAccount.upsert({
            where: { clientId_platform: { clientId: client.id, platform } },
            create: { clientId: client.id, platform },
            update: {},
          });
        }

        // Log activity
        await prisma.activity.create({
          data: {
            clientId: client.id,
            action: 'subscription_created',
            details: `Plan: ${plan}, Stripe Customer: ${customerId}`,
          },
        });

        // Send confirmation email with onboarding form link
        await sendSubscriptionEmail(email, {
          clientName: customerName,
          plan: plan as any,
          lang,
          onboardingToken,
        });

        // Notify n8n
        await notifyN8n('subscription.created', {
          clientId: client.id,
          email,
          plan,
          customerId,
          subscriptionId,
        });

        // Create default report settings
        await prisma.setting.upsert({
          where: { key: `report_freq_${client.id}` },
          create: { key: `report_freq_${client.id}`, value: 'weekly' },
          update: {},
        });
        await prisma.setting.upsert({
          where: { key: `report_mode_${client.id}` },
          create: { key: `report_mode_${client.id}`, value: 'auto' },
          update: {},
        });

        console.log(`[Stripe] New subscription: ${email} (${plan})`);
        break;
      }

      // ─── Subscription updated (upgrade/downgrade) ───
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const plan = sub.metadata?.plan || 'starter';
        const status = sub.status === 'active' ? 'active' : sub.status === 'past_due' ? 'past_due' : sub.status;

        await prisma.client.updateMany({
          where: { stripeSubId: sub.id },
          data: { plan, planStatus: status },
        });

        await notifyN8n('subscription.updated', { subscriptionId: sub.id, plan, status });
        break;
      }

      // ─── Subscription canceled ───
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const client = await prisma.client.findFirst({ where: { stripeSubId: sub.id } });

        if (client) {
          await prisma.client.update({
            where: { id: client.id },
            data: { planStatus: 'canceled' },
          });
          await prisma.activity.create({
            data: {
              clientId: client.id,
              action: 'subscription_canceled',
              details: `Subscription ${sub.id} canceled`,
            },
          });
          await notifyN8n('subscription.canceled', { clientId: client.id, subscriptionId: sub.id });
        }
        break;
      }

      // ─── Payment failed ───
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const client = await prisma.client.findFirst({ where: { stripeCustomerId: customerId } });

        if (client) {
          await prisma.client.update({
            where: { id: client.id },
            data: { planStatus: 'past_due' },
          });
          await prisma.activity.create({
            data: {
              clientId: client.id,
              action: 'payment_failed',
              details: `Invoice ${invoice.id} payment failed`,
            },
          });
          await notifyN8n('payment.failed', { clientId: client.id, invoiceId: invoice.id });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (e: any) {
    console.error('[Stripe] Webhook processing error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
