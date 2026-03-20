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
 * Parse CSV content and return validated user records
 */
export declare function parseCsv(csvContent: string): UserRecord[];
//# sourceMappingURL=csvParser.d.ts.map