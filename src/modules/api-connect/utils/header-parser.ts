import { APIHeader } from '../types/api-connect';

/**
 * Parses header text in various formats:
 * - Simple "key: value"
 * - With quotes "key: value"
 * - With -H prefix
 * - With -P prefix
 */
export function parseHeadersText(text: string): APIHeader[] {
  const lines = text.split('\n').filter(line => line.trim());
  const headers: APIHeader[] = [];

  for (const line of lines) {
    let cleanLine = line.trim();
    
    // Remove surrounding quotes if present
    cleanLine = cleanLine.replace(/^["']|["']$/g, '');
    
    // Remove -H or -P prefix if present
    cleanLine = cleanLine.replace(/^-[HP]\s*/, '');
    
    // Remove any remaining quotes
    cleanLine = cleanLine.replace(/^["']|["']$/g, '');
    
    // Split on first colon
    const colonIndex = cleanLine.indexOf(':');
    if (colonIndex === -1) {
      throw new Error(`Invalid header format: ${line}`);
    }

    const key = cleanLine.substring(0, colonIndex).trim();
    const value = cleanLine.substring(colonIndex + 1).trim();
    
    if (!key || !value) {
      throw new Error(`Invalid header format: ${line}`);
    }

    headers.push({ key, value });
  }

  return headers;
}
