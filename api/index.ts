import app from './server-app.js';

/**
 * Vercel Serverless Entry Point (v1.3.9)
 */
export default async function handler(req: any, res: any) {
  try {
    // 1. Diagnostics (Masked)
    if (process.env.NODE_ENV !== 'production') {
      const hasUri = !!process.env.MONGODB_URI;
      console.log(`[Vercel Bridge] Handler Executing. URI Defined: ${hasUri}`);
    }

    // 2. Normalize Path
    const matched = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string) || req.url;
    if (matched && typeof matched === 'string') {
      req.url = matched.replace(/^\/api\/index(\.(ts|js))?/, '/api');
    }

    // 3. Wrap Express Lifecycle
    return await new Promise<void>((resolve) => {
      res.on('finish', () => resolve());
      res.on('close', () => resolve());
      
      try {
        app(req, res);
      } catch (appErr: any) {
        console.error('[Vercel Bridge App Error]:', appErr);
        if (!res.headersSent) {
          res.status(200).json({ error: true, message: `Internal App Error: ${appErr.message}`, connected: false });
        }
        resolve();
      }
    });
  } catch (outerErr: any) {
    console.error('[Vercel Bridge Bridge Error]:', outerErr);
    if (!res.headersSent) {
      res.status(200).json({ error: true, message: `Bridge Critical: ${outerErr.message}`, connected: false });
    }
  }
}
