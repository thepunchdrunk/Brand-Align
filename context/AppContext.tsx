import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, AppView, BrandSettings, AnalysisResult, UploadState, Purpose, AssetType } from '../types';
import { BRAND_SETTINGS } from '../config/brandSettings';

interface AppContextType {
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    currentView: AppView;
    setCurrentView: (view: AppView) => void;

    brandSettings: BrandSettings;
    setBrandSettings: (settings: BrandSettings) => void;

    analysisResult: AnalysisResult | null;
    setAnalysisResult: (result: AnalysisResult | null) => void;

    uploadState: UploadState;
    setUploadState: React.Dispatch<React.SetStateAction<UploadState>>;

    isAnalyzing: boolean;
    setIsAnalyzing: (isAnalyzing: boolean) => void;

    resetAnalysis: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userRole, setUserRole] = useState<UserRole>(UserRole.GENERAL_USER);
    const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);
    const [brandSettings, setBrandSettings] = useState<BrandSettings>(BRAND_SETTINGS);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [uploadState, setUploadState] = useState<UploadState>({
        file: null,
        textInput: '',
        purpose: Purpose.MARKETING,
        region: "Global",
        assetType: AssetType.DOCUMENT,
        additionalContext: ''
    });

    // Reset view when role changes
    useEffect(() => {
        if (userRole === UserRole.ADMIN) {
            setCurrentView(AppView.ANALYTICS);
        } else {
            setCurrentView(AppView.UPLOAD);
        }
    }, [userRole]);

    const resetAnalysis = () => {
        setAnalysisResult(null);
        setUploadState({
            file: null,
            textInput: '',
            purpose: Purpose.MARKETING,
            region: "Global",
            assetType: AssetType.DOCUMENT,
            additionalContext: ''
        });
        setCurrentView(AppView.UPLOAD);
    };

    return (
        <AppContext.Provider value={{
            userRole,
            setUserRole,
            currentView,
            setCurrentView,
            brandSettings,
            setBrandSettings,
            analysisResult,
            setAnalysisResult,
            uploadState,
            setUploadState,
            isAnalyzing,
            setIsAnalyzing,
            resetAnalysis
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
