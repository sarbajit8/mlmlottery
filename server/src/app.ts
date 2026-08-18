import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { getPublicSettings } from './modules/system/system.service.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', true); // behind the Apache reverse proxy on :8083
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '4mb' })); // headroom for base64 payment-QR uploads
  app.use(requestLogger);

  // Human-friendly landing page for the raw backend URL, so hitting it directly in a browser
  // confirms the API is up instead of showing a bare 404. /api/health remains the JSON check.
  app.get('/', async (_req, res) => {
    const { companyName } = await getPublicSettings();
    res.type('html').send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${companyName} API</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#05070c;color:#e7e9ee;font-family:system-ui,-apple-system,sans-serif;">
  <div style="text-align:center;padding:24px;">
    <div style="width:56px;height:56px;margin:0 auto 16px;border-radius:16px;background:linear-gradient(135deg,#34d399,#059669);display:flex;align-items:center;justify-content:center;font-size:28px;box-shadow:0 8px 24px rgba(5,150,105,0.35);">✓</div>
    <h1 style="margin:0 0 6px;font-size:18px;font-weight:600;">Server Running Successfully</h1>
    <p style="margin:0;color:#8b93a3;font-size:13px;">${companyName} API</p>
    <p style="margin:8px 0 0;color:#4b5563;font-size:11px;">${new Date().toISOString()}</p>
  </div>
</body>
</html>`);
  });

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
