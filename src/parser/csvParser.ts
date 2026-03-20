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
    // Normalize keys: lowercase + trim to handle messy CSV headers
    const trimmedRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      trimmedRow[key.trim().toLowerCase()] = (value as string) || '';
    }

    // Accept common column name variations
    const email = (trimmedRow.email || trimmedRow['e-mail'] || trimmedRow['email address'] || '').trim();
    const name = (trimmedRow.name || trimmedRow['full name'] || trimmedRow['username'] || '').trim();
    const plan = (trimmedRow.plan || trimmedRow['plan type'] || trimmedRow['subscription'] || '').trim();
    const totalImagesStr = (trimmedRow.totalimages || trimmedRow['total images'] || trimmedRow['total_images'] || '0').trim();

    // Validate required fields
    if (!email || !isValidEmail(email)) {
      continue;
    }

    if (!name) {
      continue;
    }

    // Collect prompts from images.0 through images.9 (case-insensitive keys already lowercased)
    const prompts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const prompt = (trimmedRow[`images.${i}`] || trimmedRow[`image.${i}`] || trimmedRow[`prompt${i}`] || '').trim();
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
