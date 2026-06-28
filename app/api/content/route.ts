import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { generateContent, generateWeeklyPlan } from '@/lib/ai';
import { notifyN8n } from '@/lib/email';

// POST /api/content — generate content with AI
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { clientId, topic, platforms, tone, language, emojis, extra, saveAsDraft } = await req.json();

  if (!topic || !platforms?.length) {
    return NextResponse.json({ error: 'Topic and platforms required' }, { status: 400 });
  }

  // Get client brand context if provided
  let brandContext;
  if (clientId) {
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (client) {
      brandContext = {
        name: client.name,
        industry: client.industry || undefined,
        description: client.brandDescription || undefined,
        keywords: client.keywords || undefined,
      };
    }
  }

  try {
    const generated = await generateContent({
      topic,
      platforms,
      tone: tone || 'professionnel',
      language: language || 'français',
      emojis: emojis || 'oui, modérément',
      extra,
      brandContext,
    });

    // Save as drafts if requested
    if (saveAsDraft && clientId) {
      const posts = [];
      for (const [platform, content] of Object.entries(generated)) {
        const post = await prisma.post.create({
          data: {
            clientId,
            platform,
            topic,
            content: content.text,
            hashtags: content.hashtags || '',
            status: 'draft',
          },
        });
        posts.push(post);
      }

      await prisma.activity.create({
        data: {
          clientId,
          action: 'content_generated',
          details: `${platforms.length} posts generated for: ${topic}`,
        },
      });

      await notifyN8n('content.generated', { clientId, topic, platforms, postCount: posts.length });

      return NextResponse.json({ generated, saved: posts });
    }

    return NextResponse.json({ generated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/content — list posts
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '100');

  const where: any = {};
  if (clientId) where.clientId = clientId;
  if (status && status !== 'all') where.status = status;

  const posts = await prisma.post.findMany({
    where,
    include: { client: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json(posts);
}

// PUT /api/content — update a post (schedule, edit, mark published)
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });

  const post = await prisma.post.update({ where: { id }, data });

  if (data.status === 'published') {
    await prisma.activity.create({
      data: { clientId: post.clientId, action: 'post_published', details: `${post.platform}: ${post.topic || ''}` },
    });
    await notifyN8n('post.published', { postId: id, platform: post.platform, clientId: post.clientId });
  }

  return NextResponse.json(post);
}

// DELETE /api/content — delete a post
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
