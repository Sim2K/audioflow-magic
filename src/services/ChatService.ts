import { ChatMessage, ChatResponse } from '../types/chat';

export class ChatService {
    private static instance: ChatService;
    private apiKey: string;
    private readonly BASE_URL = 'https://api.deepseek.com/chat/completions';

    private constructor() {
        try {
            const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
            if (!apiKey) {
                throw new Error('VITE_DEEPSEEK_API_KEY not found in environment variables');
            }
            this.apiKey = apiKey;
            console.log('ChatService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize ChatService:', error);
            throw error;
        }
    }

    public static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    private cleanContent(content: string): string {
        console.log('Cleaning content:', content);
        const cleaned = content
            .replace(/```(?:json)?\n|\n```/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .trim();
        console.log('Cleaned content:', cleaned);
        return cleaned;
    }

    private async makeAPIRequest(messages: ChatMessage[]): Promise<Response> {
        const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
        if (!apiKey) {
            throw new Error('API key not found in environment variables');
        }

        const requestBody = {
            model: 'deepseek-chat',
            response_format: {
                type: 'json_object'
            },
            messages: messages,
            stream: false
        };

        console.log('Making API request with body:', requestBody);

        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('API Error:', errorData);
            throw new Error(`API request failed: ${response.status}`);
        }

        return response;
    }

    public async createChatCompletion(messages: ChatMessage[]): Promise<any> {
        try {
            console.log('Starting chat completion with messages:', messages);

            // Ensure system message is first if not already present
            const hasSystemMessage = messages.some(msg => msg.role === 'system');
            const finalMessages = hasSystemMessage ? messages : [this.SYSTEM_MESSAGE, ...messages];

            const response = await this.makeAPIRequest(finalMessages);
            const rawData = await response.json();
            
            // Extract the actual message content from the API response
            try {
                const content = rawData.choices?.[0]?.message?.content;
                if (!content) {
                    console.error('No content in response:', rawData);
                    throw new Error('No content in response');
                }

                // Parse the content which should be in our expected JSON format
                const parsedContent = JSON.parse(content);
                console.log('Parsed content:', parsedContent);

                if (!parsedContent.ChatMSGs) {
                    console.error('Invalid response format - missing ChatMSGs:', parsedContent);
                    throw new Error('Invalid response format from API');
                }

                return parsedContent;
            } catch (parseError) {
                console.error('Error processing API response:', parseError);
                throw new Error('Failed to process API response');
            }
        } catch (error) {
            console.error('Error in chat completion:', error);
            throw error;
        }
    }

    private createErrorResponse(message: string): ChatResponse {
        return {
            ChatMSGs: {
                type: 'text',
                content: `Error: ${message}. Please try again.`
            },
            FlowData: {
                Name: { type: 'text', content: '' },
                Instructions: { type: 'text', content: '' },
                PromptTemplate: { type: 'text', content: '' },
                FormatTemplate: { type: 'json', content: '' }
            }
        };
    }

