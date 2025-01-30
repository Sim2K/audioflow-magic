const https = require('https');
const fs = require('fs');
const path = require('path');

const files = [
  {
    url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
    output: '../netlify/functions/ffmpeg-core.js'
  },
  {
    url: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm',
    output: '../netlify/functions/ffmpeg-core.wasm'
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
