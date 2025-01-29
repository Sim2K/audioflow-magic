import { createFFmpeg } from '@ffmpeg/ffmpeg';

export async function POST(request: Request) {
  const formData = await request.formData();
  const audioFile = formData.get('file') as File;
  const isIOS = formData.get('isIOS') === 'true';
  
  if (!isIOS) {
    return new Response(audioFile);
  }

  try {
    // Convert to WebM using ffmpeg
    const inputBuffer = await audioFile.arrayBuffer();
    const ffmpeg = createFFmpeg();
    await ffmpeg.load();
    
    ffmpeg.FS('writeFile', 'input.m4a', new Uint8Array(inputBuffer));
    
    await ffmpeg.run(
      '-i', 'input.m4a',
      '-c:a', 'libopus',
      '-b:a', '16k',
      '-ar', '16000',
      '-ac', '1',
      'output.webm'
    );
    
    const data = ffmpeg.FS('readFile', 'output.webm');
    const processedBlob = new Blob([data.buffer], { type: 'audio/webm' });
    
    return new Response(processedBlob);
  } catch (error) {
    console.error('Audio processing error:', error);
    return new Response(audioFile);
  }
}
