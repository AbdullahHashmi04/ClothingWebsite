import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

export async function callClaude(userMessage) {
  const payload = {
    anthropic_version: "bedrock-2023-06-01",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: userMessage,
      },
    ],
  };

  const params = {
    modelId: "anthropic.claude-3-opus-20240229-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  };

  try {
    const command = new InvokeModelCommand(params);
    const response = await client.send(command);
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error) {
    console.error("Error calling Claude:", error);
    throw error;
  }
}