/**
 * Check if an email has already been sent
 */
export declare function isAlreadySent(email: string): boolean;
/**
 * Record that an email was sent
 */
export declare function recordSent(email: string, name: string, subject: string, body?: string): void;
/**
 * Get total count of sent emails
 */
export declare function getSentCount(): number;
/**
 * Get recently sent emails
 */
export declare function getRecentSent(limit: number): Array<{
    email: string;
    name: string;
    subject: string;
    body: string;
    sent_at: string;
}>;
/**
 * Close database connection
 */
export declare function closeDb(): void;
//# sourceMappingURL=store.d.ts.map