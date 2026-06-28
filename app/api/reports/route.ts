import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendReportEmail, notifyN8n } from '@/lib/email';
import { subDays, subWeeks, subMonths, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

// GET /api/reports — list reports
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');

  const where: any = {};
  if (clientId) where.clientId = clientId;

  const reports = await prisma.report.findMany({
    where,
    include: { client: { select: { name: true, email: true, lang: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(reports);
}

// POST /api/reports — generate a report for a client
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clientId, type, sendNow } = await req.json();
  if (!clientId) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

  const reportType = type || 'weekly';
  const now = new Date();
  let periodStart: Date;

  switch (reportType) {
    case 'monthly': periodStart = subMonths(now, 1); break;
    case 'biweekly': periodStart = subWeeks(now, 2); break;
    default: periodStart = subWeeks(now, 1); break;
  }

  // Gather stats for the period
  const posts = await prisma.post.findMany({
    where: {
      clientId,
      createdAt: { gte: periodStart, lte: now },
    },
  });

  const totalPosts = posts.length;
  const published = posts.filter(p => p.status === 'published').length;
  const scheduled = posts.filter(p => p.status === 'scheduled').length;

  // Platform breakdown
  const platformStats: Record<string, { total: number; published: number }> = {};
  for (const p of posts) {
    if (!platformStats[p.platform]) platformStats[p.platform] = { total: 0, published: 0 };
    platformStats[p.platform].total++;
    if (p.status === 'published') platformStats[p.platform].published++;
  }

  // Calculate engagement (from performance data if available)
  let totalEngagement = 0;
  let engagementCount = 0;
  for (const p of posts) {
    if (p.performance && typeof p.performance === 'object') {
      const perf = p.performance as any;
      if (perf.engagement) { totalEngagement += perf.engagement; engagementCount++; }
    }
  }
  const avgEngagement = engagementCount > 0 ? Math.round(totalEngagement / engagementCount * 10) / 10 : 0;

  // Top performing posts
  const topPosts = posts
    .filter(p => p.performance && (p.performance as any).likes)
    .sort((a, b) => ((b.performance as any).likes || 0) - ((a.performance as any).likes || 0))
    .slice(0, 5)
    .map(p => ({
      platform: p.platform,
      topic: p.topic,
      likes: (p.performance as any).likes || 0,
    }));

  const reportData = {
    totalPosts,
    published,
    scheduled,
    engagement: avgEngagement,
    platforms: platformStats,
    topPosts,
  };

  const locale = client.lang === 'en' ? enUS : fr;
  const periodLabel = `${format(periodStart, 'dd MMM', { locale })} — ${format(now, 'dd MMM yyyy', { locale })}`;

  const report = await prisma.report.create({
    data: {
      clientId,
      periodStart,
      periodEnd: now,
      type: reportType,
      data: reportData,
      sendMode: sendNow ? 'manual' : 'auto',
      sentAt: sendNow ? now : null,
    },
  });

  // Send email if requested
  if (sendNow) {
    await sendReportEmail(client.email, {
      clientName: client.name,
      lang: client.lang,
      periodLabel,
      stats: { totalPosts, published, engagement: avgEngagement },
    });

    await prisma.activity.create({
      data: { clientId, action: 'report_sent', details: `${reportType} report sent for ${periodLabel}` },
    });

    await notifyN8n('report.sent', { clientId, reportId: report.id, type: reportType });
  }

  return NextResponse.json(report, { status: 201 });
}

// PUT /api/reports — update report settings (frequency, send mode)
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clientId, frequency, sendMode } = await req.json();
  if (!clientId) return NextResponse.json({ error: 'Client ID required' }, { status: 400 });

  if (frequency) {
    await prisma.setting.upsert({
      where: { key: `report_freq_${clientId}` },
      create: { key: `report_freq_${clientId}`, value: frequency },
      update: { value: frequency },
    });
  }

  if (sendMode) {
    await prisma.setting.upsert({
      where: { key: `report_mode_${clientId}` },
      create: { key: `report_mode_${clientId}`, value: sendMode },
      update: { value: sendMode },
    });
  }

  return NextResponse.json({ success: true, frequency, sendMode });
}
