import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  {
    url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
    output: '../public/ffmpeg-core.js'
  },
  {
    url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm',
    output: '../public/ffmpeg-core.wasm'
  }
];

function download(url, output) {
  const file = fs.createWriteStream(path.join(__dirname, output));
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
      console.log(`Downloaded ${url} to ${output}`);
    });
  }).on('error', function(err) {
    fs.unlink(output);
    console.error(`Error downloading ${url}:`, err.message);
  });
}

files.forEach(file => download(file.url, file.output));
