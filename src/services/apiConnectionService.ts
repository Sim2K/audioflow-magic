import { supabase } from '../lib/supabase';
import type { APIConnection } from '../modules/api-connect/types/api-connect';
import { DBAPIConnection, toAPIConnection, toDBAPIConnection } from '../types/database';

export class APIConnectionService {
  static async getAPIConnectionByFlowId(flowId: string, userId: string): Promise<APIConnection | null> {
    const { data, error } = await supabase
      .from('api_connections')
      .select('*')
      .eq('flow_id', flowId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      throw new Error(`Error fetching API connection: ${error.message}`);
    }

    return data ? toAPIConnection(data as DBAPIConnection) : null;
  }

  static async createAPIConnection(connection: APIConnection, flowId: string, userId: string): Promise<APIConnection> {
    const { data, error } = await supabase
      .from('api_connections')
      .insert([toDBAPIConnection(connection, flowId, userId)])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating API connection: ${error.message}`);
    }

    return toAPIConnection(data as DBAPIConnection);
  }

  static async updateAPIConnection(connection: APIConnection, flowId: string, userId: string): Promise<APIConnection> {
    const { data, error } = await supabase
      .from('api_connections')
      .update(toDBAPIConnection(connection, flowId, userId))
      .eq('flow_id', flowId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating API connection: ${error.message}`);
    }

    return toAPIConnection(data as DBAPIConnection);
  }

  static async deleteAPIConnection(flowId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('api_connections')
      .delete()
      .eq('flow_id', flowId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error deleting API connection: ${error.message}`);
    }
  }

  static async saveAPIConnection(connection: APIConnection, flowId: string, userId: string): Promise<APIConnection> {
    const existing = await this.getAPIConnectionByFlowId(flowId, userId);
    if (existing) {
      return this.updateAPIConnection(connection, flowId, userId);
    }
    return this.createAPIConnection(connection, flowId, userId);
  }
}
