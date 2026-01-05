
import React, { useState } from 'react';
import { ArrowRight, Check, CalendarDays } from 'lucide-react';
import * as db from '../services/storageService';
import { LogEntry } from '../types';

interface OnboardingPageProps {
  onComplete: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lastPeriodDate, setLastPeriodDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Max date is today to prevent future logging errors
  const maxDate = new Date().toISOString().split('T')[0];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save User & Settings
      const user = db.getUserStats();
      const settings = db.getSettings();
      
      db.saveUserStats({ ...user, name: name || 'User' });
      db.saveSettings({ ...settings, cycleLength, periodLength, onboarded: true });
      
      // Save initial log for accurate cycle prediction
      const initialLog: LogEntry = {
          date: lastPeriodDate,
          symptoms: [],
          mood: null,
          flow: 'Medium', // Default flow to mark start of cycle
          waterIntake: 0,
          spotting: null
      };
      db.saveLog(initialLog);
      
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      
      {/* Progress Bar */}
      <div className="w-full max-w-xs h-1 bg-gray-100 rounded-full mb-12 flex">
        <div 
            className="h-full bg-pink-500 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
        ></div>
      </div>

      <div className="w-full max-w-xs flex-1 flex flex-col justify-center">
        
        {step === 1 && (
            <div className="animate-in slide-in-from-right duration-300">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Hi there! 👋</h1>
                <p className="text-gray-500 mb-8">What should we call you?</p>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full border-b-2 border-gray-200 py-3 text-xl focus:outline-none focus:border-pink-500 transition-colors"
                />
            </div>
        )}

        {step === 2 && (
            <div className="animate-in slide-in-from-right duration-300">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Cycle History</h1>
                <p className="text-gray-500 mb-8">How long is your average cycle?</p>
                
                <div className="flex items-center justify-center gap-4 mb-8">
                    <button onClick={() => setCycleLength(Math.max(21, cycleLength - 1))} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">-</button>
                    <div className="text-center">
                        <span className="text-4xl font-bold text-pink-500">{cycleLength}</span>
                        <span className="block text-xs text-gray-400">DAYS</span>
                    </div>
                    <button onClick={() => setCycleLength(Math.min(35, cycleLength + 1))} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">+</button>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="animate-in slide-in-from-right duration-300">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Period Length</h1>
                <p className="text-gray-500 mb-8">How long does your period usually last?</p>
                
                <div className="flex items-center justify-center gap-4 mb-8">
                    <button onClick={() => setPeriodLength(Math.max(2, periodLength - 1))} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">-</button>
                    <div className="text-center">
                        <span className="text-4xl font-bold text-pink-500">{periodLength}</span>
                        <span className="block text-xs text-gray-400">DAYS</span>
                    </div>
                    <button onClick={() => setPeriodLength(Math.min(9, periodLength + 1))} className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">+</button>
                </div>
            </div>
        )}

        {step === 4 && (
            <div className="animate-in slide-in-from-right duration-300">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Last Period</h1>
                <p className="text-gray-500 mb-8">When did your last period start?</p>
                
                <div className="relative">
                    <input 
                        type="date" 
                        value={lastPeriodDate}
                        max={maxDate}
                        onChange={(e) => setLastPeriodDate(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 text-gray-800 font-bold focus:outline-none focus:border-pink-500"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-pink-500">
                        <CalendarDays size={24} />
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">We use this to predict your next cycle immediately.</p>
            </div>
        )}

      </div>

      <button 
        onClick={handleNext}
        disabled={step === 1 && name.length === 0}
        className="w-full max-w-xs bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
      >
        {step === 4 ? 'Get Started' : 'Continue'}
        {step === 4 ? <Check size={20} /> : <ArrowRight size={20} />}
      </button>

    </div>
  );
};
