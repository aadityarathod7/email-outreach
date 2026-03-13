import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { UserRecord } from '../parser/csvParser';

let client: GoogleGenerativeAI | null = null;

/**
 * Get or create Gemini client singleton
 */
function getClient(): GoogleGenerativeAI {
  if (!client) {
    client = new GoogleGenerativeAI({
      apiKey: config.llmApiKey || 'dummy-key',
    });
  }
  return client;
}

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
 * Generate a personalized email using LLM API
 */
export async function generateEmail(
  user: UserRecord
): Promise<{ subject: string; body: string }> {
  try {
    const interests = analyzeCreativeInterests(user.prompts);
    const promptsList = user.prompts.map((p) => `"${p}"`).join('\n');

    const systemPrompt = `You are Aayushi, a friendly team member at ${config.brandName} (https://www.artnovaai.com). Your job is to write compelling, authentic emails to creators about specific challenges they face and how to solve them.

CRITICAL RULES - THIS IS SUPER IMPORTANT:
1. NEVER say "I noticed your X" or "I saw you created Y" - this makes users feel stalked and creepy.
2. NEVER analyze or mention their specific prompts or past work - it's creepy and breaks trust.
3. Do NOT reveal that you know about their creative interests or activity level.
4. The email should identify a REAL PROBLEM or CHALLENGE that creators in their niche face.
5. Mention that ${config.brandName} solves this specific problem NATURALLY (as a helpful friend would).
6. Offer FREE CREDITS or a free trial - something they can test risk-free.
7. Keep it 50-100 words EXACTLY. No more, no less. Count the words.
8. Sound like Aayushi - warm, conversational, human, helpful. Not corporate or salesy.
9. NO urgency, NO FOMO, NO "limited time" language.
10. Use natural exclamation marks sparingly - only 1-2 if it feels genuine.
11. Make it INTERESTING - talk about the benefit and value, not just the feature.
12. End with a simple, curious CTA like "Worth a quick look?" or "Curious to see the difference?"
13. Include the website link naturally in the text.
14. Sign as "Best, Aayushi" or just "Aayushi" - personal, not corporate.
15. Write plain text only. No HTML, no markdown, no bullet points.
16. Make the subject line SPECIFIC and intriguing - not generic.

TONE: You're a knowledgeable friend who's discovered something cool and thinks they'd actually benefit from it. Be genuine, be specific about their pain point, and be helpful - not salesy.`;

    const userPrompt = `Write a personalized email for this user:

Name: ${user.name}
Email: ${user.email}
Creative Niche: ${interests}

CRITICAL: Do NOT include any unsubscribe, opt-out, or "If you'd rather not hear from us" language anywhere in the email.

Return ONLY valid JSON (no markdown code blocks):
{
  "subject": "subject line (4-7 words, no 'free' or promotional language)",
  "body": "Hi ${user.name},\\n\\n[2-3 sentences about their creative pain point and how ArtNovaAI helps - ~60-100 words]\\n\\nStart with 2 free credits at artnovaai.com—no card needed. Curious to see the difference?\\n\\nBest,\\nAayushi — ArtNovaAI Team"
}

EMAIL STRUCTURE (EXACTLY):
1. Hi [Name],
2. 2-3 sentences (~60-100 words): One genuine pain point + ArtNovaAI solution
3. CTA: "Start with 2 free credits at artnovaai.com—no card needed. Curious to see the difference?"
4. Sign-off: "Best,\\nAayushi — ArtNovaAI Team"
5. NO unsubscribe line. NO opt-out. NO "if you'd rather not hear from us". NOTHING after signature.

DO NOT ADD:
- Unsubscribe instructions
- "If you'd rather not hear from us"
- opt-out language
- CAN-SPAM footer
- Any line after the signature`;

    const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });

    const completion = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemPrompt}\n\n${userPrompt}`,
            },
          ],
        },
      ],
    });

    const content = completion.response.text();
    if (!content) {
      throw new Error('Empty response from Gemini API');
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

      const retryModel = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });

      const retryCompletion = await retryModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`,
              },
            ],
          },
        ],
      });

      const retryContent = retryCompletion.response.text();
      if (!retryContent) {
        throw new Error('Empty response from Gemini API on retry');
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
