import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { UploadSection } from './components/UploadSection';
import { ScoreDashboard } from './components/ScoreDashboard';
import { ActivityHistory } from './components/ActivityHistory';
import { BrandRules } from './components/BrandRules';
import { KnowledgeBase } from './components/KnowledgeBase';
import { UserManagement } from './components/UserManagement';
import { AdminDashboard } from './components/AdminDashboard';
import { AppView, UserRole } from './types';
import { analyzeContent } from './services/gemini';
import { AppProvider, useApp } from './context/AppContext';

function MainContent() {
    const {
        userRole, setUserRole,
        currentView, setCurrentView,
        uploadState, setUploadState,
        isAnalyzing, setIsAnalyzing,
        analysisResult, setAnalysisResult,
        brandSettings, setBrandSettings,
        resetAnalysis
    } = useApp();

    const handleAnalyze = async () => {
        // Determine content to analyze
        let contentToAnalyze = uploadState.textInput;

        // Allow empty text if file is present (PDF, Image, etc)
        if (!contentToAnalyze && !uploadState.fileBase64) {
            // If file is selected but no base64 (e.g. unsupported docx that wasn't converted), return
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
                uploadState.fileBase64,
                uploadState.mimeType,
                uploadState.additionalContext
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
                    onAnalyze={handleAnalyze}
                />
            )}

            {userRole === UserRole.GENERAL_USER && currentView === AppView.RESULTS && analysisResult && (
                <ScoreDashboard />
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

            {userRole === UserRole.ADMIN && currentView === AppView.BRAND_GUIDELINES && (
                <BrandRules settings={brandSettings} onSave={setBrandSettings} />
            )}

            {userRole === UserRole.ADMIN && currentView === AppView.USER_MANAGEMENT && (
                <UserManagement />
            )}
        </Layout>
    );
}

export default function App() {
    return (
        <AppProvider>
            <MainContent />
        </AppProvider>
    );
}