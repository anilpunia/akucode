// Vercel Serverless Function — proxies Gemini so the API key never reaches the browser.
//
// On Vercel, set an env var named GEMINI_API_KEY (NOT prefixed with VITE_).
// The browser calls /api/gemini with { prompt, generationConfig } and this
// function adds the key server-side. The key is never in the client bundle.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing GEMINI_API_KEY' });
    return;
  }

  try {
    const { prompt, generationConfig } = req.body || {};
    if (!prompt) {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
      apiKey;

    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: generationConfig || { temperature: 0.7 },
      }),
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gemini proxy failed', detail: String(err) });
  }
}
