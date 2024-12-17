import { openAI } from "../config/config";

export async function sentimentAnalysis(messageUser? : string) {
  const GPTresponse = await openAI.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "assistant",
        content: `Given a string input enclosed between the @ character (e.g., @input@), @${messageUser}@ return a JSON object with the following format:{"stats": { "urgency": Rate the user's urgency from 1.0 to 10.0 (decimal format, can be 1.6 or others), where 1 is the least urgent and 10 is the most urgent, "sentiment": "Rate the user's mood from 1.0 to 10.0 (decimal format), where 1 is the customer being pleased and 10 is the customer being unpleased.", "topic": "The type of the message." This can be ONLY ONE OF the following: Complaints, Returns, Informations, Support, Tracking, Suggestions" "response": "As a specialist in customer service, create a response that provides a solution to the client's problems. Provide a detailed response from a customer service perspective. Acknowledge the user's concern with empathy, suggest actionable solutions based on their urgency, and provide a response that is aligned with their sentiment (e.g., calm for frustration, prompt for urgent issues)." }} Please note: - The values should be analyzed based on the input. - The urgency rating is determined based on time sensitivity and frustration. - Sentiment score includes both tone and content of the message. - The response should be empathetic, professional, and tailored to the user's emotional state and urgency. Without markdown formatting.`,
      },
    ],
  });

  return GPTresponse.choices[0].message.content;
}
