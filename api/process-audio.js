import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import axios from 'axios';
import FormData from 'form-data';
import stream from 'stream';

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
      // Convert the uploaded audio to webm using fluent-ffmpeg
      const outputBuffer = await convertToWebm(req.file.buffer);

      // Prepare form data for Whisper API
      const formData = new FormData();
      formData.append('file', outputBuffer, {
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

// Function to convert audio to webm using fluent-ffmpeg
function convertToWebm(inputBuffer) {
  return new Promise((resolve, reject) => {
    const inputStream = new stream.PassThrough();
    const outputStream = new stream.PassThrough();
    const chunks = [];

    inputStream.end(inputBuffer);

    outputStream.on('data', (chunk) => chunks.push(chunk));
    outputStream.on('end', () => resolve(Buffer.concat(chunks)));
    outputStream.on('error', reject);

    ffmpeg(inputStream)
      .setFfmpegPath(ffmpegStatic) // Use static FFmpeg binary
      .inputFormat('m4a')
      .audioCodec('libopus')
      .audioBitrate('16k')
      .audioChannels(1)
      .audioFrequency(16000)
      .format('webm')
      .on('error', reject)
      .pipe(outputStream, { end: true });
  });
}