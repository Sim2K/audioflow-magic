import { Flow } from "./storage";
import { FlowService } from "../services/flowService";

let cachedFlows: { [userId: string]: Flow[] } = {};

export const getFlows = async (userId: string): Promise<Flow[]> => {
  if (!userId) throw new Error("User ID is required");
  
  if (!cachedFlows[userId]) {
    cachedFlows[userId] = await FlowService.getAllFlows(userId);
  }
  return cachedFlows[userId];
};

export const saveFlow = async (flow: Omit<Flow, "id">, userId: string, isEditing?: string): Promise<Flow> => {
  if (!userId) throw new Error("User ID is required");

  let savedFlow: Flow;
  if (isEditing) {
    savedFlow = await FlowService.updateFlow(isEditing, flow, userId);
  } else {
    savedFlow = await FlowService.createFlow(flow, userId);
  }

  // Update cache
  delete cachedFlows[userId];
  return savedFlow;
};

export const deleteFlow = async (id: string, userId: string): Promise<void> => {
  if (!userId) throw new Error("User ID is required");

  await FlowService.deleteFlow(id, userId);
  // Update cache
  delete cachedFlows[userId];
};