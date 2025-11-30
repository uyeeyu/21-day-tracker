import React from 'react';
import { Entry, EntryType, FoodData, SleepData, DigitalData, OutputData } from '../types';
import { TYPE_CONFIG, MOOD_OPTIONS } from '../constants';
import { PixelCard } from './PixelComponents';

interface EntryListProps {
  entries: Entry[];
}

export const EntryCard: React.FC<{ entry: Entry }> = ({ entry }) => {
  const renderEntryContent = (entry: Entry) => {
    switch (entry.type) {
      case EntryType.SLEEP:
        const sData = entry.data as SleepData;
        return (
          <div className="flex gap-4 items-center">
            <div className="text-4xl">🛌</div>
            <div className="flex-1">
              <div className="font-pixel text-lg font-bold">{sData.bedTime} - {sData.wakeTime}</div>
              <div className="text-sm italic">"{sData.comment}"</div>
            </div>
          </div>
        );
      case EntryType.FOOD:
        const fData = entry.data as FoodData;
        return (
          <div className="flex flex-col gap-2">
            <div className="flex gap-4 items-start">
              <div className="text-4xl">🍱</div>
              {fData.image && (
                <img src={fData.image} alt="Food" className="w-24 h-24 object-cover rounded-lg border-2 border-agency-text shadow-pixel-sm" />
              )}
            </div>
            <div className="font-body text-sm mt-1">{fData.description}</div>
          </div>
        );
      case EntryType.DIGITAL:
        const dData = entry.data as DigitalData;
        return (
          <div className="flex gap-4 items-center">
            <div className="text-4xl">📱</div>
            <div>
              <div className="font-pixel text-xl font-bold">{dData.durationMinutes} mins</div>
              <div className="text-sm">Mood: {dData.mood}</div>
            </div>
          </div>
        );
      case EntryType.OUTPUT:
        const oData = entry.data as OutputData;
        return (
          <div className="flex gap-4 items-center">
            <div className="text-4xl">⭐</div>
            <div className="font-body text-sm">{oData.description}</div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <PixelCard className={`${TYPE_CONFIG[entry.type].color} bg-opacity-30`}>
      <div className="absolute top-2 right-2 text-xs font-pixel text-gray-500">
        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>

      {renderEntryContent(entry)}

      {/* AI Feedback Bubble */}
      {entry.aiFeedback && (
        <div className="mt-4 bg-white border-2 border-agency-text rounded-lg p-3 relative ml-6 shadow-sm">
          <div className="absolute -left-2 top-[-2px] w-4 h-4 bg-white border-l-2 border-b-2 border-agency-text transform rotate-45"></div>
          <p className="text-xs font-bold text-agency-text/80 font-pixel">AI SAYS:</p>
          <p className="text-sm text-agency-text">{entry.aiFeedback}</p>
        </div>
      )}
    </PixelCard>
  );
};

export const EntryList: React.FC<EntryListProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="text-center font-pixel text-gray-400 mt-10 p-8 border-2 border-dashed border-agency-text/30 rounded-xl">
        No records yet... Post something! ✨
      </div>
    );
  }

  // Sort by timestamp descending (newest first)
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-4">
      {sortedEntries.map(entry => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
};

// Re-export specific props for the full view usage if needed, 
// though we primarily use EntryList now.
interface Props {
  date: string;
  entries: Entry[];
  mood: string;
  onSetMood: (mood: string) => void;
  className?: string;
}

const DailyView: React.FC<Props> = ({ date, entries, mood, onSetMood, className = '' }) => {
  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Mood Selector */}
      <PixelCard className="bg-agency-cream text-center border-dashed">
        <h3 className="font-pixel text-lg mb-2">How is your {new Date(date).toLocaleDateString('en-US', {weekday: 'long'})}?</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {MOOD_OPTIONS.map(m => (
            <button 
              key={m}
              onClick={() => onSetMood(m)}
              className={`text-2xl p-2 rounded-lg transition-transform hover:scale-125 active:scale-95 ${mood === m ? 'bg-agency-pink border-2 border-agency-text shadow-pixel-sm' : ''}`}
            >
              {m}
            </button>
          ))}
        </div>
      </PixelCard>

      {/* Entries List */}
      <div>
        <h3 className="font-pixel text-xl mb-4 border-b-2 border-agency-text inline-block">Daily Log</h3>
        <EntryList entries={entries} />
      </div>
    </div>
  );
};

export default DailyView;