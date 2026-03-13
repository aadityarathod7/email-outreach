import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { config } from '../config/env';

// Import routes
import emailRoutes from './routes/emails';
import configRoutes from './routes/config';
import statsRoutes from './routes/stats';
import gmailRoutes from './routes/gmail';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.log(`${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    logger.log(`Body: ${JSON.stringify(req.body).substring(0, 200)}`);
  }
  next();
});

// API Routes
app.use('/api/emails', emailRoutes);
app.use('/api/config', configRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/gmail', gmailRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    appName: config.brandName,
  });
});

// Serve React frontend
const frontendBuildPath = path.join(__dirname, '../../frontend-dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    status: err.status || 500,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  logger.log(`🚀 Server running on http://localhost:${PORT}`);
  logger.log(`📧 Email Outreach Dashboard - ${config.brandName}`);
});

export default app;
