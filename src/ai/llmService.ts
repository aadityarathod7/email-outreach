import { config } from '../config/env';
import { logger } from '../utils/logger';
import { UserRecord } from '../parser/csvParser';

// ─── Rotation pools ───────────────────────────────────────────────────────────

const SUBJECT_STYLES = [
  // Urgency
  (name: string) => `${name}, don't renew just yet`,
  (name: string) => `${name}, before you hit renew`,
  (name: string) => `${name}, your subscription is ending — see this first`,
  // Curiosity
  (name: string) => `${name}, one thing before you renew`,
  (name: string) => `${name}, know your options first`,
  (name: string) => `${name}, read this before deciding`,
  // Positive reframe
  (name: string) => `${name}, your renewal date is actually good news`,
  (name: string) => `${name}, switching is easier than you think`,
  (name: string) => `${name}, this might be perfect timing`,
  // Direct
  (name: string) => `${name}, your current tool is expiring — try this`,
  (name: string) => `${name}, a better option before you renew`,
];

const TIMING_HOOKS = [
  'Your current tool\'s subscription is ending soon — and before you renew, we\'d love for you to try something better.',
  'Your current subscription is wrapping up — and this is honestly the best time to give ArtNovaAI a shot.',
  'We know your current tool\'s subscription is coming to an end — and we want to make this decision easy for you.',
  'Before your current subscription auto-renews — give yourself 60 seconds to try something better.',
  'Your current tool\'s subscription is expiring — and honestly, that\'s a great opportunity to explore something that works harder for you.',
];

const ZERO_FRICTION_LINES = [
  'You already have an ArtNovaAI account. Just log in, use your 2 free credits, and generate a professional image in 4–5 seconds.',
  'You\'re already signed in. No setup. No card. Just 2 free credits waiting for you to use right now.',
  'Your ArtNovaAI account is already set up. Log in, use 2 free credits, and see the difference yourself in under a minute.',
  'You already have an account on ArtNovaAI. Log in and use your 2 free credits right now — no card, no commitment, nothing to lose.',
  'Your ArtNovaAI account is ready and waiting. Just log in and use your 2 free credits before you make any renewal decisions.',
];

const BENEFIT_LINES = [
  'Same quality. Less time. Way less cost.',
  'Professional images in 4–5 seconds. Hours of work, done in minutes.',
  '4–5 seconds per image. A fraction of your current cost. Zero hassle.',
  'Same results. A fraction of the cost. Zero learning curve.',
  'Professional images in 4–5 seconds. Less cost. Zero learning curve. Just results.',
];

const CTA_LINES = [
  `Try it before you decide: ${config.brandUrl}`,
  `Just try it once before renewing: ${config.brandUrl}`,
  `The decision gets easier once you try it: ${config.brandUrl}`,
  `See it for yourself: ${config.brandUrl}`,
  `Log in and see: ${config.brandUrl}`,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0];
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Generate a subscription-expiry outreach email using Groq API
 */
export async function generateEmail(
  user: UserRecord
): Promise<{ subject: string; body: string }> {
  try {
    const first = firstName(user.name);

    // Pre-select random elements server-side for guaranteed variety
    const subjectFn = pick(SUBJECT_STYLES);
    const preSubject = subjectFn(first);
    const timingHook = pick(TIMING_HOOKS);
    const zeroFriction = pick(ZERO_FRICTION_LINES);
    const benefit = pick(BENEFIT_LINES);
    const cta = pick(CTA_LINES);

    const systemPrompt = `You are Aayushi, a warm and professional team member at ArtNovaAI. You write short subscription-expiry outreach emails — catching users at the exact moment their competitor tool is expiring, making trying ArtNovaAI feel like the obvious, zero-effort next step.

EXACT EMAIL STRUCTURE (4 lines, nothing more):
Line 1 — Timing hook: Acknowledge their competitor tool subscription is expiring. Warm, not pushy.
Line 2 — Zero friction: Remind them they already have an ArtNovaAI account. No setup. Just log in.
Line 3 — Key benefit: One punchy line on speed and cost advantage.
Line 4 — Single CTA: Soft call to action with the link. Link appears ONLY here, nowhere else.

TONE RULES:
- Professional but warm throughout
- Zero exclamation marks
- Zero pressure words: "limited time", "act now", "don't miss out", "free", "offer", "discount"
- Total body: 60–80 words maximum
- Sign off exactly: "Warm regards,\\nAayushi\\nArtNovaAI Team"
- Plain text only — no markdown, no HTML, no bullet points`;

    const userPrompt = `Write a subscription-expiry outreach email for this user.

Name: ${user.name}
First name to use: ${first}

Pre-selected elements (use these EXACTLY as written — do not rephrase them):
- Subject: ${preSubject}
- Line 1 (Timing hook): ${timingHook}
- Line 2 (Zero friction): ${zeroFriction}
- Line 3 (Key benefit): ${benefit}
- Line 4 (CTA): ${cta}

Compose the email body by combining the 4 lines above in order, with a blank line between each. Then add the sign-off.

Return ONLY valid JSON (no markdown code blocks, no extra text):
{
  "subject": "${preSubject}",
  "body": "Hi ${first},\\n\\n${timingHook}\\n\\n${zeroFriction}\\n\\n${benefit}\\n\\n${cta}\\n\\nWarm regards,\\nAayushi\\nArtNovaAI Team"
}`;

    const callGroq = async () => {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.llmApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.4,
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        const error: any = await response.json();
        throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq API');
      return content;
    };

    const parseJson = (raw: string): { subject: string; body: string } => {
      let text = raw;
      if (text.includes('```json')) {
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (text.includes('```')) {
        text = text.replace(/```/g, '').trim();
      }
      return JSON.parse(text);
    };

    let email: { subject: string; body: string };

    try {
      email = parseJson(await callGroq());
    } catch {
      logger.warn(`JSON parse failed for ${user.email}, retrying...`);
      email = parseJson(await callGroq());
    }

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
