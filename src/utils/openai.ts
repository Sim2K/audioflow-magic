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
    // Convert WebM to mp3 format using Web Audio API
    const audioData = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    
    // Create MP3 blob
    const mp3Blob = await convertToMp3(audioBuffer);
    
    // First step: Transcribe audio using Whisper
    const formData = new FormData();
    formData.append('file', mp3Blob, 'audio.mp3');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to transcribe audio');
    }

    const data: WhisperResponse = await response.json();
    const transcript = data.text;

    // Second step: Process transcript with GPT-4
    // Use flow.endpoint if provided, otherwise use default
    const endpoint = flow.endpoint || DEFAULT_COMPLETION_ENDPOINT;
    
    const completionResponse = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: [
              {
                text: "You are a very helpful assistant. You are good at creating summaries from transcriptions and following user's requests/actions/tasks to action on translations given. You think step by step to make the best use of the JSON schema given to use to respond to the user.",
                type: "text"
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                text: `Read the {Instructions} which will instruct you on how to work with the given {transcript}. Respond using the format shown in the {JSON Template}.

Instructions:
${flow.prompt}

'Transcript':
${transcript}

'JSON Template':
${flow.format}`,
                type: "text"
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!completionResponse.ok) {
      const error = await completionResponse.json();
      throw new Error(error.error?.message || 'Failed to process transcript');
    }

    const completionData = await completionResponse.json();
    const processedResponse = JSON.parse(completionData.choices[0].message.content);

    return {
      transcript,
      processedResponse
    };
  } catch (error) {
    console.error('Error in transcription process:', error);
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
