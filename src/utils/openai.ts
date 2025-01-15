import { StorageKeys } from './storage';
import { Flow } from './storage';
import { formatConfigs, SupportedFormat } from './audioTypes';

const DEFAULT_COMPLETION_ENDPOINT = 'v1/completions';

interface WhisperResponse {
  text: string;
}

async function prepareAudioForUpload(audioBlob: Blob, format: SupportedFormat): Promise<FormData> {
  const formData = new FormData();
  const config = formatConfigs[format];
  
  // Check if file needs to be chunked (>25MB)
  if (audioBlob.size > 25 * 1024 * 1024) {
    console.log('Audio file too large, chunking...');
    const chunkSize = 20 * 1024 * 1024; // 20MB chunks
    const chunks = Math.ceil(audioBlob.size / chunkSize);
    
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, audioBlob.size);
      const chunk = audioBlob.slice(start, end, `${config.mimeType};codecs=${config.codec}`);
      formData.append('file', chunk, `chunk_${i}.${config.extension}`);
    }
  } else {
    formData.append('file', audioBlob, `audio.${config.extension}`);
  }
  
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');
  
  return formData;
}

export async function transcribeAudio(audioBlob: Blob, flow: Flow): Promise<{ transcript: string; processedResponse: any }> {
  const apiKey = localStorage.getItem(StorageKeys.OPENAI_API_KEY);
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  try {
    console.log('Starting transcription with blob:', {
      size: audioBlob.size,
      type: audioBlob.type
    });

    // Create FormData
    const formData = new FormData();
    
    // Convert to mp3 format for better compatibility
    const audioData = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(audioData);
    const mp3Blob = await convertToMp3(audioBuffer);
    
    console.log('Converted audio to MP3:', {
      originalSize: audioBlob.size,
      mp3Size: mp3Blob.size,
      mp3Type: mp3Blob.type
    });

    formData.append('file', mp3Blob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    console.log('Sending request to OpenAI');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Transcription failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result: WhisperResponse = await response.json();
    const cleanTranscript = result.text.trim();

    // Process the response based on the flow
    const processedResponse = await processTranscriptionResponse(cleanTranscript, flow);

    return {
      transcript: cleanTranscript,
      processedResponse
    };
  } catch (error) {
    console.error('Transcription error details:', error);
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

async function processTranscriptionResponse(transcript: string, flow: Flow): Promise<any> {
  const apiKey = localStorage.getItem(StorageKeys.OPENAI_API_KEY);
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  // Process with GPT-4
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
              text: `Read the {Instructions} which will instruct you on how to work with the given {transcript}. Respond using the format shown in the {JSON Template} and add at the top of the {JSON Template} a generated title based on the contents of the {JSON Template} and the key pair holding that data will look like this, "theFlowTitle": " ... a title representing the contents of the {JSON Template} ...". This will sit at the start of every JSON response object and be named "theFlowTitle". "theFlowTitle" will be independent of any details in the {JSON Template}, for example, if 'title' exists in the {JSON Template}, then both 'title' and 'theFlowTitle' will be shown.

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
  return JSON.parse(completionData.choices[0].message.content);
}
