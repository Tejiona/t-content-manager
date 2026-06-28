import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// GET /api/activity — recent activity log
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const activities = await prisma.activity.findMany({
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });

  return NextResponse.json(activities);
}
