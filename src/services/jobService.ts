import type { Job, Profile, JobRating } from '../types';

async function callApi<T>(action: string, payload: any): Promise<T> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
    throw new Error(errorData.details || errorData.error || `API request failed with status ${response.status}`);
  }

  return response.json();
}

const parseAndCleanJson = <T,>(text: string): T => {
    if (typeof text !== 'string' || text.trim() === '') {
        throw new Error("The AI returned empty text. Please try again.");
    }
    try {
        const jsonStr = text.trim().replace(/^```json\s*|```$/g, '');
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error parsing Gemini JSON from proxy:", error, { text });
        throw new Error("Could not understand the AI's response.");
    }
};

export const jobService = {
  parseJobFromText: async (text: string): Promise<Partial<Job>> => {
      const payload = { text };
      const response = await callApi<{ text: string }>('parseText', payload);

      if (!response.text) {
          throw new Error("The AI response was incomplete.");
      }

      const jobDetails = parseAndCleanJson<Partial<Job>>(response.text);
      return { ...jobDetails, source: 'Manual Text' };
  },

  rateJobFit: async (jobDescription: string, profile: Profile): Promise<JobRating> => {
    const ratingSchema = {
        type: "OBJECT",
        properties: {
          rating: { type: "INTEGER" },
          reasoning: { type: "STRING" }
        },
        required: ['rating', 'reasoning']
    };
    const prompt = `You are a helpful and encouraging career coach AI. Analyze a job description and rate how well it fits a user's profile on a 1 to 5 star scale.\n\n**User Profile Preferences:**\n- **Remote Only:** ${profile.preferences.remoteOnly}\n- **Keywords:** ${profile.preferences.keywords.join(', ')}\n- **Preferred Roles:** ${profile.preferences.preferredRoles.join(', ')}\n\n**Job Description to Analyze:**\n---\n${jobDescription}\n---\n\n**Your Task:** Based on the user's preferences, analyze the job description and return ONLY a single JSON object that strictly adheres to the provided schema. Your reasoning should be positive and encouraging, even if the fit is low. Use emojis to make it engaging!`;
    const payload = {
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: ratingSchema },
    };
    const response = await callApi<{ text: string }>('rateJobFit', payload);
    return parseAndCleanJson<JobRating>(response.text);
  }
};