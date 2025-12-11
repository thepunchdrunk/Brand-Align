
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
  mission: string;
  audience: string;
  toneVoice: string;
  styleGuide: string;
  bannedTerms: string;
  inclusiveLanguage: boolean;
}

export interface Issue {
  id: string;
  category: 'Visual' | 'Cultural' | 'Compliance';
  subcategory: string; // e.g., 'Layout', 'Tone', 'Legal'
  description: string;
  suggestion: string;
  severity: 'Low' | 'Medium' | 'High';
  priorityScore: number; // New: Calculation of freq + impact
  fixed?: boolean;
}

export interface CulturalInsight {
    dimension: 'Symbolism' | 'Language' | 'Taboo' | 'Values' | 'Humor';
    observation: string;
    riskLevel: 'Safe' | 'Risky' | 'Offensive';
    recommendation: string;
}

export interface Claim {
    text: string;
    status: 'Verified' | 'Unverified' | 'Expired';
    citation?: string;
}

export interface AnalysisResult {
  overallScore: number;
  confidenceScore: number; // New: AI confidence in analysis
  
  // New Grouped Scores with Deep Metrics
  categories: {
      visual: {
          score: number;
          layoutComplexity: 'Low' | 'Optimal' | 'High'; // New
          metrics: { name: string; status: 'Pass' | 'Fail' | 'Warn' }[];
      };
      cultural: {
          score: number;
          toneDrift: number; // New: 0-100% deviation
          metrics: { name: string; status: 'Pass' | 'Fail' | 'Warn' }[];
      };
      compliance: {
          score: number;
          riskAssessment: 'Low' | 'Medium' | 'Critical'; // New
          metrics: { name: string; status: 'Pass' | 'Fail' | 'Warn' }[];
          claims: Claim[]; // New: Specific claims check
      };
  };
  
  culturalDeepDive?: {
      regionDetected: string;
      suitabilitySummary: string;
      insights: CulturalInsight[];
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
  detectedConfidence: number; // New
}

export interface HistoryItem {
    id: number;
    filename: string;
    type: AssetType;
    date: string;
    score: number;
    purpose: Purpose;
    region: Region;
    issues: number;
    status: 'Pass' | 'Needs Review' | 'Critical';
    contextSnapshot?: any; // New: Store settings at time of analysis
}

export type FixIntensity = 'Low' | 'Medium' | 'High';
