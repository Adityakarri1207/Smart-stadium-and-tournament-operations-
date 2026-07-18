"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStadiumResponse = void 0;
const genai_1 = require("@google/genai");
const prisma_1 = require("../utils/prisma");
// Ensure the API key is provided
const apiKey = process.env.GEMINI_API_KEY || 'mock-key-for-development';
const ai = new genai_1.GoogleGenAI({ apiKey });
const generateStadiumResponse = async (query) => {
    try {
        // 1. Retrieve stadium context from database
        const zones = await prisma_1.prisma.zone.findMany({ include: { facilities: true } });
        const events = await prisma_1.prisma.event.findMany({ orderBy: { time: 'asc' } });
        // 2. Build structured prompt
        const contextStr = JSON.stringify({ zones, events });
        const prompt = `
You are the official Smart Stadium Assistant for the FIFA World Cup 2026.
Your goal is to provide helpful, concise, and accurate responses to spectators.
Always use the following real-time stadium context to answer the user's query.
If the answer is not in the context, politely inform them based on general knowledge.
Do not hallucinate wait times or event times not present in the context.

Real-time Stadium Context:
${contextStr}

User Query: ${query}

Response Format:
Provide a clear, engaging, and professional response using Markdown.
`;
        // 3. Call Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || 'I am sorry, I am unable to process your request at this time.';
    }
    catch (error) {
        console.error('Gemini API Error:', error.message);
        // Fallback deterministic response
        return `**Fallback Mode Activated:** I am currently unable to reach the AI services. However, I can tell you that the stadium has ${await prisma_1.prisma.zone.count()} zones. Please check the dashboard for live updates.`;
    }
};
exports.generateStadiumResponse = generateStadiumResponse;
//# sourceMappingURL=gemini.js.map