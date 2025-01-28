export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type AuthType = 'Bearer' | 'Basic' | 'None';

export interface APIHeader {
  key: string;
  value: string;
}

export interface APIConnection {
  flowId: string;
  method: HTTPMethod;
  url: string;
  headers: APIHeader[];
  authType: AuthType;
  authToken?: string;
}

export interface CURLParseResult {
  method: HTTPMethod;
  url: string;
  headers: APIHeader[];
  authType: AuthType;
  authToken?: string;
}

export interface DeepseekConfig extends APIConnection {
    defaultParams: {
        temperature: number;
        max_completion_tokens: number;
        top_p: number;
        frequency_penalty: number;
        presence_penalty: number;
        response_format: { type: string };
    }
}
