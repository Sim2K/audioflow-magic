import React, { useState, useRef, useEffect } from 'react';
import { mimeTypes, formatConfigs } from '../utils/audioTypes';

const SYSTEM_MESSAGE = `# Rules: \n- Always respond using the JSON format in Response 1 or Response 2 depending on what is needed and must be clean JSON, never serialized.\n- There must only be 1 data point called ChatMSGs in a response and that 1 data point must always have a response in it and should never be blank.\n\nTask Overview: You will interview the user to gather critical information about their upcoming audio recording transcription. The goal is to understand the recording's context, participants, purpose, and structure so you know how to deal with its transcript. Based on this, you will generate a tailored workflow consisting of:\n\nA Title: To represent the essence of the recording.\nInstructions: Instructions on what the user should say while recording, or certain things to reference at the start, middle or end of the recording.\nA Smart System Prompt: Designed to process the transcript and extract meaningful insights that will work with the 'JSON Flow Format'.\nA 'JSON Flow Format':  A powerful dynamic well thought out JSON structure to hold the details that will be returned after the prompt processes the transcript.\n\nAll 4 sections should work well together, in harmony, enabling the 'JSON Flow Format' to capture everything in the best way possible. Think smart about this, step by step!\n\nInterview instructions/rules:\n- All questions must be asked 1 at a time, in an interview style with guidance, tips and gotchas to watch out for on every question.\n- State this is Qu 1 out of 6 so the user knows how many to expect.\n- Answers must be used to influence the following/follow-up questions.\n\nInterview Flow:\nAsk the user the following questions:\n1. **Purpose:** What is the purpose of your recording? (E.g., a meeting, interview, casual conversation)\n2. **Participants:** Who will be in the recording, and what roles do they play? (E.g., interviewee, moderator)\n3. **Context:** Where and when will the recording take place? (If applicable)\n4. **Focus:** What specific insights or outputs do you expect from the transcript analysis? (Never offer or mention to capture the transcript as this is sorted elsewhere)\n5. **Tone & Style:** Should the output be formal, casual, detailed, concise, or in another style?\n6. **Viewpoint:** Find out what viewpoint they want the Summary or similar data points written in, maybe the 3rd person, or maybe as if they wrote it. Explain this in an easy-to-understand way with examples. Examples:\n   - **First Person:** "I reflected on..." (as if you're narrating yourself).\n   - **Second Person:** "You reflected on..." (as if it's personalized feedback to you).\n   - **Third Person:** "The speaker reflected on..." (neutral, like an observer).\n\nSystem Response Template:\nOnce the interview is complete, generate a JSON response, in one of the following Response formats based on the presence of 'FlowData' if the 'JSON Flow Format' is ready to go:\n\n**Response 2 (JSON With FlowData):**\n{\n    "ChatMSGs": {\n        "content": ""\n    },\n    "FlowData": {\n        "Name": {\n            "content": ""\n        },\n        "Instructions": {\n            "content": ""\n        },\n        "PromptTemplate": {\n            "content": ""\n        },\n        "FormatTemplate": {\n            "content": "{ \\"analysis\\": { \\"title\\": \\"\\", \\"summary\\": \\"\\", \\"valid_points\\": [] ] } }"\n        }\n    }\n}\n\nResponse 1 (JSON Without FlowData):\n{\n    "ChatMSGs": {\n        "content": ""\n    }\n}\n\n# Implementation Notes\n\n## Response Structure\n- **If there is data in 'FlowData', use Response 2 format.**\n- **If there is no data for 'FlowData', use Response 1 format.**\n\n## Code Blocks\nEnsure that each part of the response is encapsulated within its respective JSON code block as shown in the examples above.\n\n## Placeholder Usage\nThe '{transcript}' placeholder must be present in the 'PromptTemplate' to facilitate dynamic insertion of transcript data during processing.\n\n# Step-by-Step Instructions Post-Interview\n\n## Collect the following details:\n- **Title** (referred to as 'Name' in the JSON 'FlowData')\n- **Instructions** (guidance for the user to follow)\n- **Prompt** (the smart systrem prompt for processing transcripts)\n- **JSON format/output structure** (referred to as 'FormatTemplate' in the JSON 'FlowData')\n\n## Populate the FlowData JSON structure:\n1. **Insert the Title into the 'Name' field.**\n2. **Insert the Instructions into the 'Instructions' field.**\n3. **Insert the Prompt into the 'PromptTemplate' field.**\n4. **Insert the JSON Format into the 'FormatTemplate' field.**\n\n## Present the completed JSON object in a JSON code block.\n\n# Provide Clear Instructions to the User\n\n# Final Explanation and User Guidance\nOnce the JSON response is provided, explain in full detail how it works in simple terms (suitable for a 10-year-old). Include examples, scenarios, advice, benefits of using the flow, and tips to get the best out of it. Ensure the user feels confident and proud of the customized flow. The, 'How This Works (Simple Explanation):' should be placed inside and at the end of the 'ChatMSGs'.\n\nRespond in JSON format only, using response 1 or 2 and must be clean JSON, never serialized.`;

