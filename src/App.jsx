import React, { useState } from 'react';
import { Upload, FileAudio, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { upload as blobUpload } from '@vercel/blob/client';

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
  inputGroup: { marginBottom: '20px' },
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
  buttonDisabled: { background: '#cbd5e0', cursor: 'not-allowed' },
  alert: {
    padding: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '20px'
  },
  alertError: { background: '#fff5f5', border: '1px solid #feb2b2', color: '#742a2a' },
  alertSuccess: { background: '#f0fff4', border: '1px solid #9ae6b4', color: '#22543d' },
  resultBox: { background: '#f7fafc', borderRadius: '12px', padding: '24px', marginBottom: '20px' },
  resultContent: {
    background: 'white', borderRadius: '8px', padding: '16px',
    maxHeight: '300px', overflowY: 'auto', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap'
  }
};

export default function AudioTranscriber() {
  const [file, setFile] = useState(null);
  const [audioUrlInput, setAudioUrlInput] = useState(''); // NEW — optional public URL
  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError('');
    setTranscript('');
    setSummary('');
    setStatus('idle');
  };

  // ---- Upload: direct to Vercel Blob (no size limit) ----
  async function uploadDirectToBlob(f) {
    const out = await blobUpload(f.name, f, {
      access: 'public',
      handleUploadUrl: '/api/blob-upload', // our API route above
      // onUploadProgress: (p) => console.log('upload', p.percentage)
    });
    return out.url; // public URL
  }

  async function transcribeAudioUrl(audioUrl) {
    const r = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ audioUrl })
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Transcription failed');
    return j.text;
  }

  async function summarizeTranscript(text) {
    const r = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ transcript: text })
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || 'Summarization failed');
    return j.summary;
  }

  const handleProcess = async () => {
    try {
      setError('');
      setTranscript('');
      setSummary('');

      // If user pasted a URL, use it directly; otherwise upload the file
      let audioUrl = audioUrlInput.trim();
      if (!audioUrl) {
        if (!file) {
          setError('Please select a file or paste a public audio URL');
          return;
        }
        setStatus('uploading');
        audioUrl = await uploadDirectToBlob(file);
      }

      setStatus('transcribing');
      const text = await transcribeAudioUrl(audioUrl);
      setTranscript(text);

      setStatus('summarizing');
      const s = await summarizeTranscript(text);
      setSummary(s);

      setStatus('completed');
    } catch (e) {
      setError(e.message || 'Something went wrong');
      setStatus('error');
    }
  };

  // One-click sample (no upload)
  async function useSampleAudio() {
    try {
      setError('');
      setTranscript('');
      setSummary('');
      setStatus('transcribing');

      const sampleUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      const text = await transcribeAudioUrl(sampleUrl);
      setTranscript(text);

      setStatus('summarizing');
      const s = await summarizeTranscript(text);
      setSummary(s);

      setStatus('completed');
    } catch (e) {
      setError(e.message || 'Sample failed');
      setStatus('error');
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.mainCard}>
        <div style={styles.header}>
          <FileAudio size={40} color="#667eea" />
          <h1 style={styles.title}>Audio Transcription & Summary</h1>
        </div>

        {/* Upload box */}
        <div style={styles.uploadBox}>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="audio-upload"
          />
          <label htmlFor="audio-upload" style={{ cursor: 'pointer', display: 'block' }}>
            <Upload size={48} color="#a0aec0" style={{ margin: '0 auto' }} />
            <p style={{ color: '#4a5568', fontSize: '16px', marginTop: '15px' }}>
              {file ? file.name : 'Click to upload audio (or video) file'}
            </p>
            <p style={{ color: '#a0aec0', fontSize: '14px' }}>
              Supports MP3, WAV, M4A, MP4 and more
            </p>
          </label>
        </div>

        {/* Optional: paste a public URL (skips uploading) */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Or paste a public audio URL (optional)</label>
          <input
            type="url"
            value={audioUrlInput}
            onChange={(e) => setAudioUrlInput(e.target.value)}
            placeholder="https://example.com/file.mp3 (Dropbox: share link + ?dl=1)"
            style={styles.input}
          />
          <small style={{ color: '#718096' }}>
            If provided, we’ll skip uploading and transcribe this URL directly.
          </small>
        </div>

        <button
          onClick={handleProcess}
          disabled={['uploading','transcribing','summarizing'].includes(status) || (!file && !audioUrlInput)}
          style={{
            ...styles.button,
            ...( ['uploading','transcribing','summarizing'].includes(status) || (!file && !audioUrlInput)
              ? styles.buttonDisabled
              : {}
            )
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

        <button
          onClick={useSampleAudio}
          style={{ ...styles.button, background: '#475569', marginTop: 8 }}
        >
          Try with Sample Audio (no upload)
        </button>

        {error && (
          <div style={{ ...styles.alert, ...styles.alertError }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {status === 'completed' && (
          <div style={{ ...styles.alert, ...styles.alertSuccess }}>
            <CheckCircle size={20} />
            <p style={{ margin: 0, fontWeight: 600 }}>Processing completed successfully!</p>
          </div>
        )}

        {transcript && (
          <div style={styles.resultBox}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Transcript</h2>
            <div style={styles.resultContent}>
              <p style={{ color: '#2d3748', margin: 0 }}>{transcript}</p>
            </div>
          </div>
        )}

        {summary && (
          <div style={styles.resultBox}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Summary</h2>
            <div style={styles.resultContent}>
              <p style={{ color: '#2d3748', margin: 0 }}>{summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}