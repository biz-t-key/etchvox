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
        // Use Gemini 1.5 Flash for speed and cost efficiency
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
