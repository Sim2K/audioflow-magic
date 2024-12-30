export const StorageKeys = {
  OPENAI_API_KEY: "openai_api_key",
  FLOWS: "automation_flows",
} as const;

export interface Flow {
  id: string;
  name: string;
  endpoint: string;
  format: string;
  prompt: string;
}

export const storage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    try {
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  },
};