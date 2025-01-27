export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatContentType {
    type?: 'text' | 'json';
    content: string;
}

export interface FlowDataType {
    Name: ChatContentType;
    Instructions: ChatContentType;
    PromptTemplate: ChatContentType;
    FormatTemplate: ChatContentType;
}

export interface ChatResponse {
    ChatMSGs: ChatContentType;
    FlowData?: FlowDataType;
}
