import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function gemini(prompt: string) {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
    });

    return response.text;
}