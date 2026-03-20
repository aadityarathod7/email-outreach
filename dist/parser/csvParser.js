"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCsv = parseCsv;
const papaparse_1 = __importDefault(require("papaparse"));
/**
 * Validate email address with basic regex
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Parse CSV content and return validated user records
 */
function parseCsv(csvContent) {
    const results = papaparse_1.default.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
    });
    if (results.errors.length > 0) {
        throw new Error(`CSV parsing errors: ${JSON.stringify(results.errors)}`);
    }
    const users = [];
    for (const row of results.data) {
        // Trim header keys to handle messy CSV headers
        const trimmedRow = {};
        for (const [key, value] of Object.entries(row)) {
            trimmedRow[key.trim()] = value;
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
        const prompts = [];
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
//# sourceMappingURL=csvParser.js.map