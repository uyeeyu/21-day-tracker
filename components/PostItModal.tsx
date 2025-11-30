import React, { useState, useRef, useEffect } from 'react';
import { EntryType, Entry, SleepData, FoodData, DigitalData, OutputData } from '../types';
import { TYPE_CONFIG } from '../constants';
import { PixelButton, PixelInput, PixelTextArea } from './PixelComponents';
import { analyzeSleep, analyzeFood, praiseOutput } from '../services/geminiService';
import { X, Upload, Play, Square, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<Entry, 'id'>) => void;
}

const PostItModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [type, setType] = useState<EntryType>(EntryType.SLEEP);
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [sleepData, setSleepData] = useState<SleepData>({ bedTime: '', wakeTime: '', comment: '' });
  const [foodData, setFoodData] = useState<FoodData>({ description: '', image: '' });
  const [outputData, setOutputData] = useState<OutputData>({ description: '' });
  
  // Digital Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [digitalMood, setDigitalMood] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoodData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const date = new Date().toISOString().split('T')[0];
    const timestamp = Date.now();
    let entryData: any;
    let feedback = '';

    try {
      if (type === EntryType.SLEEP) {
        entryData = sleepData;
        const duration = "some hours"; // Simplifying duration calc for AI prompt
        feedback = await analyzeSleep(sleepData.comment, duration);
      } else if (type === EntryType.FOOD) {
        entryData = foodData;
        feedback = await analyzeFood(foodData.description, foodData.image);
      } else if (type === EntryType.DIGITAL) {
        entryData = { durationMinutes: Math.floor(seconds / 60), mood: digitalMood } as DigitalData;
      } else if (type === EntryType.OUTPUT) {
        entryData = outputData;
        feedback = await praiseOutput(outputData.description);
      }

      onSave({
        date,
        timestamp,
        type,
        data: entryData,
        aiFeedback: feedback
      });
      handleClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTimerActive(false);
    setSeconds(0);
    setFoodData({ description: '', image: '' });
    setSleepData({ bedTime: '', wakeTime: '', comment: '' });
    setOutputData({ description: '' });
    setDigitalMood('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className={`w-[90%] max-w-md ${timerActive ? 'bg-agency-purple' : 'bg-agency-cream'} border-4 border-agency-text rounded-xl p-6 relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-colors duration-500`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-pixel text-2xl font-bold text-agency-text">POST-IT!</h2>
          {!timerActive && (
            <button onClick={handleClose} className="p-1 hover:bg-red-200 rounded-full border-2 border-transparent hover:border-agency-text transition-all">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Type Selector */}
        {!timerActive && (
          <div className="grid grid-cols-4 gap-2 mb-6">
            {Object.values(EntryType).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex flex-col items-center p-2 rounded-lg border-2 ${type === t ? 'border-agency-text bg-white shadow-pixel-sm transform -translate-y-1' : 'border-transparent opacity-60 hover:opacity-100'}`}
              >
                <span className="text-2xl mb-1">{TYPE_CONFIG[t].icon}</span>
                <span className="font-pixel text-xs">{TYPE_CONFIG[t].label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Form Content */}
        <div className="space-y-4 font-body">
          
          {/* SLEEP FORM */}
          {type === EntryType.SLEEP && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Bed Time 🌙</label>
                  <PixelInput type="time" value={sleepData.bedTime} onChange={e => setSleepData({...sleepData, bedTime: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Wake Time ☀️</label>
                  <PixelInput type="time" value={sleepData.wakeTime} onChange={e => setSleepData({...sleepData, wakeTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Pre-sleep thoughts?</label>
                <PixelTextArea placeholder="I read a book..." value={sleepData.comment} onChange={e => setSleepData({...sleepData, comment: e.target.value})} />
              </div>
            </>
          )}

          {/* FOOD FORM */}
          {type === EntryType.FOOD && (
            <>
              <div className="flex justify-center mb-4">
                <label className="cursor-pointer w-full h-32 border-2 border-dashed border-agency-text rounded-xl flex flex-col items-center justify-center hover:bg-white transition-colors bg-agency-pink/20 overflow-hidden relative">
                  {foodData.image ? (
                    <img src={foodData.image} alt="Food" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="mb-2 text-agency-text" />
                      <span className="font-pixel text-sm">Snap a Pic</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <PixelTextArea placeholder="What did you eat?" value={foodData.description} onChange={e => setFoodData({...foodData, description: e.target.value})} />
            </>
          )}

          {/* DIGITAL FORM */}
          {type === EntryType.DIGITAL && (
            <div className="text-center py-4">
               {!timerActive && seconds === 0 ? (
                 <div className="space-y-4">
                   <p className="font-pixel text-lg">Ready to doomscroll?</p>
                   <PixelButton onClick={() => setTimerActive(true)} className="bg-agency-purple w-full py-4 text-xl">
                     <Play className="inline mr-2" /> Start Timer
                   </PixelButton>
                 </div>
               ) : timerActive ? (
                 <div className="space-y-6">
                   <div className="font-pixel text-6xl text-agency-text animate-pulse">
                     {Math.floor(seconds / 60).toString().padStart(2, '0')}:{(seconds % 60).toString().padStart(2, '0')}
                   </div>
                   <p className="text-sm">Time flies when you are scrolling...</p>
                   <PixelButton onClick={() => setTimerActive(false)} className="bg-red-400 text-white w-full">
                     <Square className="inline mr-2 fill-current" /> Stop
                   </PixelButton>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <div className="font-pixel text-4xl mb-4">
                      Total: {Math.floor(seconds / 60)} min
                   </div>
                   <label className="block text-sm font-bold mb-1">How do you feel now?</label>
                   <PixelInput placeholder="Guilty? Happy?" value={digitalMood} onChange={e => setDigitalMood(e.target.value)} />
                 </div>
               )}
            </div>
          )}

          {/* OUTPUT FORM */}
          {type === EntryType.OUTPUT && (
             <>
              <label className="block text-sm font-bold mb-1">What did you create/do?</label>
              <PixelTextArea rows={4} placeholder="I wrote a blog post..." value={outputData.description} onChange={e => setOutputData({...outputData, description: e.target.value})} />
              <p className="text-xs text-agency-text/70 mt-2">* AI will generate praise for you!</p>
             </>
          )}

        </div>

        {/* Footer Actions */}
        {!timerActive && (
          <div className="mt-6 flex justify-end">
            <PixelButton onClick={handleSubmit} disabled={loading} className="bg-agency-pink text-agency-text w-full">
              {loading ? 'AI Thinking...' : 'Stick It! ✨'}
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostItModal;
