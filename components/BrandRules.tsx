import React, { useState } from 'react';
import { Save, Shield, AlertTriangle, Lock, Info, Upload, RefreshCw, Link2, FileCheck, BrainCircuit } from 'lucide-react';
import { BrandSettings } from '../types';
import { extractBrandSettings } from '../services/gemini';

interface BrandRulesProps {
  settings: BrandSettings;
  onSave: (settings: BrandSettings) => void;
}

export const BrandRules: React.FC<BrandRulesProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<BrandSettings>(settings);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'core' | 'compliance'>('core');

  const handleSync = async () => {
      setIsSyncing(true);
      // Simulate API call to fetch from CMS
      setTimeout(() => {
          setFormData({
              brandName: "Acme Corp Global",
              toneVoice: "Our voice is human, clear, and confident. We speak to the user, not at them. We prioritize clarity over cleverness, but allow for moments of delight. We are never bureaucratic or stiff.",
              bannedTerms: "synergy, best-in-class, disruption, hack, guru, rockstar",
              inclusiveLanguage: true
          });
          setIsSyncing(false);
      }, 1500);
  };

  const handleSave = () => {
      onSave(formData);
      // Visual feedback handled by parent or toast ideally
  };

  return (
    <div className="space-y-8">
      
      {/* Sync/Connect Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
            <div className="flex items-center gap-6">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20">
                    <BrainCircuit className="h-8 w-8 text-indigo-300" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Dynamic Knowledge Graph</h2>
                    <p className="text-indigo-200 text-sm mt-1 max-w-lg">
                        The engine is currently running on manual configuration. Connect to your headless CMS or Brandfolder API for real-time synchronization.
                    </p>
                </div>
            </div>
            <div className="flex gap-3">
                 <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/50"
                 >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync with CMS'}
                 </button>
                 <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg flex items-center gap-2 backdrop-blur-sm border border-white/10 transition-colors">
                    <Link2 className="h-4 w-4" />
                    Connect API
                 </button>
            </div>
          </div>
          
          {/* Quick Stats Strip */}
          <div className="bg-white p-4 border-t border-slate-100 flex divide-x divide-slate-100">
              <div className="px-6 flex-1 flex items-center gap-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Synced</div>
                  <div className="text-sm font-semibold text-slate-700">Just now</div>
              </div>
              <div className="px-6 flex-1 flex items-center gap-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source</div>
                  <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-semibold text-slate-700">Manual Override</span>
                  </div>
              </div>
              <div className="px-6 flex-1 flex items-center gap-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Version</div>
                  <div className="text-sm font-semibold text-slate-700">v2.5.4 (Draft)</div>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
                  <button 
                    onClick={() => setActiveTab('core')}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-all ${activeTab === 'core' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                      <div className="flex items-center gap-3">
                          <Shield className={`h-5 w-5 ${activeTab === 'core' ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="font-semibold">Core Identity</span>
                      </div>
                      {activeTab === 'core' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('compliance')}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-all ${activeTab === 'compliance' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                      <div className="flex items-center gap-3">
                          <AlertTriangle className={`h-5 w-5 ${activeTab === 'compliance' ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="font-semibold">Risk & Compliance</span>
                      </div>
                      {activeTab === 'compliance' && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>}
                  </button>
              </div>

              <div className="bg-indigo-900 rounded-xl p-6 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                       <Upload className="h-24 w-24" />
                   </div>
                   <h3 className="font-bold text-lg mb-2">Import Guidelines</h3>
                   <p className="text-indigo-200 text-sm mb-4">Upload PDF/DOCX brand books to auto-extract rules.</p>
                   <button 
                     onClick={() => document.getElementById('file-upload-rules')?.click()}
                     className="w-full py-2 bg-white text-indigo-900 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors"
                    >
                       Upload Document
                   </button>
                   <input 
                    type="file" 
                    id="file-upload-rules" 
                    className="hidden" 
                    accept=".txt,.pdf,.docx"
                    onChange={async (e) => {
                        if (e.target.files?.[0]) {
                            const text = `Simulated extraction from ${e.target.files[0].name}...`; 
                            const settings = await extractBrandSettings(text);
                            setFormData(settings);
                        }
                    }}
                   />
              </div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  {activeTab === 'core' && (
                      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div>
                              <h3 className="text-lg font-bold text-slate-900 mb-1">Brand Identity</h3>
                              <p className="text-sm text-slate-500 mb-6">Define how the brand refers to itself and sounds.</p>
                              
                              <div className="space-y-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Primary Brand Name</label>
                                      <input 
                                          type="text" 
                                          value={formData.brandName}
                                          onChange={e => setFormData({...formData, brandName: e.target.value})}
                                          className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-900 font-medium transition-shadow"
                                      />
                                  </div>

                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tone of Voice Definition</label>
                                      <textarea 
                                          value={formData.toneVoice}
                                          onChange={e => setFormData({...formData, toneVoice: e.target.value})}
                                          className="w-full h-40 p-4 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-700 leading-relaxed resize-none transition-shadow"
                                          placeholder="e.g. Friendly, professional, and concise..."
                                      />
                                  </div>
                              </div>
                          </div>
                          
                          <div className="pt-6 border-t border-slate-100">
                               <label className="flex items-center justify-between cursor-pointer group">
                                   <div>
                                       <span className="font-bold text-slate-900 block group-hover:text-indigo-700 transition-colors">Strict Inclusivity Protocol</span>
                                       <span className="text-sm text-slate-500">Enforce gender-neutral and culturally sensitive language globally.</span>
                                   </div>
                                   <div className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.inclusiveLanguage ? 'bg-indigo-600' : 'bg-slate-200'}`} onClick={() => setFormData({...formData, inclusiveLanguage: !formData.inclusiveLanguage})}>
                                       <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${formData.inclusiveLanguage ? 'translate-x-6' : 'translate-x-0'}`} />
                                   </div>
                               </label>
                          </div>
                      </div>
                  )}

                  {activeTab === 'compliance' && (
                       <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                           <div>
                              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                                  Negative Constraints
                              </h3>
                              <p className="text-sm text-slate-500 mb-6">Terms that should trigger immediate compliance flags.</p>

                              <div className="bg-red-50/50 rounded-xl p-6 border border-red-100">
                                  <label className="block text-xs font-bold text-red-800 uppercase tracking-wider mb-3">Restricted Terminology Blocklist</label>
                                  <input 
                                      type="text" 
                                      value={formData.bannedTerms}
                                      onChange={e => setFormData({...formData, bannedTerms: e.target.value})}
                                      className="w-full p-4 bg-white border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-red-900 placeholder-red-300 shadow-sm"
                                  />
                                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                      <Info className="h-3 w-3" />
                                      Comma separated. Matches will be flagged as High Severity.
                                  </p>
                              </div>
                           </div>
                       </div>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={handleSave}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all"
                      >
                          <Save className="h-4 w-4" />
                          Save Changes
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};