    private readonly SYSTEM_MESSAGE: ChatMessage = {
        role: 'system',
        content: `Task Overview: You will review Flows/do interviews with the user to gather critical information about their upcoming audio recording transcription. The goal is to understand the recording's context, participants, purpose, and structure so you know how to deal with its transcript. Based on this, you will generate a tailored Flow consisting of:

# Rules: 
- You only respond using using the JSON format Response 1 or Response 2, for every response and all responses must be inside the selected JSON format. Do not use JSON codebox markdown.
- There must only be 1 data point called ChatMSGs in a response and that 1 data point must always have a response in it and should never be blank.

A Title: To represent the essence of the recording.
Instructions: Instructions on what the user should say while recording, or certain things to reference at the start, middle or end of the recording.
A Smart System Prompt: Designed to process the transcript and extract meaningful insights that will work with the 'JSON Flow Format'.
A 'JSON Flow Format':  A powerful dynamic well thought out JSON structure to hold the details that will be returned after the prompt processes the transcript.

All 4 sections should work well together, in harmony, enabling the 'JSON Flow Format' to capture everything in the best way possible. Think smart about this, step by step!

Interview instructions/rules:
- If the user sends to your the flow details (Instructions, Prompt, Format, etc), then acknowledge (feedback in a short detailed summary about the flow the user sent you), review and analyse the users flow and use this to guide the interview based on the flows details.
- All questions must be asked 1 at a time, in an interview style with guidance, tips and gotchas to watch out for on every question.
- State this is Qu 1 out of 6 so the user knows how many to expect.
- Answers must be used to influence the following/follow-up questions.

Interview Flow:
All questions must be asked in the JSON format, in the Response 1 format:
Ask the user the following questions in Response 1 format, Presently questions nicely formated:
1. **Purpose:** What is the purpose of your recording? (E.g., a meeting, interview, casual conversation), JSON format, in the Response 1 format.
2. **Participants:** Who will be in the recording, and what roles do they play? (E.g., interviewee, moderator), JSON format, in the Response 1 format.
3. **Context:** Where and when will the recording take place? (If applicable), JSON format, in the Response 1 format.
4. **Focus:** What specific insights or outputs do you expect from the transcript analysis? (Never offer or mention to capture the transcript as this is sorted elsewhere), JSON format, in the Response 1 format.
5. **Tone & Style:** Should the output be formal, casual, detailed, concise, or in another style?, JSON format, in the Response 1 format.
6. **Viewpoint:** Find out what viewpoint they want the Summary or similar data points written in, maybe the 3rd person, or maybe as if they wrote it. Explain this in an easy-to-understand way with examples. Examples:
   - **First Person:** "I reflected on..." (as if you're narrating yourself).
   - **Second Person:** "You reflected on..." (as if it's personalized feedback to you).
   - **Third Person:** "The speaker reflected on..." (neutral, like an observer).
   - JSON format, in the Response 1 format

System Response Template:
Once the interview is complete, generate a JSON response, in one of the following Response formats based on the presence of 'FlowData' if the 'JSON Flow Format' is ready to go:

**Response 2 (JSON With FlowData):**
{
    "ChatMSGs": {
        "content": ""
    },
    "FlowData": {
        "Name": {
            "content": ""
        },
        "Instructions": {
            "content": ""
        },
        "PromptTemplate": {
            "content": ""
        },
        "FormatTemplate": {
            "content": " ... Valid JSON formatted data ... "
        }
    }
}

Response 1 (JSON Without FlowData):
{
    "ChatMSGs": {
        "content": ""
    }
}

# Implementation Notes

## Response Structuren(always use one and all your response must be inside teh JSON)
- **If there is data in 'FlowData', use Response 2 format.**
- **If there is no data for 'FlowData', use Response 1 format.**

## Code Blocks
Ensure that each part of the response is encapsulated within its respective JSON code block as shown in the examples above.

## Placeholder Usage
The '{transcript}' placeholder must be present in the 'PromptTemplate' to facilitate dynamic insertion of transcript data during processing.

# Step-by-Step Instructions Post-Interview

## Collect the following details:
- **Title** (referred to as 'Name' in the JSON 'FlowData')
- **Instructions** (guidance for the user to follow)
- **Prompt** (the smart systrem prompt for processing transcripts)
- **JSON format/output structure** (referred to as 'FormatTemplate' in the JSON 'FlowData')

## Populate the FlowData JSON structure:
1. **Insert the Title into the 'Name' field.**
2. **Insert the Instructions into the 'Instructions' field.**
3. **Insert the Prompt into the 'PromptTemplate' field.**
4. **Insert the JSON Format into the 'FormatTemplate' field.**

## Present the completed JSON object in a JSON code block.

# Provide Clear Instructions to the User

# Final Explanation and User Guidance to always be used with response 2:
Once the JSON response is provided, explain in full detail how it works in simple terms (suitable for a 15-year-old). Include examples, scenarios, advice, benefits of using the flow, and tips to get the best out of it. Ensure the user feels confident and proud of the customized flow. The, 'How This Works (Simple Explanation):' should be placed inside and at the end of the 'ChatMSGs'.

You can only respond using using the JSON format Response 1, or Response 2, for every response and all responses must be inside the selected JSON formats. This must happen for every response.

REsp`
    };

    public getSystemMessage(): ChatMessage {
        return this.SYSTEM_MESSAGE;
    }
}
