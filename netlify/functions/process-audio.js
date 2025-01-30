const { createFFmpeg } = require('@ffmpeg/ffmpeg');
const ffmpeg = createFFmpeg({ log: true });

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    // Parse multipart form data
    const formData = JSON.parse(event.body);
    const audioData = formData.file;
    
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    // Write input file
    ffmpeg.FS('writeFile', 'input.m4a', await fetch(audioData).then(r => r.arrayBuffer()));

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
      body: Buffer.from(data).toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('Error processing audio:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process audio' })
    };
  }
};
