import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/clients — list all clients
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clients = await prisma.client.findMany({
    include: {
      socialAccounts: { select: { platform: true, connected: true, accountName: true } },
      _count: { select: { posts: true, reports: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(clients);
}

// POST /api/clients — create a client manually
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  if (!data.name || !data.email) {
    return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      email: data.email,
      name: data.name,
      company: data.company,
      industry: data.industry,
      city: data.city,
      country: data.country,
      phone: data.phone,
      lang: data.lang || 'fr',
      plan: data.plan || 'starter',
      planStatus: data.planStatus || 'active',
      brandDescription: data.brandDescription,
      tone: data.tone || 'professionnel',
      keywords: data.keywords,
    },
  });

  // Create default social accounts
  for (const platform of ['instagram', 'facebook', 'linkedin', 'x']) {
    await prisma.socialAccount.create({
      data: { clientId: client.id, platform },
    });
  }

  await prisma.activity.create({
    data: { clientId: client.id, action: 'client_created', details: `${data.name} added manually` },
  });

  return NextResponse.json(client, { status: 201 });
}

// PUT /api/clients — update a client
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  if (!data.id) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

  const { id, ...updateData } = data;
  const client = await prisma.client.update({
    where: { id },
    data: updateData,
  });

  await prisma.activity.create({
    data: { clientId: id, action: 'client_updated', details: `${client.name} updated` },
  });

  return NextResponse.json(client);
}

// DELETE /api/clients — delete a client
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
