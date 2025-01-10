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
