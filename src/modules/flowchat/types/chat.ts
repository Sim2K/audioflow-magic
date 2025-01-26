export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface FlowDataStructure {
    Name: {
        type: 'text';
        value?: string;
    };
    Instructions: {
        type: 'text';
        value?: string;
    };
    PromptTemplate: {
        type: 'text';
        value?: string;
    };
    FormatTemplate: {
        type: 'json';
        value?: any;
    };
}

export interface ChatResponse {
    ChatMSGs: {
        type: 'text';
        content?: string;
    };
    FlowData: FlowDataStructure;
}
