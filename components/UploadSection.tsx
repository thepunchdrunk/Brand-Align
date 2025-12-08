import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, Wand2, Loader2, Link2, 
  FileText, CheckCircle2, Lock, Image as ImageIcon, Video, Presentation, Mail, Globe,
  Megaphone, Users, Scale, Share2, DollarSign, Newspaper, MapPin, Check, FileType, Laptop,
  ChevronDown, Layout, AlertOctagon, Briefcase, Code2, HeartHandshake, GraduationCap, ShieldAlert,
  ScrollText, Mic, Smartphone, Mails, Sparkles, ScanEye, Lightbulb, MessageSquareQuote, AlertTriangle
} from 'lucide-react';
import { Purpose, Region, UploadState, AssetType } from '../types';
import { detectContext } from '../services/gemini';

interface UploadSectionProps {
  uploadState: UploadState;
  setUploadState: React.Dispatch<React.SetStateAction<UploadState>>;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const COUNTRIES = [
  "Global", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "China", "India", 
  "Brazil", "Mexico", "Italy", "Spain", "South Korea", "Russia", "Netherlands", "Saudi Arabia", "Turkey", "Switzerland", 
  "Taiwan", "Poland", "Sweden", "Belgium", "Thailand", "Ireland", "Austria", "Nigeria", "Argentina", "Norway", 
  "Israel", "UAE", "Vietnam", "South Africa", "Singapore", "Denmark", "Malaysia", "Hong Kong", "Philippines", "Colombia", 
  "Chile", "Finland", "Egypt", "Portugal", "Greece", "New Zealand", "Peru", "Kazakhstan", "Romania", "Ukraine", 
  "Hungary", "Qatar", "Kuwait", "Morocco", "Slovakia", "Ecuador", "Oman", "Dominican Republic", "Puerto Rico", "Kenya", 
  "Angola", "Ethiopia", "Sri Lanka", "Guatemala", "Uzbekistan", "Myanmar", "Luxembourg", "Bulgaria", "Croatia", "Belarus", 
  "Uruguay", "Lithuania", "Serbia", "Slovenia", "Costa Rica", "Panama", "Ivory Coast", "Tanzania", "Cameroon", "Uganda", 
  "Ghana", "Jordan", "Tunisia", "Bahrain", "Bolivia", "Paraguay", "Latvia", "Estonia", "Cyprus", "Iceland", "El Salvador", 
  "Honduras", "Nepal", "Trinidad & Tobago", "Cambodia", "Zimbabwe", "Senegal", "Papua New Guinea"
].sort((a, b) => a === "Global" ? -1 : b === "Global" ? 1 : a.localeCompare(b));

export const UploadSection: React.FC<UploadSectionProps> = ({ 
  uploadState, 
  setUploadState, 
  onAnalyze,
  isAnalyzing 
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'sharepoint'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedFields, setDetectedFields] = useState<string[]>([]);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [enableRegion, setEnableRegion] = useState(uploadState.region !== "Global");
  const [formatWarning, setFormatWarning] = useState<string | null>(null);

  // Clear detection flash after 3 seconds
  useEffect(() => {
    if (detectedFields.length > 0) {
      const timer = setTimeout(() => setDetectedFields([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [detectedFields]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setFormatWarning(null);
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let newAssetType = AssetType.DOCUMENT;
    
    // Determine Asset Type
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) newAssetType = AssetType.IMAGE;
    else if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) newAssetType = AssetType.VIDEO;
    else if (['ppt', 'pptx', 'key'].includes(ext)) newAssetType = AssetType.PRESENTATION;
    else if (['mp3', 'wav', 'm4a'].includes(ext)) newAssetType = AssetType.PODCAST;
    else if (['pdf'].includes(ext)) newAssetType = AssetType.DOCUMENT;

    setDetectedFields(['assetType']);

    const newState: UploadState = { 
        ...uploadState, 
        file,
        assetType: newAssetType,
        textInput: '',
        fileBase64: undefined,
        mimeType: file.type
    };

    // SUPPORTED AI FORMATS: PDF, Image, Audio, Video, Plain Text
    const supportedBinaryTypes = [
        'application/pdf',
        'image/png', 'image/jpeg', 'image/webp', 
        'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a',
        'video/mp4', 'video/mpeg', 'video/quicktime'
    ];

    // Case 1: Binary files supported by Gemini (PDF, Image, Audio, Video)
    if (supportedBinaryTypes.some(type => file.type.includes(type)) || ext === 'pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            const base64 = result.split(',')[1];
            setUploadState({
                ...newState,
                fileBase64: base64,
                mimeType: file.type || (ext === 'pdf' ? 'application/pdf' : file.type)
            });
        };
        reader.readAsDataURL(file);
    } 
    // Case 2: Plain Text files
    else if (file.type.startsWith('text/') || ['txt', 'md', 'csv', 'json'].includes(ext)) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            setUploadState({ ...newState, textInput: text });
            await handleAutoDetect(text);
        };
        reader.readAsText(file);
    } 
    // Case 3: Unsupported Binary (DOCX, PPTX) - No Simulation, User Must Convert
    else {
        setUploadState(newState);
        setFormatWarning("For deep analysis, please upload a PDF version or paste the text content directly. The AI cannot natively read .docx or .pptx files yet.");
    }
  };

  const handleAutoDetect = async (text: string) => {
      if (!text || text.length < 10) return;
      setIsDetecting(true);
      try {
          const detected = await detectContext(text);
          setUploadState(prev => ({
              ...prev, 
              purpose: detected.purpose,
              assetType: detected.assetType
            }));
          setDetectedFields(['purpose', 'assetType']); // Trigger visual feedback for both
      } catch (e) {
          console.error("Auto detect failed", e);
      } finally {
          setIsDetecting(false);
      }
  }

  const handleManualAutoDetect = () => {
      handleAutoDetect(uploadState.textInput);
  }

  const handleSharePointFetch = () => {
      if (!urlInput) return;
      setIsFetchingUrl(true);
      
      // Simulate network request to SharePoint API
      setTimeout(async () => {
          const mockContent = `[IMPORTED FROM SHAREPOINT: ${urlInput}]\n\nCONFIDENTIAL DRAFT - Q3 STRATEGY UPDATE\n\nOur goal is to leverage best-in-class synergy to disrupt the market. We need to focus on low-hanging fruit and drill down into the data. This product is guaranteed to increase revenue by 200%. Let's circle back on this next week.`;
          
          setUploadState(prev => ({
              ...prev,
              textInput: mockContent,
              sharePointUrl: urlInput,
              file: null // Clear file if URL is used
          }));
          
          await handleAutoDetect(mockContent);
          setIsFetchingUrl(false);
      }, 1500);
  };

  const handleRegionToggle = (enabled: boolean) => {
      setEnableRegion(enabled);
      if (!enabled) {
          setUploadState(prev => ({ ...prev, region: "Global" }));
      }
  };

  // Icons mapping for Purpose
  const PurposeIcon = ({ purpose }: { purpose: Purpose }) => {
      switch (purpose) {
          case Purpose.MARKETING: return <Megaphone className="h-3.5 w-3.5" />;
          case Purpose.INTERNAL_COMMS: return <Users className="h-3.5 w-3.5" />;
          case Purpose.LEGAL: return <Scale className="h-3.5 w-3.5" />;
          case Purpose.SOCIAL_MEDIA: return <Share2 className="h-3.5 w-3.5" />;
          case Purpose.SALES_PITCH: return <DollarSign className="h-3.5 w-3.5" />;
          case Purpose.PRESS_RELEASE: return <Newspaper className="h-3.5 w-3.5" />;
          case Purpose.CRISIS: return <ShieldAlert className="h-3.5 w-3.5" />;
          case Purpose.HR: return <Briefcase className="h-3.5 w-3.5" />;
          case Purpose.PRODUCT: return <Layout className="h-3.5 w-3.5" />;
          case Purpose.TECHNICAL: return <Code2 className="h-3.5 w-3.5" />;
          case Purpose.INVESTOR: return <CheckCircle2 className="h-3.5 w-3.5" />;
          case Purpose.EXECUTIVE: return <AlertOctagon className="h-3.5 w-3.5" />;
          case Purpose.SUPPORT: return <HeartHandshake className="h-3.5 w-3.5" />;
          case Purpose.TRAINING: return <GraduationCap className="h-3.5 w-3.5" />;
          default: return <FileText className="h-3.5 w-3.5" />;
      }
  };

  // Icons mapping for Asset Type
  const AssetIcon = ({ type }: { type: AssetType }) => {
      switch(type) {
          case AssetType.DOCUMENT: return <FileText className="h-4 w-4" />;
          case AssetType.PRESENTATION: return <Presentation className="h-4 w-4" />;
          case AssetType.EMAIL: return <Mail className="h-4 w-4" />;
          case AssetType.IMAGE: return <ImageIcon className="h-4 w-4" />;
          case AssetType.VIDEO: return <Video className="h-4 w-4" />;
          case AssetType.WEBSITE: return <Laptop className="h-4 w-4" />;
          case AssetType.SOCIAL_POST: return <Share2 className="h-4 w-4" />;
          case AssetType.ADVERTISEMENT: return <Megaphone className="h-4 w-4" />;
          case AssetType.ARTICLE: return <Newspaper className="h-4 w-4" />;
          case AssetType.SCRIPT: return <ScrollText className="h-4 w-4" />;
          case AssetType.UI_COPY: return <Smartphone className="h-4 w-4" />;
          case AssetType.NEWSLETTER: return <Mails className="h-4 w-4" />;
          case AssetType.PODCAST: return <Mic className="h-4 w-4" />;
          default: return <FileText className="h-4 w-4" />;
      }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Check Content Alignment</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Verify your assets against brand voice, compliance, and cultural standards.
          </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Upload Area */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden h-full flex flex-col">
             {/* Source Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/50">
                <button 
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'upload' 
                        ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-[0_2px_12px_rgba(0,0,0,0.05)]' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <UploadCloud className="h-4 w-4" />
                    Direct Upload
                </button>
                <button 
                    onClick={() => setActiveTab('sharepoint')}
                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'sharepoint' 
                        ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-[0_2px_12px_rgba(0,0,0,0.05)]' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                >
                    <Link2 className="h-4 w-4" />
                    SharePoint Link
                </button>
            </div>

            {/* Main Content Input Area */}
            <div className="p-8 pb-8 flex-1 flex flex-col">
                {activeTab === 'upload' && (
                    <div className="space-y-6 flex-1 flex flex-col animate-in fade-in slide-in-from-left-4 duration-300">
                        {/* File Drop Zone */}
                        <div 
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all duration-300 flex-1 flex flex-col items-center justify-center min-h-[160px] ${
                                isDragging 
                                ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' 
                                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {uploadState.file ? <CheckCircle2 className="h-6 w-6 text-emerald-500"/> : <UploadCloud className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-slate-800">
                                        {uploadState.file ? uploadState.file.name : "Drag & Drop Asset"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        PDF, MP4, MP3, JPG, PNG, TXT supported.
                                    </p>
                                </div>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    id="file-upload"
                                    accept=".pdf,.txt,.md,.jpg,.jpeg,.png,.mp4,.mov,.mp3,.wav,.docx,.pptx"
                                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                                />
                                {!uploadState.file && (
                                    <label 
                                        htmlFor="file-upload"
                                        className="mt-1 px-4 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 cursor-pointer font-bold text-xs uppercase tracking-wide transition-all shadow-sm"
                                    >
                                        Browse Files
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Format Warning for unsupported binaries */}
                        {formatWarning && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-amber-800">Format Optimization Needed</h4>
                                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                        {formatWarning}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Text Content Area (Only if no file) */}
                        {!uploadState.file && (
                            <div className="relative">
                                <div className="absolute top-0 left-0 -mt-3 bg-white px-2 text-xs font-bold text-slate-400 uppercase tracking-wider ml-4">
                                    Text Content
                                </div>
                                <textarea
                                    className="w-full h-24 p-4 bg-white border border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none text-slate-800 text-sm leading-relaxed transition-all shadow-inner"
                                    placeholder="Paste email draft, ad copy, or announcement text here to analyze..."
                                    value={uploadState.textInput}
                                    onChange={(e) => setUploadState({...uploadState, textInput: e.target.value})}
                                />
                                {uploadState.textInput && !uploadState.sharePointUrl && (
                                    <button 
                                        onClick={handleManualAutoDetect}
                                        disabled={isDetecting}
                                        className="absolute bottom-4 right-4 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-md font-bold flex items-center gap-2 transition-colors border border-indigo-100"
                                    >
                                        {isDetecting ? <Loader2 className="h-3 w-3 animate-spin"/> : <Sparkles className="h-3 w-3" />}
                                        {isDetecting ? 'Aligning...' : 'Scan Context'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'sharepoint' && (
                    <div className="space-y-6 flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <Link2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">SharePoint Integration</h3>
                                    <p className="text-sm text-slate-500">Securely fetch documents directly from your organization's cloud.</p>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://company.sharepoint.com/sites/marketing/docs/..." 
                                    className="w-full pl-10 pr-24 py-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 transition-shadow"
                                />
                                <button 
                                    onClick={handleSharePointFetch}
                                    disabled={isFetchingUrl || !urlInput}
                                    className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-md text-sm transition-colors"
                                >
                                    {isFetchingUrl ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Fetch'}
                                </button>
                            </div>
                        </div>

                        {/* Result Preview Area for SharePoint */}
                        {uploadState.textInput && uploadState.sharePointUrl && (
                            <div className="relative animate-in fade-in slide-in-from-bottom-2">
                                <div className="absolute top-0 left-0 -mt-3 bg-white px-2 text-xs font-bold text-emerald-600 uppercase tracking-wider ml-4 border border-emerald-100 rounded-full shadow-sm">
                                    ✓ Document Loaded
                                </div>
                                <textarea
                                    readOnly
                                    className="w-full h-32 p-4 bg-slate-50 border border-emerald-200 rounded-xl outline-none resize-none text-slate-600 text-sm leading-relaxed"
                                    value={uploadState.textInput}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Context Configuration (Metadata Panel) */}
        <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 flex flex-col gap-6 h-full">
                
                {/* Configuration Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <ScanEye className={`h-4 w-4 ${isDetecting ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
                            {isDetecting ? 'AI Scanning...' : 'Metadata Context'}
                        </h3>
                    </div>
                    {(uploadState.file || uploadState.textInput.length > 10) && (
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                           {detectedFields.length > 0 ? 'Context Updated' : 'System Ready'}
                        </span>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Asset Type Dropdown */}
                    <div className={`relative transition-all duration-500 ${detectedFields.includes('assetType') ? 'ring-2 ring-indigo-500/50 rounded-lg p-1 -m-1 bg-indigo-50/30' : ''}`}>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block ml-1 flex justify-between">
                            Asset Format
                            {detectedFields.includes('assetType') && <span className="text-indigo-600 flex items-center gap-1"><Sparkles className="h-3 w-3"/> Auto-detected</span>}
                        </label>
                        <div className="relative">
                            <select 
                                value={uploadState.assetType}
                                onChange={(e) => setUploadState({...uploadState, assetType: e.target.value as AssetType})}
                                className="w-full pl-9 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 appearance-none cursor-pointer hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            >
                                {Object.values(AssetType).map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <div className="absolute left-3 top-3 pointer-events-none text-slate-500">
                                <AssetIcon type={uploadState.assetType} />
                            </div>
                            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Context Field */}
                    <div className="relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block ml-1 flex items-center gap-1">
                            Context
                        </label>
                        <textarea
                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all shadow-sm placeholder:text-slate-400 h-24"
                            placeholder="e.g. Target audience is Gen Z, tone should be casual..."
                            value={uploadState.additionalContext || ''}
                            onChange={(e) => setUploadState({...uploadState, additionalContext: e.target.value})}
                        />
                    </div>

                    {/* Communication Goal Dropdown (Converted from Grid) */}
                    <div className={`relative transition-all duration-500 ${detectedFields.includes('purpose') ? 'ring-2 ring-indigo-500/50 rounded-lg p-1 -m-1 bg-indigo-50/30' : ''}`}>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 block ml-1 flex justify-between">
                            Communication Goal
                            {detectedFields.includes('purpose') && <span className="text-indigo-600 flex items-center gap-1"><Sparkles className="h-3 w-3"/> AI Suggested</span>}
                        </label>
                        <div className="relative">
                             <select 
                                value={uploadState.purpose}
                                onChange={(e) => setUploadState({...uploadState, purpose: e.target.value as Purpose})}
                                className="w-full pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 appearance-none cursor-pointer hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            >
                                {Object.values(Purpose).map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <div className="absolute left-3 top-3 pointer-events-none text-slate-500">
                                <PurposeIcon purpose={uploadState.purpose} />
                            </div>
                            <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    {/* Region Dropdown */}
                    <div className="relative">
                         <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Target Region</label>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-medium text-slate-400">{enableRegion ? 'Specific' : 'Global'}</span>
                                <button 
                                    onClick={() => handleRegionToggle(!enableRegion)}
                                    className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${enableRegion ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                >
                                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${enableRegion ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        </div>
                        
                        <div className={`relative transition-all duration-300 ${enableRegion ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale pointer-events-none'}`}>
                                <select 
                                    value={uploadState.region}
                                    onChange={(e) => setUploadState({...uploadState, region: e.target.value as Region})}
                                    disabled={!enableRegion}
                                    className="w-full pl-9 pr-8 py-3 bg-white border border-indigo-200 rounded-lg text-sm font-semibold text-indigo-900 appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                >
                                    {COUNTRIES.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <div className="absolute left-3 top-3 pointer-events-none text-indigo-500">
                                    <Globe className="h-4 w-4" />
                                </div>
                                <div className="absolute right-3 top-3.5 pointer-events-none text-indigo-300">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1"></div>

                {/* Action Button */}
                <button
                    onClick={onAnalyze}
                    disabled={isAnalyzing || (!uploadState.textInput && !uploadState.file)}
                    className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] ${
                        isAnalyzing || (!uploadState.textInput && !uploadState.file)
                        ? 'bg-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-indigo-600 hover:bg-indigo-500'
                    }`}
                >
                    {isAnalyzing ? (
                        <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Running Compliance...
                        </>
                    ) : (
                        <>
                        Start Analysis
                        <Wand2 className="h-5 w-5" />
                        </>
                    )}
                </button>

            </div>
        </div>
      </div>
    </div>
  );
};