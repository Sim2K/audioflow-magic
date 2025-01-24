import { supabase } from '../lib/supabase';

export interface Transcript {
  id?: bigint;
  user_id: string;
  timestamp?: string;
  flow_id: string;
  transcript: string;
  response: Record<string, any>;
  audio_url?: string | null;
  api_forward_result?: Record<string, any> | null;
  created_at?: string;
  updated_at?: string;
}

export class TranscriptService {
  static async createTranscript(transcript: Omit<Transcript, 'id' | 'timestamp' | 'created_at' | 'updated_at'>) {
    // Ensure response and api_forward_result are objects, not null
    const data = {
      ...transcript,
      response: transcript.response || {},
      api_forward_result: transcript.api_forward_result || {}
    };

    const { data: result, error } = await supabase
      .from('transcripts')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Error creating transcript: ${error.message}`);
    }

    return result;
  }

  static async getTranscripts(userId: string) {
    const { data, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching transcripts: ${error.message}`);
    }

    return data;
  }
}
