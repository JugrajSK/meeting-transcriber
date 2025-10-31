# Audio Transcription & Summary App

A React-based web application that transcribes audio files with speaker identification using AssemblyAI and generates summaries using OpenAI's GPT-4.

## Features

- 🎤 Audio file upload (MP3, WAV, M4A, AAC, FLAC, OGG, OPUS)
- 👥 Speaker identification and labeling
- 📝 Automatic transcription using AssemblyAI
- 🤖 AI-powered summaries using GPT-4
- 💫 Beautiful gradient UI with inline styles

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

You'll also need API keys from:
- **AssemblyAI** - [Get your key](https://www.assemblyai.com/)
- **OpenAI** - [Get your key](https://platform.openai.com/)

## Installation

### Option 1: Using Vite (Recommended - Faster)

1. **Create a new React project with Vite:**
   ```bash
   npm create vite@latest audio-transcriber -- --template react
   cd audio-transcriber
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm install lucide-react
   ```

3. **Replace the default code:**
   - Open `src/App.jsx`
   - Delete all existing code
   - Paste in the complete code from the artifact

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:5173`

### Option 2: Using Create React App

1. **Create a new React app:**
   ```bash
   npx create-react-app audio-transcriber
   cd audio-transcriber
   ```

2. **Install Lucide React icons:**
   ```bash
   npm install lucide-react
   ```

3. **Replace the default code:**
   - Open `src/App.js`
   - Delete all existing code
   - Paste in the complete code from the artifact

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`

## Usage

1. **Enter API Keys:**
   - Paste your AssemblyAI API key in the first field
   - Paste your OpenAI API key in the second field

2. **Upload Audio File:**
   - Click on the upload area
   - Select an audio file from your computer
   - Supported formats: MP3, WAV, M4A, AAC, FLAC, OGG, OPUS

3. **Process Audio:**
   - Click the "Process Audio" button
   - Wait for the upload, transcription, and summarization to complete
   - This may take 1-3 minutes depending on audio length

4. **View Results:**
   - The transcript will appear with speaker labels
   - The AI-generated summary will appear below

## Troubleshooting

### "Transcoding failed" Error
- **Solution:** Make sure you're uploading a valid audio file (not a video)
- Try converting your file to MP3 format first
- Verify the file isn't corrupted by playing it in a media player

### API Key Errors
- Double-check that your API keys are correct
- Ensure your AssemblyAI account is active
- Verify your OpenAI account has available credits

### Port Already in Use
- **Vite (5173):** Change port with `npm run dev -- --port 3001`
- **CRA (3000):** The app will prompt you to use another port automatically

### Dependencies Installation Fails
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## File Structure

```
audio-transcriber/
├── node_modules/
├── public/
├── src/
│   ├── App.jsx (or App.js)  # Main application code
│   ├── index.css
│   └── main.jsx (or index.js)
├── package.json
└── README.md
```

## API Costs

- **AssemblyAI:** Free tier includes limited transcription minutes
- **OpenAI:** GPT-4 API calls are metered (typically $0.03-0.06 per summary)

Monitor your usage on respective dashboards:
- [AssemblyAI Dashboard](https://www.assemblyai.com/dashboard)
- [OpenAI Usage](https://platform.openai.com/usage)

## Technology Stack

- **React** - Frontend framework
- **Lucide React** - Icon library
- **AssemblyAI API** - Audio transcription with speaker diarization
- **OpenAI GPT-4 API** - Text summarization

## Notes

- Audio files are uploaded directly to AssemblyAI's servers
- No audio data is stored locally
- API keys are stored in component state (not persisted)
- For production use, implement proper API key management

## Support

For issues related to:
- **AssemblyAI:** Visit [AssemblyAI Documentation](https://www.assemblyai.com/docs)
- **OpenAI:** Visit [OpenAI Documentation](https://platform.openai.com/docs)
- **React/Vite:** Visit official documentation

## License

MIT License - Feel free to use and modify as needed!
