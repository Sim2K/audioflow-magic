export interface Flow {
    id: string;
    name: string;
    instructions: string;
    prompt: string;
    format: string;
}

export interface FlowData {
    Name: { type: string; content: string };
    Instructions: { type: string; content: string };
    PromptTemplate: { type: string; content: string };
    FormatTemplate: { type: string; content: string };
}
