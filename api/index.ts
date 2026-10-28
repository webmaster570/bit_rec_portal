import app from '../server/app';

export default function handler(req: any, res: any) {
  // If Vercel passed the path in x-matched-path or x-forwarded-uri, normalize req.url
  const matched = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string);
  if (matched && typeof matched === 'string' && matched.startsWith('/api')) {
    req.url = matched;
  }
  return app(req, res);
}
