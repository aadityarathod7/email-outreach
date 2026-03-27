import { config } from '../config/env';
import { logger } from '../utils/logger';
import { UserRecord } from '../parser/csvParser';

// ─── API key pool ──────────────────────────────────────────────────────────────
// Reads LLM_API_KEYS (comma-separated) or falls back to LLM_API_KEY
function loadApiKeys(): string[] {
  const keys: string[] = [];
  const multi = process.env.LLM_API_KEYS;
  if (multi) keys.push(...multi.split(',').map((k) => k.trim()).filter(Boolean));
  // Always include the single LLM_API_KEY as fallback if not already in the list
  if (config.llmApiKey && !keys.includes(config.llmApiKey)) {
    keys.push(config.llmApiKey);
  }
  // Sort: Groq keys (gsk_) first, then OpenAI keys (sk-) last
  keys.sort((a, b) => {
    const aIsGroq = a.startsWith('gsk_') ? 0 : 1;
    const bIsGroq = b.startsWith('gsk_') ? 0 : 1;
    return aIsGroq - bIsGroq;
  });
  return keys;
}

let _apiKeys = loadApiKeys();
let _keyIndex = 0;

function nextApiKey(): string {
  if (_apiKeys.length === 0) throw new Error('No LLM API keys configured');
  const key = _apiKeys[_keyIndex % _apiKeys.length];
  _keyIndex = (_keyIndex + 1) % _apiKeys.length;
  return key;
}

/** Call after saving new keys via settings so they take effect immediately */
export function reloadApiKeys(): void {
  _apiKeys = loadApiKeys();
  _keyIndex = 0;
  logger.log(`LLM API keys reloaded: ${_apiKeys.length} key(s) available`);
}

// ─── Rotation pools ───────────────────────────────────────────────────────────

const SUBJECT_STYLES = [
  (name: string) => `${name}, today is the last day — just try it`,
  (name: string) => `${name}, your subscription expires today`,
  (name: string) => `${name}, this is my last message about this`,
  (name: string) => `${name}, one last thing before your subscription ends`,
  (name: string) => `${name}, closing the loop on this`,
  (name: string) => `${name}, last chance — expires today`,
  (name: string) => `${name}, final note before your renewal`,
  (name: string) => `${name}, wrapping up — today's the day`,
];

const OPENING_LINES = [
  "I've reached out a couple of times this week — today is genuinely the last day your current subscription is active.",
  "This is my third and final message. I only kept following up because I genuinely think this matters for you today.",
  "I promised myself I'd only send one more — and today's the day your subscription actually expires, so here it is.",
  "Last one, I promise. I've sent a couple of notes this week, and today is the actual expiry date.",
  "I don't want to clutter your inbox — but today is the last day, and I'd feel bad not mentioning it one more time.",
  "Final message from me. Your subscription ends today, and I wanted to make sure you had this before it did.",
  "I know I've reached out before — this is the last time. Today your current tool's subscription expires.",
  "One last note. I've followed up because today is genuinely the final day of your subscription.",
];

const MIDDLE_LINES = [
  "Your ArtNovaAI account is ready and waiting — just log in, use your 2 free credits, and see what 4–5 second generation actually feels like before you decide anything.",
  "You already have an account. No setup. No card. Just 2 free credits sitting there — takes 60 seconds to use them before your subscription closes out.",
  "The account is set up. The credits are there. All you have to do is log in once and run one image — before the clock runs out today.",
  "Before your subscription lapses — you have 2 free credits on ArtNovaAI, no setup needed. Log in and use them. That's it.",
  "It costs you nothing to try. Your ArtNovaAI account already exists with 2 free credits. One login. One image. Sixty seconds.",
  "Your ArtNovaAI account has been ready since day one. Two free credits. No commitment. Just use them today before your current tool auto-renews or expires.",
];

const COMPARISON_LINES = [
  'Same results. A fraction of the cost. No renewal fees.',
  'Faster generation, lower price — no lock-in, no auto-renewal.',
  '4–5 seconds per image. Cheaper than what you\'re paying now. No strings.',
  'Professional quality. 4–5 second turnaround. None of the renewal headaches.',
  'Same output quality. Dramatically faster. Nothing to renew.',
  'Better speed, better price — and you already have access.',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0];
}

/**
 * Auto-format email body:
 * - Splits into paragraphs on any run of blank lines
 * - Trims each paragraph (preserves internal single newlines for sign-off blocks)
 * - Rejoins with exactly one blank line (\n\n) between paragraphs
 * - Removes trailing/leading whitespace from the whole body
 */
function autoFormat(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .join('\n\n');
}

// ─── Provider detection ──────────────────────────────────────────────────────

interface LLMProvider {
  url: string;
  model: string;
  name: string;
}

function getProvider(apiKey: string): LLMProvider {
  if (apiKey.startsWith('sk-')) {
    return {
      url: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
      name: 'OpenAI',
    };
  }
  // Default: Groq (keys start with gsk_)
  return {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    name: 'Groq',
  };
}

// ─── LLM-based generation ─────────────────────────────────────────────────────

