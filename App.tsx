
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { UploadSection } from './components/UploadSection';
import { ScoreDashboard } from './components/ScoreDashboard';
import { ActivityHistory } from './components/ActivityHistory';
import { BrandRules } from './components/BrandRules';
import { KnowledgeBase } from './components/KnowledgeBase';
import { UserManagement } from './components/UserManagement';
import { AdminDashboard } from './components/AdminDashboard';
import { AppView, Purpose, Region, UploadState, AnalysisResult, BrandSettings, AssetType, UserRole, HistoryItem, FixIntensity } from './types';
import { analyzeContent } from './services/gemini';

// Sample initial history (used only if storage is empty)
const INITIAL_HISTORY: HistoryItem[] = [
    { 
        id: 1, 
        filename: "Q3_Marketing_Strategy.pptx", 
        type: AssetType.PRESENTATION,
        date: "2023-10-24T14:30:00", 
        score: 92, 
        purpose: Purpose.MARKETING, 
        region: "Global", 
        issues: 3,
        status: 'Pass' 
    },
    { 
        id: 2, 
        filename: "Sales_Pitch_V2.docx", 
        type: AssetType.DOCUMENT,
        date: "2023-10-23T09:15:00", 
        score: 78, 
        purpose: Purpose.SALES_PITCH, 
        region: "North America", 
        issues: 12,
        status: 'Needs Review' 
    }
];

const INITIAL_SETTINGS: BrandSettings = {
    brandName: 'AERION',
    mission: `1. BRAND PHILOSOPHY
AERION is conceived as a clarity engine in a world saturated with noise. The brand’s purpose is not merely to look modern, but to systematically reduce cognitive friction wherever complex systems meet human decision-making. The philosophy below anchors all visual, verbal, and experiential choices.

1.1 Purpose and Role
AERION exists to transform complexity into clarity. Its role is to make technical systems, data, and processes understandable, so that individuals and organizations can act with confidence.`,
    
    audience: `1.4 COGNITIVE LOAD CONSIDERATIONS
AERION design teams are expected to use cognitive load theory as a practical lens. 
1. Extraneous Load: Must be minimized by removing ornamental content.
2. Intrinsic Load: Must be clarified by structuring complex concepts into progressive disclosure.`,

    toneVoice: `2.1 VISUAL PERSONALITY
The visual personality is calm, structured, and quietly confident. Layouts breathe. Color is controlled. Typography is clear and unadorned. There are no decorative flourishes.

2.3 VISUAL RESTRAINT AS STRATEGY
AERION deliberately adopts visual restraint as a strategic tool. The question ‘what can we remove?’ is as important as ‘what must we add?’`,

    styleGuide: `2. VISUAL IDENTITY SYSTEM
The visual system of AERION is built to be rigorous, repeatable, and scalable. It is intentionally minimal but not empty.`,

    bannedTerms: `synergy, paradigm shift, leverage, bandwidth, rockstar, ninja, guru, disruptive (unless referring to tech)`,
    inclusiveLanguage: true
};

