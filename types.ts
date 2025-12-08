export enum UserRole {
  GENERAL_USER = 'GENERAL_USER',
  ADMIN = 'ADMIN'
}

export enum AppView {
  UPLOAD = 'UPLOAD',
  RESULTS = 'RESULTS',
  HISTORY = 'HISTORY',
  BRAND_GUIDELINES = 'BRAND_GUIDELINES',
  KNOWLEDGE_BASE = 'KNOWLEDGE_BASE',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  ANALYTICS = 'ANALYTICS'
}

export enum Purpose {
  MARKETING = 'Marketing',
  INTERNAL_COMMS = 'Internal Comms',
  LEGAL = 'Legal',
  SOCIAL_MEDIA = 'Social Media',
  SALES_PITCH = 'Sales Pitch',
  PRESS_RELEASE = 'Press Release',
  CRISIS = 'Crisis Response',
  HR = 'HR & Recruitment',
  PRODUCT = 'Product & UX',
  TECHNICAL = 'Technical Docs',
  INVESTOR = 'Investor Relations',
  EXECUTIVE = 'Executive Briefing',
  SUPPORT = 'Customer Support',
  TRAINING = 'Training & L&D'
}

export type Region = string;

export enum AssetType {
  DOCUMENT = 'Document',
  PRESENTATION = 'Presentation',
  EMAIL = 'Email',
  IMAGE = 'Image',
  VIDEO = 'Video',
  WEBSITE = 'Website',
  SOCIAL_POST = 'Social Media Post',
  ADVERTISEMENT = 'Advertisement',
  ARTICLE = 'Article / Blog',
  SCRIPT = 'Script',
  UI_COPY = 'UI / UX Copy',
  NEWSLETTER = 'Newsletter',
  PODCAST = 'Podcast'
}

export interface BrandSettings {
  brandName: string;
  mission: string;        // Strategic Mission Statement
  audience: string;       // Target Audience Personas
  toneVoice: string;      // Voice Archetype & tonal rules
  styleGuide: string;     // Grammar, Mechanics, Formatting (e.g. Dates, Capitalization)
  bannedTerms: string;    // Negative constraints
  inclusiveLanguage: boolean;
}

export interface Issue {
  id: string;
  category: 'Visual' | 'Tone' | 'Terminology' | 'Cultural' | 'Compliance' | 'Purpose';
  description: string;
  suggestion: string;
  severity: 'Low' | 'Medium' | 'High';
  fixed?: boolean;
}

export interface AnalysisResult {
  overallScore: number;
  subScores: {
    visual: number;
    tone: number;
    terminology: number;
    compliance: number;
    cultural: number;
    purpose: number;
  };
  issues: Issue[];
  correctedText?: string;
  summary: string;
}

export interface UploadState {
  file: File | null;
  textInput: string;
  sharePointUrl?: string;
  purpose: Purpose;
  region: Region;
  assetType: AssetType;
  fileBase64?: string;
  mimeType?: string;
  additionalContext: string;
}