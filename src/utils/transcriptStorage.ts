import { Flow } from './storage';
import { transcriptService } from '../services/transcriptService';
import type { TranscriptRecord } from '../types/transcript';

export type { TranscriptRecord };

// Clean object for database storage
const sanitizeForDB = (obj: any): any => {
  if (!obj) return null;
  // Convert to string and back to remove circular references and functions
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Error sanitizing object for DB:', error);
    // If stringification fails, create a clean object with essential properties
    return {
      error: 'Data could not be fully serialized',
      summary: typeof obj === 'object' ? Object.keys(obj) : typeof obj
    };
  }
};

export const saveTranscript = async (
  transcript: string,
  jsonResponse: any,
  flow: Flow,
  userId: string,
  audioUrl?: string,
  apiForwardResult?: any
): Promise<TranscriptRecord> => {
  try {
    // Sanitize the response and API result before saving
    const cleanResponse = sanitizeForDB({
      ...jsonResponse,
      theFlowTitle: jsonResponse.theFlowTitle || 'Untitled Transcript'
    });

    const cleanApiResult = sanitizeForDB(apiForwardResult);

    console.log('Saving transcript with sanitized data:', {
      hasResponse: !!cleanResponse,
      hasApiResult: !!cleanApiResult,
      flowId: flow.id,
      responseKeys: cleanResponse ? Object.keys(cleanResponse) : []
    });

    const savedTranscript = await transcriptService.saveTranscript({
      user_id: userId,
      flow_id: flow.id,
      transcript,
      response: cleanResponse,
      audio_url: audioUrl || null,
      api_forward_result: cleanApiResult
    });

    return savedTranscript;
  } catch (error) {
    console.error('Error in saveTranscript:', error);
    throw error;
  }
};

export const getTranscripts = async (userId: string): Promise<TranscriptRecord[]> => {
  try {
    return await transcriptService.getTranscripts(userId);
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    throw error;
  }
};

export const deleteTranscript = async (id: string, userId: string): Promise<void> => {
  try {
    await transcriptService.deleteTranscript(id, userId);
  } catch (error) {
    console.error('Error deleting transcript:', error);
    throw error;
  }
};
