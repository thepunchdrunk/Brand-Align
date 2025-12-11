
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Purpose, Region, AnalysisResult, BrandSettings, AssetType, FixIntensity } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to clean Markdown JSON blocks
const cleanJson = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
};

// Define the schema for the analysis response
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "Overall score from 0 to 100" },
    confidenceScore: { type: Type.NUMBER, description: "AI confidence in this analysis from 0 to 100" },
    categories: {
        type: Type.OBJECT,
        properties: {
            visual: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    layoutComplexity: { type: Type.STRING, enum: ['Low', 'Optimal', 'High'], description: "Density and structural complexity of the asset" },
                    metrics: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                status: { type: Type.STRING, enum: ['Pass', 'Fail', 'Warn'] }
                            }
                        }
                    }
                },
                required: ["score", "metrics", "layoutComplexity"]
            },
            cultural: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    toneDrift: { type: Type.NUMBER, description: "Percentage deviation from brand tone (0-100)" },
                    metrics: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                status: { type: Type.STRING, enum: ['Pass', 'Fail', 'Warn'] }
                            }
                        }
                    }
                },
                required: ["score", "metrics", "toneDrift"]
            },
            compliance: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    riskAssessment: { type: Type.STRING, enum: ['Low', 'Medium', 'Critical'], description: "Overall GRC risk impact" },
                    metrics: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                status: { type: Type.STRING, enum: ['Pass', 'Fail', 'Warn'] }
                            }
                        }
                    },
                    claims: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                status: { type: Type.STRING, enum: ['Verified', 'Unverified', 'Expired'] },
                                citation: { type: Type.STRING }
                            },
                            required: ["text", "status"]
                        }
                    }
                },
                required: ["score", "metrics", "riskAssessment", "claims"]
            }
        },
        required: ["visual", "cultural", "compliance"]
    },
    culturalDeepDive: {
        type: Type.OBJECT,
        properties: {
            regionDetected: { type: Type.STRING },
            suitabilitySummary: { type: Type.STRING, description: "Actionable summary of how well this fits the region." },
            insights: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        dimension: { type: Type.STRING, enum: ['Symbolism', 'Language', 'Taboo', 'Values', 'Humor'] },
                        observation: { type: Type.STRING },
                        riskLevel: { type: Type.STRING, enum: ['Safe', 'Risky', 'Offensive'] },
                        recommendation: { type: Type.STRING }
                    },
                    required: ["dimension", "observation", "riskLevel", "recommendation"]
                }
            }
        },
        required: ["regionDetected", "suitabilitySummary", "insights"]
    },
    summary: { type: Type.STRING, description: "A brief 2 sentence summary of the analysis." },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["Visual", "Cultural", "Compliance"] },
          subcategory: { type: Type.STRING },
          description: { type: Type.STRING },
          suggestion: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          priorityScore: { type: Type.NUMBER, description: "Calculated priority 1-100 based on severity and impact" }
        },
        required: ["id", "category", "subcategory", "description", "suggestion", "severity", "priorityScore"]
      }
    },
    correctedText: { type: Type.STRING, description: "A fully rewritten version of the input text incorporating all suggestions." }
  },
  required: ["overallScore", "categories", "culturalDeepDive", "issues", "summary", "correctedText", "confidenceScore"]
};

const translationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    translatedText: { type: Type.STRING },
    notes: { type: Type.STRING },
    stylisticScore: { type: Type.NUMBER, description: "0-100 score of how well brand voice was preserved in translation" },
    complianceIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of any compliance terms violated in the target language" }
  },
  required: ["translatedText", "notes", "stylisticScore"]
};

// Schema for context detection
const contextDetectionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        purpose: { type: Type.STRING, enum: Object.values(Purpose) },
        assetType: { type: Type.STRING, enum: Object.values(AssetType) },
        confidence: { type: Type.NUMBER }
    },
    required: ["purpose", "assetType", "confidence"]
};

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

