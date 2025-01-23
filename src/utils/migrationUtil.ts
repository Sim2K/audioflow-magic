import { transcriptService } from '../services/transcriptService';

const TRANSCRIPTS_KEY = 'transcripts';

interface LegacyTranscript {
  id: string;
  transcript: string;
  jsonResponse: any;
  flowDetails: {
    id: string;
    [key: string]: any;
  };
  theFlowTitle: string;
  createdAt: string;
}

export const migrateExistingTranscripts = async (userId: string): Promise<{
  total: number;
  migrated: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}> => {
  const result = {
    total: 0,
    migrated: 0,
    failed: 0,
    errors: [] as Array<{ id: string; error: string }>
  };

  try {
    const localData = localStorage.getItem(TRANSCRIPTS_KEY);
    if (!localData) {
      return result;
    }

    const localTranscripts = JSON.parse(localData) as LegacyTranscript[];
    result.total = localTranscripts.length;

    for (const transcript of localTranscripts) {
      try {
        await transcriptService.saveTranscript({
          user_id: userId,
          flow_id: transcript.flowDetails.id,
          transcript: transcript.transcript,
          response: {
            ...transcript.jsonResponse,
            theFlowTitle: transcript.theFlowTitle
          },
          audio_url: null,
          api_forward_result: null
        });
        result.migrated++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          id: transcript.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Only clear localStorage if all records were migrated successfully
    if (result.failed === 0) {
      localStorage.removeItem(TRANSCRIPTS_KEY);
    }

    return result;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};
