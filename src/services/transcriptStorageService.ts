import { transcriptStorageSettings } from '@/modules/settings/transcriptStorageSettings';
import { TranscriptService } from './transcriptService';

export interface TranscriptData {
  user_id: string;
  flow_id: string;
  transcript: string;
  response: any;
  audio_url?: string;
  api_forward_result?: any;
}

export interface LocalTranscript {
  id: string;
  timestamp: string;
  flowId: string;
  flowName: string;
  transcript: string;
  response: any;
  audioUrl?: string;
  apiForwardResult?: any;
  storageType: 'local' | 'cloud';
}

export const transcriptStorageService = {
  async saveTranscript(data: TranscriptData, flowName: string): Promise<void> {
    const isCloudStorage = transcriptStorageSettings.isCloudStorage();

    if (isCloudStorage) {
      await TranscriptService.createTranscript({
        user_id: data.user_id,
        flow_id: data.flow_id,
        transcript: data.transcript,
        response: data.response || {},
        audio_url: data.audio_url,
        api_forward_result: data.api_forward_result || {}
      });
    } else {
      const transcriptHistory = this.getLocalTranscripts();
      const localTranscript: LocalTranscript = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        flowId: data.flow_id,
        flowName: flowName,
        transcript: data.transcript,
        response: data.response,
        audioUrl: data.audio_url,
        apiForwardResult: data.api_forward_result,
        storageType: 'local'
      };
      
      transcriptHistory.push(localTranscript);
      localStorage.setItem("transcripts", JSON.stringify(transcriptHistory));
    }
  },

  getLocalTranscripts(): LocalTranscript[] {
    try {
      return JSON.parse(localStorage.getItem("transcripts") || "[]");
    } catch {
      return [];
    }
  }
};
