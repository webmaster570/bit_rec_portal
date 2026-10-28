import 'dotenv/config';
import path from 'path';
import app from './server/app';
import { tryConnectDb } from './server/db';

const PORT = process.env.PORT || 3000;

// Non-blocking database connection attempt on startup
if (!process.env.VERCEL) {
  tryConnectDb().then(() => {
    console.log('[Server] Initial database check complete.');
  }).catch((err) => {
    console.warn('[Server] Initial database check warning:', err?.message || err);
  });
}

// ----------------------------------------------------
// VITE OR STATIC ASSETS MIDDLEWARE (Local & Node Hosting Only)
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  import('vite').then(async ({ createServer }) => {
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`[Server] Recruitment Portal Dev Server running on http://0.0.0.0:${PORT}`);
    });
  }).catch((err) => {
    console.error('[Server] Failed to initialize Vite dev server:', err);
  });
} else if (!process.env.VERCEL) {
  // Production Node server (e.g. Docker or Render)
  import('express').then(({ default: express }) => {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          res.status(404).send('Static assets not found. Please run "npm run build" first.');
        }
      });
    });
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`[Server] Recruitment Portal Production Server running on http://0.0.0.0:${PORT}`);
    });
  });
}

export default app;
