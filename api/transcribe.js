// api/transcribe.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { audioUrl } = await readJson(req);
    if (!audioUrl) return res.status(400).json({ error: 'audioUrl required' });

    // 1) Create transcript job
    const create = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: { authorization: process.env.ASSEMBLYAI_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ audio_url: audioUrl, speaker_labels: true })
    });
    const created = await create.json();
    if (!create.ok) throw new Error(created?.error || 'failed to create transcript');

    // 2) Poll until done
    while (true) {
      await sleep(3000);
      const poll = await fetch(`https://api.assemblyai.com/v2/transcript/${created.id}`, {
        headers: { authorization: process.env.ASSEMBLYAI_API_KEY }
      });
      const data = await poll.json();
      if (data.status === 'completed') return res.status(200).json({ text: data.text, raw: data });
      if (data.status === 'error') throw new Error(data.error || 'transcription error');
      // else queued/processing → continue
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }
async function readJson(req){
  const chunks=[]; for await (const c of req) chunks.push(c);
  const s = Buffer.concat(chunks).toString('utf8') || '{}';
  return JSON.parse(s);
}