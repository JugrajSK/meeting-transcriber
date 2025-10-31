/* eslint-env node */
import { put } from '@vercel/blob';
import { Buffer } from 'node:buffer';

export const config = {
  api: {
    bodyParser: false,         // read raw stream
    sizeLimit: '10mb'          // keep small for local testing
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const filename = req.headers['x-filename'] || `upload-${Date.now()}`;
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    // Read raw body into a Buffer
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    // 👉 Provide the byte length explicitly
    const { url } = await put(filename, buffer, {
      access: 'public',
      contentType,
      contentLength: buffer.length,   // <-- important
    });

    return res.status(200).json({ url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}