
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, AlertTriangle, AlertOctagon, 
  RefreshCw, Download, Sparkles, ArrowRightLeft,
  Palette, ShieldAlert, Globe, ArrowRight, LayoutTemplate,
  Languages, Copy, PartyPopper,
  Map, Fingerprint, XCircle, Search, ThumbsUp, ChevronDown, Check,
  Activity, Zap, Gauge, AlignLeft, Scale, FileCheck
} from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { AnalysisResult, Issue, AssetType, BrandSettings, FixIntensity } from '../types';
import { translateContent } from '../services/gemini';

interface ScoreDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
  originalText: string;
  assetType: AssetType;
  brandSettings?: BrandSettings;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({ result, onReset, originalText, assetType, brandSettings }) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'translation'>('analysis');
  const [selectedCategory, setSelectedCategory] = useState<'Visual' | 'Cultural' | 'Compliance'>('Visual'); 
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [fixedIssues, setFixedIssues] = useState<Set<string>>(new Set());
  
  // New States for Ultra-Deep Features
  const [fixIntensity, setFixIntensity] = useState<FixIntensity>('Medium');
  const [showDiffView, setShowDiffView] = useState(false);
  
  // Translation State
  const [targetLang, setTargetLang] = useState('Spanish');
  const [translatedText, setTranslatedText] = useState('');
  const [translationNotes, setTranslationNotes] = useState('');
  const [translationScore, setTranslationScore] = useState<number>(0);
  const [translationIssues, setTranslationIssues] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  // Dynamic Score State
  const [displayScore, setDisplayScore] = useState(0);

  // Check if asset supports text operations
  const isTextBased = !!originalText || 
                      assetType === AssetType.DOCUMENT || 
                      assetType === AssetType.EMAIL || 
                      assetType === AssetType.ARTICLE ||
                      assetType === AssetType.SOCIAL_POST;

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Emerald 500
    if (score >= 70) return '#f59e0b'; // Amber 500
    return '#ef4444'; // Red 500
  };

  const handleFix = (id: string) => {
      const newFixed = new Set(fixedIssues);
      if (newFixed.has(id)) newFixed.delete(id);
      else newFixed.add(id);
      setFixedIssues(newFixed);
  };

  const handleFixAll = (category: string) => {
      const categoryIssues = result.issues.filter(i => i.category === category && i.severity !== 'High');
      const newFixed = new Set(fixedIssues);
      categoryIssues.forEach(i => newFixed.add(i.id));
      setFixedIssues(newFixed);
  }

  const handleTranslate = async () => {
      if (!brandSettings || !originalText) return;
      setIsTranslating(true);
      try {
          const res = await translateContent(originalText, targetLang, brandSettings);
          setTranslatedText(res.translatedText);
          setTranslationNotes(res.notes);
          setTranslationScore(res.stylisticScore);
          setTranslationIssues(res.complianceIssues || []);
      } catch (e) {
          console.error(e);
      } finally {
          setIsTranslating(false);
      }
  };

  const handleDownload = () => {
      const textToDownload = activeTab === 'translation' ? translatedText : result.correctedText;
      if (!textToDownload) return;
      const element = document.createElement("a");
      const file = new Blob([textToDownload], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = activeTab === 'translation' ? `translated_${targetLang}.txt` : "corrected_asset.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
  };

  const fixedCount = fixedIssues.size;
  const totalIssues = result.issues.length;
  const potentialGainPerIssue = (100 - result.overallScore) / (totalIssues || 1);
  const projectedScore = Math.min(100, Math.round(result.overallScore + (fixedCount * potentialGainPerIssue)));
  const isPerfectScore = projectedScore === 100;

  useEffect(() => {
    const timer = setTimeout(() => {
        setDisplayScore(projectedScore);
    }, 100);
    return () => clearTimeout(timer);
  }, [projectedScore]);

  // Enhanced Pillar Card with Deep Metrics
  const PillarCard = ({ title, score, metrics, icon: Icon, colorClass, onClick, active, extraMetric }: any) => (
      <div 
        onClick={onClick}
        className={`relative p-5 rounded-2xl border transition-all cursor-pointer group overflow-hidden ${
            active 
            ? `bg-white border-${colorClass.split('-')[1]}-500 ring-1 ring-${colorClass.split('-')[1]}-500 shadow-lg scale-[1.02]` 
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md opacity-90'
        }`}
      >
          <div className="flex justify-between items-start mb-3">
              <div className={`p-2.5 rounded-xl ${active ? `bg-${colorClass.split('-')[1]}-100 text-${colorClass.split('-')[1]}-700` : 'bg-slate-50 text-slate-400'}`}>
                  <Icon className="h-5 w-5" />
              </div>
              <div className="text-right">
                  <div className={`text-xl font-bold ${score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                      {score}/100
                  </div>
              </div>
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-3">{title}</h3>
          
          {extraMetric && (
              <div className="mb-3 pb-3 border-b border-slate-100">
                  {extraMetric}
              </div>
          )}

          <div className="space-y-1.5">
              {metrics.slice(0, 3).map((m: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 truncate max-w-[120px]">{m.name}</span>
                      {m.status === 'Pass' && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                      {m.status === 'Warn' && <AlertOctagon className="h-3.5 w-3.5 text-amber-500" />}
                      {m.status === 'Fail' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                  </div>
              ))}
          </div>
      </div>
  );

  const filteredIssues = result.issues.filter(i => i.category === selectedCategory).sort((a,b) => b.priorityScore - a.priorityScore);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pb-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
                onClick={() => setActiveTab('analysis')}
                className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                    activeTab === 'analysis' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <LayoutTemplate className="h-4 w-4" />
                Deep Analysis
            </button>
            {isTextBased && (
                <button 
                    onClick={() => setActiveTab('translation')}
                    className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                        activeTab === 'translation' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Languages className="h-4 w-4" />
                    Translation
                </button>
            )}
          </div>
          
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
               <div className="text-right">
                   <div className="flex items-center gap-1 justify-end">
                       <span className={`text-xl font-bold leading-none ${isPerfectScore ? 'text-emerald-600' : 'text-slate-900'}`}>{displayScore}</span>
                       <span className="text-xs text-slate-400">/100</span>
                   </div>
                   <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 justify-end">
                       Confidence: {Math.round(result.confidenceScore || 85)}%
                   </div>
               </div>
               <div className="h-10 w-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: displayScore, fill: getScoreColor(displayScore) }]} startAngle={90} endAngle={-270}>
                        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                        <RadialBar background dataKey="value" cornerRadius={10} />
                        </RadialBarChart>
                    </ResponsiveContainer>
               </div>
          </div>
      </div>

      {activeTab === 'analysis' && (
          <div className="space-y-6">
              {/* PILLAR CARDS WITH DEEP METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Visual Pillar */}
                  <PillarCard 
                    title="Visual & Structural" 
                    score={result.categories.visual.score} 
                    metrics={result.categories.visual.metrics} 
                    icon={Palette}
                    colorClass="text-blue-500"
                    active={selectedCategory === 'Visual'}
                    onClick={() => { setSelectedCategory('Visual'); setSelectedIssue(null); }}
                    extraMetric={
                        <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-500 font-medium">Layout Complexity</span>
                             <span className={`px-2 py-0.5 rounded-full font-bold ${
                                 result.categories.visual.layoutComplexity === 'Optimal' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                             }`}>
                                 {result.categories.visual.layoutComplexity || 'Optimal'}
                             </span>
                        </div>
                    }
                  />

                  {/* Cultural Pillar */}
                  <PillarCard 
                    title="Cultural & Tone" 
                    score={result.categories.cultural.score} 
                    metrics={result.categories.cultural.metrics} 
                    icon={Globe}
                    colorClass="text-indigo-500"
                    active={selectedCategory === 'Cultural'}
                    onClick={() => { setSelectedCategory('Cultural'); setSelectedIssue(null); }}
                    extraMetric={
                        <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-500 font-medium">Tone Drift</span>
                             <div className="flex items-center gap-2">
                                 <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                     <div className={`h-full ${result.categories.cultural.toneDrift > 20 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(result.categories.cultural.toneDrift || 5, 100)}%` }}></div>
                                 </div>
                                 <span className="font-bold text-slate-700">{result.categories.cultural.toneDrift || 5}%</span>
                             </div>
                        </div>
                    }
                  />

                  {/* Compliance Pillar */}
                  <PillarCard 
                    title="Compliance" 
                    score={result.categories.compliance.score} 
                    metrics={result.categories.compliance.metrics} 
                    icon={ShieldAlert}
                    colorClass="text-emerald-500"
                    active={selectedCategory === 'Compliance'}
                    onClick={() => { setSelectedCategory('Compliance'); setSelectedIssue(null); }}
                    extraMetric={
                        <div className="flex justify-between items-center text-xs">
                             <span className="text-slate-500 font-medium">Risk Impact</span>
                             <span className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                                 result.categories.compliance.riskAssessment === 'Critical' ? 'bg-red-50 text-red-600' : 
                                 result.categories.compliance.riskAssessment === 'Medium' ? 'bg-amber-50 text-amber-600' : 
                                 'bg-emerald-50 text-emerald-600'
                             }`}>
                                 {result.categories.compliance.riskAssessment === 'Critical' && <AlertTriangle className="h-3 w-3" />}
                                 {result.categories.compliance.riskAssessment || 'Low'}
                             </span>
                        </div>
                    }
                  />
              </div>

              {/* DYNAMIC CONTENT AREA */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
                  
                  {/* LEFT: ISSUES LIST (4 Cols) */}
                  <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                              {selectedCategory} Findings
                              <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{filteredIssues.length}</span>
                          </h3>
                          {filteredIssues.length > 0 && (
                              <button 
                                onClick={() => handleFixAll(selectedCategory)}
                                className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                              >
                                Fix Low Priority
                              </button>
                          )}
                      </div>
                      <div className="overflow-y-auto flex-1 p-2 space-y-2 max-h-[500px]">
                          {filteredIssues.map((issue) => (
                              <div 
                                  key={issue.id}
                                  onClick={() => setSelectedIssue(issue)}
                                  className={`p-3 rounded-lg cursor-pointer border transition-all ${
                                      selectedIssue?.id === issue.id 
                                      ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                  }`}
                              >
                                  <div className="flex justify-between items-start mb-1">
                                      <div className="flex gap-2">
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                              issue.severity === 'High' ? 'bg-red-100 text-red-700' : 
                                              issue.severity === 'Medium' ? 'bg-amber-100 text-amber-700' : 
                                              'bg-blue-100 text-blue-700'
                                          }`}>
                                              {issue.subcategory}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-bold mt-0.5">Pri: {issue.priorityScore}</span>
                                      </div>
                                      {fixedIssues.has(issue.id) ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertOctagon className="h-4 w-4 text-slate-300" />}
                                  </div>
                                  <p className="text-sm font-medium text-slate-800 mt-2 line-clamp-2">{issue.description}</p>
                              </div>
                          ))}
                          {filteredIssues.length === 0 && (
                              <div className="p-8 text-center text-slate-400">
                                  <Check className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                  <p className="text-sm">No issues found.</p>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* RIGHT: DETAIL VIEW (8 Cols) */}
                  <div className="lg:col-span-8 flex flex-col gap-6">
                       
                       {/* CULTURAL SPECIAL SECTION */}
                       {selectedCategory === 'Cultural' && result.culturalDeepDive && (
                           <div className="bg-indigo-900 rounded-xl p-6 text-white relative overflow-hidden shadow-lg animate-in fade-in slide-in-from-top-4">
                               <div className="absolute top-0 right-0 p-4 opacity-10"><Globe className="h-32 w-32 rotate-12" /></div>
                               <div className="relative z-10 flex flex-col md:flex-row gap-6">
                                   <div className="flex-1">
                                       <div className="flex items-center gap-2 mb-2">
                                           <Map className="h-4 w-4 text-indigo-300" />
                                           <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">Regional Fit Analysis: {result.culturalDeepDive.regionDetected || 'Global'}</span>
                                       </div>
                                       <h3 className="text-lg font-bold mb-2 text-white">Market Adaptation Summary</h3>
                                       <p className="text-indigo-100 text-sm leading-relaxed border-l-2 border-indigo-400 pl-3">
                                           {result.culturalDeepDive.suitabilitySummary}
                                       </p>
                                   </div>
                                   <div className="w-full md:w-1/3 bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/10">
                                       <div className="text-xs font-bold text-indigo-200 uppercase mb-2">Symbolic Sensitivity</div>
                                       <div className="space-y-2">
                                           {result.culturalDeepDive.insights.slice(0,3).map((insight, i) => (
                                               <div key={i} className="flex items-center justify-between text-xs">
                                                   <span className="text-white truncate">{insight.dimension}</span>
                                                   <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                                       insight.riskLevel === 'Safe' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                                   }`}>{insight.riskLevel}</span>
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                               </div>
                           </div>
                       )}

                       {/* COMPLIANCE CLAIMS SECTION */}
                       {selectedCategory === 'Compliance' && result.categories.compliance.claims && result.categories.compliance.claims.length > 0 && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 animate-in fade-in">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FileCheck className="h-4 w-4" /> Claim Verification
                                </h3>
                                <div className="space-y-2">
                                    {result.categories.compliance.claims.map((claim, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100">
                                            <div className={`mt-0.5 p-1 rounded-full ${
                                                claim.status === 'Verified' ? 'bg-emerald-100 text-emerald-600' :
                                                claim.status === 'Expired' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                                {claim.status === 'Verified' ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-800 font-medium">"{claim.text}"</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className={`text-[10px] font-bold uppercase ${
                                                        claim.status === 'Verified' ? 'text-emerald-600' :
                                                        claim.status === 'Expired' ? 'text-red-600' : 'text-amber-600'
                                                    }`}>{claim.status}</span>
                                                    {claim.citation && <span className="text-[10px] text-slate-400">Source: {claim.citation}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                       )}

                       {/* ISSUE DETAIL CARD */}
                       <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                           {selectedIssue ? (
                               <div className="flex flex-col h-full animate-in fade-in duration-300">
                                   <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                       <div>
                                           <h3 className="text-lg font-bold text-slate-800">Issue Remediation</h3>
                                           <p className="text-xs text-slate-500 uppercase tracking-wide">{selectedIssue.category} • {selectedIssue.subcategory}</p>
                                       </div>
                                       <div className="flex gap-2">
                                            {isTextBased && (
                                                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Fix Intensity</span>
                                                    <div className="flex gap-1">
                                                        {(['Low', 'Medium', 'High'] as FixIntensity[]).map((level) => (
                                                            <button 
                                                                key={level}
                                                                onClick={() => setFixIntensity(level)}
                                                                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all ${
                                                                    fixIntensity === level ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                                }`}
                                                                title={level}
                                                            >
                                                                {level[0]}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center">
                                                +{Math.round(potentialGainPerIssue)} Pts
                                            </span>
                                       </div>
                                   </div>
                                   
                                   <div className="p-6 flex-1 space-y-6">
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                            <div className="flex items-center gap-2 mb-2 text-slate-500 font-bold text-xs uppercase">
                                                <Search className="h-3.5 w-3.5" /> Diagnosis
                                            </div>
                                            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedIssue.description}</p>
                                        </div>

                                        <div className="bg-white p-0 rounded-xl border border-indigo-100 ring-1 ring-indigo-50 shadow-sm overflow-hidden">
                                            <div className="bg-indigo-50/50 px-4 py-2 border-b border-indigo-100 flex justify-between items-center">
                                                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase">
                                                    <Sparkles className="h-3.5 w-3.5" /> 
                                                    {showDiffView ? 'AI Suggestion (Diff View)' : 'AI Suggestion'}
                                                </div>
                                                <button 
                                                    onClick={() => setShowDiffView(!showDiffView)}
                                                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
                                                >
                                                    <ArrowRightLeft className="h-3 w-3" />
                                                    {showDiffView ? 'Show Text' : 'Show Diff'}
                                                </button>
                                            </div>
                                            <div className="p-4">
                                                {showDiffView ? (
                                                    <div className="flex gap-4 text-sm">
                                                        <div className="flex-1 bg-red-50 p-3 rounded text-red-800 line-through decoration-red-400 opacity-60">
                                                            {/* Simulate original text related to issue - simplified for demo */}
                                                            ...{selectedIssue.description.substring(0, 50)}...
                                                        </div>
                                                        <div className="flex-1 bg-emerald-50 p-3 rounded text-emerald-800 font-medium">
                                                            {selectedIssue.suggestion}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                                        {selectedIssue.suggestion}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                   </div>
                                   
                                   <div className="p-4 border-t border-slate-200 flex justify-between items-center">
                                        <div className="text-xs text-slate-400 font-medium">
                                            {isTextBased && (
                                                <span>Fix Intensity: <span className="text-slate-700">{fixIntensity}</span></span>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleFix(selectedIssue.id)}
                                            className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
                                                fixedIssues.has(selectedIssue.id)
                                                ? 'bg-slate-100 text-slate-500 cursor-default'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                                            }`}
                                        >
                                            {fixedIssues.has(selectedIssue.id) ? <><Check className="h-4 w-4"/> Applied</> : 'Apply Recommendation'}
                                        </button>
                                   </div>
                               </div>
                           ) : (
                               <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                                   <div className="p-4 bg-slate-50 rounded-full mb-3">
                                      <Search className="h-8 w-8 text-slate-300" />
                                   </div>
                                   <p className="text-sm font-medium">Select an issue to view AI remediation.</p>
                               </div>
                           )}
                       </div>
                  </div>
              </div>
          </div>
      )}

      {/* TRANSLATION TAB */}
      {activeTab === 'translation' && isTextBased && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[600px] flex flex-col overflow-hidden animate-in fade-in">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                   <div className="flex items-center gap-4">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <Languages className="h-4 w-4 text-indigo-500" />
                            Brand-Safe Translation
                       </h3>
                       <div className="h-4 w-px bg-slate-300"></div>
                       <div className="relative">
                            <select 
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg pl-3 pr-8 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Chinese">Chinese</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
                       </div>
                   </div>
                   <button 
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
                   >
                       {isTranslating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                       {isTranslating ? 'Translating...' : 'Generate Translation'}
                   </button>
              </div>

              <div className="flex-1 grid grid-cols-2 divide-x divide-slate-200">
                   <div className="p-6 overflow-auto bg-slate-50/50">
                       <div className="text-xs font-bold text-slate-400 uppercase mb-4">Original Source</div>
                       <div className="text-slate-600 font-mono text-sm whitespace-pre-wrap">{originalText}</div>
                   </div>
                   <div className="p-6 overflow-auto bg-white">
                       <div className="flex justify-between items-center mb-4">
                           <div className="text-xs font-bold text-indigo-500 uppercase">
                               {targetLang} Output
                           </div>
                           {translatedText && (
                               <div className="flex gap-2">
                                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${translationScore > 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                       {translationScore > 80 ? <Check className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                                       Stylistic Match: {translationScore}%
                                   </span>
                               </div>
                           )}
                       </div>
                       
                       {translatedText ? (
                           <div className="space-y-6">
                               <div className="text-slate-800 font-mono text-sm whitespace-pre-wrap">{translatedText}</div>
                               
                               {translationIssues.length > 0 && (
                                   <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                       <div className="text-xs font-bold text-red-800 uppercase mb-2 flex items-center gap-2">
                                           <ShieldAlert className="h-4 w-4" /> Compliance Warning
                                       </div>
                                       <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                                           {translationIssues.map((issue, idx) => (
                                               <li key={idx}>{issue}</li>
                                           ))}
                                       </ul>
                                   </div>
                               )}

                               {translationNotes && (
                                   <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-800">
                                        <strong className="block mb-1">Adaptation Note:</strong> {translationNotes}
                                   </div>
                               )}
                               <button className="text-xs text-indigo-600 font-bold flex items-center gap-1 hover:underline"><Copy className="h-3 w-3"/> Copy</button>
                           </div>
                       ) : (
                           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                               <Globe className="h-8 w-8 mb-2 opacity-50" />
                               <p>Ready to translate.</p>
                           </div>
                       )}
                   </div>
              </div>
          </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl shadow-lg mt-auto">
          <button onClick={onReset} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-300">
              <RefreshCw className="h-4 w-4" /> Analyze New Asset
          </button>
          <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-400">{fixedIssues.size} of {totalIssues} issues resolved</span>
              <button onClick={handleDownload} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-900/50 transition-all">
                  <Download className="h-4 w-4" /> Download Report
              </button>
          </div>
      </div>
    </div>
  );
};
