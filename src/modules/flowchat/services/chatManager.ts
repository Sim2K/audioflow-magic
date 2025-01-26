import { ChatMessage, ChatResponse, FlowDataStructure } from '../types/chat';
import { DeepSeekService } from './deepseekService';

export class ChatManager {
    private messages: ChatMessage[] = [];
    private deepseekService: DeepSeekService;
    private static instance: ChatManager;

    private constructor() {
        this.deepseekService = DeepSeekService.getInstance();
        this.initializeChat();
    }

    public static getInstance(): ChatManager {
        if (!ChatManager.instance) {
            ChatManager.instance = new ChatManager();
        }
        return ChatManager.instance;
    }

    private initializeChat() {
        const systemMessage = this.deepseekService.getSystemMessage();
        console.log('Initializing chat with system message:', systemMessage);
        this.messages = [systemMessage];
    }

    private getFormattedMessages(): ChatMessage[] {
        // Start with system message
        const formattedMessages: ChatMessage[] = [this.deepseekService.getSystemMessage()];
        
        // Find the last user message
        const lastUserMessage = [...this.messages]
            .reverse()
            .find(msg => msg.role === 'user');

        if (lastUserMessage) {
            console.log('Adding last user message:', lastUserMessage);
            formattedMessages.push(lastUserMessage);
        }

        console.log('Final formatted messages:', formattedMessages);
        return formattedMessages;
    }

    public async sendMessage(content: string): Promise<ChatResponse | null> {
        console.log('Sending new message:', content);
        console.log('Current message history:', this.messages);

        const userMessage: ChatMessage = {
            role: 'user',
            content
        };

        // Store the message in our history
        this.messages.push(userMessage);

        try {
            // Get properly formatted messages for the API
            const messagesToSend = this.getFormattedMessages();
            console.log('Sending formatted messages to API:', messagesToSend);

            const response = await this.deepseekService.createChatCompletion(messagesToSend);
            
            if (response) {
                console.log('Received API response:', response);
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: JSON.stringify(response)
                };
                this.messages.push(assistantMessage);
            }

            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove the user message if the request failed
            this.messages.pop();
            throw error;
        }
    }

    public getMessages(): ChatMessage[] {
        return [...this.messages];
    }

    public clearChat() {
        console.log('Clearing chat history');
        this.initializeChat();
    }
}
