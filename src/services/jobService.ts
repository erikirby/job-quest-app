import type { Job, Profile, JobRating, GenerateContentResponse } from '../types';

const jobSchema = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING", description: "The job title. Be concise." },
    company: { type: "STRING", description: "The name of the company hiring." },
    location: { type: "STRING", description: "The job location, e.g., 'Remote' or 'Tokyo, Japan'." },
    url: { type: "STRING", description: "The direct URL to apply or view the job. If not present, use a Google search URL for the company's career page." },
    tags: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "A list of 3-5 relevant skills or keywords, e.g., 'React', 'TypeScript', 'Localization'."
    },
    description: {
      type: "STRING",
      description: "A brief, 2-3 sentence summary of the job role and responsibilities. Keep it in plain text."
    },
    remote: {
      type: "BOOLEAN",
      description: "True if the job is remote, false otherwise."
    },
  },
  required: ['title', 'company', 'location', 'description', 'remote', 'tags', 'url'],
};

const ratingSchema = {
  type: "OBJECT",
  properties: {
    rating: { type: "INTEGER", description: "A star rating from 1 (poor fit) to 5 (perfect fit)." },
    reasoning: { type: "STRING", description: "A concise, 2-4 sentence explanation for the rating, using emojis to make it engaging." }
  },
  required: ['rating', 'reasoning']
};

async function callApi<T>(action: string, payload: any): Promise<T> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  return response.json();
}

const parseAndCleanResponse = <T,>(response: any): T => {
    // The response from the proxy is the full SDK response object.
    // Check for safety blocks first.
    const blockReason = response?.promptFeedback?.blockReason;
    if (blockReason) {
        console.error("Gemini request was blocked:", response.promptFeedback);
        throw new Error(`Request blocked for safety reasons: ${blockReason}. Please adjust your input.`);
    }

    const text = response?.text;
    if (typeof text !== 'string' || text.trim() === '') {
        console.error("Invalid or empty text response from Gemini:", response);
        throw new Error("The AI returned an empty or invalid response. Please try again.");
    }

    try {
        const jsonStr = text.trim().replace(/^```json\s*|```$/g, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error parsing Gemini JSON response:", error, { text });
        throw new Error("Could not understand the AI's response.");
    }
};

export const jobService = {
  parseJobFromText: async (text: string): Promise<Partial<Job>> => {
    const prompt = `You are an expert HR assistant. Extract structured information from the following job description text. Return ONLY a single JSON object that strictly adheres to the provided schema. Do not include any other text or explanations.\n\nJob Description:\n---\n${text}\n---`;
    const payload = {
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: jobSchema },
    };
    const response = await callApi<GenerateContentResponse>('parseJobFromText', payload);
    return parseAndCleanResponse<Partial<Job>>(response);
  },

  parseJobFromImage: async (base64ImageData: string, mimeType: string): Promise<Partial<Job>> => {
    const prompt = `You are an expert HR assistant with OCR. Extract structured info from the job posting screenshot. Return ONLY a single JSON object adhering to the schema. If a URL isn't visible, create a Google search URL for "[Company Name] careers".`;
    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const payload = {
      model: "gemini-2.5-flash",
      contents: { parts: [{ text: prompt }, imagePart] },
      config: { responseMimeType: "application/json", responseSchema: jobSchema },
    };
    const response = await callApi<GenerateContentResponse>('parseJobFromImage', payload);
    return parseAndCleanResponse<Partial<Job>>(response);
  },
  
  generateJobImage: async (job: Partial<Job>): Promise<string> => {
    const prompt = `**Objective:** Create a single, high-quality piece of artwork for a collectible "Job Quest" card.\n**Art Style:** Inspired by the iconic, clean, character-focused style of early Pokémon TCG artists like Ken Sugimori. Cel-shaded, with clean lines and simple coloring. The artwork MUST feature a single, clear, central subject (a character, creature, or symbolic object) that metaphorically represents the job.\n**Subject Matter:**\n- **Job Title:** "${job.title}"\n- **Job Description:** "${job.description}"\n- **Concept:** Generate a creative, metaphorical character. For example, "Network Engineer": A futuristic cybernetic courier with glowing data packets. "Japanese Tutor": A wise, scholarly kitsune (fox spirit).\n- **Background:** MINIMALISTIC. Simple shapes or a soft gradient.\n**CRITICAL INSTRUCTIONS:**\n1.  **NO TEXT:** The image must not contain any words, letters, or numbers.\n2.  **NO BORDERS OR FRAMES:** Do not draw a card border. The output must be the full-bleed artwork only.\n3.  **SINGLE SUBJECT:** Focus on one compelling character or creature.`;
    const payload = {
      model: 'imagen-4.0-generate-001',
      prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '4:3' },
    };
    const response = await callApi<{ generatedImages: { image: { imageBytes: string } }[] }>('generateJobImage', payload);
    if (response.generatedImages && response.generatedImages.length > 0) {
      return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
    }
    throw new Error("No image was generated.");
  },

  rateJobFit: async (jobDescription: string, profile: Profile): Promise<JobRating> => {
    const prompt = `You are a helpful and encouraging career coach AI. Analyze a job description and rate how well it fits a user's profile on a 1 to 5 star scale.\n\n**User Profile Preferences:**\n- **Remote Only:** ${profile.preferences.remoteOnly}\n- **Keywords:** ${profile.preferences.keywords.join(', ')}\n- **Preferred Roles:** ${profile.preferences.preferredRoles.join(', ')}\n\n**Job Description to Analyze:**\n---\n${jobDescription}\n---\n\n**Your Task:** Based on the user's preferences, analyze the job description and return ONLY a single JSON object that strictly adheres to the provided schema. Your reasoning should be positive and encouraging, even if the fit is low. Use emojis to make it engaging!`;
    const payload = {
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: ratingSchema },
    };
    const response = await callApi<GenerateContentResponse>('rateJobFit', payload);
    return parseAndCleanResponse<JobRating>(response);
  }
};