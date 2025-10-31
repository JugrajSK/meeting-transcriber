/* eslint-env node */
/* global Buffer */

import { handleUpload } from '@vercel/blob/client';

export const config = {
  // We’ll read JSON ourselves and pass a fresh Request to handleUpload
  api: { bodyParser: false },
};

async function readText(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    // 1) Read JSON body safely (don’t reuse the original stream)
    const raw = await readText(req);
    const body = raw ? JSON.parse(raw) : {};

    // 2) Create a brand-new WHATWG Request with a string body
    const request = new Request(`http://${req.headers.host}${req.url}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    // 3) Ask Vercel Blob to generate a one-time client upload token
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        // allow audio/video from browser; public is fine for test links
        allowedContentTypes: ['audio/*', 'video/*'],
        access: 'public',
        addRandomSuffix: true,
      }),
      // optional; won’t fire in local dev, but fine to keep
      onUploadCompleted: async ({ blob }) => {
        console.log('Blob upload completed:', blob.url);
      },
    });

    res.status(200).json(json);
  } catch (e) {
    console.error('blob-upload error:', e);
    res.status(400).json({ error: e.message || 'Failed to create upload token' });
  }
}