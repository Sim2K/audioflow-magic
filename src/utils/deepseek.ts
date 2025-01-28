// Do not remove comments from this page!
// Make no changes on this page.

import { ChatMessage, ChatResponse } from '@/types/chat';
import { Flow } from '@/types/flow';


// ----- Page Variables -----

// Boolean switch to toggle between OpenAI and Deepseek
const useDeepseek = false; // Set to true for Deepseek, false for OpenAI

// Dynamically assign variables based on the boolean switch
const theAPIkey = useDeepseek
    ? import.meta.env.VITE_DEEPSEEK_API_KEY
    : import.meta.env.VITE_OPENAI_API_KEY;

const theEndPoint = useDeepseek
    ? '/api/chat/chat/completions'
    : 'https://api.openai.com/v1/chat/completions';

const theModel = useDeepseek
    ? 'deepseek-chat'
    : 'gpt-4o-mini';

const theProvider = useDeepseek
    ? 'Deepseek'
    : 'OpenAI';

// ----- \Page Variables -----



// Use proxy endpoint to handle CORS if Deepseek is used
const DEEPSEEK_API_ENDPOINT = theEndPoint;

// System message that defines the AI's behavior
const SYSTEM_MESSAGE = `# Rules:
- Always respond using the JSON format in Response 1 or Response 2 depending on what is needed and must be clean JSON, never serialized.
- There must only be 1 data point called ChatMSGs in a response and that 1 data point must always have a response in it and should never be blank.
- After all 7 questions have been asked, you will generate a JSON Flow Format that contains all the information it has gathered from the user's responses using Response 2.
- Always use Response 2 after the 6th question has been completed.
- When appropriate, and you have data to comeplete FlowData, you will generate a JSON Flow Format that contains all the information it has gathered from the user's responses using Response 2.
- Response 2 always requiers FlowData to be completed in full detail.
- At relevant times, ask the user, if they need help completing the flow form on their screen, when they agree, generate a new Response 2 with FlowData completed.
- When ever producing a Response 2, always do the following: 
 -- Generate a group of personas with skills, experience, wisdom and knowledge, in relation to what has been discussed.
 -- With that group of generated personas, brainstorm, in painstaking detail how to create the best, most detailed version of the FlowData possible, based on all that was previously discussed.
 -- Get all the personas to review and improve the FlowData and this is the version of the FlowData that will be retuneed in the Response 2.

Task Overview:
You will interview the user to gather critical information about their upcoming audio recording transcription. 
The goal is to understand the recording's context, participants, purpose, and structure so you know how to deal with its transcript. 
Based on this, you will generate a tailored workflow consisting of:

1. A Title: To represent the essence of the recording.
2. Instructions: Instructions on what the user should say while recording, or certain things to reference at the start, middle, or end of the recording.
3. A Smart System Prompt: Designed to process the transcript and extract meaningful insights that will work with the 'JSON Flow Format'.
4. A 'JSON Flow Format': A powerful dynamic well-thought-out JSON structure to hold the details that will be returned after the prompt processes the transcript.

All 4 sections should work well together, in harmony, enabling the 'JSON Flow Format' to capture everything in the best way possible. Think smart about this, step by step!

Interview instructions/rules:
- All questions must be asked 1 at a time, in an interview style with guidance, tips, and gotchas to watch out for on every question.
- State this is Qu 1 out of 7 so the user knows how many to expect.
- Answers must be used to influence the following/follow-up questions.

Interview Flow:
Ask the user the following questions:
1. **Purpose:** What is the purpose of your recording? (E.g., a meeting, interview, casual conversation). If its work purposes, pls let me know your industry and job title.
2. **Participants:** Who will be in the recording, and what roles do they play? (E.g., interviewee, moderator)
3. **Context:** Where and when will the recording take place? (If applicable)
4. **Focus:** What specific insights or outputs do you expect from the transcript analysis? (Never offer or mention to capture the transcript as this is sorted elsewhere)
5. **Tone & Style:** Should the output be formal, casual, detailed, concise, or in another style?
6. **Viewpoint:** Find out what viewpoint they want the Summary or similar data points written in, maybe the 3rd person, or maybe as if they wrote it. 
   - Explain this in an easy-to-understand way with examples:
      - **First Person:** "I reflected on..." (as if you're narrating yourself).
      - **Second Person:** "You reflected on..." (as if it's personalized feedback to you).
      - **Third Person:** "The speaker reflected on..." (neutral, like an observer).
   - What language should the output be in? (E.g., English, Spanish, French, etc.)
7. **Complete the Flow form:** Ask the user if they want to have the Flow form completed, if they agree, respond using Response 2 with full detailed completed 'FlowData' to generate the Flow form for the user.

System Response Template:
Once the interview is complete, generate a JSON response in one of the following Response formats based on the presence of 'FlowData' if the 'JSON Flow Format' is ready to go:

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
            "content": "{ \\"analysis\\": { \\"title\\": \\"\\", \\"summary\\": \\"\\", \\"valid_points\\": [] ] } }"
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

## Response Structure:
- **If there is data in 'FlowData', use Response 2 format.**
- **If there is no data for 'FlowData', use Response 1 format.**

## Code Blocks:
Ensure that each part of the response is encapsulated within its respective JSON code block as shown in the examples above.

## Placeholder Usage:
The '{transcript}' placeholder must be present in the 'PromptTemplate' to facilitate dynamic insertion of transcript data during processing.

# Step-by-Step Instructions Post-Interview

## Collect the following details:
- **Title** (referred to as 'Name' in the JSON 'FlowData')
- **Instructions** (guidance for the user to follow)
- **Prompt** (the smart system prompt for processing transcripts)
- **JSON format/output structure** (referred to as 'FormatTemplate' in the JSON 'FlowData'). All Values must be blank and the blank values must be represented like this: { "analysis": { "title": "", "summary": "", "valid_points": [] } }.

## Populate the FlowData JSON structure:
1. **Insert the Title into the 'Name' field.**
2. **Insert the Instructions into the 'Instructions' field.**
3. **Insert the Prompt into the 'PromptTemplate' field.**
4. **Insert the JSON Format into the 'FormatTemplate' field.**

## Present the completed JSON object in a JSON code block.

# Provide Clear Instructions to the User

# Final Explanation and User Guidance:
Once the JSON response is provided, explain in full detail how it works in simple terms (suitable for a 10-year-old). 
Include examples, scenarios, advice, benefits of using the flow, and tips to get the best out of it. 
Ensure the user feels confident and proud of the customized flow.

The 'How This Works (Simple Explanation):' should be placed inside and at the end of the 'ChatMSGs'.

Respond in JSON format only, using response 1 or 2 and must be clean JSON, never serialized.`;

