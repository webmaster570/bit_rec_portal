import app from '../server';

export default function handler(req: any, res: any) {
  // If Vercel passed the path in x-matched-path, ensure req.url is set correctly
  const matched = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'];
  if (matched && typeof matched === 'string' && matched.startsWith('/api')) {
    req.url = matched;
  }
  return new Promise<void>((resolve, reject) => {
    res.on('finish', () => resolve());
    res.on('close', () => resolve());
    res.on('error', (err: any) => reject(err));
    app(req, res);
  });
}

