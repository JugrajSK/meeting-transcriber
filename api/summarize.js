// api/summarize.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = await readJson(req);
    const transcript = body?.transcript;
    if (!transcript) return res.status(400).json({ error: 'transcript required' });

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You summarize meeting transcripts. Output concise bullet points with action items and decisions.' },
          { role: 'user', content: `Summarize this transcript:\n\n${transcript}` }
        ],
        temperature: 0.2
      })
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || 'OpenAI error');

    const summary = j?.choices?.[0]?.message?.content || '';
    return res.status(200).json({ summary });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

async function readJson(req){
  const chunks=[]; for await (const c of req) chunks.push(c);
  const s = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(s);
}