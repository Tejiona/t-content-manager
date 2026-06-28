import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sendReportEmail, notifyN8n } from '@/lib/email';
import { subWeeks, subMonths, format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

// POST /api/reports/send-all — send pending auto reports for all clients
// Can be triggered by Vercel Cron or n8n
export async function POST(req: NextRequest) {
  // Allow cron trigger with secret OR admin session
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    where: { planStatus: 'active' },
  });

  const results: Array<{ clientId: string; name: string; sent: boolean; error?: string }> = [];

  for (const client of clients) {
    try {
      // Check report frequency setting
      const freqSetting = await prisma.setting.findUnique({ where: { key: `report_freq_${client.id}` } });
      const modeSetting = await prisma.setting.findUnique({ where: { key: `report_mode_${client.id}` } });
      const frequency = freqSetting?.value || 'weekly';
      const mode = modeSetting?.value || 'auto';

      // Skip if manual mode
      if (mode === 'manual') {
        results.push({ clientId: client.id, name: client.name, sent: false, error: 'Manual mode' });
        continue;
      }

      // Check if report already sent for this period
      const lastReport = await prisma.report.findFirst({
        where: { clientId: client.id, sentAt: { not: null } },
        orderBy: { sentAt: 'desc' },
      });

      const now = new Date();
      let periodStart: Date;
      let shouldSend = true;

      switch (frequency) {
        case 'monthly':
          periodStart = subMonths(now, 1);
          if (lastReport?.sentAt && (now.getTime() - lastReport.sentAt.getTime()) < 25 * 24 * 60 * 60 * 1000) shouldSend = false;
          break;
        case 'biweekly':
          periodStart = subWeeks(now, 2);
          if (lastReport?.sentAt && (now.getTime() - lastReport.sentAt.getTime()) < 12 * 24 * 60 * 60 * 1000) shouldSend = false;
          break;
        default:
          periodStart = subWeeks(now, 1);
          if (lastReport?.sentAt && (now.getTime() - lastReport.sentAt.getTime()) < 5 * 24 * 60 * 60 * 1000) shouldSend = false;
      }

      if (!shouldSend) {
        results.push({ clientId: client.id, name: client.name, sent: false, error: 'Too recent' });
        continue;
      }

      // Gather stats
      const posts = await prisma.post.findMany({
        where: { clientId: client.id, createdAt: { gte: periodStart, lte: now } },
      });

      const totalPosts = posts.length;
      const published = posts.filter(p => p.status === 'published').length;

      const locale = client.lang === 'en' ? enUS : fr;
      const periodLabel = `${format(periodStart, 'dd MMM', { locale })} — ${format(now, 'dd MMM yyyy', { locale })}`;

      // Create report
      const report = await prisma.report.create({
        data: {
          clientId: client.id,
          periodStart,
          periodEnd: now,
          type: frequency,
          data: { totalPosts, published, engagement: 0, platforms: {} },
          sendMode: 'auto',
          sentAt: now,
        },
      });

      // Send email
      await sendReportEmail(client.email, {
        clientName: client.name,
        lang: client.lang,
        periodLabel,
        stats: { totalPosts, published, engagement: 0 },
      });

      results.push({ clientId: client.id, name: client.name, sent: true });
    } catch (e: any) {
      results.push({ clientId: client.id, name: client.name, sent: false, error: e.message });
    }
  }

  await notifyN8n('reports.batch_sent', { results, timestamp: new Date().toISOString() });

  return NextResponse.json({ sent: results.filter(r => r.sent).length, total: results.length, results });
}
