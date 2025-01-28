import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { Message } from '../types';
import { ChatService } from '@/services/ChatService';

interface ChatProps {
  onSendMessage: (flowData: any) => void;
  flowDetails?: any;
  isOpen: boolean;
  flowChatBlank?: boolean;
}

const SYSTEM_MESSAGE = 'SYSTEM_MESSAGE';

const ChatSection: React.FC<ChatProps> = ({ onSendMessage, flowDetails, isOpen, flowChatBlank }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Memoize chatService instance
  const chatService = useMemo(() => ChatService.getInstance(), []);

  useEffect(() => {
    setIsLoading(false);
    return () => setIsLoading(false);
  }, []);

  // Initialize welcome message only if no messages exist and dialog is open
  useEffect(() => {
    if (flowChatBlank && isOpen && messages.length === 0) {
      setIsLoading(true);
      const welcomeMessage: Message = {
        id: `system-${Date.now()}`,
        content: 'Hi, can you help me craft a new Flow pls!',
        timestamp: new Date(),
        sender: 'user'
      };
      
      // Set initial message
      setMessages([welcomeMessage]);

      // Get AI response
      const getInitialResponse = async () => {
        try {
          const response = await chatService.createChatCompletion([{
            role: 'user',
            content: welcomeMessage.content
          }]);

          if (response.ChatMSGs && isOpen) {
            const assistantMessage: Message = {
              id: `assistant-${Date.now()}`,
              content: response.ChatMSGs.content,
              timestamp: new Date(),
              sender: 'assistant'
            };
            setMessages(prev => [...prev, assistantMessage]);
          }
        } catch (error) {
          console.error('Error sending initial message:', error);
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            content: 'Sorry, there was an error starting the chat. Please try again.',
            timestamp: new Date(),
            sender: 'assistant'
          }]);
        } finally {
          setIsLoading(false);
          scrollToBottom();
        }
      };

      getInitialResponse();
    } else if (flowDetails && messages.length === 0 && isOpen) {
      setIsLoading(true);
      const welcomeMessage: Message = {
        id: `system-${Date.now()}`,
        content: `Hi, can you help me with my audio flow settings for "${flowDetails.name}". Here are the Flow details: 
        
Instructions:
"${flowDetails.instructions}"
        
Prompt Template:
"${flowDetails.prompt}"
        
Format Template:
"${flowDetails.format}"

I need to make some improvements to the flow. Please analyse it in painstaking detail to fully understand what it is about.`,
        timestamp: new Date(),
        sender: 'user'
      };
      
      // Set initial message
      setMessages([welcomeMessage]);

      // Get AI response
      const getInitialResponse = async () => {
        try {
          const response = await chatService.createChatCompletion([{
            role: 'user',
            content: welcomeMessage.content
          }]);

          if (response.ChatMSGs && isOpen) {
            const assistantMessage: Message = {
              id: `assistant-${Date.now()}`,
              content: response.ChatMSGs.content,
              timestamp: new Date(),
              sender: 'assistant'
            };
            setMessages(prev => [...prev, assistantMessage]);
          }
        } catch (error) {
          console.error('Error sending initial message:', error);
          setMessages(prev => [...prev, {
            id: `error-${Date.now()}`,
            content: 'Sorry, there was an error starting the chat. Please try again.',
            timestamp: new Date(),
            sender: 'assistant'
          }]);
        } finally {
          setIsLoading(false);
          scrollToBottom();
        }
      };

      getInitialResponse();
    }
  }, [flowDetails, chatService, messages.length, isOpen, flowChatBlank]);

  // Scroll to bottom helper function
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  };

  // Auto-scroll on messages change or loading state change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageToSend = inputValue.trim();
    setInputValue('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageToSend,
      timestamp: new Date(),
      sender: 'user'
    };

    // Update messages state with new user message immediately
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Get current messages including the new one we just added
      const currentMessages = [...messages, userMessage];
      
      // Convert messages to API format
      const apiMessages = currentMessages.map(msg => ({
        role: msg.sender as 'user' | 'assistant',
        content: msg.content
      }));

      const response = await chatService.createChatCompletion(apiMessages);

      if (response.ChatMSGs) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: response.ChatMSGs.content,
          timestamp: new Date(),
          sender: 'assistant'
        };
        
        // Update messages with assistant response
        setMessages(prev => [...prev, assistantMessage]);
        
        // Handle FlowData if present
        if (response.FlowData && onSendMessage) {
          onSendMessage(response.FlowData);
        }
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          content: 'Sorry, there was an error processing your message. Please try again.',
          timestamp: new Date(),
          sender: 'assistant'
        }
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 mb-4 p-4 bg-muted rounded-lg"
      >
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 bg-secondary animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSend}
          disabled={isLoading || !inputValue.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatSection;