const DEFAULT_UPLOAD_STATE: UploadState = {
    file: null,
    textInput: '',
    purpose: Purpose.MARKETING,
    region: "Global",
    assetType: AssetType.DOCUMENT,
    additionalContext: '',
    detectedConfidence: 0
};

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GENERAL_USER);
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // -- PERSISTENCE LAYER --
  const [history, setHistory] = useState<HistoryItem[]>(() => {
      const saved = localStorage.getItem('brandai_history');
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });

  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => {
      const saved = localStorage.getItem('brandai_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [uploadState, setUploadState] = useState<UploadState>(() => {
      const savedDraft = localStorage.getItem('brandai_upload_draft');
      return savedDraft ? JSON.parse(savedDraft) : DEFAULT_UPLOAD_STATE;
  });

  // Save to local storage whenever they change
  useEffect(() => {
      localStorage.setItem('brandai_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
      localStorage.setItem('brandai_settings', JSON.stringify(brandSettings));
  }, [brandSettings]);

  useEffect(() => {
      // Auto-save draft (excluding binary file data to avoid quota issues for demo)
      const draftToSave = { ...uploadState, file: null, fileBase64: undefined };
      localStorage.setItem('brandai_upload_draft', JSON.stringify(draftToSave));
  }, [uploadState]);

  // Reset view when role changes
  useEffect(() => {
      if (userRole === UserRole.ADMIN) {
          setCurrentView(AppView.ANALYTICS);
      } else {
          setCurrentView(AppView.UPLOAD);
      }
  }, [userRole]);

  const handleAnalyze = async () => {
    // Determine content to analyze
    let contentToAnalyze = uploadState.textInput;
    
    // Allow empty text if file is present (PDF, Image, etc)
    if (!contentToAnalyze && !uploadState.fileBase64) {
         if (uploadState.file) {
             alert("Please convert this file to PDF or paste the text content to proceed.");
             return;
         }
         return;
    }

    setIsAnalyzing(true);
    try {
        const result = await analyzeContent(
            contentToAnalyze, 
            uploadState.purpose, 
            uploadState.region, 
            uploadState.assetType,
            brandSettings,
            'Medium', // Default intensity
            uploadState.fileBase64,
            uploadState.mimeType,
            uploadState.additionalContext
        );
        setAnalysisResult(result);
        
        // Add to history
        const newHistoryItem: HistoryItem = {
            id: Date.now(),
            filename: uploadState.file?.name || "Text Snippet Analysis",
            type: uploadState.assetType,
            date: new Date().toISOString(), // Standardize date format
            score: result.overallScore,
            purpose: uploadState.purpose,
            region: uploadState.region,
            issues: result.issues.length,
            status: result.overallScore >= 90 ? 'Pass' : result.overallScore >= 70 ? 'Needs Review' : 'Critical',
            contextSnapshot: {
                brandSettingsVersion: "v2.1",
                region: uploadState.region
            }
        };
        setHistory(prev => [newHistoryItem, ...prev]);

        setCurrentView(AppView.RESULTS);
    } catch (error) {
        console.error("Analysis failed", error);
        alert("Analysis failed. Please check your API Key and try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setUploadState(DEFAULT_UPLOAD_STATE);
    setCurrentView(AppView.UPLOAD);
  };

  return (
    <Layout 
        currentView={currentView} 
        setView={setCurrentView}
        userRole={userRole}
        setUserRole={setUserRole}
    >
      {/* GENERAL USER VIEWS */}
      {userRole === UserRole.GENERAL_USER && currentView === AppView.UPLOAD && (
        <UploadSection 
            uploadState={uploadState} 
            setUploadState={setUploadState}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            history={history}
        />
      )}
      
      {userRole === UserRole.GENERAL_USER && currentView === AppView.RESULTS && analysisResult && (
        <ScoreDashboard 
            result={analysisResult} 
            onReset={handleReset}
            originalText={uploadState.textInput || `(Content from file: ${uploadState.file?.name})`}
            assetType={uploadState.assetType}
            brandSettings={brandSettings}
        />
      )}

      {currentView === AppView.HISTORY && (
          <ActivityHistory history={history} />
      )}

      {currentView === AppView.KNOWLEDGE_BASE && (
          <KnowledgeBase />
      )}

      {/* ADMIN VIEWS */}
      {userRole === UserRole.ADMIN && currentView === AppView.ANALYTICS && (
          <AdminDashboard history={history} />
      )}

      {userRole === UserRole.ADMIN && currentView === AppView.BRAND_GUIDELINES && (
          <BrandRules settings={brandSettings} onSave={setBrandSettings} />
      )}

      {userRole === UserRole.ADMIN && currentView === AppView.USER_MANAGEMENT && (
          <UserManagement />
      )}
    </Layout>
  );
}
