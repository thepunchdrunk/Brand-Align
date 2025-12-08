import React, { useState } from 'react';
import { FileText, Calendar, ArrowUpRight, Clock, MoreHorizontal, Search, Filter, CheckCircle2, AlertTriangle, AlertOctagon, Download } from 'lucide-react';
import { Purpose, Region, AssetType } from '../types';

// Mock History Data
const historyData = [
    { 
        id: 1, 
        filename: "Q3_Marketing_Strategy.pptx", 
        type: AssetType.PRESENTATION,
        date: "2 hours ago", 
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
        date: "Yesterday, 2:30 PM", 
        score: 78, 
        purpose: Purpose.SALES_PITCH, 
        region: "North America", 
        issues: 12,
        status: 'Needs Review' 
    },
    { 
        id: 3, 
        filename: "Instagram_Ad_Copy.txt", 
        type: AssetType.EMAIL,
        date: "Yesterday, 10:15 AM", 
        score: 65, 
        purpose: Purpose.SOCIAL_MEDIA, 
        region: "Global", 
        issues: 8,
        status: 'Critical' 
    },
    { 
        id: 4, 
        filename: "Annual_Report_Draft.pdf", 
        type: AssetType.DOCUMENT, 
        date: "Oct 24, 2023", 
        score: 88, 
        purpose: Purpose.INTERNAL_COMMS, 
        region: "Europe", 
        issues: 4,
        status: 'Pass' 
    },
    { 
        id: 5, 
        filename: "Product_Launch_Video_Script.docx", 
        type: AssetType.VIDEO,
        date: "Oct 22, 2023", 
        score: 81, 
        purpose: Purpose.MARKETING, 
        region: "APAC", 
        issues: 6,
        status: 'Needs Review' 
    },
];

export const ActivityHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = historyData.filter(item => 
      item.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Pass': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
          case 'Needs Review': return 'bg-amber-100 text-amber-700 border-amber-200';
          case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  const getScoreColor = (score: number) => {
      if (score >= 90) return 'text-emerald-600';
      if (score >= 70) return 'text-amber-500';
      return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search by filename or purpose..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2">
                <Filter className="h-4 w-4" />
                Filter
            </button>
            <button className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm">
                <Download className="h-4 w-4" />
                Export Log
            </button>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Asset</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Context</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Score</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="p-4">
                              <div className="flex items-center gap-3">
                                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                                      <FileText className="h-5 w-5" />
                                  </div>
                                  <div>
                                      <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{item.filename}</div>
                                      <div className="text-xs text-slate-400">{item.type}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="p-4">
                              <div className="flex flex-col gap-1">
                                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                                      {item.purpose}
                                  </span>
                                  {item.region !== "Global" && (
                                    <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                        {item.region}
                                    </span>
                                  )}
                              </div>
                          </td>
                          <td className="p-4 text-sm text-slate-500 flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              {item.date}
                          </td>
                          <td className="p-4 text-center">
                              <span className={`font-bold text-lg ${getScoreColor(item.score)}`}>
                                  {item.score}
                              </span>
                          </td>
                          <td className="p-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)}`}>
                                  {item.status === 'Pass' && <CheckCircle2 className="h-3 w-3" />}
                                  {item.status === 'Needs Review' && <AlertOctagon className="h-3 w-3" />}
                                  {item.status === 'Critical' && <AlertTriangle className="h-3 w-3" />}
                                  {item.status}
                              </span>
                          </td>
                          <td className="p-4 text-right">
                              <button className="text-slate-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-all">
                                  <ArrowUpRight className="h-4 w-4" />
                              </button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
          
          {filteredHistory.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                  <p>No activity found matching your search.</p>
              </div>
          )}
      </div>
    </div>
  );
};