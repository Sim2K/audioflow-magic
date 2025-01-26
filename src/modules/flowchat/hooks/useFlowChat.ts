import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';

export const useFlowChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = useCallback((content: string, sender: 'user' | 'system') => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      sender
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    addMessage,
    clearMessages
  };
};

export default useFlowChat;
