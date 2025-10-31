/* eslint-env node */
/* global process, Buffer */

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '20mb',
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // Read raw bytes from the request
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // Forward to AssemblyAI upload
    const up = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY || '',
        'content-length': String(buffer.length),
        'content-type': 'application/octet-stream',
      },
      body: buffer,
    });

    const contentType = up.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!up.ok) {
      const errBody = isJson ? await up.json().catch(() => ({})) : await up.text().catch(() => '');
      const msg = isJson ? (errBody?.error || JSON.stringify(errBody)) : errBody;
      return res.status(up.status).json({ error: msg || `AssemblyAI upload failed (${up.status})` });
    }

    const data = isJson ? await up.json() : await up.text();
    // AssemblyAI returns { upload_url: "..." }
    const url = typeof data === 'string' ? data : data?.upload_url;

    if (!url) {
      return res.status(500).json({ error: 'No upload_url returned from AssemblyAI' });
    }

    return res.status(200).json({ url });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}