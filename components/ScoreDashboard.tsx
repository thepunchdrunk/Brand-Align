import React, { useState } from 'react';
import { 
  CheckCircle, AlertTriangle, AlertOctagon, 
  RefreshCw, Download, Sparkles, ArrowRightLeft, FileText,
  Palette, Mic, Book, ShieldAlert, Globe, Target, ArrowRight, LayoutTemplate
} from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { AnalysisResult, Issue, AssetType } from '../types';

interface ScoreDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  originalText: string;
  assetType: AssetType;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({ result, onReset, originalText, assetType }) => {
  const [viewMode, setViewMode] = useState<'issues' | 'compare'>('issues');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set());

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Emerald 500
    if (score >= 70) return '#f59e0b'; // Amber 500
    return '#ef4444'; // Red 500
  };

  const isVisualAsset = [
      AssetType.IMAGE, 
      AssetType.VIDEO, 
      AssetType.PRESENTATION, 
      AssetType.WEBSITE, 
      AssetType.ADVERTISEMENT, 
      AssetType.SOCIAL_POST
  ].includes(assetType);

  const getCategoryLabel = (key: string) => {
      if (key.toLowerCase() === 'visual') {
          return isVisualAsset ? 'Visual Aesthetics' : 'Structure & Format';
      }
      return key;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'visual': return isVisualAsset ? Palette : LayoutTemplate;
      case 'tone': return Mic;
      case 'terminology': return Book;
      case 'compliance': return ShieldAlert;
      case 'cultural': return Globe;
      case 'purpose': return Target;
      default: return FileText;
    }
  };

  const handleFix = (id: string) => {
      const newFixed = new Set(fixedIssues);
      if (newFixed.has(id)) {
          newFixed.delete(id);
      } else {
          newFixed.add(id);
      }
      setFixedIssues(newFixed);
  };

  const handleApplyAll = () => {
      const allIds = result.issues.map(i => i.id);
      setFixedIssues(new Set(allIds));
      setViewMode('compare');
  };

  const handleDownload = () => {
      if (!result.correctedText) return;
      const element = document.createElement("a");
      const file = new Blob([result.correctedText], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "corrected_asset.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  // Calculate dynamic score based on fixes
  const fixedCount = fixedIssues.size;
  const totalIssues = result.issues.length;
  const projectedScore = Math.min(100, result.overallScore + (fixedCount * ((100 - result.overallScore) / totalIssues)));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-32 w-32" />
            </div>
            <div>
                <h3 className="text-slate-500 font-medium mb-1">Overall Alignment Score</h3>
                <div className="text-5xl font-bold text-slate-900">{Math.round(projectedScore)}<span className="text-2xl text-slate-400">/100</span></div>
                <div className="mt-4 flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${projectedScore > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {projectedScore > 80 ? 'Excellent' : 'Needs Work'}
                    </span>
                    {fixedCount > 0 && <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-700">+{fixedCount} fixes applied</span>}
                </div>
            </div>
            <div className="h-32 w-32">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: projectedScore, fill: getScoreColor(projectedScore) }]} startAngle={90} endAngle={-270}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar background dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-2 flex flex-col justify-center">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-slate-500 font-medium">Category Performance Breakdown</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {Object.entries(result.subScores).map(([key, value]) => {
                    const Icon = getCategoryIcon(key);
                    const color = getScoreColor(value as number);
                    const label = getCategoryLabel(key);
                    
                    return (
                    <div key={key} className="flex items-center gap-4 group">
                        <div className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-slate-200 transition-colors`}>
                            <Icon className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="capitalize text-sm font-bold text-slate-700">{label}</span>
                                <span className="text-sm font-bold transition-colors" style={{ color }}>{value as number}/100</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full rounded-full transition-all duration-1000 ease-out relative"
                                    style={{ 
                                        width: `${value as number}%`, 
                                        backgroundColor: color,
                                        boxShadow: `0 0 10px ${color}40`
                                    }} 
                                >
                                    <div className="absolute inset-0 bg-white/20"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )})}
             </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
          <button 
            onClick={() => setViewMode('issues')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${viewMode === 'issues' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <AlertTriangle className="h-4 w-4" />
              Issues & Fixes
          </button>
          <button 
            onClick={() => setViewMode('compare')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${viewMode === 'compare' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
              <ArrowRightLeft className="h-4 w-4" />
              Compare & Preview
          </button>
      </div>

      {/* Main Content Area */}
      {viewMode === 'issues' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Left: Issue List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Issues ({result.issues.length})
                    </h3>
                    <button 
                        onClick={handleApplyAll}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors"
                    >
                        Apply All Fixes
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {result.issues.map((issue) => (
                        <div 
                            key={issue.id}
                            onClick={() => setSelectedIssue(issue)}
                            className={`p-4 rounded-lg cursor-pointer border transition-all ${
                                selectedIssue?.id === issue.id 
                                ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    issue.severity === 'High' ? 'bg-red-100 text-red-700' : 
                                    issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                    {getCategoryLabel(issue.category)}
                                </span>
                                {fixedIssues.has(issue.id) ? (
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <AlertOctagon className="h-4 w-4 text-slate-300" />
                                )}
                            </div>
                            <p className="text-sm font-medium text-slate-800 line-clamp-2">{issue.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Middle: Fix Details */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col lg:col-span-2 overflow-hidden">
                {selectedIssue ? (
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">{getCategoryLabel(selectedIssue.category)} Issue</h3>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                    selectedIssue.severity === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                }`}>
                                    {selectedIssue.severity} Impact
                                </span>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-6 bg-slate-50/50 space-y-6">
                            
                            {/* Visual Comparison / Fix Block */}
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                    <div className="p-5 bg-amber-50/30">
                                        <div className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <AlertTriangle className="h-3 w-3" /> Issue Detected
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed font-medium">
                                            {selectedIssue.description}
                                        </p>
                                    </div>
                                    <div className="p-5 bg-emerald-50/30">
                                        <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2 flex items-center gap-2">
                                            <Sparkles className="h-3 w-3" /> Recommended Fix
                                        </div>
                                        <p className="text-slate-800 text-base leading-relaxed font-semibold">
                                            "{selectedIssue.suggestion}"
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                    <button 
                                        className="px-4 py-2 rounded-lg font-semibold text-sm text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                        Ignore
                                    </button>
                                    <button 
                                        onClick={() => handleFix(selectedIssue.id)}
                                        className={`px-5 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm ${
                                            fixedIssues.has(selectedIssue.id)
                                            ? 'bg-white text-emerald-600 border border-emerald-200'
                                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        }`}
                                    >
                                        {fixedIssues.has(selectedIssue.id) ? (
                                            <>
                                            <CheckCircle className="h-4 w-4" />
                                            Fix Applied
                                            </>
                                        ) : (
                                            <>
                                            Apply Fix
                                            <ArrowRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="px-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Context & Guidelines</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Based on the <strong>{getCategoryLabel(selectedIssue.category)}</strong> guidelines for your selected purpose, 
                                    this content may cause misalignment or cultural friction. 
                                    {selectedIssue.severity === 'High' && " Immediate attention is recommended due to potential compliance risks."}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <AlertTriangle className="h-12 w-12 mb-4 opacity-20" />
                        <p>Select an issue from the list to view details and AI fixes.</p>
                    </div>
                )}
            </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-indigo-500" />
                    Original vs Corrected
                </h3>
            </div>
            <div className="flex-1 grid grid-cols-2 divide-x divide-slate-200 overflow-hidden">
                <div className="flex flex-col h-full">
                    <div className="p-3 bg-slate-100 text-xs font-bold uppercase text-slate-500 tracking-wider">Original Content</div>
                    <div className="p-6 flex-1 overflow-auto whitespace-pre-wrap text-slate-600 font-mono text-sm">
                        {originalText}
                    </div>
                </div>
                <div className="flex flex-col h-full bg-emerald-50/30">
                     <div className="p-3 bg-emerald-100/50 text-xs font-bold uppercase text-emerald-700 tracking-wider flex justify-between items-center">
                        <span>AI Improved Content</span>
                        <span className="text-emerald-600 text-[10px] bg-white px-2 py-1 rounded-full shadow-sm">Ready to use</span>
                    </div>
                    <div className="p-6 flex-1 overflow-auto whitespace-pre-wrap text-slate-900 font-mono text-sm">
                        {result.correctedText || "No correction generated."}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-lg">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300"
          >
              <RefreshCw className="h-4 w-4" />
              Analyze New File
          </button>
          
          <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-400">
                  {fixedIssues.size} of {totalIssues} issues resolved
              </span>
              <button 
                onClick={handleDownload}
                disabled={!result.correctedText}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-900/50 transition-all"
              >
                  <Download className="h-4 w-4" />
                  Download Corrected
              </button>
          </div>
      </div>
    </div>
  );
};