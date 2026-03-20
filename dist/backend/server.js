"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
// Import routes
const emails_1 = __importDefault(require("./routes/emails"));
const config_1 = __importDefault(require("./routes/config"));
const stats_1 = __importDefault(require("./routes/stats"));
const gmail_1 = __importDefault(require("./routes/gmail"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    logger_1.logger.log(`${req.method} ${req.path}`);
    next();
});
// API Routes
app.use('/api/emails', emails_1.default);
app.use('/api/config', config_1.default);
app.use('/api/stats', stats_1.default);
app.use('/api/gmail', gmail_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        appName: env_1.config.brandName,
    });
});
// Serve React frontend
const frontendBuildPath = path_1.default.join(__dirname, '../../frontend-dist');
if (fs_1.default.existsSync(frontendBuildPath)) {
    app.use(express_1.default.static(frontendBuildPath));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(frontendBuildPath, 'index.html'));
    });
}
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.logger.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        status: err.status || 500,
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Start server
app.listen(PORT, () => {
    logger_1.logger.log(`🚀 Server running on http://localhost:${PORT}`);
    logger_1.logger.log(`📧 Email Outreach Dashboard - ${env_1.config.brandName}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map