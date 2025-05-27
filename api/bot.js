export default async function handler(req, res) {
  const TELEGRAM_API_BASE = 'https://api.telegram.org';

  const { url, method, headers } = req;
  const { query } = req;

  // Handle root access with redirect to doc
  if (req.url === '/' || req.url === '') {
    res.writeHead(302, { Location: '/index.html' });
    return res.end();
  }

  // Parse bot path: /api/bot{token}/{method}
  const path = req.url.replace(/^\/api/, '').split('?')[0];
  const parts = path.split('/').filter(Boolean);

  if (parts.length < 2 || !parts[0].startsWith('bot')) {
    return res.status(400).send('Invalid bot request format');
  }

  const targetUrl = \`\${TELEGRAM_API_BASE}\${path}\${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}\`;

  try {
    const telegramRes = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      body: method !== 'GET' && method !== 'HEAD' ? req.body : undefined,
    });

    const contentType = telegramRes.headers.get('content-type') || 'application/json';
    const buffer = await telegramRes.arrayBuffer();

    res.status(telegramRes.status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end(Buffer.from(buffer));
  } catch (err) {
    res.status(500).send(\`Error proxying request: \${err.message}\`);
  }
}
