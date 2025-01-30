const https = require('https');
const fs = require('fs');
const path = require('path');

const __filename = __filename;
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
  const outputPath = path.join(__dirname, output);
  const outputDir = path.dirname(outputPath);
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const file = fs.createWriteStream(outputPath);
  https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();
      console.log(`Downloaded ${url} to ${output}`);
    });
  }).on('error', function(err) {
    fs.unlink(outputPath, () => {});
    console.error(`Error downloading ${url}:`, err.message);
  });
}

files.forEach(file => download(file.url, file.output));
