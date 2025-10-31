// api/blob-sign.js
import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { filename, contentType } = await readJson(req);
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType required' });
    }

    // Create a new public blob key (empty object now) to get a URL,
    // client will immediately PUT the actual bytes to this URL.
    const { url } = await put(filename, new Blob(['']), { access: 'public', contentType });
    return res.status(200).json({ uploadUrl: url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

async function readJson(req){
  const chunks=[]; for await (const c of req) chunks.push(c);
  const s = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(s);
}