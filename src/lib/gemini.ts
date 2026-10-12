import { GoogleGenAI } from "@google/genai";
import { useStore } from "@/src/store/useStore";

export async function generateImage(prompt: any): Promise<string> {
  const customKey = useStore.getState().geminiApiKey;
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  
  // If no API key is available, fallback to a free, no-key service like Pollinations AI
  if (!apiKey) {
    console.warn("No Gemini API key found. Falling back to free image generation service.");
    // Extract text prompt from the complex prompt object if needed
    let textPrompt = "";
    if (typeof prompt === "string") {
      textPrompt = prompt;
    } else if (prompt.parts && prompt.parts.length > 0) {
      textPrompt = prompt.parts.find((p: any) => p.text)?.text || "A beautiful design";
    } else if (Array.isArray(prompt)) {
      textPrompt = prompt.find((p: any) => p.text)?.text || "A beautiful design";
    }

    // Add a random seed to ensure unique images for the same prompt
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(textPrompt)}?seed=${seed}&width=1024&height=1024&nologo=true`;
    
    // Fetch the image and convert to base64 to match the expected return type
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to generate image with fallback service");
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
}
