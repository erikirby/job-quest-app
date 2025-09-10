import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

const jobSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    company: { type: Type.STRING },
    location: { type: Type.STRING },
    url: { type: Type.STRING },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    description: { type: Type.STRING },
    remote: { type: Type.BOOLEAN },
  },
  required: ['title', 'company', 'location', 'description', 'remote', 'tags', 'url'],
};

const ratingSchema = {
  type: Type.OBJECT,
  properties: {
    rating: { type: Type.INTEGER },
    reasoning: { type: Type.STRING }
  },
  required: ['rating', 'reasoning']
};


export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { action, payload } = request.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured' });
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    switch (action) {
      case 'rateJobFit': {
        const result = await ai.models.generateContent(payload);
        return response.status(200).json({ text: result.text });
      }
      
      case 'parseText': {
         const { text } = payload;
         const prompt = `You are an expert HR assistant. Extract structured information from the following job description text. Return ONLY a single JSON object that strictly adheres to the provided schema. Do not include any other text or explanations.\n\nJob Description:\n---\n${text}\n---`;

         const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: jobSchema,
            },
         });

         return response.status(200).json({ text: result.text });
      }

      default:
        return response.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error(`Error in action '${action}':`, error);
    const details = error.cause?.message || error.message || 'An unknown error occurred.';
    return response.status(500).json({ error: 'An error occurred with the AI service', details });
  }
}