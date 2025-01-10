import { APIConnection } from '../types/api-connect';
import { APIForwardResult } from '../types/api-result';

export async function forwardToExternalAPI(
  apiConnection: APIConnection,
  aiResponse: any
): Promise<APIForwardResult> {
  try {
    const headers: Record<string, string> = {};
    
    // Add custom headers
    apiConnection.headers.forEach(header => {
      headers[header.key] = header.value;
    });

    // Add auth header if needed
    if (apiConnection.authType === 'Bearer') {
      headers['Authorization'] = `Bearer ${apiConnection.authToken}`;
    } else if (apiConnection.authType === 'Basic') {
      headers['Authorization'] = `Basic ${apiConnection.authToken}`;
    }

    const response = await fetch(apiConnection.url, {
      method: apiConnection.method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: apiConnection.method !== 'GET' ? JSON.stringify(aiResponse) : undefined
    });

    const data = await response.json();

    return {
      status: response.ok ? 'success' : 'error',
      statusCode: response.status,
      response: data,
      timestamp: new Date().toISOString(),
      flowId: apiConnection.flowId,
      method: apiConnection.method,
      url: apiConnection.url
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Failed to forward to external API',
      timestamp: new Date().toISOString(),
      flowId: apiConnection.flowId,
      method: apiConnection.method,
      url: apiConnection.url
    };
  }
}
