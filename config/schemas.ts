import { Schema, Type } from "@google/genai";
import { Purpose, AssetType } from "../types";

// Define the schema for the analysis response
export const analysisSchema: Schema = {
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
export const settingsExtractionSchema: Schema = {
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
export const contextDetectionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        purpose: { type: Type.STRING, enum: Object.values(Purpose) },
        assetType: { type: Type.STRING, enum: Object.values(AssetType) }
    },
    required: ["purpose", "assetType"]
};
