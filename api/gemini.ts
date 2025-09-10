import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality, Type } from "@google/genai";

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
      
      case 'parseAndGenerate': {
        const { text } = payload;
        
        const parsePrompt = `You are an expert HR assistant. Extract structured information from the following job description text. Return ONLY a single JSON object that strictly adheres to the provided schema. Do not include any other text or explanations.\n\nJob Description:\n---\n${text}\n---`;
        
        const imageGenPrompt = `
          **Objective:** Create a single, high-quality piece of artwork for a collectible "Job Quest" card.
          **Art Style:** Inspired by the iconic, clean, character-focused style of artists like Ken Sugimori for Pokémon TCG. Cel-shaded, with clean lines and simple coloring.
          **Focus:** The artwork MUST feature a single, clear, central subject (a character or creature) that metaphorically represents the job described in the text.
          **Background:** The background MUST be a complete, but MINIMALISTIC, scene or environment. DO NOT use a plain white or empty background.
          **CRITICAL INSTRUCTIONS (MANDATORY):**
          1.  **NO TEXT:** The final image MUST NOT contain any words, letters, numbers, or symbols. It must be a pure illustration.
          2.  **NO BORDERS OR FRAMES:** Do not draw a card border or any UI elements. The output must be the full-bleed artwork only.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview', // <-- CRITICAL FIX: Use the correct multi-modal model
            contents: [
                { parts: [{ text: parsePrompt }, { text: imageGenPrompt }] }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: jobSchema,
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const jsonPart = result.candidates?.[0]?.content?.parts?.find(p => p.text);
        const imagePart = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (!jsonPart?.text || !imagePart?.inlineData?.data) {
             const blockReason = result.candidates?.[0]?.finishReason;
             const reasonDetails = blockReason ? `Request blocked for safety reasons: ${blockReason}` : 'The AI response was missing required parts (JSON or Image).';
             console.error("Multi-modal response missing parts:", JSON.stringify(result, null, 2));
             return response.status(500).json({ error: 'Could not generate complete card data.', details: reasonDetails });
        }
        
        return response.status(200).json({
            jobData: jsonPart.text,
            imageBytes: imagePart.inlineData.data
        });
      }

      case 'generateRandomImage': {
          const prompt = `A vibrant, high-quality illustration of a mythical creature in a dynamic pose, cel-shaded, simple but complete background, fantasy art style. CRITICAL: NO TEXT, NO BORDERS, NO UI.`;
          
          const result = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image-preview',
              contents: [{ parts: [{ text: prompt }] }],
              config: {
                  responseModalities: [Modality.IMAGE],
              },
          });
          
          const imagePart = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (!imagePart?.inlineData?.data) {
              console.error("Random image response missing data:", JSON.stringify(result, null, 2));
              return response.status(500).json({ error: 'Could not generate random image.' });
          }
          
          return response.status(200).json({ imageBytes: imagePart.inlineData.data });
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