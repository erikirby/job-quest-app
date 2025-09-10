import { GoogleGenAI, Type } from "@google/genai";
import type { Job, Profile, JobRating } from '../types';

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

const ratingSchema = {
  type: Type.OBJECT,
  properties: {
    rating: { type: Type.INTEGER, description: "A star rating from 1 (poor fit) to 5 (perfect fit)." },
    reasoning: { type: Type.STRING, description: "A concise, 2-4 sentence explanation for the rating, using emojis to make it engaging." }
  },
  required: ['rating', 'reasoning']
};

const parseAndCleanResponse = <T,>(responseText: string): T => {
  try {
    const jsonStr = responseText.trim();
    // Gemini can sometimes return markdown ```json ... ```, so we strip it.
    const cleanedJsonStr = jsonStr.replace(/^```json\s*|```$/g, '');
    const parsed = JSON.parse(cleanedJsonStr);
    return parsed;
  } catch (error) {
    console.error("Error parsing Gemini JSON response:", error);
    throw new Error("Could not understand the AI's response. It might be in an unexpected format.");
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

      return parseAndCleanResponse<Partial<Job>>(response.text);
    } catch (error) {
      console.error("Failed to parse job from text:", error);
      throw error;
    }
  },

  rateJobFit: async (jobDescription: string, profile: Profile): Promise<JobRating> => {
    console.log("Rating job fit with Gemini...");
    const prompt = `
      You are a helpful and encouraging career coach AI. Your task is to analyze a job description and rate how well it fits a user's profile on a 1 to 5 star scale.
      
      **User Profile Preferences:**
      - **Remote Only:** ${profile.preferences.remoteOnly}
      - **Keywords:** ${profile.preferences.keywords.join(', ')}
      - **Preferred Roles:** ${profile.preferences.preferredRoles.join(', ')}

      **Job Description to Analyze:**
      ---
      ${jobDescription}
      ---

      **Your Task:**
      Based on the user's preferences, analyze the job description and return ONLY a single JSON object that strictly adheres to the provided schema. 
      Your reasoning should be positive and encouraging, even if the fit is low. Use emojis to make it engaging!
    `;

    try {
       const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: ratingSchema,
        },
      });

      return parseAndCleanResponse<JobRating>(response.text);
    } catch (error) {
      console.error("Failed to rate job fit:", error);
      throw new Error("Could not analyze the job rating. Please try again.");
    }
  }
};