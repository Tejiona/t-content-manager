import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { notifyN8n } from '@/lib/email';

// GET /api/onboarding?token=xxx — get client info for onboarding form
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const client = await prisma.client.findUnique({
    where: { onboardingToken: token },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      industry: true,
      city: true,
      plan: true,
      lang: true,
      brandDescription: true,
      tone: true,
      keywords: true,
      onboardingDone: true,
      socialAccounts: {
        select: { platform: true, accountName: true, connected: true },
      },
    },
  });

  if (!client) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  return NextResponse.json(client);
}

// POST /api/onboarding — submit onboarding form (social media credentials)
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { token, company, industry, city, brandDescription, tone, keywords, socialAccounts } = data;

  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const client = await prisma.client.findUnique({ where: { onboardingToken: token } });
  if (!client) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });

  // Update client profile
  await prisma.client.update({
    where: { id: client.id },
    data: {
      company: company || client.company,
      industry: industry || client.industry,
      city: city || client.city,
      brandDescription: brandDescription || client.brandDescription,
      tone: tone || client.tone,
      keywords: keywords || client.keywords,
      onboardingDone: true,
    },
  });

  // Save social media credentials (encrypted)
  if (socialAccounts && Array.isArray(socialAccounts)) {
    for (const account of socialAccounts) {
      if (!account.platform) continue;

      const updateData: any = {
        accountName: account.accountName || null,
        pageId: account.pageId || null,
        connected: !!(account.accessToken || account.accountName),
      };

      // Encrypt sensitive tokens
      if (account.accessToken) {
        updateData.accessToken = encrypt(account.accessToken);
      }
      if (account.refreshToken) {
        updateData.refreshToken = encrypt(account.refreshToken);
      }

      await prisma.socialAccount.upsert({
        where: { clientId_platform: { clientId: client.id, platform: account.platform } },
        create: { clientId: client.id, platform: account.platform, ...updateData },
        update: updateData,
      });
    }
  }

  await prisma.activity.create({
    data: {
      clientId: client.id,
      action: 'onboarding_completed',
      details: `${client.name} completed onboarding form`,
    },
  });

  await notifyN8n('client.onboarding_completed', {
    clientId: client.id,
    name: client.name,
    email: client.email,
    plan: client.plan,
  });

  return NextResponse.json({ success: true });
}
