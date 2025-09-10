import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

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
    let result;
    switch (action) {
      case 'parseJobFromText':
      case 'parseJobFromImage':
      case 'rateJobFit':
        result = await ai.models.generateContent(payload);
        break;
      case 'generateJobImage':
        result = await ai.models.generateImages(payload);
        break;
      default:
        return response.status(400).json({ error: 'Invalid action' });
    }
    return response.status(200).json(result);
  } catch (error: any) {
    console.error('Error calling Gemini API:', error);
    return response.status(500).json({ error: 'An error occurred with the AI service', details: error.message });
  }
}
