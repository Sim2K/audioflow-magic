import multer from 'multer';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static'; // Static binary
import stream from 'stream';
import FormData from 'form-data';
import axios from 'axios';

// Multer config for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

// Resolve to the correct location during runtime
const ffmpegPath = path.resolve(ffmpegStatic);

export const config = {
  api: {
    bodyParser: false, // Disable default bodyParser for Multer to work
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  upload.single('file')(req, {}, async (err) => {
    if (err) return res.status(500).json({ error: 'File upload failed' });

    try {
      console.log('Received audio for transcription, processing with FFmpeg...');

      // Set ffmpeg path from ffmpeg-static
      //ffmpeg.setFfmpegPath(ffmpegStatic);

      // Set FFmpeg path for fluent-ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

      // Convert in-memory file to webm using fluent-ffmpeg
      const outputBuffer = await convertToWebm(req.file.buffer);

      // Prepare form data for Whisper API
      const formData = new FormData();
      formData.append('file', outputBuffer, {
        filename: 'audio.webm',
        contentType: 'audio/webm',
      });
      formData.append('model', 'whisper-1');

      // Send to Whisper API
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      // Return the Whisper transcript
      res.status(200).json(response.data);
    } catch (error) {
      console.error('Audio transcription failed:', error);
      res.status(500).json({ error: 'Audio transcription failed', details: error.message });
    }
  });
}

// Function to convert audio to webm using fluent-ffmpeg
function convertToWebm(inputBuffer) {
  return new Promise((resolve, reject) => {
    const outputStream = new stream.PassThrough();
    const inputStream = new stream.PassThrough();
    inputStream.end(inputBuffer);

    const chunks = [];
    outputStream.on('data', (chunk) => chunks.push(chunk));
    outputStream.on('end', () => resolve(Buffer.concat(chunks)));
    outputStream.on('error', reject);

    ffmpeg(inputStream)
      .inputFormat('m4a')
      .audioCodec('libopus')
      .audioBitrate(16)
      .audioChannels(1)
      .audioFrequency(16000)
      .format('webm')
      .on('error', reject)
      .pipe(outputStream, { end: true });
  });
}
