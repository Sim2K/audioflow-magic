import { ChatMessage, ChatResponse } from '../types/chat';

export class DeepSeekService {
    private static instance: DeepSeekService;
    private apiKey: string;

    private constructor() {
        // In browser environment, we need to use import.meta.env for Vite
        this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
        if (!this.apiKey) {
            console.error('VITE_DEEPSEEK_API_KEY not found in environment variables');
        }
    }

    public static getInstance(): DeepSeekService {
        if (!DeepSeekService.instance) {
            DeepSeekService.instance = new DeepSeekService();
        }
        return DeepSeekService.instance;
    }

    public async createChatCompletion(messages: ChatMessage[]): Promise<ChatResponse | null> {
        try {
            console.log('Sending request to DeepSeek API:', {
                model: "deepseek-chat",
                messagesCount: messages.length,
                apiKey: this.apiKey ? 'Set' : 'Not Set'
            });

            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    frequency_penalty: 0,
                    max_tokens: 2048,
                    presence_penalty: 0,
                    temperature: 1,
                    top_p: 1,
                    stream: false,
                    response_format: { type: "json_object" }
                })
            });

            console.log('DeepSeek API Response:', {
                status: response.status,
                statusText: response.statusText
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('DeepSeek API Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error
                });
                throw new Error(`Chat completion failed: ${response.status} ${response.statusText} - ${error}`);
            }

            const result = await response.json();
            console.log('DeepSeek API Success:', {
                hasChoices: !!result.choices,
                firstChoice: result.choices?.[0]
            });

            const content = result.choices[0].message.content;
            return content ? JSON.parse(content) : null;
        } catch (error) {
            console.error('Error in chat completion:', error);
            throw error;
        }
    }

    public getSystemMessage(): ChatMessage {
        return {
            role: 'system',
            content: "You are an intelligent and supportive assistant. Your primary responsibility is to help users design and manage workflows for processing transcripts. All your responses must be structured within the 'ChatMSGs' field of the provided JSON template: {\"ChatMSGs\": {\"type\": \"text\"}, \"FlowData\": {\"Name\": {\"type\": \"text\"}, \"Instructions\": {\"type\": \"text\"}, \"PromptTemplate\": {\"type\": \"text\"}, \"FormatTemplate\": {\"type\": \"json\"}}}. Additionally, when required, you dynamically populate the 'FlowData' section in the JSON template based on the user's input and the context of the conversation. This ensures that the information you provide is actionable, well-structured, and directly applicable to their workflows."
        };
    }
}
