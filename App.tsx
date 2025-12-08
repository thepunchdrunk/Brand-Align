import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { UploadSection } from './components/UploadSection';
import { ScoreDashboard } from './components/ScoreDashboard';
import { ActivityHistory } from './components/ActivityHistory';
import { BrandRules } from './components/BrandRules';
import { KnowledgeBase } from './components/KnowledgeBase';
import { UserManagement } from './components/UserManagement';
import { AdminDashboard } from './components/AdminDashboard';
import { AppView, Purpose, Region, UploadState, AnalysisResult, BrandSettings, AssetType, UserRole } from './types';
import { analyzeContent } from './services/gemini';

export default function App() {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.GENERAL_USER);
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  // Reset view when role changes
  useEffect(() => {
      if (userRole === UserRole.ADMIN) {
          setCurrentView(AppView.ANALYTICS);
      } else {
          setCurrentView(AppView.UPLOAD);
      }
  }, [userRole]);

  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    textInput: '',
    purpose: Purpose.MARKETING,
    region: "Global",
    assetType: AssetType.DOCUMENT
  });

  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
      brandName: 'Acme Corp',
      toneVoice: 'Professional, innovative, and customer-centric.',
      bannedTerms: 'cheap, budget, guarantee',
      inclusiveLanguage: true
  });

  const handleAnalyze = async () => {
    // Determine content to analyze
    let contentToAnalyze = uploadState.textInput;
    
    // If no explicit text, check if we need simulation for non-image files
    if (!contentToAnalyze && uploadState.file && !uploadState.imageBase64) {
        // Fallback for demo if no text input but file is there (and NOT an image which is handled via base64)
        contentToAnalyze = `(Content from file: ${uploadState.file.name}) [Simulated Content for Demo]: We are exited to announce our new product that is the best ever in history. Use it or loose it. It's cheap and good for guys who work hard. Guaranteed results or money back.`;
    }

    // Allow empty text if image is present
    if (!contentToAnalyze && !uploadState.imageBase64) return;

    setIsAnalyzing(true);
    try {
        const result = await analyzeContent(
            contentToAnalyze, 
            uploadState.purpose, 
            uploadState.region, 
            uploadState.assetType,
            brandSettings,
            uploadState.imageBase64,
            uploadState.mimeType
        );
        setAnalysisResult(result);
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
    setUploadState({
        file: null,
        textInput: '',
        purpose: Purpose.MARKETING,
        region: "Global",
        assetType: AssetType.DOCUMENT
    });
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
        />
      )}
      
      {userRole === UserRole.GENERAL_USER && currentView === AppView.RESULTS && analysisResult && (
        <ScoreDashboard 
            result={analysisResult} 
            onReset={handleReset}
            originalText={uploadState.textInput || `(Content from file: ${uploadState.file?.name})`}
        />
      )}

      {currentView === AppView.HISTORY && (
          <ActivityHistory />
      )}

      {currentView === AppView.KNOWLEDGE_BASE && (
          <KnowledgeBase />
      )}

      {/* ADMIN VIEWS */}
      {userRole === UserRole.ADMIN && currentView === AppView.ANALYTICS && (
          <AdminDashboard />
      )}

      {userRole === UserRole.ADMIN && currentView === AppView.BRAND_RULES && (
          <BrandRules settings={brandSettings} onSave={setBrandSettings} />
      )}

      {userRole === UserRole.ADMIN && currentView === AppView.USER_MANAGEMENT && (
          <UserManagement />
      )}
    </Layout>
  );
}