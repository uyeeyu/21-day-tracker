import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Entry, EntryType, SleepData, DigitalData } from '../types';
import { PixelButton, PixelCard } from './PixelComponents';
import { generateWeeklySummary } from '../services/geminiService';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  entries: Entry[];
  onBack: () => void;
}

const StatsView: React.FC<Props> = ({ entries, onBack }) => {
  const [activeTab, setActiveTab] = useState<EntryType>(EntryType.SLEEP);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Helper to group data by date
  const getDailyData = () => {
    const dataMap: Record<string, any> = {};
    
    // Sort entries by date
    const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
    
    sortedEntries.forEach(e => {
      const dateLabel = new Date(e.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      if (!dataMap[dateLabel]) {
        dataMap[dateLabel] = { name: dateLabel, sleepHours: 0, digitalMins: 0, foodCount: 0, outputCount: 0, fullDate: e.date };
      }

      if (e.type === EntryType.SLEEP) {
        // Very rough calc for demo: assume duration in comment or just count 1 entry = 7 hours default if parsing fails
        // Real implementation needs proper time diff from bedTime/wakeTime strings
        dataMap[dateLabel].sleepHours = 7; // Placeholder logic
      } else if (e.type === EntryType.DIGITAL) {
        dataMap[dateLabel].digitalMins += (e.data as DigitalData).durationMinutes;
      } else if (e.type === EntryType.FOOD) {
        dataMap[dateLabel].foodCount += 1;
      } else if (e.type === EntryType.OUTPUT) {
        dataMap[dateLabel].outputCount += 1;
      }
    });

    return Object.values(dataMap);
  };

  const chartData = getDailyData().slice(-21); // Last 21 recorded days

  const handleGenerateSummary = async () => {
    setLoadingAi(true);
    const summaryData = JSON.stringify(chartData.map(d => ({ date: d.name, val: d[activeTab === EntryType.SLEEP ? 'sleepHours' : activeTab === EntryType.DIGITAL ? 'digitalMins' : activeTab === EntryType.FOOD ? 'foodCount' : 'outputCount'] })));
    const summary = await generateWeeklySummary(activeTab, summaryData);
    setAiSummary(summary);
    setLoadingAi(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case EntryType.SLEEP:
        return (
          <div className="h-64 w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <XAxis dataKey="name" fontSize={10} tick={{fontFamily: 'VT323'}} />
                 <YAxis fontSize={10} tick={{fontFamily: 'VT323'}} />
                 <Tooltip contentStyle={{fontFamily: 'VT323', borderRadius: '8px', border: '2px solid black'}} />
                 <Bar dataKey="sleepHours" fill="#AEC6CF" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
             <p className="text-center text-xs mt-2 text-gray-500">*Hours estimated</p>
          </div>
        );
      case EntryType.DIGITAL:
        return (
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} tick={{fontFamily: 'VT323'}} />
                <YAxis fontSize={10} tick={{fontFamily: 'VT323'}} />
                <Tooltip contentStyle={{fontFamily: 'VT323', borderRadius: '8px', border: '2px solid black'}} />
                <Line type="monotone" dataKey="digitalMins" stroke="#E6E6FA" strokeWidth={4} dot={{r: 4, fill: '#5D4037'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case EntryType.FOOD:
        // Visual Gallery for Food
        return (
           <div className="grid grid-cols-3 gap-2 mt-4 max-h-64 overflow-y-auto">
             {entries.filter(e => e.type === EntryType.FOOD).map(e => {
               const fd = e.data as any;
               return (
                 <div key={e.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-agency-text relative">
                   {fd.image ? <img src={fd.image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-2xl">🍱</div>}
                   <div className="absolute bottom-0 bg-black/50 text-white text-[8px] w-full text-center">{new Date(e.date).getDate()}</div>
                 </div>
               )
             })}
           </div>
        );
      case EntryType.OUTPUT:
         return (
           <div className="mt-4 space-y-2 max-h-64 overflow-y-auto font-pixel">
             {entries.filter(e => e.type === EntryType.OUTPUT).map(e => (
               <div key={e.id} className="bg-yellow-100 p-2 rounded border border-agency-text text-sm">
                 ⭐ {(e.data as any).description}
               </div>
             ))}
           </div>
         );
    }
  };

  return (
    <div className="min-h-screen bg-agency-cream p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 bg-white border-2 border-agency-text rounded-full hover:bg-agency-pink/20">
          <ArrowLeft />
        </button>
        <h1 className="font-pixel text-3xl">Stats Log</h1>
        <div className="w-10"></div>
      </div>

      {/* Tabs */}
      <div className="flex justify-between bg-white border-2 border-agency-text rounded-lg p-1 mb-6 shadow-pixel-sm">
        {Object.values(EntryType).map((t) => (
          <button
            key={t}
            onClick={() => { setActiveTab(t); setAiSummary(''); }}
            className={`flex-1 text-center py-2 text-sm font-pixel rounded-md transition-all ${activeTab === t ? 'bg-agency-text text-white' : 'hover:bg-gray-100'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <PixelCard className="mb-6 min-h-[300px]">
        <h2 className="font-pixel text-xl mb-2 flex items-center gap-2">
           Overview
        </h2>
        {renderTabContent()}
      </PixelCard>

      {/* AI Insight */}
      <PixelCard className="bg-agency-purple/20 border-agency-purple">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-pixel font-bold">AI Insight 🤖</h3>
          <button onClick={handleGenerateSummary} disabled={loadingAi} className="p-1 bg-white border border-agency-text rounded hover:bg-agency-pink">
             <RefreshCw size={14} className={loadingAi ? 'animate-spin' : ''} />
          </button>
        </div>
        <p className="font-body text-sm min-h-[40px]">
          {loadingAi ? 'Analyzing your pixel life...' : aiSummary || 'Click refresh for insights!'}
        </p>
      </PixelCard>
    </div>
  );
};

export default StatsView;
