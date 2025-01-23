import { supabase } from '../lib/supabase';
import { SaveTranscriptParams, TranscriptRecord, handleTranscriptError } from '../types/transcript';

export const transcriptService = {
  async saveTranscript(params: SaveTranscriptParams): Promise<TranscriptRecord> {
    try {
      console.log('Saving transcript with params:', {
        user_id: params.user_id,
        flow_id: params.flow_id,
        hasTranscript: !!params.transcript,
        hasResponse: !!params.response,
        hasAudioUrl: !!params.audio_url,
        hasApiResult: !!params.api_forward_result
      });

      const { data, error } = await supabase
        .from('transcripts')
        .insert([{
          user_id: params.user_id,
          flow_id: params.flow_id,
          transcript: params.transcript,
          response: params.response || null,
          audio_url: params.audio_url || null,
          api_forward_result: params.api_forward_result || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving transcript:', error);
        throw error;
      }
      if (!data) throw new Error('No data returned from insert');
      
      return data as TranscriptRecord;
    } catch (error) {
      console.error('Error in saveTranscript:', error);
      throw error; // Re-throw the error after handling
    }
  },

  async getTranscripts(userId: string): Promise<TranscriptRecord[]> {
    try {
      const { data, error } = await supabase
        .from('transcripts')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Supabase error getting transcripts:', error);
        throw error;
      }
      return data as TranscriptRecord[];
    } catch (error) {
      console.error('Error in getTranscripts:', error);
      throw error;
    }
  },

  async deleteTranscript(id: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transcripts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase error deleting transcript:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteTranscript:', error);
      throw error;
    }
  },

  async getTranscriptById(id: string, userId: string): Promise<TranscriptRecord | null> {
    try {
      const { data, error } = await supabase
        .from('transcripts')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Supabase error getting transcript by id:', error);
        throw error;
      }
      
      return data as TranscriptRecord;
    } catch (error) {
      console.error('Error in getTranscriptById:', error);
      throw error;
    }
  }
};
