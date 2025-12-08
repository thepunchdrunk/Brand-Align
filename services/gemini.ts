import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Purpose, Region, AnalysisResult, BrandSettings, AssetType } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Define the schema for the analysis response
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "Overall score from 0 to 100" },
    subScores: {
      type: Type.OBJECT,
      properties: {
        visual: { type: Type.NUMBER },
        tone: { type: Type.NUMBER },
        terminology: { type: Type.NUMBER },
        compliance: { type: Type.NUMBER },
        cultural: { type: Type.NUMBER },
        purpose: { type: Type.NUMBER },
      },
      required: ["visual", "tone", "terminology", "compliance", "cultural", "purpose"]
    },
    summary: { type: Type.STRING, description: "A brief 2 sentence summary of the analysis." },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["Visual", "Tone", "Terminology", "Cultural", "Compliance", "Purpose"] },
          description: { type: Type.STRING },
          suggestion: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] }
        },
        required: ["id", "category", "description", "suggestion", "severity"]
      }
    },
    correctedText: { type: Type.STRING, description: "A fully rewritten version of the input text incorporating all suggestions." }
  },
  required: ["overallScore", "subScores", "issues", "summary", "correctedText"]
};

// Schema for extracting settings from a document
const settingsExtractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    brandName: { type: Type.STRING },
    mission: { type: Type.STRING },
    audience: { type: Type.STRING },
    toneVoice: { type: Type.STRING },
    styleGuide: { type: Type.STRING },
    bannedTerms: { type: Type.STRING },
    inclusiveLanguage: { type: Type.BOOLEAN }
  },
  required: ["brandName", "toneVoice", "bannedTerms", "inclusiveLanguage"]
};

// Schema for context detection
const contextDetectionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        purpose: { type: Type.STRING, enum: Object.values(Purpose) },
        assetType: { type: Type.STRING, enum: Object.values(AssetType) }
    },
    required: ["purpose", "assetType"]
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
  
  const isVisual = [AssetType.IMAGE, AssetType.VIDEO, AssetType.PRESENTATION, AssetType.WEBSITE, AssetType.ADVERTISEMENT, AssetType.SOCIAL_POST].includes(assetType);
  
  const visualCriteria = isVisual 
    ? `1. Visual: Analyze the visual elements, composition, color usage, text overlays, and overall aesthetic alignment against the brand.`
    : `1. Visual (Structure): Evaluate the structure, formatting, hierarchy, and readability of the document against the Editorial Style Guide (e.g. Capitalization, Dates, Numbers).`;

  const systemInstruction = `
    You are an expert Brand Alignment & Cultural Intelligence Engine acting as the guardian for the brand "${settings.brandName}".
    
    === BRAND GUIDELINES CONFIGURATION ===
    
    1. MISSION & PURPOSE:
    ${settings.mission}
    
    2. TARGET AUDIENCE PERSONAS:
    ${settings.audience}
    
    3. VOICE & TONE ARCHETYPE:
    ${settings.toneVoice}
    
    4. EDITORIAL STYLE GUIDE (Grammar, Formatting, Mechanics):
    ${settings.styleGuide}
    
    5. NEGATIVE CONSTRAINTS (Banned Terms):
    ${settings.bannedTerms}
    
    6. INCLUSIVITY SETTING:
    ${settings.inclusiveLanguage ? "Strict Global Inclusivity (Gender-neutral, culturally sensitive)" : "Standard"}
    
    === CONTEXT ===
    - Asset Type: ${assetType}
    - Target Purpose: ${purpose}
    - Target Region: ${region}
    - User Context: "${additionalContext || "None"}"

    Your goal is to score the content and provide actionable fixes.
    
    IMPORTANT INSTRUCTION:
    Analyze the ACTUAL content provided (Text, PDF, Audio, or Image). Do NOT simulate or hallucinate content.
    If the content contains text, analyze it deeply for tone, terminology, and style mechanics.
    
    SCORING CRITERIA:
    ${visualCriteria}
    2. Tone: Does it match the "${settings.toneVoice}" style? Is it consistent with the Mission?
    3. Terminology: Are specific industry terms used correctly? FLAG any usage of: ${settings.bannedTerms}.
    4. Compliance: Are there legal risks or prohibited claims?
    5. Cultural: Is the language inclusive and culturally adapted for ${region}? Does it fit the Target Audience?
    6. Purpose: Does it effectively achieve the goal of a ${purpose}?

    Return a JSON object matching the provided schema.
  `;

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
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze this text and determine the 'Purpose' and 'AssetType'. 
        
        Purposes: ${Object.values(Purpose).join(', ')}
        AssetTypes: ${Object.values(AssetType).join(', ')}
        
        Text: ${content.substring(0, 1000)}`,
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
  const prompt = `
    Analyze the following brand guidelines document (or text snippet) and extract the key configuration settings.
    
    Return a JSON object with:
    1. brandName: The likely name of the brand.
    2. mission: The mission statement or core purpose.
    3. audience: Description of target audiences.
    4. toneVoice: A detailed description of the tone of voice.
    5. styleGuide: Specific editorial rules (capitalization, date formats, etc).
    6. bannedTerms: A comma-separated string of terms that are explicitly discouraged.
    7. inclusiveLanguage: Boolean.

    Document Content:
    ${content.substring(0, 5000)}
  `;

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