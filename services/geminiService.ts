import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePhotoDescription = async (base64Image: string): Promise<string> => {
  try {
    // Strip the prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: "You are an analog photography enthusiast and poet. Analyze this photo. Describe the mood, the lighting, and the composition in a short, evocative paragraph (max 40 words). Do not just list objects. Focus on the 'feeling' of the image."
          }
        ]
      }
    });

    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The developer needs to refill the chemicals (API Error).";
  }
};