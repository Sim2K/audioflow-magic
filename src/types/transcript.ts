import { Database } from './supabase';

export interface TranscriptRecord {
  id: string;
  user_id: string;
  timestamp: string;
  flow_id: string;
  transcript: string;
  response: any;
  audio_url: string | null;
  api_forward_result: any | null;
  created_at: string;
  updated_at: string;
}

export interface SaveTranscriptParams {
  user_id: string;
  flow_id: string;
  transcript: string;
  response?: any;
  audio_url?: string;
  api_forward_result?: any;
}

export class TranscriptError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TranscriptError';
  }
}

export const handleTranscriptError = (error: any): never => {
  // Handle specific Supabase error codes
  if (error.code === '23505') {
    throw new TranscriptError('Duplicate transcript', 'DUPLICATE');
  }
  if (error.code === '23514') {
    throw new TranscriptError('Invalid transcript data', 'INVALID_DATA');
  }
  throw error;
};
