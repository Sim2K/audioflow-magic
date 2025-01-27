import React, { useState, useRef, useEffect } from 'react';
import { ChatService } from '../services/ChatService';
import { ChatMessage, ChatResponse, FlowDataType } from '../types/chat';

interface FlowChatProps {
    onSave?: (flowData: FlowDataType) => void;
    onClose?: () => void;
    initialFlow?: {
        id: string;
        name: string;
        format: string;
        prompt: string;
        instructions: string;
    };
}

export const FlowChat: React.FC<FlowChatProps> = ({ onSave, onClose, initialFlow }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatService = ChatService.getInstance();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerId = 'flow-chat-container';

    useEffect(() => {
        // Initialize chat with system message if there's an initial flow
        if (initialFlow) {
            const initialMessage: ChatMessage = {
                role: 'user',
                content: `Hi, can you help me with my audio flow settings for "${initialFlow.name}". Here are the Flow details: 
        
Instructions:
"${initialFlow.instructions}"
        
Prompt Template:
"${initialFlow.prompt}"
        
Format Template:
"${initialFlow.format}"


I need to make some improvements to the flow. Please analyse it in painstaking detail to fully understand what it is about.`
            };
            setMessages([initialMessage]);
        }
    }, [initialFlow]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const newMessage: ChatMessage = {
            role: 'user',
            content: inputValue.trim()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await chatService.createChatCompletion([...messages, newMessage]);
            
            if (response.ChatMSGs) {
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: response.ChatMSGs.content
                };
                setMessages(prev => [...prev, assistantMessage]);

                // If we have FlowData and onSave callback, call it
                if (response.FlowData && onSave) {
                    onSave(response.FlowData);
                }
            } else {
                throw new Error('Invalid response format from chat service');
            }
        } catch (error) {
            console.error('Error in chat:', error);
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, there was an error processing your request. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flow-chat" role="dialog" aria-labelledby="flow-chat-title" aria-describedby={chatContainerId}>
            <div className="flow-chat-header">
                <h2 id="flow-chat-title">Flow Chat</h2>
                <button 
                    onClick={onClose} 
                    className="close-button"
                    aria-label="Close chat"
                >
                    ×
                </button>
            </div>
            
            <div id={chatContainerId} className="messages-container">
                {messages.map((message, index) => (
                    <div 
                        key={index} 
                        className={`message ${message.role}`}
                        role="log"
                        aria-live={message.role === 'assistant' ? 'polite' : 'off'}
                    >
                        <div className="message-content">{message.content}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
                {isLoading && (
                    <div className="loading" role="status" aria-live="polite">
                        Thinking...
                    </div>
                )}
                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="input-form">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    aria-label="Chat message"
                    rows={3}
                />
                <button 
                    type="submit" 
                    disabled={isLoading || !inputValue.trim()}
                    aria-label={isLoading ? 'Sending message...' : 'Send message'}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default FlowChat;
