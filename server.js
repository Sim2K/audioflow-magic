import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/process-audio', upload.single('file'), async (req, res) => {
  console.log('Received audio processing request:', {
    isIOS: req.body.isIOS,
    fileSize: req.file?.size,
    mimeType: req.file?.mimetype
  });

  const isIOS = req.body.isIOS === 'true';
  
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
      'output.webm'
    ]);
    
    const data = await ffmpeg.readFile('output.webm');
    res.set('Content-Type', 'audio/webm');
    res.send(Buffer.from(data));
  } catch (error) {
    console.error('Audio processing error:', error);
    res.send(req.file.buffer);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check available at: http://localhost:${port}/api/health`);
});
