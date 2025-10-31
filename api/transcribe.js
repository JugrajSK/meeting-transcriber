// api/transcribe.js
/* eslint-env node */
/* global process */

import { Buffer } from 'node:buffer';

export const config = {
  api: { bodyParser: true }, // let Vercel parse JSON
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { audioUrl } = req.body || {};
  if (!audioUrl) return res.status(400).json({ error: 'audioUrl required' });

  try {
    const AAI_KEY = process.env.ASSEMBLYAI_API_KEY;

    // 1) create transcript
    const create = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: AAI_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ audio_url: audioUrl, speaker_labels: true }),
    });
    const created = await create.json();
    if (!create.ok) throw new Error(created.error || 'failed to create transcript');

    // 2) poll
    while (true) {
      await new Promise((r) => setTimeout(r, 3000));
      const poll = await fetch(`https://api.assemblyai.com/v2/transcript/${created.id}`, {
        headers: { authorization: AAI_KEY },
      });
      const data = await poll.json();

      if (data.status === 'completed') {
        return res.status(200).json({ text: data.text, raw: data });
      }
      if (data.status === 'error') {
        throw new Error(data.error || 'transcription error');
      }
      // else: queued/processing → loop
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}