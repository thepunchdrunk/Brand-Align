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
    brandName: { type: Type.STRING, description: "The name of the organization or brand found in the text." },
    toneVoice: { type: Type.STRING, description: "A detailed description of the tone of voice based on the text (e.g. 'Professional, authoritative, but approachable')." },
    bannedTerms: { type: Type.STRING, description: "A comma-separated list of negative, prohibited, or discouraged words found in the text." },
    inclusiveLanguage: { type: Type.BOOLEAN, description: "True if the text mentions inclusivity, diversity, or gender-neutral language requirements." }
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
  imageBase64?: string,
  mimeType?: string
): Promise<AnalysisResult> => {
  const ai = getClient();
  
  const systemInstruction = `
    You are an expert Brand Alignment & Cultural Intelligence Engine acting as the guardian for the brand "${settings.brandName}".
    
    Configuration:
    - Asset Type: ${assetType}
    - Brand Tone: ${settings.toneVoice}
    - Prohibited Terms (Flag as Compliance/Terminology Issue): ${settings.bannedTerms}
    - Strict Inclusivity Mode: ${settings.inclusiveLanguage ? "Active" : "Standard"}
    - Target Purpose: ${purpose}
    - Target Region: ${region}

    Your goal is to score the content and provide actionable fixes.
    If an image is provided, analyze the visual elements, text overlays, and overall aesthetic alignment.
    
    Scoring Criteria:
    1. Visual: Does the text/description/image imply high-quality formatting suitable for a ${assetType}?
    2. Tone: Does it match the "${settings.toneVoice}" style and the expectation for ${purpose}?
    3. Terminology: Are specific industry terms used correctly? FLAG any usage of: ${settings.bannedTerms}.
    4. Compliance: Are there legal risks or prohibited claims?
    5. Cultural: Is the language inclusive and culturally adapted for ${region}? If the region is Global, ensure no cultural idioms that are hard to translate are used.
    6. Purpose: Does it effectively achieve the goal of a ${purpose}?

    Return a JSON object matching the provided schema.
  `;

  try {
    const parts: any[] = [{ text: content || 'Analyze this asset.' }];
    if (imageBase64 && mimeType) {
        parts.push({
            inlineData: {
                mimeType: mimeType,
                data: imageBase64
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
    2. toneVoice: A concise summary of the desired tone of voice.
    3. bannedTerms: A comma-separated string of terms that are explicitly discouraged or banned. If none found, return an empty string.
    4. inclusiveLanguage: Boolean, true if the text mentions inclusivity, diversity, or gender-neutral language requirements.

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