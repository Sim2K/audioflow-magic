export interface APIForwardResult {
  status: 'success' | 'error';
  statusCode?: number;
  response?: any;
  error?: string;
  timestamp: string;
  flowId: string;
  method: string;
  url: string;
}
