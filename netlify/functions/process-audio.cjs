const { createFFmpeg } = require('@ffmpeg/ffmpeg');
const busboy = require('busboy');
const path = require('path');
const axios = require('axios');  // New dependency for sending requests to Whisper
const FormData = require('form-data');

// Initialize FFmpeg
const ffmpeg = createFFmpeg({
  log: true,
  corePath: require.resolve('@ffmpeg/core')
});

function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    const bb = busboy({ headers: event.headers });

    bb.on('file', (name, file) => {
      file.on('data', (data) => buffers.push(data));
    });

    bb.on('close', () => {
      resolve(Buffer.concat(buffers));
    });

    bb.on('error', reject);
    bb.write(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'));
    bb.end();
  });
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const file = await parseMultipartForm(event);

    // Convert to webm format (if needed)
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    ffmpeg.FS('writeFile', 'input.m4a', file);
    await ffmpeg.run('-i', 'input.m4a', '-c:a', 'libopus', 'output.webm');
    const processedFile = ffmpeg.FS('readFile', 'output.webm');

    // Prepare the Whisper API request
    const formData = new FormData();
    formData.append('file', Buffer.from(processedFile), {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    formData.append('model', 'whisper-1');

    const whisperResponse = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(whisperResponse.data)
    };
  } catch (error) {
    console.error('Error processing audio:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Audio transcription failed', details: error.message })
    };
  }
};
