import { APIConnection } from '../types/api-connect';
import { APIConnectionService } from '../../../services/apiConnectionService';

let connectionCache: Record<string, APIConnection> = {};

export async function getAPIConnections(): Promise<Record<string, APIConnection>> {
  return connectionCache;
}

export async function saveAPIConnection(connection: APIConnection, userId: string): Promise<void> {
  if (!userId) throw new Error("User ID is required");

  await APIConnectionService.saveAPIConnection(connection, connection.flowId, userId);
  // Update cache
  connectionCache[connection.flowId] = connection;
}

export async function getAPIConnection(flowId: string, userId: string): Promise<APIConnection | null> {
  if (!userId) throw new Error("User ID is required");

  if (connectionCache[flowId]) {
    return connectionCache[flowId];
  }

  const connection = await APIConnectionService.getAPIConnectionByFlowId(flowId, userId);
  if (connection) {
    connectionCache[flowId] = connection;
  }
  return connection;
}

export async function deleteAPIConnection(flowId: string, userId: string): Promise<void> {
  if (!userId) throw new Error("User ID is required");

  await APIConnectionService.deleteAPIConnection(flowId, userId);
  // Update cache
  delete connectionCache[flowId];
}
