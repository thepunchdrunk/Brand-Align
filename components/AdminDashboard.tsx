
import React, { useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, ReferenceLine
} from 'recharts';
import { 
  TrendingUp, TrendingDown, ShieldAlert, Globe, MapPin, AlertTriangle, 
  CheckCircle2, Layout, FileText, Target, Filter, Download, Calendar, DollarSign, Microscope,
  Sparkles, Activity, Zap
} from 'lucide-react';
import { HistoryItem } from '../types';

interface AdminDashboardProps {
    history: HistoryItem[];
}

// --- MOCK DATA GENERATORS FOR ROBUST VISUALIZATION ---

const TREND_DATA = [
  { date: 'Sep 01', overall: 72, cultural: 65, compliance: 80 },
  { date: 'Sep 08', overall: 75, cultural: 68, compliance: 82 },
  { date: 'Sep 15', overall: 74, cultural: 70, compliance: 79 },
  { date: 'Sep 22', overall: 78, cultural: 75, compliance: 85 },
  { date: 'Sep 29', overall: 82, cultural: 80, compliance: 88 },
  { date: 'Oct 06', overall: 81, cultural: 78, compliance: 90 },
  { date: 'Oct 13', overall: 85, cultural: 82, compliance: 92 },
  { date: 'Oct 20', overall: 88, cultural: 86, compliance: 94 },
  { date: 'Oct 27', overall: 87, cultural: 89, compliance: 95 },
];

const RISK_PROJECTION_DATA = [
    { month: 'Nov', risk: 65 },
    { month: 'Dec', risk: 55 },
    { month: 'Jan', risk: 48 },
    { month: 'Feb', risk: 42 },
    { month: 'Mar', risk: 35 }, // projected lower
];

const ISSUE_DISTRIBUTION = [
  { name: 'Visual / Format', value: 45, color: '#3b82f6' }, // Blue
  { name: 'Cultural Tone', value: 30, color: '#6366f1' },   // Indigo
  { name: 'Compliance', value: 25, color: '#10b981' },      // Emerald
];

const ROOT_CAUSE_DATA = [
    { name: 'Unclear Guideline', value: 35, color: '#f59e0b' },
    { name: 'Legacy Template', value: 25, color: '#64748b' },
    { name: 'Localization Error', value: 20, color: '#ec4899' },
    { name: 'New Regulation', value: 20, color: '#10b981' },
];

const REGIONAL_PERFORMANCE = [
  { region: 'North America', score: 92, risk: 'Low' },
  { region: 'Europe (EMEA)', score: 85, risk: 'Medium' },
  { region: 'APAC', score: 68, risk: 'High' },
  { region: 'LATAM', score: 74, risk: 'Medium' },
];

