import { useState } from 'react';
import { APIForwardResult } from '../types/api-result';
import { getAPIConnection } from '../utils/storage';
import { forwardToExternalAPI } from '../services/api-forwarder';
import { Flow } from '@/utils/storage';
import { useAuth } from '@/hooks/useAuth';

export function useAPIForward() {
  const [apiResult, setApiResult] = useState<APIForwardResult | null>(null);
  const [isForwarding, setIsForwarding] = useState(false);
  const { user } = useAuth();

  const forwardResponse = async (flow: Flow, aiResponse: any): Promise<APIForwardResult | null> => {
    if (!user) return null;

    try {
      const apiConnection = await getAPIConnection(flow.id, user.id);
      if (!apiConnection) {
        console.log('No API connection found for flow:', flow.id);
        return null;
      }

      setIsForwarding(true);
      console.log('Forwarding to API:', apiConnection.url);
      const result = await forwardToExternalAPI(apiConnection, aiResponse);
      console.log('API forward result:', result);
      setApiResult(result);
      return result;
    } catch (error) {
      console.error('Error forwarding to API:', error);
      const errorResult: APIForwardResult = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        flowId: flow.id,
        method: 'UNKNOWN',
        url: 'UNKNOWN'
      };
      setApiResult(errorResult);
      return errorResult;
    } finally {
      setIsForwarding(false);
    }
  };

  return {
    apiResult,
    isForwarding,
    forwardResponse
  };
}
