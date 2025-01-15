import { StorageKeys } from './storage';
import { Flow } from './storage';

const DEFAULT_COMPLETION_ENDPOINT = 'v1/completions';

interface WhisperResponse {
  text: string;
}

export async function transcribeAudio(audioBlob: Blob, flow: Flow): Promise<{ transcript: string; processedResponse: any }> {
  const apiKey = localStorage.getItem(StorageKeys.OPENAI_API_KEY);
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please add it in Settings.');
  }

  try {
    // Check file size first
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    if (audioBlob.size > MAX_FILE_SIZE) {
      throw new Error(`Audio file size (${(audioBlob.size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum limit of 25MB. Please record a shorter message or check audio settings.`);
    }

    // Warn if file size is approaching limit
    if (audioBlob.size > MAX_FILE_SIZE * 0.8) {
      console.warn(`Audio file size (${(audioBlob.size / 1024 / 1024).toFixed(2)}MB) is approaching the 25MB limit.`);
    }

    // Calculate chunks if file is large (over 24MB)
    const MAX_CHUNK_SIZE = 24 * 1024 * 1024; // 24MB
    let transcriptParts: string[] = [];
    
    if (audioBlob.size > MAX_CHUNK_SIZE) {
      // Split into chunks
      const chunks = Math.ceil(audioBlob.size / MAX_CHUNK_SIZE);
      for (let i = 0; i < chunks; i++) {
        const start = i * MAX_CHUNK_SIZE;
        const end = Math.min((i + 1) * MAX_CHUNK_SIZE, audioBlob.size);
        const chunk = audioBlob.slice(start, end, audioBlob.type);
        
        // Transcribe chunk
        const formData = new FormData();
        formData.append('file', chunk, `chunk.${audioBlob.type.split('/')[1]}`);
        formData.append('model', 'whisper-1');
        
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Transcription error details:', errorData);
          throw new Error(`Transcription failed: ${response.statusText}. ${errorData.error?.message || ''}`);
        }

        const result: WhisperResponse = await response.json();
        transcriptParts.push(result.text);
      }
    } else {
      // Transcribe entire file
      const formData = new FormData();
      formData.append('file', audioBlob, `audio.${audioBlob.type.split('/')[1]}`);
      formData.append('model', 'whisper-1');

      console.log('Sending audio for transcription:', {
        type: audioBlob.type,
        size: audioBlob.size,
        filename: `audio.${audioBlob.type.split('/')[1]}`
      });

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Transcription error details:', errorData);
        throw new Error(`Transcription failed: ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const result: WhisperResponse = await response.json();
      transcriptParts = [result.text];
    }

    // Clean and join transcript parts
    const cleanTranscript = transcriptParts
      .map(part => part?.trim() || '')
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const transcript = cleanTranscript;

    // Process with GPT-4
    const endpoint = flow.endpoint || DEFAULT_COMPLETION_ENDPOINT;
    const completionResponse = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: flow.model || 'gpt-4',
        messages: [
          { role: 'system', content: flow.systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: transcript }
        ],
        temperature: flow.temperature || 0.7,
        max_tokens: flow.maxTokens || 500,
      }),
    });

    if (!completionResponse.ok) {
      const errorData = await completionResponse.json().catch(() => ({}));
      console.error('GPT processing error details:', errorData);
      throw new Error(`GPT processing failed: ${completionResponse.statusText}. ${errorData.error?.message || ''}`);
    }

    const processedResponse = await completionResponse.json();

    return {
      transcript,
      processedResponse
    };

  } catch (error) {
    console.error('Transcription/processing error:', error);
    throw error;
  }
}

async function convertToMp3(audioBuffer: AudioBuffer): Promise<Blob> {
  // Create an offline context
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  // Create buffer source
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start();

  // Render audio
  const renderedBuffer = await offlineContext.startRendering();

  // Convert to WAV format (since browser MP3 encoding is not widely supported)
  const wavBlob = await new Promise<Blob>((resolve) => {
    const length = renderedBuffer.length * 2;
    const view = new DataView(new ArrayBuffer(44 + length));

    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, renderedBuffer.numberOfChannels, true);
    view.setUint32(24, renderedBuffer.sampleRate, true);
    view.setUint32(28, renderedBuffer.sampleRate * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    const data = new Float32Array(renderedBuffer.length);
    renderedBuffer.copyFromChannel(data, 0);
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    resolve(new Blob([view], { type: 'audio/wav' }));
  });

  return wavBlob;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
