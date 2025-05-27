import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const TELEGRAM_API_BASE = 'https://api.telegram.org';

  try {
    const urlPath = req.url.replace(/^\\/api/, '');
    const fullUrl = TELEGRAM_API_BASE + urlPath + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
    
    console.log('[Proxy] Incoming request:', req.method, fullUrl);

    const rawBody = req.method !== 'GET' ? await buffer(req) : undefined;
    if (rawBody) console.log('[Proxy] Body:', rawBody.toString());

    const telegramRes = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
      },
      body: rawBody,
    });

    const data = await telegramRes.text();
    console.log('[Proxy] Telegram response status:', telegramRes.status);
    console.log('[Proxy] Telegram response body:', data);

    res.status(telegramRes.status);
    res.setHeader('Content-Type', telegramRes.headers.get('content-type') || 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.send(data);
  } catch (err) {
    console.error('[Proxy] Error:', err.message);
    res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
