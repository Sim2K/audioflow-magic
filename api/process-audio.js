import multer from 'multer';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import axios from 'axios';
import FormData from 'form-data';

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false, // Needed for Multer
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  upload.single('file')(req, {}, async (err) => {
    if (err) return res.status(500).json({ error: 'File upload failed' });

    console.log('Received audio processing request:', {
      isIOS: req.body?.isIOS,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype,
    });

    const isIOS = req.body?.isIOS === 'true';
    if (!isIOS || !req.file) {
      console.log('Returning original file (not iOS or no file)');
      return res.send(req.file.buffer);
    }

    try {
      const ffmpeg = new FFmpeg();
      await ffmpeg.load({
        coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
      });

      // Write uploaded file to ffmpeg virtual filesystem
      await ffmpeg.writeFile('input.m4a', req.file.buffer);

      // Convert the audio to webm format
      await ffmpeg.exec([
        '-i', 'input.m4a',
        '-c:a', 'libopus',
        '-b:a', '16k',
        '-ar', '16000',
        '-ac', '1',
        'output.webm',
      ]);

      // Read the converted audio data
      const data = await ffmpeg.readFile('output.webm');

      // Prepare form data for Whisper API
      const formData = new FormData();
      formData.append('file', Buffer.from(data), {
        filename: 'audio.webm',
        contentType: 'audio/webm',
      });
      formData.append('model', 'whisper-1');

      // Send to Whisper API for transcription
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      // Return the JSON response from Whisper
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Audio processing/transcription error:', error);
      res.status(500).json({ error: 'Audio transcription failed', details: error.message });
    }
  });
}