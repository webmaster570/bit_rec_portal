import app from '../server/app';

export default async function handler(req: any, res: any) {
  try {
    // If Vercel passed the path in x-matched-path or x-forwarded-uri, normalize req.url
    const matched = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string);
    if (matched && typeof matched === 'string' && matched.startsWith('/api')) {
      req.url = matched;
    }
    
    // In Vercel serverless, we wrap the Express app call to catch potential internal crashes 
    // that result in generic 500 pages.
    return new Promise<void>((resolve, reject) => {
      res.on('finish', () => resolve());
      res.on('error', (err: any) => reject(err));
      
      try {
        app(req, res);
      } catch (err: any) {
        console.error('[Vercel Bridge Crash]', err);
        if (!res.headersSent) {
          res.status(200).json({ 
            error: true, 
            message: `Serverless Bridge Error: ${err.message}`, 
            connected: false 
          });
        }
        resolve();
      }
    });
  } catch (err: any) {
    console.error('[Vercel Outer Handler Error]', err);
    if (!res.headersSent) {
      res.status(200).json({ error: true, message: `Outer Handler Error: ${err.message}`, connected: false });
    }
  }
}
