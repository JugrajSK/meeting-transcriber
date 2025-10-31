// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
//
// function App() {
//   const [count, setCount] = useState(0)
//
//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }
//
// export default App


import React, { useState } from 'react';
import { Upload, FileAudio, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  mainCard: {
    maxWidth: '900px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    padding: '40px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: 0
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  },
  uploadBox: {
    border: '3px dashed #cbd5e0',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginBottom: '20px',
    background: '#f7fafc'
  },
  button: {
    width: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  buttonDisabled: {
    background: '#cbd5e0',
    cursor: 'not-allowed'
  },
  alert: {
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px'
  },
  alertError: {
    background: '#fff5f5',
    border: '1px solid #feb2b2',
    color: '#742a2a'
  },
  alertSuccess: {
    background: '#f0fff4',
    border: '1px solid #9ae6b4',
    color: '#22543d'
  },
  resultBox: {
    background: '#f7fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px'
  },
  resultContent: {
    background: 'white',
    borderRadius: '8px',
    padding: '16px',
    maxHeight: '300px',
    overflowY: 'auto',
    border: '1px solid #e2e8f0'
  },
  speakerLabel: {
    fontWeight: '600',
    color: '#667eea',
    marginBottom: '4px'
  }
};

export default function AudioTranscriber() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [assemblyApiKey, setAssemblyApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      setTranscript(null);
      setSummary('');
    }
  };

  const uploadToAssemblyAI = async (audioFile) => {
    const formData = new FormData();
    formData.append('file', audioFile);

    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': assemblyApiKey
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio file');
    }

    const uploadData = await uploadResponse.json();
    return uploadData.upload_url;
  };

  const transcribeAudio = async (audioUrl) => {
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': assemblyApiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speaker_labels: true
      })
    });

    if (!transcriptResponse.ok) {
      throw new Error('Failed to start transcription');
    }

    const transcriptData = await transcriptResponse.json();
    return transcriptData.id;
  };

  const pollTranscript = async (transcriptId) => {
    while (true) {
      const pollingResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            'authorization': assemblyApiKey
          }
        }
      );

      if (!pollingResponse.ok) {
        throw new Error('Failed to check transcription status');
      }

      const pollingData = await pollingResponse.json();

      if (pollingData.status === 'completed') {
        return pollingData;
      } else if (pollingData.status === 'error') {
        throw new Error('Transcription failed: ' + pollingData.error);
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  };



  const summarizeWithGPT = async (transcriptText) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
  content: `
ROLE: Clinical Documentation & Triage Assistant

PRIMARY OBJECTIVE
- From a raw doctor–patient conversation transcript, generate a structured medical record with highest priority on accurate HISTORY (CC, HPI, ROS, PMH, Meds, Allergies, FHx, SHx).
- Then propose a clinician-facing Differential Diagnosis and Treatment Plan. These are suggestions for review, not medical advice.

NON-NEGOTIABLE RULES
1) Faithfulness > completeness: Never invent facts. If information is not explicitly present, set the field to null and add it to "missing_fields".
2) Evidence mapping: For every key fact, reference transcript timestamps or speaker turns.
3) Preserve negations (patient denies, no fever, etc.) and uncertainty (likely, unsure).
4) Use standard clinical language and structure.
5) Suggestions (diagnosis or treatments) must be clinician-facing, never directly to patients.
6) If info is missing, do not guess — leave it null.
7) Prioritize accuracy of history over suggestions.

OUTPUT FORMAT
Return a patient records in this structure ONLY (obviously remove the "" around the topics and fix capitalization):
{
  "patient": { "name": null, "dob": null, "age": null, "sex": null },
  "history": {
    "chief_complaint": null,
    "hpi": { "onset": null, "location": null, "duration": null, "character": null, "aggravating": null, "relieving": null, "timing": null, "severity": null, "associated_symptoms_positive": [], "associated_symptoms_negative": [], "functional_impact": null },
    "ros": { "positives": [], "negatives": [] },
    "pmh": [],
    "psh": [],
    "medications": [],
    "allergies": [],
    "family_history": [],
    "social_history": { "tobacco": null, "alcohol": null, "substances": null, "occupation": null, "living_situation": null, "sexual_history": null }
  },
  "assessment": {
    "differential": [
      { "dx": "", "rationale": "", "confidence": 0.0 }
    ],
    "plan": [
      { "problem": "", "diagnostics": [], "treatments": [], "follow_up": null }
    ]
  },
  "quality_checks": {
    "missing_fields": [],
    "assumptions": [],
    "overall_confidence": 0.0
  }
}

After the JSON, include a short 5–8 sentence "Clinician Summary".

Do NOT include any extra commentary.
`},
          {
              role: 'user',
  content: `
You are given a doctor–patient conversation transcript: \n\n${transcriptText}. Your task is to:
1. Extract patient history accurately (chief complaint, HPI, ROS, PMH, meds, allergies, FHx, SHx).
2. Structure it according to the JSON format provided in the system prompt.
3. Only THEN generate differential diagnosis and treatment suggestions — but ONLY based on information in the transcript.
4. If information is unclear or missing, leave it as null or empty.

TRANSCRIPT BELOW:
[Insert transcript here — e.g., Speaker 1: ..., Speaker 2: ...]

Please respond ONLY in valid JSON (as shown in system prompt), followed by a short clinician summary.
`

          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select an audio file');
      return;
    }

    if (!assemblyApiKey || !openaiApiKey) {
      setError('Please enter both API keys');
      return;
    }

    try {
      setStatus('uploading');
      setError('');

      // Upload audio file
      const audioUrl = await uploadToAssemblyAI(file);

      // Start transcription
      setStatus('transcribing');
      const transcriptId = await transcribeAudio(audioUrl);

      // Poll for completion
      const transcriptData = await pollTranscript(transcriptId);
      setTranscript(transcriptData);

      // Format transcript with speaker labels
      let formattedTranscript = '';
      if (transcriptData.utterances) {
        formattedTranscript = transcriptData.utterances
          .map(utterance => `Speaker ${utterance.speaker}: ${utterance.text}`)
          .join('\n\n');
      } else {
        formattedTranscript = transcriptData.text;
      }

      // Generate summary
      setStatus('summarizing');
      const summaryText = await summarizeWithGPT(formattedTranscript);
      setSummary(summaryText);

      setStatus('completed');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <div style={styles.container}>
    <div style={styles.mainCard}>
    <div style={styles.header}>
    <FileAudio size={40} color="#667eea" />
    <h1 style={styles.title}>Audio Transcription & Summary</h1>
    </div>

    <div>
    <div style={styles.inputGroup}>
    <label style={styles.label}>AssemblyAI API Key</label>
    <input
    type="password"
    value={assemblyApiKey}
    onChange={(e) => setAssemblyApiKey(e.target.value)}
    placeholder="Enter your AssemblyAI API key"
    style={styles.input}
    />
    </div>

    <div style={styles.inputGroup}>
    <label style={styles.label}>OpenAI API Key</label>
    <input
    type="password"
    value={openaiApiKey}
    onChange={(e) => setOpenaiApiKey(e.target.value)}
    placeholder="Enter your OpenAI API key"
    style={styles.input}
    />
    </div>

    <div style={styles.uploadBox}>
    <input
    type="file"
    accept="audio/*"
    onChange={handleFileChange}
    style={{ display: 'none' }}
    id="audio-upload"
    />
    <label htmlFor="audio-upload" style={{ cursor: 'pointer', display: 'block' }}>
    <Upload size={48} color="#a0aec0" style={{ margin: '0 auto' }} />
    <p style={{ color: '#4a5568', fontSize: '16px', marginTop: '15px' }}>
    {file ? file.name : 'Click to upload audio file'}
    </p>
    <p style={{ color: '#a0aec0', fontSize: '14px' }}>
    Supports MP3, WAV, M4A, and more
    </p>
    </label>
    </div>

    <button
    onClick={handleProcess}
    disabled={!file || status === 'uploading' || status === 'transcribing' || status === 'summarizing'}
    style={{
      ...styles.button,
      ...(!file || status === 'uploading' || status === 'transcribing' || status === 'summarizing' ? styles.buttonDisabled : {})
    }}
    >
    {(status === 'uploading' || status === 'transcribing' || status === 'summarizing') ? (
      <>
      <Loader2 size={20} />
      {status === 'uploading' && 'Uploading...'}
      {status === 'transcribing' && 'Transcribing...'}
      {status === 'summarizing' && 'Generating Summary...'}
      </>
    ) : (
      'Process Audio'
    )}
    </button>

    {error && (
      <div style={{...styles.alert, ...styles.alertError}}>
      <AlertCircle size={20} style={{ flexShrink: 0 }} />
      <p style={{ margin: 0 }}>{error}</p>
      </div>
    )}

    {status === 'completed' && (
      <div style={{...styles.alert, ...styles.alertSuccess}}>
      <CheckCircle size={20} />
      <p style={{ margin: 0, fontWeight: 600 }}>Processing completed successfully!</p>
      </div>
    )}

    {transcript && (
      <div style={styles.resultBox}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Transcript</h2>
      <div style={styles.resultContent}>
      {transcript.utterances ? (
        transcript.utterances.map((utterance, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
          <div style={styles.speakerLabel}>Speaker {utterance.speaker}</div>
          <div style={{ color: '#2d3748' }}>{utterance.text}</div>
          </div>
        ))
      ) : (
        <p style={{ color: '#2d3748', margin: 0 }}>{transcript.text}</p>
      )}
      </div>
      </div>
    )}

    {summary && (
      <div style={styles.resultBox}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Summary</h2>
      <div style={styles.resultContent}>
      <p style={{ color: '#2d3748', margin: 0, whiteSpace: 'pre-wrap' }}>{summary}</p>
      </div>
      </div>
    )}
    </div>
    </div>
    </div>
  );
}
