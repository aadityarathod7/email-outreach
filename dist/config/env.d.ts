interface Config {
    gmailUser: string;
    gmailAppPassword: string;
    smtpUser: string;
    smtpAppPassword: string;
    llmApiKey: string;
    emailService: string;
    emailUser: string;
    emailPassword: string;
    brandName: string;
    brandUrl: string;
    senderName: string;
    pollIntervalMinutes: number;
    maxEmailsPerBatch: number;
    delayBetweenEmailsMs: number;
    csvSenderEmail?: string;
}
export declare const config: Config;
export {};
//# sourceMappingURL=env.d.ts.map