import { Flow } from "./storage";

const FLOWS_KEY = "flows";

export const getFlows = (): Flow[] => {
  const flows = localStorage.getItem(FLOWS_KEY);
  return flows ? JSON.parse(flows) : [];
};

export const saveFlow = (flow: Omit<Flow, "id">, isEditing?: string): Flow => {
  const flows = getFlows();
  const newFlow = {
    ...flow,
    id: isEditing || Date.now().toString(),
  };

  if (isEditing) {
    const index = flows.findIndex((f) => f.id === isEditing);
    if (index !== -1) {
      flows[index] = newFlow;
    }
  } else {
    flows.push(newFlow);
  }

  localStorage.setItem(FLOWS_KEY, JSON.stringify(flows));
  return newFlow;
};

export const deleteFlow = (id: string): void => {
  const flows = getFlows().filter((flow) => flow.id !== id);
  localStorage.setItem(FLOWS_KEY, JSON.stringify(flows));
};