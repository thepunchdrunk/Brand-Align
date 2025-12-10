import { GoogleGenAI } from "@google/genai";
import { Purpose, Region, AnalysisResult, BrandSettings, AssetType } from '../types';
import { getAnalysisSystemInstruction, CONTEXT_DETECTION_PROMPT, SETTINGS_EXTRACTION_PROMPT } from '../config/prompts';
import { analysisSchema, settingsExtractionSchema, contextDetectionSchema } from '../config/schemas';

const getClient = () => {
  // Prefer the Vite client-side env var; gracefully fall back for server contexts.
  const apiKey = typeof import.meta !== 'undefined'
    ? import.meta.env.VITE_GEMINI_API_KEY as string | undefined
    : undefined;

  const fallbackKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
  const resolvedKey = apiKey || fallbackKey;

  if (!resolvedKey) {
    throw new Error("API Key not found");
  }

  return new GoogleGenAI({ apiKey: resolvedKey });
};

export const analyzeContent = async (
  content: string,
  purpose: Purpose,
  region: Region,
  assetType: AssetType,
  settings: BrandSettings,
  fileBase64?: string,
  mimeType?: string,
  additionalContext?: string
): Promise<AnalysisResult> => {
  const ai = getClient();

  const systemInstruction = getAnalysisSystemInstruction(settings, assetType, purpose, region, additionalContext);

  try {
    const parts: any[] = [{ text: content || 'Analyze the attached asset.' }];

    if (fileBase64 && mimeType) {
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: fileBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }

    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const detectContext = async (content: string): Promise<{ purpose: Purpose, assetType: AssetType }> => {
  const ai = getClient();
  const prompt = CONTEXT_DETECTION_PROMPT(content.substring(0, 1000), Object.values(Purpose).join(', '), Object.values(AssetType).join(', '));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: contextDetectionSchema
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as { purpose: Purpose, assetType: AssetType };
  }
  return { purpose: Purpose.MARKETING, assetType: AssetType.DOCUMENT };
};

export const extractBrandSettings = async (content: string): Promise<BrandSettings> => {
  const ai = getClient();
  const prompt = SETTINGS_EXTRACTION_PROMPT(content.substring(0, 5000));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: settingsExtractionSchema
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as BrandSettings;
  }
  throw new Error("Failed to extract settings");
};