const TOP_VIOLATIONS = [
  { id: '1', name: 'Outdated Logo Usage', count: 142, category: 'Visual', cost: 1200 },
  { id: '2', name: 'Competitor Terms', count: 89, category: 'Compliance', cost: 45000 },
  { id: '3', name: 'Tone: Too Casual', count: 76, category: 'Cultural', cost: 0 },
  { id: '4', name: 'Missing Legal Footer', count: 54, category: 'Compliance', cost: 15000 },
  { id: '5', name: 'Gender Bias (Language)', count: 32, category: 'Cultural', cost: 5000 },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ history }) => {
  const [timeRange, setTimeRange] = useState('30d');

  // KPI Calculations
  const avgScore = 87; 
  const totalScans = 1240;
  const criticalRate = 12; // %
  const estimatedRiskCost = 66200; // Mocked total

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* 1. Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-900">Governance Analytics</h2>
           <p className="text-slate-500 text-sm">Real-time insights into brand alignment, cultural risks, and compliance velocity.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button 
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === '7d' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === '30d' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              30 Days
            </button>
            <button 
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${timeRange === '90d' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Quarter
            </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Brand Health Index</p>
                      <h3 className="text-3xl font-bold text-slate-900 mt-1">{avgScore}/100</h3>
                  </div>
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                      <Target className="h-5 w-5" />
                  </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">+2.4% vs last period</span>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Risk Exposure</p>
                      <h3 className="text-3xl font-bold text-slate-900 mt-1">${(estimatedRiskCost / 1000).toFixed(1)}k</h3>
                  </div>
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                      <DollarSign className="h-5 w-5" />
                  </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                  <span className="text-xs font-medium text-slate-500">Based on regulatory fines</span>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Critical Risk Rate</p>
                      <h3 className="text-3xl font-bold text-slate-900 mt-1">{criticalRate}%</h3>
                  </div>
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                      <AlertTriangle className="h-5 w-5" />
                  </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">-1.2% (Improving)</span>
              </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Fail Region</p>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">APAC</h3>
                  </div>
                  <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                      <Globe className="h-5 w-5" />
                  </div>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                  <span className="text-xs font-medium text-red-600">68% Avg Score</span>
              </div>
          </div>
      </div>

      {/* NEW: PREDICTIVE INTELLIGENCE SUMMARY SECTION */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="h-32 w-32 text-white" />
            </div>
            <div className="relative z-10">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                    Predictive Intelligence Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Forecast Card */}
                    <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-slate-300 uppercase tracking-wider font-bold">Risk Forecast (30 Days)</p>
                            <Zap className="h-4 w-4 text-amber-400" />
                        </div>
                        <div className="flex items-end gap-2 mt-auto">
                            <span className="text-3xl font-bold text-white">{RISK_PROJECTION_DATA[0].risk}%</span>
                            <span className="text-xs font-bold text-amber-300 mb-1.5 bg-amber-500/20 px-2 py-0.5 rounded">High Volatility</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                            AI predicts a temporary spike in <span className="text-white font-bold">{RISK_PROJECTION_DATA[0].month}</span> due to seasonal campaign volume.
                        </p>
                    </div>

                    {/* Drift Card */}
                    <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-slate-300 uppercase tracking-wider font-bold">Guideline Drift</p>
                            <MapPin className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div className="flex items-end gap-2 mt-auto">
                            <span className="text-3xl font-bold text-white">v2.1</span>
                            <span className="text-xs font-bold text-indigo-300 mb-1.5">Slow Adoption</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                            <span className="text-white font-bold">APAC</span> region is showing 40% deviation from the new "v2.1" standards deployed Oct 06.
                        </p>
                    </div>

                    {/* Prevention Card */}
                    <div className="bg-white/10 rounded-xl p-5 backdrop-blur-sm border border-white/10 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-slate-300 uppercase tracking-wider font-bold">Primary Prevention</p>
                            <Microscope className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex items-end gap-2 mt-auto">
                            <span className="text-xl font-bold text-white truncate">{ROOT_CAUSE_DATA[0].name}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                            Clarifying this rule could prevent <span className="text-emerald-300 font-bold">~35%</span> of forecasted issues next quarter.
                        </p>
                    </div>
                </div>
            </div>
      </div>

      {/* 3. Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Trend Chart (2/3 width) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Alignment Trends</h3>
                    <p className="text-xs text-slate-500">Tracking Overall Score vs Cultural Compliance over time</p>
                  </div>
                  <div className="flex gap-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Overall
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Compliance
                      </div>
                  </div>
              </div>
              <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <defs>
                              <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                          <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <Tooltip 
                              contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} 
                              itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                          />
                          <Area type="monotone" dataKey="overall" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorOverall)" />
                          <Line type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                          
                          {/* Guideline Drift Analysis Marker */}
                          <ReferenceLine x="Oct 06" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "v2.1 Deployed", position: 'top', fill: '#d97706', fontSize: 10, fontWeight: 'bold' }} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Root Cause Analysis (1/3 width) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-slate-800 text-lg mb-2 flex items-center gap-2">
                  <Microscope className="h-5 w-5 text-slate-400"/>
                  Root Cause Analysis
              </h3>
              <p className="text-xs text-slate-500 mb-6">AI-identified patterns for recent failures</p>
              
              <div className="flex-1 min-h-[200px] relative">
                   <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={ROOT_CAUSE_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {ROOT_CAUSE_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                   </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* 4. Risk Projection & Secondary Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Risk Projection Chart (New Feature) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg mb-2">Risk Projection Timeline</h3>
              <p className="text-xs text-slate-500 mb-6">Predicted compliance risk based on historical patterns</p>
              <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={RISK_PROJECTION_DATA}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                          <YAxis hide />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="risk" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Top Violations */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 text-lg">Top Recurring Violations</h3>
                  <button className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-0 divide-y divide-slate-100">
                  {TOP_VIOLATIONS.map((violation, idx) => (
                      <div key={violation.id} className="py-3 flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-300 w-4">0{idx + 1}</span>
                              <div>
                                  <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                      {violation.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 uppercase font-medium mt-0.5">
                                      {violation.category}
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center gap-4">
                              {violation.cost > 0 && (
                                  <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">
                                      Risk: ${violation.cost.toLocaleString()}
                                  </span>
                              )}
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md">
                                  {violation.count}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

      </div>
    </div>
  );
};
