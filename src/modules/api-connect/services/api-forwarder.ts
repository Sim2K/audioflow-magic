import { APIConnection } from '../types/api-connect';
import { APIForwardResult } from '../types/api-result';

export async function forwardToExternalAPI(
  apiConnection: APIConnection,
  aiResponse: any
): Promise<APIForwardResult> {
  console.log('Forwarding to API:', {
    url: apiConnection.url,
    method: apiConnection.method,
    headers: apiConnection.headers,
    authType: apiConnection.authType
  });

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add custom headers
    if (Array.isArray(apiConnection.headers)) {
      apiConnection.headers.forEach(header => {
        headers[header.key] = header.value;
      });
    }

    // Add auth header if needed
    if (apiConnection.authType === 'Bearer' && apiConnection.authToken) {
      headers['Authorization'] = `Bearer ${apiConnection.authToken}`;
    } else if (apiConnection.authType === 'Basic' && apiConnection.authToken) {
      headers['Authorization'] = `Basic ${apiConnection.authToken}`;
    }

    console.log('Making request with headers:', headers);

    const response = await fetch(apiConnection.url, {
      method: apiConnection.method,
      headers,
      body: apiConnection.method !== 'GET' ? JSON.stringify(aiResponse) : undefined
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    console.log('API response:', {
      status: response.status,
      statusText: response.statusText,
      data
    });

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
    console.error('API forward error:', error);
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