export default function Test() {
  // Existing API test states
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New audio format testing states
  const [selectedFormat, setSelectedFormat] = useState<'webm' | 'mp4'>('webm');
  const [selectedMimeType, setSelectedMimeType] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Update available MIME types when format changes
  useEffect(() => {
    const firstSupported = mimeTypes[selectedFormat].find(mime => {
      try {
        return MediaRecorder.isTypeSupported(mime);
      } catch {
        return false;
      }
    });
    setSelectedMimeType(firstSupported || '');
  }, [selectedFormat]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use proxy endpoint instead of direct API call
      const response = await fetch('/api/chat/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-c7c4c8a6ce6c43f89df9b32c45008379'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: SYSTEM_MESSAGE
            },
            {
              role: 'user',
              content: userInput
            }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      setRecordingError(null);
      setAudioUrl(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: formatConfigs[selectedFormat].sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: formatConfigs[selectedFormat].bitrate
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: selectedMimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setRecordingError('Recording error: ' + event.error.message);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      console.log('Recording started with config:', {
        format: selectedFormat,
        mimeType: selectedMimeType,
        sampleRate: formatConfigs[selectedFormat].sampleRate,
        bitrate: formatConfigs[selectedFormat].bitrate
      });

    } catch (err) {
      console.error('Error starting recording:', err);
      setRecordingError('Error starting recording: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Existing API Test Section */}
      <h1 className="text-2xl font-bold mb-4">Deepseek API Test</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="userInput" className="block mb-2">Enter your message:</label>
          <textarea
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4 mb-8">
          <h2 className="text-xl font-bold mb-2">Response:</h2>
          <pre className="p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {/* New Audio Format Testing Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Audio Format Testing</h2>
        
        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block mb-2">Audio Format:</label>
            <select 
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as 'webm' | 'mp4')}
              className="w-full p-2 border rounded"
            >
              <option value="webm">WebM</option>
              <option value="mp4">MP4</option>
            </select>
          </div>

          {/* MIME Type Selection */}
          <div>
            <label className="block mb-2">MIME Type:</label>
            <select 
              value={selectedMimeType}
              onChange={(e) => setSelectedMimeType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {mimeTypes[selectedFormat].map(mime => (
                <option 
                  key={mime} 
                  value={mime}
                  disabled={!MediaRecorder.isTypeSupported(mime)}
                >
                  {mime} {!MediaRecorder.isTypeSupported(mime) && '(not supported)'}
                </option>
              ))}
            </select>
          </div>

          {/* Recording Controls */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={startRecording}
              disabled={isRecording || !selectedMimeType}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              Start Recording
            </button>
            <button
              type="button"
              onClick={stopRecording}
              disabled={!isRecording}
              className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-400"
            >
              Stop Recording
            </button>
          </div>

          {/* Format Info */}
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-bold mb-2">Current Configuration:</h3>
            <pre className="whitespace-pre-wrap">
              {JSON.stringify({
                format: selectedFormat,
                mimeType: selectedMimeType,
                sampleRate: formatConfigs[selectedFormat].sampleRate,
                bitrate: formatConfigs[selectedFormat].bitrate,
                extension: formatConfigs[selectedFormat].extension,
                supported: selectedMimeType ? MediaRecorder.isTypeSupported(selectedMimeType) : false
              }, null, 2)}
            </pre>
          </div>

          {/* Error Display */}
          {recordingError && (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              {recordingError}
            </div>
          )}

          {/* Audio Preview */}
          {audioUrl && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Recording Preview:</h3>
              <audio controls className="w-full">
                <source src={audioUrl} type={selectedMimeType} />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
