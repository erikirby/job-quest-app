import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

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
      case 'parseJobFromText':
      case 'parseJobFromImage':
      case 'rateJobFit': {
        const result = await ai.models.generateContent(payload);
        // Extract the raw text and send it back.
        // The client-side will handle JSON parsing and validation.
        return response.status(200).json({ text: result.text });
      }
      case 'generateJobImage': {
        const result = await ai.models.generateImages(payload);
        // Extract the image data and send it back in a simple format.
        const images = result.generatedImages.map(img => ({
          imageBytes: img.image.imageBytes
        }));
        return response.status(200).json({ generatedImages: images });
      }
      default:
        return response.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error(`Error in action '${action}':`, error);
    // Try to pass along a more descriptive error from the Gemini API if available
    const details = error.cause?.message || error.message || 'An unknown error occurred.';
    return response.status(500).json({ error: 'An error occurred with the AI service', details });
  }
}