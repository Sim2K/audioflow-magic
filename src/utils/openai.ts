}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

async function processTranscriptionResponse(transcript: string, flow: Flow): Promise<any> {
  const apiKey = localStorage.getItem(StorageKeys.OPENAI_API_KEY);
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  // Process with GPT-4
  const completionResponse = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: [
            {
              text: "You are a very helpful assistant. You are good at creating summaries from transcriptions and following user's requests/actions/tasks to action on translations given. You think step by step to make the best use of the JSON schema given to use to respond to the user.",
              type: "text"
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              text: `Read the {Instructions} which will instruct you on how to work with the given {transcript}. Respond using the format shown in the {JSON Template} and add at the top of the {JSON Template} a generated title based on the contents of the {JSON Template} and the key pair holding that data will look like this, "theFlowTitle": " ... a title representing the contents of the {JSON Template} ...". This will sit at the start of every JSON response object and be named "theFlowTitle". "theFlowTitle" will be independent of any details in the {JSON Template}, for example, if 'title' exists in the {JSON Template}, then both 'title' and 'theFlowTitle' will be shown.

Instructions:
${flow.prompt}

'Transcript':
${transcript}

'JSON Template':
${flow.format}`,
              type: "text"
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    })
  });

  if (!completionResponse.ok) {
    const error = await completionResponse.json();
    throw new Error(error.error?.message || 'Failed to process transcript');
  }

  const completionData = await completionResponse.json();
  return JSON.parse(completionData.choices[0].message.content);
}