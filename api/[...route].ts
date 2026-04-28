export default async function handler(req: any, res: any) {
  const url = String(req.url || '');
  const pathname = url.split('?')[0];

  if (pathname === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      runtime: 'vercel',
      api: 'reachable',
      mongoUriSet: Boolean(process.env.MONGO_URI),
      jwtSecretSet: Boolean(process.env.JWT_SECRET),
    });
  }

  try {
    const mod = await import('./_lib/app');
    return mod.default(req, res);
  } catch (error: any) {
    console.error('API bootstrap error:', error);
    return res.status(500).json({
      error: 'API bootstrap failed',
      details: error?.message || 'Unknown server error',
    });
  }
}
