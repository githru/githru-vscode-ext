import axios from "axios";

import { LLM_API_TOKEN, LLM_API_URL } from "./config";
import type { GeminiRequest, GeminiResponse } from "./types";

export class LLMClient {
  async sendPrompt(prompt: string): Promise<string> {
    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      },
    };

    try {
      const response = await axios.post<GeminiResponse>(
        `${LLM_API_URL}?key=${LLM_API_TOKEN}`,
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    } catch (error) {
      console.error("❌ Gemini API call failed:", error);
      throw error;
    }
  }
}