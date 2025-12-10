import { BrandSettings, AssetType, Purpose, Region } from '../types';

export const getAnalysisSystemInstruction = (
    settings: BrandSettings,
    assetType: AssetType,
    purpose: Purpose,
    region: Region,
    additionalContext?: string
) => {
    const isVisual = [
        AssetType.IMAGE,
        AssetType.VIDEO,
        AssetType.PRESENTATION,
        AssetType.WEBSITE,
        AssetType.ADVERTISEMENT,
        AssetType.SOCIAL_POST
    ].includes(assetType);

    const visualCriteria = isVisual
        ? `1. Visual: Analyze the visual elements, composition, color usage, text overlays, and overall aesthetic alignment against the brand.`
        : `1. Visual (Structure): Evaluate the structure, formatting, hierarchy, and readability of the document against the Editorial Style Guide (e.g. Capitalization, Dates, Numbers).`;

    return `
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
};

export const CONTEXT_DETECTION_PROMPT = (content: string, purposeList: string, assetTypeList: string) => `
    Analyze this text and determine the 'Purpose' and 'AssetType'. 
        
    Purposes: ${purposeList}
    AssetTypes: ${assetTypeList}
    
    Text: ${content}
`;

export const SETTINGS_EXTRACTION_PROMPT = (content: string) => `
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
    ${content}
`;
