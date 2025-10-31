// api/summarize.js
/* global process */

import { Buffer } from 'node:buffer';

/* eslint-env node */

export const config = {
  api: { bodyParser: true }, // parse JSON automatically
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { transcript } = req.body || {};
  if (!transcript) return res.status(400).json({ error: 'transcript required' });

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Summarize meeting transcripts into concise bullets with action items & decisions.' },
          { role: 'user', content: `Summarize this transcript:\n\n${transcript}` },
        ],
        temperature: 0.2,
      }),
    });

    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || 'OpenAI error');

    const summary = j?.choices?.[0]?.message?.content || '';
    return res.status(200).json({ summary });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}