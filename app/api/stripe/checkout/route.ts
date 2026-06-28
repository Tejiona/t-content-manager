import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, createPortalSession } from '@/lib/stripe';
import { getSession } from '@/lib/auth';

// POST /api/stripe/checkout — create checkout session
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email, plan, lang } = await req.json();
    if (!email || !plan) {
      return NextResponse.json({ error: 'Email and plan required' }, { status: 400 });
    }
    if (!['starter', 'growth'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const checkoutSession = await createCheckoutSession(email, plan, lang || 'fr');
    return NextResponse.json({ url: checkoutSession.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
