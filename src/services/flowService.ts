import { supabase } from '../lib/supabase';
import type { Flow } from '../utils/storage';
import { DBFlow, toFlow, toDBFlow } from '../types/database';

export class FlowService {
  static async getAllFlows(userId: string): Promise<Flow[]> {
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching flows: ${error.message}`);
    }

    return (data as DBFlow[]).map(toFlow);
  }

  static async getFlowById(id: string, userId: string): Promise<Flow | null> {
    const { data, error } = await supabase
      .from('flows')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      throw new Error(`Error fetching flow: ${error.message}`);
    }

    return data ? toFlow(data as DBFlow) : null;
  }

  static async createFlow(flow: Omit<Flow, 'id'>, userId: string): Promise<Flow> {
    const { data, error } = await supabase
      .from('flows')
      .insert([{ ...toDBFlow(flow), user_id: userId }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating flow: ${error.message}`);
    }

    return toFlow(data as DBFlow);
  }

  static async updateFlow(id: string, flow: Partial<Flow>, userId: string): Promise<Flow> {
    const updates = flow.format ? toDBFlow(flow as Omit<Flow, 'id'>) : flow;
    
    const { data, error } = await supabase
      .from('flows')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating flow: ${error.message}`);
    }

    return toFlow(data as DBFlow);
  }

  static async deleteFlow(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('flows')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Error deleting flow: ${error.message}`);
    }
  }
}
