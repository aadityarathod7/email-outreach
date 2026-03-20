import { config } from '../config/env';
import { logger } from '../utils/logger';
import { UserRecord } from '../parser/csvParser';

/**
 * Analyze user prompts to describe their creative interests
 */
function analyzeCreativeInterests(prompts: string[]): string {
  if (prompts.length === 0) {
    return 'AI image generation';
  }

  // Extract common themes
  const themesSet = new Set<string>();
  const promptsLower = prompts.join(' ').toLowerCase();

  const keywords: Record<string, string[]> = {
    anime: ['anime', 'manga', 'studio ghibli', 'japanese'],
    cyberpunk: ['cyberpunk', 'futuristic', 'neon', 'sci-fi'],
    nature: ['nature', 'landscape', 'mountain', 'forest', 'water', 'sunset'],
    portrait: ['portrait', 'face', 'character', 'person'],
    abstract: ['abstract', 'geometric', 'pattern'],
    fantasy: ['fantasy', 'magic', 'wizard', 'dragon'],
  };

  for (const [theme, words] of Object.entries(keywords)) {
    if (words.some((word) => promptsLower.includes(word))) {
      themesSet.add(theme);
    }
  }

  const themes = Array.from(themesSet);
  if (themes.length === 0) {
    return 'diverse AI art styles';
  }

  return `${themes.slice(0, 2).join(', ')} aesthetics`;
}

/**
 * Casual subject line openers to vary per email
 */
const SUBJECT_LINES = [
  'quick question',
  'a thought',
  'something I noticed',
  'wondering something',
  'had to share this',
  'one thing creators tell me',
  'honest question',
  'just a thought',
  'something worth knowing',
  'a quick note',
];

/**
 * Varied engagement questions
 */
const QUESTIONS = [
  'Is that something you deal with too?',
  'Does that sound familiar?',
  'Ring any bells?',
  'Sound like something you run into?',
  'Does that resonate with you?',
  'Is that a challenge on your end as well?',
];

/**
 * Varied empathy + CTA lines
 */
const EMPATHY_LINES = [
  "You're not alone — and there's actually a fix for it: https://www.artnovaai.com",
  "You're definitely not the only one — and there's a solution worth checking out: https://www.artnovaai.com",
  "It's a common problem, and there's actually a really good fix: https://www.artnovaai.com",
  "Totally understandable — and there's something that genuinely helps: https://www.artnovaai.com",
  "You're in good company — and there's a tool that takes care of exactly that: https://www.artnovaai.com",
  "It's more common than you'd think — and there's a clean solution: https://www.artnovaai.com",
];

/**
 * Generate a personalized email using Groq API
 */
export async function generateEmail(
  user: UserRecord
): Promise<{ subject: string; body: string }> {
  try {
    const interests = analyzeCreativeInterests(user.prompts);
    const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    const subject = pick(SUBJECT_LINES);
    const question = pick(QUESTIONS);
    const empathy = pick(EMPATHY_LINES);

    const systemPrompt = `You are Aayushi, a team member at ${config.brandName}. You write short, personal, conversational emails to AI art creators.

EXACT EMAIL STRUCTURE TO FOLLOW:

Subject: quick question

Hi [Name],

I work with a lot of creators in the fantasy art space — and the one thing they all say is that getting AI to nail the fine details consistently is still the most frustrating part.

Is that something you deal with too?

You're not alone — and there's actually a fix for it: https://www.artnovaai.com

Warm regards,
Aayushi
ArtNovaAI Team

RULES:
1. Subject line is already provided — use it exactly as given
2. Opening line MUST start with a variation of "I work with a lot of creators in the [niche] space" — rephrase slightly each time but keep the same feel
3. The opening line must name a SPECIFIC pain point for that creative niche
4. Second paragraph is a short question — rephrase it slightly but keep the same casual tone
5. Third paragraph is empathy + link — rephrase slightly but ALWAYS include https://www.artnovaai.com
6. Sign-off: "Warm regards,\nAayushi\nArtNovaAI Team" — always the same
7. Plain text only. No HTML, no bullet points, no markdown
8. NEVER mention their specific prompts, past work, or stalk-y observations
9. Keep the whole email under 80 words in the body
10. Vary the WORDING across emails — same structure, different phrasing each time`;

    const userPrompt = `Write a personalized email for this creator:

Name: ${user.name}
Creative Niche: ${interests}

Use these pre-selected elements (chosen randomly for variety):
- Subject line: "${subject}"
- Question line: "${question}"
- Empathy + link line: "${empathy}"

FOLLOW THIS STRUCTURE EXACTLY:

Subject: ${subject}

Hi ${user.name},

[Opening: A variation of "I work with a lot of creators in the ${interests} space — and the one thing they all say is that [specific pain point] is still the most frustrating part." Rephrase slightly but keep same feel and structure.]

${question}

${empathy}

Warm regards,
Aayushi
ArtNovaAI Team

Return ONLY valid JSON (no markdown code blocks):
{
  "subject": "${subject}",
  "body": "Hi ${user.name},\\n\\n[opening sentence about creators in ${interests} space + pain point]\\n\\n${question}\\n\\n${empathy}\\n\\nWarm regards,\\nAayushi\\nArtNovaAI Team"
}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.llmApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error: any = await response.json();
      throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
    }

    const data: any = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from Groq API');
    }

    // Parse JSON from response (handle markdown-wrapped JSON)
    let email: { subject: string; body: string };
    let jsonText = content;

    // Remove markdown code blocks if present
    if (jsonText.includes('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.replace(/```/g, '').trim();
    }

    try {
      email = JSON.parse(jsonText);
    } catch {
      // Retry once if JSON parsing fails
      logger.warn(`JSON parse failed for ${user.email}, retrying...`);

      const retryResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.llmApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!retryResponse.ok) {
        const error: any = await retryResponse.json();
        throw new Error(`Groq API retry error: ${error.error?.message || retryResponse.statusText}`);
      }

      const retryData: any = await retryResponse.json();
      const retryContent = retryData.choices?.[0]?.message?.content;

      if (!retryContent) {
        throw new Error('Empty response from Groq API on retry');
      }

      // Remove markdown blocks from retry response too
      let retryJsonText = retryContent;
      if (retryJsonText.includes('```json')) {
        retryJsonText = retryJsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (retryJsonText.includes('```')) {
        retryJsonText = retryJsonText.replace(/```/g, '').trim();
      }

      email = JSON.parse(retryJsonText);
    }

    // Validate structure
    if (!email.subject || !email.body) {
      throw new Error('Invalid email structure: missing subject or body');
    }

    return email;
  } catch (error) {
    logger.error(
      `Failed to generate email for ${user.email}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  }
}

/**
 * Add delay to respect API rate limits
 */
export async function rateLimit(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
