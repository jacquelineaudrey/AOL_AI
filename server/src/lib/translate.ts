import { openAI } from "../config/config";

export async function translate(message?: string, language?: string) {
    const GPTresponse = await openAI.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "assistant",
        content: `Given a string input enclosed between the @ character (e.g., @input@), @${message}@ return the translation of given string to ${language} without @`,
      },
    ],
  });

  return GPTresponse.choices[0].message.content;
}
