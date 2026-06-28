import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateWeeklyPlan } from '@/lib/ai';
import { PLANS } from '@/lib/stripe';

// POST /api/content/weekly-plan — generate weekly content plan
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clientId } = await req.json();
  if (!clientId) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const planConfig = PLANS[client.plan as keyof typeof PLANS] || PLANS.starter;

  try {
    const plan = await generateWeeklyPlan({
      name: client.name,
      industry: client.industry || undefined,
      description: client.brandDescription || undefined,
      keywords: client.keywords || undefined,
      tone: client.tone,
      lang: client.lang,
      postsPerWeek: planConfig.postsPerWeek,
    });

    return NextResponse.json({ plan });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
