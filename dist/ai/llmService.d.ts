import { UserRecord } from '../parser/csvParser';
/**
 * Generate a personalized email using LLM API
 */
export declare function generateEmail(user: UserRecord): Promise<{
    subject: string;
    body: string;
}>;
/**
 * Add delay to respect API rate limits
 */
export declare function rateLimit(): Promise<void>;
//# sourceMappingURL=llmService.d.ts.map