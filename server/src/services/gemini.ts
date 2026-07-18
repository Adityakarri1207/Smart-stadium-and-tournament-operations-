import { GoogleGenAI } from '@google/genai';
import { prisma } from '../utils/prisma';

// Ensure the API keys are provided
const apiKeys = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

if (apiKeys.length === 0) {
  apiKeys.push('mock-key-for-development');
}

let currentKeyIndex = 0;

export const generateStadiumResponse = async (
  query: string,
  stadiumId?: string | null,
  userProfile?: any
): Promise<string> => {
  let zones: any[] = [];
  let events: any[] = [];
  let incidents: any[] = [];
  let stadiumName = 'Global Stadium Network';

  try {
    // 1. Retrieve filtered stadium context from database
    if (stadiumId) {
      const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
      if (stadium) {
        stadiumName = stadium.name;
      }
      zones = await prisma.zone.findMany({ 
        where: { stadiumId }, 
        include: { facilities: true } 
      });
      events = await prisma.event.findMany({ 
        where: { stadiumId }, 
        orderBy: { time: 'asc' } 
      });
      incidents = await prisma.incident.findMany({
        where: {
          zone: { stadiumId },
          status: 'OPEN'
        },
        include: {
          zone: true
        }
      });
    } else {
      zones = await prisma.zone.findMany({ include: { facilities: true } });
      events = await prisma.event.findMany({ orderBy: { time: 'asc' } });
      incidents = await prisma.incident.findMany({
        where: { status: 'OPEN' },
        include: { zone: true }
      });
    }
  } catch (dbError: any) {
    console.error('Database query failed in Gemini service:', dbError.message);
  }
  
  // 2. Build structured prompt with localized preferences
  const contextStr = JSON.stringify({ zones, events, incidents });
  const preferredLangName = userProfile?.preferredLanguage === 'es' 
    ? 'Spanish' 
    : userProfile?.preferredLanguage === 'fr' 
      ? 'French' 
      : 'English';

  const prompt = `
You are the official Smart Stadium Assistant for the FIFA World Cup 2026.
Your goal is to provide helpful, concise, and accurate responses to spectators.
You are currently assisting a spectator at the stadium: "${stadiumName}".

User Profile Context:
- Spectator Name: ${userProfile?.name || 'Guest'}
- Preferred Language: ${preferredLangName}
- Seating Section: ${userProfile?.ticketSection || 'General Concourse'}
- Seat Number: ${userProfile?.seatNumber || 'N/A'}
- Accessibility Needs: ${userProfile?.accessibilityPreference || 'none'}

Always use the following real-time stadium context to answer the user's query.
If the answer is not in the context, politely inform them based on general knowledge.
Do not hallucinate wait times or event times not present in the context.

Real-time Stadium Context:
${contextStr}

User Query: ${query}

Important Constraints:
1. You MUST formulate your entire response in the preferred language: ${preferredLangName}.
2. Since the user is sitting in "${userProfile?.ticketSection || 'General Concourse'}", prioritize suggesting facilities (restrooms, food, medical, merchandise) that are located in their stand/zone first. Provide directions starting from their stand/zone.
3. If the user's accessibility needs are "step-free", explicitly highlight routes that use elevators, ramps, and step-free access paths, and avoid suggesting stairs.
4. If there is an active incident in their seating section or any stand they ask about, you MUST warn them about the hazard (e.g. wet floor, maintenance issue, security delay) and advise alternative routes or behavior.
5. Response Format: Provide a clear, engaging, and professional response using Markdown.
`;

  // 3. Retry loop with key rotation
  let attempts = 0;
  while (attempts < apiKeys.length) {
    const keyIndex = currentKeyIndex;
    const apiKey = apiKeys[keyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    attempts++;

    try {
      console.log(`Attempting Gemini API call with key index ${keyIndex} (attempt ${attempts}/${apiKeys.length})`);
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      return response.text || 'I am sorry, I am unable to process your request at this time.';
    } catch (error: any) {
      console.error(`Gemini API Error with key index ${keyIndex}:`, error.message);
      // Keep looping to try the next key
    }
  }

  // Fallback deterministic response when all keys fail
  try {
    const countZones = stadiumId 
      ? await prisma.zone.count({ where: { stadiumId } }) 
      : await prisma.zone.count();
    return `**Fallback Mode Activated:** I am currently unable to reach the AI services. However, I can tell you that the stadium has ${countZones} zones. Please check the dashboard for live updates.`;
  } catch (fallbackError) {
    return `**Fallback Mode Activated:** AI services are currently offline. Please refer to the stadium operations dashboard for live telemetry.`;
  }
};
