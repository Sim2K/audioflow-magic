import { useState, useCallback } from 'react';
import { ChatManager } from '../services/chatManager';
import { ChatMessage, ChatResponse } from '../types/chat';

export const useChat = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const chatManager = ChatManager.getInstance();

    const sendMessage = useCallback(async (content: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await chatManager.sendMessage(content);
            setMessages(chatManager.getMessages());
            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearChat = useCallback(() => {
        chatManager.clearChat();
        setMessages(chatManager.getMessages());
        setError(null);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        clearChat
    };
};
