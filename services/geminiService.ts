import { GoogleGenAI } from "@google/genai";
import { EntryType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Helper to ensure we don't crash if no API key
const checkAi = () => {
  if (!ai) {
    console.warn("Gemini API Key missing");
    return false;
  }
  return true;
};

export const analyzeSleep = async (comment: string, durationStr: string): Promise<string> => {
  if (!checkAi() || !ai) return "AI is sleeping... (No API Key)";
  
  try {
    const prompt = `You are a gentle, kawaii sleep coach. User slept: ${durationStr}. Their bedtime thought: "${comment}". Give a short, encouraging, cute 1-sentence feedback.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Sweet dreams! ✨";
  } catch (error) {
    console.error("AI Error", error);
    return "Sleep tight! (AI Error)";
  }
};

export const analyzeFood = async (description: string, imageBase64?: string): Promise<string> => {
  if (!checkAi() || !ai) return "Bon appétit! (No API Key)";

  try {
    const parts: any[] = [{ text: `You are a cute nutritionist sticker. Analyze this meal: "${description}". Be kind but helpful. Keep it under 30 words. Cute tone.` }];
    
    if (imageBase64) {
      // Strip prefix if present (data:image/png;base64,)
      const cleanBase64 = imageBase64.split(',')[1] || imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: imageBase64 ? 'gemini-2.5-flash-image' : 'gemini-2.5-flash',
      contents: { parts },
    });
    return response.text || "Yummy! 🍱";
  } catch (error) {
    console.error("AI Error", error);
    return "Looks good! (AI Error)";
  }
};

export const praiseOutput = async (description: string): Promise<string> => {
  if (!checkAi() || !ai) return "Good job! ⭐ (No API Key)";

  try {
    const prompt = `You are an overly supportive anime cheerleader. The user accomplished: "${description}". Give them high-energy, excessive praise with emojis! Max 2 sentences.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "You are amazing! ⭐";
  } catch (error) {
    console.error("AI Error", error);
    return "Great work! (AI Error)";
  }
};

export const generateWeeklySummary = async (type: EntryType, dataSummary: string): Promise<string> => {
  if (!checkAi() || !ai) return "Keep going! (No API Key)";

  try {
    const prompt = `Act as a cute pixel-art game guide. Summarize the user's progress for ${type} based on this data: ${dataSummary}. Provide 1 actionable, gentle tip.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "You're doing great!";
  } catch (error) {
    return "Data looks interesting! (AI Error)";
  }
};
