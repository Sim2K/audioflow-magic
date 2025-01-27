import { HTTPMethod, AuthType, APIConnection } from '../modules/api-connect/types/api-connect';
import { Flow } from '../utils/storage';

export interface DBFlow {
  id: string;
  user_id: string;
  name: string;
  prompt: string;
  instructions: string | null;
  format_template: any;
  created_at: string;
  updated_at: string;
}

export interface DBAPIConnection {
  id: string;
  flow_id: string;
  user_id: string;
  method: HTTPMethod;
  url: string;
  auth_type: AuthType;
  auth_token: string | null;
  headers: any[];
  created_at: string;
  updated_at: string;
}

// Conversion helpers
export const toFlow = (dbFlow: DBFlow): Flow => ({
  id: dbFlow.id,
  name: dbFlow.name,
  format: JSON.stringify(dbFlow.format_template),
  prompt: dbFlow.prompt,
  instructions: dbFlow.instructions || ''
});

export const toDBFlow = (flow: Omit<Flow, 'id'>): Omit<DBFlow, 'id' | 'user_id' | 'created_at' | 'updated_at'> => {
  try {
    // Try to parse the format string to validate it's proper JSON
    const formatTemplate = JSON.parse(flow.format);
    
    return {
      name: flow.name,
      format_template: formatTemplate,
      prompt: flow.prompt,
      instructions: flow.instructions || null
    };
  } catch (error) {
    throw new Error(`Invalid format template. Please ensure it is valid JSON. Error: ${error.message}`);
  }
};

export const toAPIConnection = (dbConn: DBAPIConnection): APIConnection => ({
  flowId: dbConn.flow_id,
  method: dbConn.method,
  url: dbConn.url,
  headers: dbConn.headers,
  authType: dbConn.auth_type,
  authToken: dbConn.auth_token || undefined
});

export const toDBAPIConnection = (conn: APIConnection, flowId: string, userId: string): Omit<DBAPIConnection, 'id' | 'created_at' | 'updated_at'> => ({
  flow_id: flowId,
  user_id: userId,
  method: conn.method,
  url: conn.url,
  headers: conn.headers,
  auth_type: conn.authType,
  auth_token: conn.authToken || null
});
