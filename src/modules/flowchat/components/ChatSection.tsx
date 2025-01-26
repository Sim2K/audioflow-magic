import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useChat } from '../hooks/useChat';
import { ChatMessage } from '../types/chat';

interface DisplayMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'assistant' | 'system';
}

interface ChatSectionProps {
  onSendMessage?: (message: string) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');
  const { messages, sendMessage, isLoading } = useChat();
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const formattedMessages = messages.map((msg, index) => {
      let content = msg.content;
      if (msg.role === 'assistant') {
        try {
          const parsed = JSON.parse(msg.content);
          content = parsed.ChatMSGs?.content || 'No content available';
        } catch (error) {
          console.error('Error parsing assistant message:', error);
          content = 'Error displaying message';
        }
      }

      return {
        id: index.toString(),
        content,
        timestamp: new Date(),
        sender: msg.role
      };
    });

    setDisplayMessages(formattedMessages);

    // Scroll to bottom after messages update
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      setTimeout(() => {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const messageToSend = inputMessage;
    setInputMessage(''); // Clear input immediately for better UX

    try {
      if (onSendMessage) {
        onSendMessage(messageToSend);
      }
      
      await sendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      // Could add toast notification here for error feedback
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
          {displayMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : msg.sender === 'assistant'
                    ? 'bg-secondary'
                    : 'bg-muted text-muted-foreground text-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-secondary rounded-lg p-3">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex gap-2">
        <Textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="min-h-[60px]"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSend} 
          disabled={!inputMessage.trim() || isLoading}
          className="px-3"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatSection;
