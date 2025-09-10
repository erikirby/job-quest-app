import { GoogleGenAI, Type } from "@google/genai";
import type { Job } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const jobSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The job title. Be concise." },
    company: { type: Type.STRING, description: "The name of the company hiring." },
    location: { type: Type.STRING, description: "The job location, e.g., 'Remote' or 'Tokyo, Japan'." },
    url: { type: Type.STRING, description: "The direct URL to apply or view the job. If not present, use a Google search URL for the company's career page." },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of 3-5 relevant skills or keywords, e.g., 'React', 'TypeScript', 'Localization'."
    },
    description: {
      type: Type.STRING,
      description: "A brief, 2-3 sentence summary of the job role and responsibilities. Keep it in plain text."
    },
    remote: {
      type: Type.BOOLEAN,
      description: "True if the job is remote, false otherwise."
    },
  },
  required: ['title', 'company', 'location', 'description', 'remote', 'tags', 'url'],
};

const parseAndCleanResponse = (responseText: string): Partial<Job> => {
  try {
    const jsonStr = responseText.trim();
    // Gemini can sometimes return markdown ```json ... ```, so we strip it.
    const cleanedJsonStr = jsonStr.replace(/^```json\s*|```$/g, '');
    const parsed = JSON.parse(cleanedJsonStr);
    return parsed;
  } catch (error) {
    console.error("Error parsing Gemini JSON response:", error);
    throw new Error("Could not understand the job details. Please try a clearer screenshot or paste more text.");
  }
};


export const jobService = {
  parseJobFromText: async (text: string): Promise<Partial<Job>> => {
    console.log("Parsing job from text with Gemini...");
    const prompt = `
      You are an expert HR assistant. Your task is to extract structured information from the following job description text.
      Analyze the text and return ONLY a single JSON object that strictly adheres to the provided schema. Do not include any other text, explanations, or markdown formatting in your response.

      Job Description Text:
      ---
      ${text}
      ---
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: jobSchema,
        },
      });

      return parseAndCleanResponse(response.text);
    } catch (error) {
      console.error("Failed to parse job from text:", error);
      throw error;
    }
  },

  parseJobFromImage: async (base64ImageData: string, mimeType: string): Promise<Partial<Job>> => {
    console.log("Parsing job from image with Gemini...");
    const prompt = `
      You are an expert HR assistant with powerful OCR capabilities. Your task is to extract structured information from the provided screenshot of a job posting.
      Analyze the image and return ONLY a single JSON object that strictly adheres to the provided schema. Do not include any other text, explanations, or markdown formatting in your response.
      If any fields are unclear, make a reasonable guess. For the URL, if it's not visible, create a Google search URL for "[Company Name] careers".
    `;
    
    const imagePart = {
      inlineData: {
        data: base64ImageData,
        mimeType: mimeType,
      },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [ {text: prompt}, imagePart ]},
        config: {
          responseMimeType: "application/json",
          responseSchema: jobSchema,
        },
      });

      return parseAndCleanResponse(response.text);
    } catch (error) {
      console.error("Failed to parse job from image:", error);
      throw error;
    }
  },
  
  generateJobImage: async (job: Partial<Job>): Promise<string> => {
    console.log("Generating image for job:", job.title);
    
    const jobText = `${job.title || ''} ${(job.tags || []).join(' ')}`.toLowerCase();
    let themeInstructions = "Use a neutral, balanced color palette with earthy tones.";
    if (jobText.includes('localization') || jobText.includes('japanese')) {
        themeInstructions = "The color scheme should be mystical and intelligent, using psychic purples, deep indigos, and glowing pinks. The background should have subtle patterns of ancient runes or swirling psychic energy.";
    } else if (jobText.includes('design') || jobText.includes('creative') || jobText.includes('artist')) {
        themeInstructions = "The color scheme should be fiery and passionate, using vibrant oranges, reds, and bright yellows. The background should have subtle patterns of swirling flames or energetic brush strokes.";
    } else if (jobText.includes('engineer') || jobText.includes('developer') || jobText.includes('tech') || jobText.includes('data')) {
        themeInstructions = "The color scheme should be electric and modern, using sharp yellows, cool blues, and metallic grays. The background should have subtle patterns of circuit board lines or digital data streams.";
    }

    const prompt = `
      Generate a single, vertically-oriented, high-quality ILLUSTRATION ONLY for a collectible job quest card.
      The illustration will be placed inside a card frame later, so it must be full-bleed artwork with NO BORDERS, NO TEXT, and NO UI elements.

      **Artwork Subject:**
      Create a dynamic and detailed illustration that metaphorically captures the essence of the job: "${job.title}".
      The role involves: ${job.description}.
      This could be a fantasy creature, a stylized character, or a symbolic scene. For example, a "Software Engineer" could be a glowing golem forged from data streams; a "Community Manager" could be a charismatic merchant in a bustling fantasy marketplace.

      **Art Style:**
      - **Style:** Modern Japanese trading card game (TCG) art. Vibrant, clean, and slightly anime-influenced.
      - **Composition:** Dynamic pose or scene. High level of detail. Professional finish.
      
      **Theming:**
      - **Color & Mood:** ${themeInstructions}

      **CRITICAL:** The final output must be the artwork ONLY. Do NOT add any card frames, text, HP values, titles, or any other elements.
    `;

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '4:3', // landscape for the smaller frame
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        throw new Error("No image was generated.");
    } catch (error) {
      console.error("Failed to generate job image:", error);
      // Return a placeholder or throw
      throw new Error("Could not generate quest artwork.");
    }
  },
};