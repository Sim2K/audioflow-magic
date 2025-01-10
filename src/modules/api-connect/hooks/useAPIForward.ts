import { useState } from 'react';
import { APIForwardResult } from '../types/api-result';
import { getAPIConnection } from '../utils/storage';
import { forwardToExternalAPI } from '../services/api-forwarder';
import { Flow } from '@/utils/storage';

export function useAPIForward() {
  const [apiResult, setApiResult] = useState<APIForwardResult | null>(null);
  const [isForwarding, setIsForwarding] = useState(false);

  const forwardResponse = async (flow: Flow, aiResponse: any): Promise<APIForwardResult | null> => {
    const apiConnection = getAPIConnection(flow.id);
    if (!apiConnection) return null;

    try {
      setIsForwarding(true);
      const result = await forwardToExternalAPI(apiConnection, aiResponse);
      setApiResult(result);
      return result;
    } catch (error) {
      const errorResult = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        flowId: flow.id,
        method: apiConnection.method,
        url: apiConnection.url
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
