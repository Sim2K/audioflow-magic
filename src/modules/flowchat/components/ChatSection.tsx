import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { ChatMessage } from '../types';

interface ChatSectionProps {
  onSendMessage?: (message: string) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: message,
        timestamp: new Date(),
        sender: 'user'
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      if (onSendMessage) {
        onSendMessage(message);
      }
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
      <ScrollArea className="flex-1 mb-4 p-4 bg-muted rounded-lg">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 max-w-[80%] ${
              msg.sender === 'user'
                ? 'ml-auto bg-primary text-primary-foreground'
                : 'bg-secondary'
            } rounded-lg p-2 shadow-sm`}
          >
            {msg.content}
          </div>
        ))}
      </ScrollArea>
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="min-h-[80px]"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatSection;
