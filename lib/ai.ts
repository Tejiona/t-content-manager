const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GenerateOptions {
  topic: string;
  platforms: string[];
  tone: string;
  language: string;
  emojis: string;
  extra?: string;
  brandContext?: {
    name: string;
    industry?: string;
    description?: string;
    keywords?: string;
  };
}

interface PlatformContent {
  text: string;
  hashtags: string;
}

const PLATFORM_LIMITS: Record<string, number> = {
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  x: 280,
};

export async function generateContent(options: GenerateOptions): Promise<Record<string, PlatformContent>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const { topic, platforms, tone, language, emojis, extra, brandContext } = options;

  const platformSpecs = platforms.map(p =>
    `- ${p.toUpperCase()} (max ${PLATFORM_LIMITS[p] || 2200} characters): adapt style to this platform`
  ).join('\n');

  const brandCtx = brandContext
    ? `\nBrand context:\n- Company: ${brandContext.name}\n- Industry: ${brandContext.industry || 'N/A'}\n- Description: ${brandContext.description || 'N/A'}\n- Usual hashtags: ${brandContext.keywords || 'N/A'}\n`
    : '';

  const prompt = `You are an expert community manager and digital marketing specialist. Generate social media content.

Topic: ${topic}
Tone: ${tone}
Language: ${language}
Emojis: ${emojis}
${extra ? 'Additional instructions: ' + extra : ''}
${brandCtx}
Target platforms:
${platformSpecs}

IMPORTANT: Respond ONLY with valid JSON, no markdown, no backticks. Exact format:
{
${platforms.map(p => `"${p}": {"text": "post content", "hashtags": "#tag1 #tag2 #tag3"}`).join(',\n')}
}

For each platform, adapt the style, length, and format. Use relevant hashtags. For X, stay under 280 characters (text + hashtags).`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9 },
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  return JSON.parse(cleaned);
}

// Generate content ideas for a week
export async function generateWeeklyPlan(brandContext: {
  name: string;
  industry?: string;
  description?: string;
  keywords?: string;
  tone: string;
  lang: string;
  postsPerWeek: number;
}): Promise<Array<{ day: string; topic: string; platform: string }>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const prompt = `Generate a weekly social media content plan for:
Company: ${brandContext.name}
Industry: ${brandContext.industry || 'N/A'}
Description: ${brandContext.description || 'N/A'}
Tone: ${brandContext.tone}
Language: ${brandContext.lang === 'fr' ? 'French' : 'English'}
Posts per week: ${brandContext.postsPerWeek}

Return ONLY valid JSON array:
[{"day":"Monday","topic":"...","platform":"instagram"},...]

Distribute across platforms (instagram, facebook, linkedin, x). Vary content types (tips, behind-the-scenes, promotions, engagement questions, industry news).`;

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8 },
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  return JSON.parse(cleaned);
}