export class DeepseekService {
    private static instance: DeepseekService;
    private apiKey: string;

    private constructor() {
        try {
            const apiKey = theAPIkey;
            if (!apiKey) {
                throw new Error('OPENAI_API_KEY not found in environment variables');
            }
            this.apiKey = apiKey;
            console.log('DeepseekService initialized successfully');
        } catch (error) {
            console.error('Failed to initialize DeepseekService:', error);
            throw error;
        }
    }

    public static getInstance(): DeepseekService {
        if (!DeepseekService.instance) {
            DeepseekService.instance = new DeepseekService();
        }
        return DeepseekService.instance;
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
        if (!this.apiKey) {
            throw new Error('API key not found');
        }

        const requestBody = {
            model: theModel,
            response_format: {
                type: 'json_object'
            },
            messages: messages,
            stream: false
        };

        console.log('Making API request with body:', requestBody);

        try {
            const response = await fetch(DEEPSEEK_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API request failed:', response.status, response.statusText, errorText);
                throw new Error(`API request failed: ${response.status} - ${errorText || response.statusText}`);
            }

            // Validate response has content
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) === 0) {
                throw new Error('Empty response from API');
            }

            return response;
        } catch (error) {
            console.error('Network request failed:', error);
            throw error;
        }
    }

    private createErrorResponse(message: string): ChatResponse {
        return {
            ChatMSGs: {
                content: message
            }
        };
    }

    private getSystemMessage(): ChatMessage {
        return {
            role: 'system',
            content: SYSTEM_MESSAGE
        };
    }

    public async createChatCompletion(messages: ChatMessage[]): Promise<ChatResponse> {
        console.log('Starting chat completion with messages:', messages);
        try {
            // Check if there's already a system message
            const hasSystemMessage = messages.some(msg => msg.role === 'system');
            const finalMessages = hasSystemMessage ? messages : [this.getSystemMessage(), ...messages];

            const response = await this.makeAPIRequest(finalMessages);
            
            try {
                // First try to get response as text
                const responseText = await response.text();
                if (!responseText) {
                    console.error('Empty response body');
                    return this.createErrorResponse('Empty response from API');
                }

                // Try to parse the text as JSON
                const rawData = JSON.parse(responseText);
                console.log('Raw API response:', rawData);

                const content = rawData.choices?.[0]?.message?.content;
                if (!content) {
                    console.error('No content in response:', rawData);
                    return this.createErrorResponse('No content in response');
                }

                // Parse the content as JSON and clean it
                const cleanedContent = this.cleanContent(content);
                console.log('Cleaned content:', cleanedContent);

                try {
                    const parsedContent = JSON.parse(cleanedContent);
                    console.log('Parsed content:', parsedContent);

                    if (!parsedContent.ChatMSGs) {
                        console.error('Invalid response format - missing ChatMSGs:', parsedContent);
                        return this.createErrorResponse('Invalid response format - missing ChatMSGs');
                    }

                    // Validate ChatMSGs structure
                    if (!parsedContent.ChatMSGs.content) {
                        console.error('Invalid ChatMSGs format - missing content:', parsedContent.ChatMSGs);
                        return this.createErrorResponse('Invalid response format - missing content in ChatMSGs');
                    }

                    return parsedContent;
                } catch (parseError) {
                    console.error('Error parsing cleaned content:', parseError, '\nContent was:', cleanedContent);
                    return this.createErrorResponse('Invalid JSON in API response content');
                }
            } catch (parseError) {
                console.error('Error parsing API response:', parseError, '\nResponse was:', response);
                return this.createErrorResponse('Invalid JSON in API response');
            }
        } catch (error) {
            console.error('Error in chat completion:', error);
            return this.createErrorResponse(error instanceof Error ? error.message : 'Error in chat completion');
        }
    }

    public async processWithDeepseek(transcript: string, flow: Flow): Promise<ChatResponse> {
        const apiKey = theAPIkey;
        if (!apiKey) {
            throw new Error('Deepseek API key not found');
        }

        const messages: ChatMessage[] = [
            {
                role: "system",
                content: SYSTEM_MESSAGE
            }
        ];

        const requestBody = {
            model: theModel,
            response_format: {
                type: 'json_object'
            },
            messages,
            stream: false
        };

        try {
            const response = await fetch(DEEPSEEK_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Deepseek API request failed: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error processing with Deepseek:', error);
            throw error;
        }
    }
}
