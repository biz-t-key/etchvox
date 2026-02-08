import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
}

export async function generateContent(systemPrompt: string, userPayload: string): Promise<string | null> {
    if (!genAI) {
        console.error('Gemini API Key is missing');
        return null;
    }

    try {
        // Use Gemini 2.5 Flash Lite for maximum speed and intelligence balance
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

        const result = await model.generateContent([
            systemPrompt, // System instructions as first part of prompt
            `Analysis Data:\n${userPayload}` // The actual data
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Generation Error:', error);
        return null;
    }
}