export const analyzeContent = async (
  content: string, 
  purpose: Purpose, 
  region: Region,
  assetType: AssetType,
  settings: BrandSettings,
  fixIntensity: FixIntensity,
  fileBase64?: string,
  mimeType?: string,
  additionalContext?: string
): Promise<AnalysisResult> => {
  const ai = getClient();
  
  const systemInstruction = `
    You are "BrandAlign Core Engine", a GRC-grade governance AI.
    Analyze assets against brand guidelines with "Ultra-Deep" precision.
    
    === SCORING WEIGHTS LOGIC ===
    - If Purpose is "Crisis Response" or "Legal", COMPLIANCE weight = 60%.
    - If Purpose is "Social Media", CULTURAL weight = 50%.
    - If Asset is "Presentation", VISUAL weight = 40%.
    
    === PILLARS ===
    1. VISUAL & STRUCTURAL
       - Layout Complexity: Analyze text density, alignment, white space.
       - Adaptive Logo Detection: Check for distorted/low-res logos.
       - Font Hierarchy & Spacing.
    
    2. CULTURAL & TONE
       - Tone Drift: Calculate % deviation from "${settings.toneVoice}".
       - Region: "${region}". Apply micro-rules (e.g. if Japan, check politeness levels; if US, check directness).
       - Symbolism: Flag colors/objects with cultural meaning.
    
    3. COMPLIANCE & GOVERNANCE
       - Banned Terms: ${settings.bannedTerms}.
       - Risk Impact: Assign Low/Medium/Critical based on regulatory exposure.
       - Claims Accuracy: Identify statistical or factual claims. Mark as 'Unverified' if no source is clear.
       - Expiration: Check for time-sensitive claims (e.g. "Best of 2023") that might be expired.

    === CONTEXT ===
    Mission: ${settings.mission}
    Audience: ${settings.audience}
    Purpose: ${purpose}
    Fix Intensity: ${fixIntensity} (Adjust rewrite aggressiveness accordingly).
    
    Return JSON matching the schema. Calculate 'priorityScore' (1-100) for issues based on severity + frequency.
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
      return JSON.parse(cleanJson(response.text)) as AnalysisResult;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const translateContent = async (content: string, targetLanguage: string, settings: BrandSettings): Promise<{ translatedText: string, notes: string, stylisticScore: number, complianceIssues?: string[] }> => {
    const ai = getClient();
    const prompt = `
      Translate to ${targetLanguage} while maintaining this Tone: "${settings.toneVoice}".
      Strictly avoid these banned terms: "${settings.bannedTerms}".
      
      POST-TRANSLATION CHECK:
      1. Calculate "Stylistic Alignment Score" (0-100): How well does the translated text capture the original brand voice?
      2. Re-run Compliance: Did any banned terms slip through or appear due to localization? List them.
      
      Text: "${content.substring(0, 5000)}"
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: translationSchema }
    });
    if (response.text) return JSON.parse(cleanJson(response.text));
    throw new Error("Translation failed");
};

export const detectContext = async (content: string): Promise<{ purpose: Purpose, assetType: AssetType, confidence: number }> => {
    const ai = getClient();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze text to determine 'Purpose' and 'AssetType'. Provide a confidence score (0-100). Options: ${Object.values(Purpose).join(', ')} / ${Object.values(AssetType).join(', ')}. Text: ${content.substring(0, 1000)}`,
        config: { responseMimeType: "application/json", responseSchema: contextDetectionSchema }
    });
    if (response.text) return JSON.parse(cleanJson(response.text));
    return { purpose: Purpose.MARKETING, assetType: AssetType.DOCUMENT, confidence: 0 };
};

export const extractBrandSettings = async (content: string): Promise<BrandSettings> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Extract brand settings from: ${content.substring(0, 5000)}`,
    config: { responseMimeType: "application/json", responseSchema: settingsExtractionSchema }
  });
  if (response.text) return JSON.parse(cleanJson(response.text));
  throw new Error("Failed to extract settings");
};
