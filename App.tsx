import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { AppState, Entry, EntryType } from './types';
import { APP_STORAGE_KEY, MAX_DAYS } from './constants';
import { Plus, BarChart2 } from 'lucide-react';
import { PixelCard, PixelButton, PixelProgressBar } from './components/PixelComponents';
import PostItModal from './components/PostItModal';
import DailyView from './components/DailyView';
import StatsView from './components/StatsView';

const App: React.FC = () => {
  // --- State ---
  const [state, setState] = useState<AppState>(() => {
    const stored = localStorage.getItem(APP_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return {
      startDate: new Date().toISOString().split('T')[0],
      entries: [],
      dailyMoods: {}
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [view, setView] = useState<'dashboard' | 'stats'>('dashboard');

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // --- Helpers ---
  const getToday = () => new Date().toISOString().split('T')[0];

  const handleAddEntry = (newEntry: Omit<Entry, 'id'>) => {
    const entryWithId = { ...newEntry, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, entries: [...prev.entries, entryWithId] }));
    // Force view to dashboard to see the new entry immediately
    setView('dashboard');
    setSelectedDate(newEntry.date);
  };

  const handleSetMood = (date: string, mood: string) => {
    setState(prev => ({
      ...prev,
      dailyMoods: { ...prev.dailyMoods, [date]: mood }
    }));
  };

  // --- Sub-components logic ---

  const renderDashboard = () => {
    const today = getToday();
    const start = new Date(state.startDate);
    
    // Calculate progress based on today vs start date
    const diffTime = Math.abs(new Date(today).getTime() - start.getTime());
    const currentDayNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Generate 21-day grid data
    const daysArray = Array.from({ length: MAX_DAYS }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const hasEntry = state.entries.some(e => e.date === dateStr);
      const isComplete = hasEntry && state.dailyMoods[dateStr]; // Simple definition of "Complete"
      
      const isSelected = dateStr === selectedDate;
      const isToday = dateStr === today;
      const dayNum = i + 1;
      
      return { dateStr, dayNum, hasEntry, isComplete, isSelected, isToday };
    });

    const entriesForSelectedDate = state.entries.filter(e => e.date === selectedDate);
    const moodForSelectedDate = state.dailyMoods[selectedDate];

    // Stats for the stats card (specific to Selected Date)
    const sleepCount = entriesForSelectedDate.filter(e => e.type === EntryType.SLEEP).length;
    const foodCount = entriesForSelectedDate.filter(e => e.type === EntryType.FOOD).length;
    const digitalMins = entriesForSelectedDate.filter(e => e.type === EntryType.DIGITAL).reduce((acc, curr) => acc + (curr.data as any).durationMinutes, 0);
    const outputCount = entriesForSelectedDate.filter(e => e.type === EntryType.OUTPUT).length;

    return (
      <div className="min-h-screen bg-agency-pink/10 pb-32">
        
        {/* Gamified Header */}
        <div className="bg-white p-4 border-b-2 border-agency-text sticky top-0 z-10 shadow-sm">
           <PixelProgressBar current={currentDayNumber} max={MAX_DAYS} label={`Cycle Day ${currentDayNumber}/21`} />
        </div>

        {/* Date Strip */}
        <div className="overflow-x-auto whitespace-nowrap p-4 bg-agency-cream border-b-4 border-agency-text shadow-sm hide-scrollbar">
          <div className="inline-flex gap-2">
            {daysArray.map((day) => (
              <div 
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`
                   w-16 h-24 flex flex-col items-center justify-between py-2 rounded-lg border-2 cursor-pointer transition-all relative
                   ${day.isSelected ? 'bg-agency-pink border-4 border-agency-text transform -translate-y-1 shadow-pixel-sm' : 'bg-white border-agency-text/50'}
                   ${day.isToday && !day.isSelected ? 'border-dashed border-agency-pink-dark' : ''}
                   hover:bg-agency-pink/20
                `}
              >
                 <span className="font-pixel text-[10px] bg-agency-text text-white px-1 rounded-sm">Day {day.dayNum}</span>
                 <span className="font-bold text-lg font-pixel">{new Date(day.dateStr).getDate()}</span>
                 <span className="font-pixel text-[10px] uppercase text-gray-500">{new Date(day.dateStr).toLocaleDateString('en-US', {weekday: 'short'})}</span>
                 <div className="h-4">
                   {day.isComplete ? '🌟' : day.hasEntry ? '📝' : ''}
                 </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 max-w-lg mx-auto space-y-6">
          
          {/* Header for Date View */}
          <div className="flex items-center justify-between">
            <h2 className="font-pixel text-2xl font-bold text-agency-text">
              {selectedDate === today ? "TODAY'S LOG" : `LOG: ${selectedDate}`}
            </h2>
            <PixelButton onClick={() => setView('stats')} className="bg-white px-3 py-1 text-sm flex items-center gap-2">
               <BarChart2 size={16} /> History
            </PixelButton>
          </div>

          {/* Quick Stats Summary Card for Selected Date */}
          <PixelCard className="bg-white">
            <div className="grid grid-cols-4 gap-2 text-center">
               <div>
                  <div className="text-xl">🛌</div>
                  <div className="font-pixel text-sm">{sleepCount > 0 ? 'Done' : '-'}</div>
               </div>
               <div>
                  <div className="text-xl">🍱</div>
                  <div className="font-pixel text-sm">{foodCount}</div>
               </div>
               <div>
                  <div className="text-xl">📱</div>
                  <div className="font-pixel text-sm">{digitalMins}m</div>
               </div>
               <div>
                  <div className="text-xl">⭐</div>
                  <div className="font-pixel text-sm">{outputCount}</div>
               </div>
            </div>
          </PixelCard>

          {/* The Feed (Daily View Embedded) */}
          <DailyView 
            date={selectedDate}
            entries={entriesForSelectedDate}
            mood={moodForSelectedDate}
            onSetMood={(m) => handleSetMood(selectedDate, m)}
          />

        </div>

        {/* Sticky Post-it Button */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <button 
            onClick={() => { setSelectedDate(today); setIsModalOpen(true); }}
            className="pointer-events-auto bg-agency-pink border-4 border-agency-text text-agency-text rounded-full p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 active:translate-y-1 transition-all group"
          >
            <Plus size={40} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-agency-text text-white text-xs px-3 py-1 rounded-lg font-pixel opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border-2 border-white shadow-sm">
              New Post-it
            </span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <HashRouter>
      <div className="font-body text-agency-text">
        {view === 'dashboard' && renderDashboard()}
        
        {view === 'stats' && (
          <StatsView entries={state.entries} onBack={() => setView('dashboard')} />
        )}

        <PostItModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddEntry}
        />
      </div>
    </HashRouter>
  );
};

export default App;