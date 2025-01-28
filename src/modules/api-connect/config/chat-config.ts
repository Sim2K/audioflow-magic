import { DeepseekConfig } from '../types/api-connect';

export const chatConfig: DeepseekConfig = {
    url: "/api/chat/chat/completions",  // Use relative URL to avoid CORS
    method: "POST",
    authType: "Bearer",
    authToken: import.meta.env.VITE_DEEPSEEK_API_KEY,
    headers: [
        { key: "Content-Type", value: "application/json" }
    ],
    defaultParams: {
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: { type: "json_object" }
    }
};
