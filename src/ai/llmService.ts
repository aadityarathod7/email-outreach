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
 * Generate a personalized email using Groq API
 */
export async function generateEmail(
  user: UserRecord
): Promise<{ subject: string; body: string }> {
  try {
    const interests = analyzeCreativeInterests(user.prompts);

    const systemPrompt = `You are Aayushi, a friendly team member at ${config.brandName} (${config.brandUrl}). Your job is to write compelling, authentic emails to creators.

EMAIL STYLE EXAMPLE (COPY THIS EXACTLY):
Subject: Get perfect AI art without endless prompting
Body:
Hi [Name],

I know you're looking for a tool that just works. The biggest difference with ArtNovaAI is that you don't have to manually fine-tune prompts or worry about quality settings.

Our AI auto-optimizes every generation behind the scenes, guaranteeing high quality and perfect consistency without you wasting credits on trial-and-error.

Curious to see the difference? Visit ${config.brandUrl} to start with your 2 free credits.

Best,
Aayushi

CRITICAL RULES:
1. Follow the EXACT structure above: Subject → Body → CTA → Signature
2. Subject line: Should be benefit-focused, relatable to their niche. DIFFERENT for each email.
3. Opening: "I know you're looking for..." or similar relatable statement
4. Body: 3 sentences max. Talk about the PROBLEM they face and how ArtNovaAI solves it
5. Always mention "2 free credits" and the website link
6. Keep tone conversational, warm, human - NOT corporate or salesy
7. NO urgency, NO FOMO, NO "limited time" language
8. NO unsubscribe/opt-out language anywhere
9. Sign-off: "Best, Aayushi" (simple, personal)
10. Plain text only - no HTML, markdown, or bullet points
11. Word count: 70-100 words for body section
12. NEVER say "I noticed your X" or "I saw you created Y"
13. NEVER mention their specific prompts or past work
14. DO reveal the SPECIFIC PROBLEM creators in their niche face
15. Show how ArtNovaAI solves THAT problem naturally

TONE: You're a knowledgeable friend who found a solution and genuinely thinks they'll benefit. Be specific about pain points. Be helpful, not salesy.`;

    const userPrompt = `Write a personalized email for this creator:

Name: ${user.name}
Email: ${user.email}
Creative Niche: ${interests}

FOLLOW THIS STRUCTURE EXACTLY:

Subject: [Benefit-focused subject line, different from "Get perfect AI art without endless prompting"]
Body:
Hi ${user.name},

I know you're looking for [relatable problem statement about their creative niche].

[1-2 sentences: Explain the specific problem they face + How ArtNovaAI solves it naturally]

Curious to see the difference? Visit https://www.artnovaai.com to start with your 2 free credits.

Best,
Aayushi

REQUIREMENTS:
- Subject: Create a NEW unique subject line (different each time) that speaks to their niche problem
- Opening: Must start with "I know you're looking for..."
- Body: 2-3 sentences explaining their problem + ArtNovaAI solution
- CTA: ALWAYS include "Curious to see the difference? Visit https://www.artnovaai.com to start with your 2 free credits."
- URL: MUST include https://www.artnovaai.com in the CTA line (this is critical!)
- Signature: "Best, Aayushi" only (NO "Aayushi — ArtNovaAI Team")
- NO unsubscribe/opt-out/CAN-SPAM footer
- Plain text only
- Total body: 80-120 words

Return ONLY valid JSON (no markdown code blocks):
{
  "subject": "Subject line here",
  "body": "Hi ${user.name},\\n\\nI know you're looking for...\\n\\n[problem + solution sentences]\\n\\nCurious to see the difference? Visit https://www.artnovaai.com to start with your 2 free credits.\\n\\nBest,\\nAayushi"
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