async function generateEmailWithLLM(
  user: UserRecord,
  customPrompt: string
): Promise<{ subject: string; body: string }> {
  const first = firstName(user.name);

  const systemMessage = `You are an email copywriter for ${config.brandName} (${config.brandUrl}), a fast AI image generation tool. The sender is ${config.senderName} from ${config.brandName}.

Write a short, personal, plain-text email based on the instructions given. Keep it concise (under 120 words total across all parts). No HTML, no markdown, no bullet points.

Return ONLY valid JSON with EXACTLY this shape — no extra fields, no text outside the JSON:
{
  "subject": "one-line subject",
  "greeting": "Hi ${first},",
  "paragraph1": "Opening sentence or two.",
  "paragraph2": "Second paragraph — product benefit or context.",
  "cta": "Call to action line including the URL ${config.brandUrl}",
  "signoff": "Warm regards,\\n${config.senderName}\\n${config.brandName} Team"
}`;

  const userMessage = `${customPrompt}\n\nRecipient name: ${first}\nRecipient email: ${user.email}`;

  // ── 1st priority: PayPal CosmosAI ──
  const paypalUrl = process.env.PAYPAL_LLM_URL;
  const paypalKey = process.env.PAYPAL_LLM_KEY;
  if (paypalUrl && paypalKey) {
    try {
      const chatUrl = paypalUrl.endsWith('/') ? `${paypalUrl}chat/completions` : `${paypalUrl}/chat/completions`;
      const response = await fetch(chatUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paypalKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.8,
          max_tokens: 600,
        }),
      });

      if (response.ok) {
        const data = await response.json() as { choices: Array<{ message: { content: string } }> };
        const content: string = data.choices[0].message.content.trim();
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]) as {
            subject: string; greeting: string; paragraph1: string;
            paragraph2?: string; cta: string; signoff: string;
          };
          const parts = [result.greeting, result.paragraph1, result.paragraph2, result.cta, result.signoff]
            .filter((p): p is string => !!p && p.trim().length > 0)
            .map((p) => p.trim());
          logger.log(`Email generated via PayPal CosmosAI for ${user.email}`);
          return { subject: result.subject.trim(), body: parts.join('\n\n') };
        }
      }
      const errText = response.ok ? 'Invalid JSON response' : `${response.status} ${await response.text()}`;
      logger.log(`PayPal CosmosAI failed (${errText}) — falling through to Groq/OpenAI`);
    } catch (ppErr) {
      logger.log(`PayPal CosmosAI error: ${ppErr instanceof Error ? ppErr.message : String(ppErr)} — falling through to Groq/OpenAI`);
    }
  }

  // ── 2nd/3rd priority: Groq keys first, then OpenAI keys ──
  let lastError: string = 'No API keys configured';
  for (let ki = 0; ki < _apiKeys.length; ki++) {
    const apiKey = nextApiKey();
    const provider = getProvider(apiKey);
    try {
      const response = await fetch(provider.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.8,
          max_tokens: 600,
        }),
      });

      if (response.status === 429) {
        logger.log(`${provider.name} key ${ki + 1} rate limited — trying next key`);
        lastError = 'Rate limited';
        continue; // try next key
      }

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`${provider.name} API error: ${response.status} ${err}`);
      }

      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      const content: string = data.choices[0].message.content.trim();

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('LLM did not return valid JSON');

      const result = JSON.parse(jsonMatch[0]) as {
        subject: string;
        greeting: string;
        paragraph1: string;
        paragraph2?: string;
        cta: string;
        signoff: string;
      };

      const parts = [result.greeting, result.paragraph1, result.paragraph2, result.cta, result.signoff]
        .filter((p): p is string => !!p && p.trim().length > 0)
        .map((p) => p.trim());

      logger.log(`Email generated via ${provider.name} (${provider.model}) for ${user.email}`);
      return { subject: result.subject.trim(), body: parts.join('\n\n') };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (!lastError.includes('Rate limited')) throw err; // non-rate-limit errors bubble up
    }
  }

  throw new Error(`All API keys exhausted: ${lastError}`);
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Generate an email by either:
 * - Calling the LLM (Groq) when a customPrompt is provided, OR
 * - Assembling from curated rotation pools (default)
 */
export async function generateEmail(
  user: UserRecord,
  customPrompt?: string
): Promise<{ subject: string; body: string }> {
  try {
    if (customPrompt && customPrompt.trim()) {
      // Retry up to 2 times on failure, then fall back to rotation pools
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          return await generateEmailWithLLM(user, customPrompt.trim());
        } catch (llmErr) {
          logger.error(`LLM attempt ${attempt} failed for ${user.email}: ${llmErr instanceof Error ? llmErr.message : String(llmErr)}`);
          if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
        }
      }
      logger.log(`LLM failed after retries for ${user.email} — falling back to rotation pools`);
    }

    const first = firstName(user.name);

    const subject = pick(SUBJECT_STYLES)(first);
    const opening = pick(OPENING_LINES);
    const middle = pick(MIDDLE_LINES);
    const comparison = pick(COMPARISON_LINES);
    const url = config.brandUrl;

    const body = autoFormat([
      `Hi ${first},`,
      opening,
      middle,
      comparison,
      `This is the last nudge, I promise: ${url}`,
      'Warm regards,\nAayushi\nArtNovaAI Team',
    ].join('\n\n'));

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
