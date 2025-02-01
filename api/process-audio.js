import multer from 'multer';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

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

      await ffmpeg.writeFile('input.m4a', req.file.buffer);
      await ffmpeg.exec([
        '-i', 'input.m4a',
        '-c:a', 'libopus',
        '-b:a', '16k',
        '-ar', '16000',
        '-ac', '1',
        'output.webm',
      ]);

      const data = await ffmpeg.readFile('output.webm');
      res.setHeader('Content-Type', 'audio/webm');
      res.send(Buffer.from(data));
    } catch (error) {
      console.error('Audio processing error:', error);
      res.send(req.file.buffer);
    }
  });
}