const { createFFmpeg } = require('@ffmpeg/ffmpeg');
const busboy = require('busboy');

// Initialize FFmpeg with CORS settings
const ffmpeg = createFFmpeg({
  log: true,
  corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js'
});

function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const buffers = [];
    
    const bb = busboy({ headers: event.headers });
    
    bb.on('file', (name, file, info) => {
      file.on('data', (data) => {
        buffers.push(data);
      });
    });
    
    bb.on('field', (name, val) => {
      fields[name] = val;
    });
    
    bb.on('close', () => {
      resolve({
        fields,
        file: Buffer.concat(buffers)
      });
    });
    
    bb.on('error', reject);
    
    bb.write(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
    bb.end();
  });
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: 'Method Not Allowed'
    };
  }

  try {
    // Parse the multipart form data
    const { file } = await parseMultipartForm(event);
    
    // Load FFmpeg if not already loaded
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    // Write input file
    ffmpeg.FS('writeFile', 'input.m4a', file);

    // Run FFmpeg command
    await ffmpeg.run('-i', 'input.m4a', '-c:a', 'libopus', 'output.webm');

    // Read the output file
    const data = ffmpeg.FS('readFile', 'output.webm');

    // Clean up
    ffmpeg.FS('unlink', 'input.m4a');
    ffmpeg.FS('unlink', 'output.webm');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/webm',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: data.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Error processing audio:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: 'Failed to process audio',
        details: error.message 
      })
    };
  }
};
