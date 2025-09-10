import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality } from "@google/genai";

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
        return response.status(200).json({ text: result.text });
      }
      case 'generateJobImage': {
        const { prompt } = payload;
        if (!prompt) {
          return response.status(400).json({ error: 'Prompt is required for image generation' });
        }
        
        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: { parts: [{ text: prompt }] },
          config: {
            responseModalities: [Modality.IMAGE],
          },
        });

        const imagePart = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (!imagePart || !imagePart.inlineData) {
            const blockReason = result.candidates?.[0]?.finishReason;
            if (blockReason === 'SAFETY') {
                 return response.status(400).json({ error: 'Image generation blocked for safety reasons.', details: 'Image generation blocked for safety reasons.' });
            }
            console.error("No image data in response:", JSON.stringify(result, null, 2));
            return response.status(500).json({ error: 'No image data found in AI response', details: 'No image data found in AI response' });
        }
        
        const imageBytes = imagePart.inlineData.data;
        return response.status(200).json({ imageBytes });
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