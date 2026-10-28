import app from '../server/app';

export default async function handler(req: any, res: any) {
  // Normalize req.url for Vercel serverless functions
  // Vercel sometimes passes the path in x-matched-path or req.url includes the function name
  const matched = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string) || req.url;
  
  if (matched && typeof matched === 'string') {
    // If the path contains the function filename, strip it to reveal the intended API route
    let cleanPath = matched.replace(/^\/api\/index(\.(ts|js))?/, '/api');
    
    // Ensure it starts with /api if it's an API request
    if (cleanPath.startsWith('/health') || cleanPath.startsWith('/state') || cleanPath.startsWith('/reconnect')) {
      cleanPath = '/api' + (cleanPath.startsWith('/') ? '' : '/') + cleanPath;
    }
    
    req.url = cleanPath;
  }

  // Delegate to the modular Express app
  return app(req, res);
}
