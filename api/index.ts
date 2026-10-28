import app from '../server/app';

/**
 * Vercel Serverless Entry Point (v1.3.7)
 * Hardened for Express/MongoDB callback lifecycle.
 */
export default async function handler(req: any, res: any) {
  try {
    // 1. Normalize Path
    const matched = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string) || req.url;
    if (matched && typeof matched === 'string') {
      req.url = matched.replace(/^\/api\/index(\.(ts|js))?/, '/api');
    }

    // 2. Wrap Express in a lifecycle promise
    // This prevents Vercel from terminating the function before MongoDB responds.
    return await new Promise<void>((resolve) => {
      // Listen for the final completion of the response
      res.on('finish', () => resolve());
      res.on('close', () => resolve());
      
      try {
        // Execute the Express app
        app(req, res);
      } catch (appErr: any) {
        console.error('[Vercel Execution Error]:', appErr);
        if (!res.headersSent) {
          res.status(200).json({
            error: true,
            message: `Runtime Execution Error: ${appErr.message}`,
            connected: false
          });
        }
        resolve();
      }
    });
  } catch (outerErr: any) {
    console.error('[Vercel Initialization Crash]:', outerErr);
    // If we crash before reaching Express, return a safe JSON error to avoid HTTP 500
    if (!res.headersSent) {
      res.status(200).json({
        error: true,
        message: `Initialization Crash: ${outerErr.message}`,
        connected: false
      });
    }
  }
}
