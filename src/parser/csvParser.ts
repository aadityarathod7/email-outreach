import Papa from 'papaparse';

/**
 * User record parsed from CSV
 */
export interface UserRecord {
  email: string;
  name: string;
  plan: string;
  totalImages: number;
  prompts: string[];
}

/**
 * Validate email address with basic regex
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Parse CSV content and return validated user records
 */
export function parseCsv(csvContent: string): UserRecord[] {
  const results = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (results.errors.length > 0) {
    throw new Error(`CSV parsing errors: ${JSON.stringify(results.errors)}`);
  }

  const users: UserRecord[] = [];

  for (const row of results.data as Record<string, string>[]) {
    // Trim header keys to handle messy CSV headers
    const trimmedRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      trimmedRow[key.trim()] = value as string;
    }

    const email = (trimmedRow.email || '').trim();
    const name = (trimmedRow.name || '').trim();
    const plan = (trimmedRow.plan || '').trim();
    const totalImagesStr = (trimmedRow.totalImages || '0').trim();

    // Validate required fields
    if (!email || !isValidEmail(email)) {
      continue;
    }

    if (!name) {
      continue;
    }

    // Collect prompts from images.0 through images.4
    const prompts: string[] = [];
    for (let i = 0; i < 5; i++) {
      const prompt = (trimmedRow[`images.${i}`] || '').trim();
      if (prompt) {
        prompts.push(prompt);
      }
    }

    const totalImages = parseInt(totalImagesStr, 10) || 0;

    users.push({
      email,
      name,
      plan,
      totalImages,
      prompts,
    });
  }

  return users;
}
