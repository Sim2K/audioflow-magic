import multer from 'multer';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import FormData from 'form-data';
import axios from 'axios';

// Multer config for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // Disable default bodyParser for Multer to work
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Upload the audio file
  upload.single('file')(req, {}, async (err) => {
    if (err) return res.status(500).json({ error: 'File upload failed' });

    try {
      console.log('Processing audio for transcription...');
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
      });

      // Write uploaded audio to ffmpeg
      await ffmpeg.writeFile('input.m4a', req.file.buffer);

      // Convert audio to webm format
      await ffmpeg.exec([
        '-i', 'input.m4a',
        '-c:a', 'libopus',
        '-b:a', '16k',
        '-ar', '16000',
        '-ac', '1',
        'output.webm',
      ]);

      // Read the converted audio
      const convertedAudio = await ffmpeg.readFile('output.webm');

      // Prepare form data for Whisper API
      const formData = new FormData();
      formData.append('file', Buffer.from(convertedAudio), {
        filename: 'audio.webm',
        contentType: 'audio/webm',
      });
      formData.append('model', 'whisper-1');

      // Send audio to Whisper API
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      // Return the transcript
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Audio processing/transcription error:', error);
      res.status(500).json({ error: 'Audio transcription failed', details: error.message });
    }
  });
}