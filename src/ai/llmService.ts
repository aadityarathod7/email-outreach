import { config } from '../config/env';
import { logger } from '../utils/logger';
import { UserRecord } from '../parser/csvParser';

// ─── Rotation pools ───────────────────────────────────────────────────────────

const SUBJECT_STYLES = [
  (name: string) => `${name}, just following up`,
  (name: string) => `${name}, wasn't sure if you saw this`,
  (name: string) => `${name}, didn't want this to get buried`,
  (name: string) => `${name}, just checking in`,
  (name: string) => `${name}, wanted to make sure you saw this`,
  (name: string) => `${name}, circling back quickly`,
  (name: string) => `${name}, one more thing before you decide`,
  (name: string) => `${name}, still here if you need it`,
];

const OPENING_LINES = [
  'Just following up on my message from yesterday.',
  "Sent you something yesterday — wasn't sure if it landed in the right place.",
  "I reached out yesterday about your expiring subscription — just wanted to make sure this didn't get buried.",
  "Didn't hear back, so I wanted to follow up quickly.",
  "Just looping back in case yesterday's message got lost.",
  "Reaching out once more — didn't want this to slip through the cracks.",
  "Following up from yesterday — wanted to make sure you had a chance to see this.",
  "I know inboxes get busy — just wanted to resurface this quickly.",
];

const MIDDLE_LINES = [
  "I know things get busy — but your current tool's subscription is getting closer to expiring, and your ArtNovaAI account is still sitting there with 2 free credits ready to use.",
  "Short version: your current tool is expiring soon, you already have an ArtNovaAI account, and there are 2 free credits waiting for you.",
  "You already have an account on ArtNovaAI. No setup needed. Just log in and use your 2 free credits to see what 4–5 second image generation actually feels like.",
  "Your ArtNovaAI account is ready with 2 free credits — and your current tool's subscription is still winding down. Worth a quick look before you renew.",
  "The short version: your subscription is almost up, and you've got 2 free credits on ArtNovaAI sitting unused. No setup. No card.",
  "Before your current tool auto-renews — your ArtNovaAI account is already set up with 2 free credits. Takes 60 seconds to try.",
];

const BENEFIT_LINES = [
  '4–5 seconds per image. No card. No commitment. Just try it once.',
  'Generate a professional image in 4–5 seconds before you decide to renew anything.',
  '4–5 second image generation. No commitment. Nothing to lose.',
  'Professional results in 4–5 seconds — before you make any renewal decisions.',
  'One image, 4–5 seconds. That\'s all it takes to see the difference.',
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
 * Generate a follow-up email by assembling pre-selected rotation elements.
 * No LLM needed — all content is chosen from curated pools for guaranteed
 * formatting and variety.
 */
export async function generateEmail(
  user: UserRecord
): Promise<{ subject: string; body: string }> {
  try {
    const first = firstName(user.name);

    const subject = pick(SUBJECT_STYLES)(first);
    const opening = pick(OPENING_LINES);
    const middle = pick(MIDDLE_LINES);
    const benefit = pick(BENEFIT_LINES);
    const url = config.brandUrl;

    // Build body directly — no LLM, guaranteed blank lines between paragraphs
    const body = [
      `Hi ${first},`,
      opening,
      middle,
      benefit,
      url,
      'Warm regards,\nAayushi',
    ].join('\n\n');

    return { subject, body };
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
  await new Promise((resolve) => setTimeout(resolve, 3 * 60 * 1000));
}
