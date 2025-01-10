import { APIConnection } from '../types/api-connect';

const API_CONNECTIONS_KEY = 'ai_audio_flow_api_connections';

export function getAPIConnections(): Record<string, APIConnection> {
  const connections = localStorage.getItem(API_CONNECTIONS_KEY);
  return connections ? JSON.parse(connections) : {};
}

export function saveAPIConnection(connection: APIConnection): void {
  const connections = getAPIConnections();
  connections[connection.flowId] = connection;
  localStorage.setItem(API_CONNECTIONS_KEY, JSON.stringify(connections));
}

export function getAPIConnection(flowId: string): APIConnection | null {
  const connections = getAPIConnections();
  return connections[flowId] || null;
}

export function deleteAPIConnection(flowId: string): void {
  const connections = getAPIConnections();
  delete connections[flowId];
  localStorage.setItem(API_CONNECTIONS_KEY, JSON.stringify(connections));
}
