import { HTTPMethod, APIHeader, CURLParseResult, AuthType } from '../types/api-connect';

const extractMethod = (curlCommand: string): HTTPMethod => {
  const methodMatch = curlCommand.match(/-X\s+([A-Z]+)/);
  return (methodMatch?.[1] as HTTPMethod) || 'GET';
};

const extractUrl = (curlCommand: string): string => {
  const urlMatch = curlCommand.match(/curl\s+(?:-X\s+[A-Z]+\s+)?['"]?(https?:\/\/[^'"]\S+)['"]?/);
  return urlMatch?.[1] || '';
};

const extractHeaders = (curlCommand: string): APIHeader[] => {
  const headers: APIHeader[] = [];
  const headerMatches = curlCommand.matchAll(/-H\s+["']([^"']+)["']/g);
  
  for (const match of headerMatches) {
    const [key, value] = match[1].split(/:\s*/);
    if (key && value) {
      headers.push({ key, value });
    }
  }
  
  return headers;
};

const determineAuthType = (headers: APIHeader[]): { authType: AuthType; authToken?: string } => {
  for (const header of headers) {
    if (header.key.toLowerCase() === 'authorization') {
      if (header.value.startsWith('Bearer ')) {
        return {
          authType: 'Bearer',
          authToken: header.value.replace('Bearer ', '')
        };
      }
      if (header.value.startsWith('Basic ')) {
        return {
          authType: 'Basic',
          authToken: header.value.replace('Basic ', '')
        };
      }
    }
  }
  return { authType: 'None' };
};

export const parseCurlCommand = (curlCommand: string): CURLParseResult => {
  const method = extractMethod(curlCommand);
  const url = extractUrl(curlCommand);
  const headers = extractHeaders(curlCommand);
  const { authType, authToken } = determineAuthType(headers);

  return {
    method,
    url,
    headers,
    authType,
    authToken
  };
};
