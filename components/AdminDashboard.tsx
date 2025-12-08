import React from 'react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, BrainCircuit, ShieldAlert, Globe, ArrowRight, MapPin, AlertTriangle } from 'lucide-react';

const driftData = [
  { month: 'Jul', actual: 88, projected: 88, safeZone: 85 },
  { month: 'Aug', actual: 87, projected: 87, safeZone: 85 },
  { month: 'Sep', actual: 89, projected: 88, safeZone: 85 },
  { month: 'Oct', actual: 85, projected: 86, safeZone: 85 },
  { month: 'Nov', actual: 82, projected: 84, safeZone: 85 },
  { month: 'Dec', actual: null, projected: 79, safeZone: 85 }, // Drift happening
  { month: 'Jan', actual: null, projected: 76, safeZone: 85 },
];

const emergingRisks = [
  { term: "Sustainability Claims", growth: "+145%", severity: "High", context: "EU Green Directive" },
  { term: "Competitor Naming", growth: "+65%", severity: "Medium", context: "Sales Pitch Decks" },
  { term: "Outdated Logo Usage", growth: "+32%", severity: "Low", context: "Internal Memos" },
  { term: "Gendered Language", growth: "+28%", severity: "Medium", context: "Job Descriptions" },
];

const regionalDrift = [
    { region: 'North America', score: 88, status: 'Stable' },
    { region: 'Europe', score: 72, status: 'Drifting' },
    { region: 'APAC', score: 81, status: 'Stable' },
    { region: 'LATAM', score: 65, status: 'Critical' },
];

export const AdminDashboard: React.FC = () => {
  const regionalDetailed = regionalDrift.map(r => ({
      ...r,
      issues: r.region === 'Europe' ? 42 : r.region === 'LATAM' ? 23 : r.region === 'North America' ? 15 : 8,
      topIssue: r.region === 'Europe' ? 'Green Claims' : r.region === 'LATAM' ? 'Tone Check' : r.region === 'North America' ? 'Competitor Mentions' : 'Formatting'
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* AI Insight Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4">
              <div className="p-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm h-fit">
                  <BrainCircuit className="h-6 w-6 text-indigo-300" />
              </div>
              <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                      AI System Forecast: <span className="text-amber-300">Brand Drift Detected</span>
                  </h2>
                  <p className="text-indigo-100 text-sm mt-1 max-w-2xl leading-relaxed">
                      Analysis of recent assets indicates a <strong>12% increase</strong> in non-compliant "Sustainability" terminology in the <strong>Europe</strong> region. 
                      Without intervention, overall brand alignment score is projected to fall below the safe threshold (85) by January.
                  </p>
              </div>
          </div>
          <button className="whitespace-nowrap px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg shadow-lg shadow-indigo-900/50 transition-colors flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              View Mitigation Plan
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart: Brand Drift Projection */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                  <div>
                      <h3 className="text-lg font-bold text-slate-900">Brand Alignment Drift Forecast</h3>
                      <p className="text-sm text-slate-500">Historical performance vs. AI-projected trajectory based on current ingestion patterns.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full"></div> Actual
                      <div className="w-3 h-3 bg-indigo-300 rounded-full opacity-50 ml-2"></div> Projected
                      <div className="w-3 h-3 bg-emerald-500 rounded-full ml-2"></div> Safe Zone
                  </div>
              </div>
              
              <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={driftData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <Tooltip 
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Area type="monotone" dataKey="actual" stroke="#4f46e5" fill="url(#colorActual)" strokeWidth={3} />
                          <Line type="monotone" dataKey="projected" stroke="#a5b4fc" strokeDasharray="5 5" strokeWidth={3} dot={false} />
                          <Line type="step" dataKey="safeZone" stroke="#10b981" strokeWidth={2} dot={false} strokeOpacity={0.5} />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Right Column: Emerging Risks */}
          <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-red-500" />
                      Trending Compliance Risks
                  </h3>
                  <div className="space-y-4">
                      {emergingRisks.map((risk, idx) => (
                          <div key={idx} className="group p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                              <div className="flex justify-between items-start mb-1">
                                  <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{risk.term}</span>
                                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{risk.growth}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                                  <span>Context: {risk.context}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                      risk.severity === 'High' ? 'border-red-200 text-red-700 bg-red-50' :
                                      risk.severity === 'Medium' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                                      'border-blue-200 text-blue-700 bg-blue-50'
                                  }`}>{risk.severity}</span>
                              </div>
                          </div>
                      ))}
                  </div>
                  <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center justify-center gap-1 transition-colors">
                      View All Risk Factors <ArrowRight className="h-3 w-3" />
                  </button>
              </div>

              {/* Minified Regional Status */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-slate-400" />
                      Regional Pulse
                  </h3>
                   <div className="space-y-3">
                      {regionalDrift.map((region) => (
                          <div key={region.region} className="flex items-center justify-between text-sm">
                              <span className="font-medium text-slate-600">{region.region}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  region.status === 'Critical' ? 'bg-red-100 text-red-700' :
                                  region.status === 'Drifting' ? 'bg-amber-100 text-amber-700' :
                                  'bg-emerald-100 text-emerald-700'
                              }`}>
                                  {region.status}
                              </span>
                          </div>
                      ))}
                   </div>
              </div>
          </div>
      </div>

      {/* Detailed Regional Analytics Section */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Globe className="h-6 w-6 text-indigo-600" />
            Regional Analytics Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regionalDetailed.map((item, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-indigo-500" />
                            <h4 className="font-bold text-slate-700">{item.region}</h4>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Alignment Score</span>
                                <span className="font-bold text-slate-700">{item.score}/100</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${item.score < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{width: `${item.score}%`}}></div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                             <div className="flex justify-between items-center mb-1">
                                 <span className="text-xs font-semibold text-slate-500">Active Issues</span>
                                 <span className={`text-sm font-bold ${item.issues > 20 ? 'text-red-600' : 'text-slate-700'}`}>{item.issues}</span>
                             </div>
                             <div className="flex items-center gap-2 mt-2">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                <span className="text-xs text-slate-600 truncate">Top: <strong>{item.topIssue}</strong></span>
                             </div>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                             <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                 View Report <ArrowRight className="h-3 w-3" />
                             </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};