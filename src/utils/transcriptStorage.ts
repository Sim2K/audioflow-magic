import { Flow } from './storage';

export interface TranscriptRecord {
  id: string;
  transcript: string;
  jsonResponse: any;
  flowDetails: Flow;
  theFlowTitle: string;
  createdAt: string;
}

const TRANSCRIPTS_KEY = 'transcripts';

export const saveTranscript = (
  transcript: string,
  jsonResponse: any,
  flow: Flow
): TranscriptRecord => {
  const transcripts = getTranscripts();
  
  const newTranscript: TranscriptRecord = {
    id: Date.now().toString(),
    transcript,
    jsonResponse,
    flowDetails: flow,
    theFlowTitle: jsonResponse.theFlowTitle || 'Untitled Transcript',
    createdAt: new Date().toISOString()
  };

  transcripts.unshift(newTranscript); // Add to start of array
  localStorage.setItem(TRANSCRIPTS_KEY, JSON.stringify(transcripts));
  
  return newTranscript;
};

export const getTranscripts = (): TranscriptRecord[] => {
  try {
    const transcripts = localStorage.getItem(TRANSCRIPTS_KEY);
    return transcripts ? JSON.parse(transcripts) : [];
  } catch (error) {
    console.error('Error parsing transcripts:', error);
    return [];
  }
};

export const deleteTranscript = (id: string): void => {
  const transcripts = getTranscripts().filter(t => t.id !== id);
  localStorage.setItem(TRANSCRIPTS_KEY, JSON.stringify(transcripts));
};
