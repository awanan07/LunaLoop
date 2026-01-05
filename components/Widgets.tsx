
import React from 'react';
import { Frown, Meh, Smile, Clock, Plus, Sparkles, Zap, Droplet } from 'lucide-react';
import { DailyLog, ThemeColor, CyclePhase } from '../types';
import { getThemeClasses } from '../constants';
import { PrivacyMask } from './PrivacyMask';

// --- SUB-COMPONENTS ---

const QuickActionsRail: React.FC<{
    onWater: () => void;
    onMood: (mood: string) => void;
    themeColor: ThemeColor;
}> = ({ onWater, onMood, themeColor }) => {
    const theme = getThemeClasses(themeColor);
    
    return (
        <div className="mb-4 w-full px-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">Quick Log</p>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x">
                {/* Water Button */}
                <button 
                    onClick={onWater}
                    className="snap-start flex-none flex items-center gap-2 pl-3 pr-4 py-3 bg-blue-50/80 backdrop-blur-sm text-blue-700 rounded-2xl border border-blue-100 shadow-sm active:scale-95 transition-transform"
                    aria-label="Log Water"
                >
                    <div className="bg-blue-200 w-6 h-6 rounded-full flex items-center justify-center shadow-inner">
                        <Plus size={12} strokeWidth={3} className="text-blue-700" />
                    </div>
                    <span className="text-xs font-bold">Water</span>
                </button>

                {/* Mood Buttons */}
                <button 
                    onClick={() => onMood('Happy')}
                    className="snap-start flex-none flex items-center gap-2 pl-3 pr-4 py-3 bg-yellow-50/80 backdrop-blur-sm text-yellow-800 rounded-2xl border border-yellow-100 shadow-sm active:scale-95 transition-transform"
                    aria-label="Log Happy Mood"
                >
                    <span className="text-xl leading-none drop-shadow-sm">😄</span>
                    <span className="text-xs font-bold">Happy</span>
                </button>

                 <button 
                    onClick={() => onMood('Tired')}
                    className="snap-start flex-none flex items-center gap-2 pl-3 pr-4 py-3 bg-stone-50/80 backdrop-blur-sm text-stone-700 rounded-2xl border border-stone-100 shadow-sm active:scale-95 transition-transform"
                    aria-label="Log Tired Mood"
                >
                    <span className="text-xl leading-none drop-shadow-sm">😴</span>
                    <span className="text-xs font-bold">Tired</span>
                </button>

                <button 
                    onClick={() => onMood('Cramps')} 
                    className={`snap-start flex-none flex items-center gap-2 pl-3 pr-4 py-3 ${theme.bgLight} ${theme.textDark} rounded-2xl border ${theme.border} shadow-sm active:scale-95 transition-transform`}
                    aria-label="Log Cramps"
                >
                     <div className={`${theme.bg} w-6 h-6 rounded-full flex items-center justify-center text-white shadow-sm`}>
                        <Zap size={12} fill="currentColor" />
                    </div>
                    <span className="text-xs font-bold">Cramps</span>
                </button>
            </div>
        </div>
    );
};

// --- MAIN WIDGETS LAYOUT ---

const WidgetCard: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  themeColor: ThemeColor;
  featured?: boolean;
}> = ({ title, children, className = '', onClick, themeColor, featured }) => {
  const theme = getThemeClasses(themeColor);
  return (
    <div 
        onClick={onClick}
        className={`
            relative rounded-2xl p-4 flex flex-col items-center justify-center transition-all duration-300 w-full aspect-[4/3]
            ${featured 
                ? `${theme.bgLight} border ${theme.border}` 
                : 'bg-white/60 backdrop-blur-md border border-white/60 shadow-sm'
            }
            ${onClick ? `cursor-pointer active:scale-[0.98] hover:bg-white/80` : ''}
            ${className}
        `}
    >
        <h3 className={`text-[10px] mb-2 font-bold uppercase tracking-widest text-center ${featured ? theme.textDark : 'text-gray-400'}`}>{title}</h3>
        <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
            {children}
        </div>
    </div>
  );
};

interface DashboardWidgetsProps {
  log: DailyLog;
  cycle: {
      prediction: string;
      phase: CyclePhase;
  };
  privacyMode: boolean;
  onOpenWater: () => void;
  onOpenLog: () => void;
  onQuickLogWater: () => void;
  onQuickLogMood: (mood: string) => void;
  themeColor: ThemeColor;
  userStreak: number;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ 
    log, 
    cycle, 
    privacyMode, 
    onOpenWater, 
    onOpenLog, 
    onQuickLogWater,
    onQuickLogMood,
    themeColor,
    userStreak
}) => {
  const isLate = cycle.prediction.toLowerCase().includes('late');
  const theme = getThemeClasses(themeColor);

  return (
    <div className="w-full px-6 flex-1 flex flex-col">
      
      {/* 1. Quick Actions Rail (Efficiency) - Removed AI Insight from here */}
      <QuickActionsRail 
         onWater={onQuickLogWater}
         onMood={onQuickLogMood}
         themeColor={themeColor}
      />

      {/* 2. Stats Grid */}
      <div className="w-full">
         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-2">Overview</p>
         <div className="grid grid-cols-2 gap-3 w-full">
            
            {/* Prediction/Timing Widget */}
            <WidgetCard title={isLate ? "Attention" : "Next Period"} themeColor={themeColor} featured>
                <PrivacyMask isActive={privacyMode} className="w-full h-full flex flex-col items-center justify-center">
                    <div className={`text-center flex flex-col items-center justify-center w-full`}>
                        {isLate ? (
                            <div className="bg-red-50 text-red-500 rounded-full w-10 h-10 flex items-center justify-center mb-1 animate-pulse">
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                        ) : (
                            <div className={`bg-white rounded-full w-10 h-10 flex items-center justify-center mb-1 shadow-sm ${theme.text}`}>
                                <Clock size={20} strokeWidth={2.5} />
                            </div>
                        )}
                        
                        <div className={`text-lg font-black leading-tight px-1 truncate w-full ${isLate ? 'text-red-600' : 'text-gray-800'}`}>
                            {cycle.prediction}
                        </div>
                    </div>
                </PrivacyMask>
            </WidgetCard>

            {/* Water Widget - Safe, no privacy mask needed generally, but user might want to hide everything. 
                Prompt says "Sensitive data". Water is usually not sensitive. Keeping it visible for utility.
            */}
            <WidgetCard title="Hydration" onClick={onOpenWater} themeColor={themeColor}>
                <div className="flex flex-col items-center justify-center w-full relative">
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-black text-blue-500 tracking-tighter">{log.waterIntake}</span>
                        <span className="text-[10px] text-gray-400 font-bold">/ {log.waterGoal}</span>
                    </div>
                    
                    <div className="w-full max-w-[80%] bg-blue-50 h-2 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((log.waterIntake / log.waterGoal) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </WidgetCard>

            {/* Symptoms Widget - Primary Call to Action if empty */}
            <WidgetCard title="Today's Log" onClick={onOpenLog} themeColor={themeColor}>
                <PrivacyMask isActive={privacyMode} className="w-full h-full flex flex-col items-center justify-center">
                    <div className={`flex flex-col items-center justify-center w-full`}>
                        {log.symptoms.length > 0 ? (
                            <>
                                <div className="bg-gray-100 p-2 rounded-full mb-1 text-gray-600">
                                    <Zap size={18} fill="currentColor" className="text-orange-400" />
                                </div>
                                <span className="text-sm font-bold text-gray-700 truncate max-w-[90px]">{log.symptoms[0]}</span>
                                {log.symptoms.length > 1 && (
                                    <span className="text-[9px] font-bold text-gray-400">+{log.symptoms.length - 1} more</span>
                                )}
                            </>
                        ) : log.mood ? (
                            // If only mood is logged, show checkmark
                            <div className="flex flex-col items-center">
                                <div className={`${theme.bg} text-white p-2 rounded-full mb-1`}>
                                    <Sparkles size={18} />
                                </div>
                                <span className="text-xs font-bold text-gray-600">Mood logged</span>
                            </div>
                        ) : (
                            // Empty State: Call to Action
                            <div className="group flex flex-col items-center animate-pulse">
                                <div className="w-10 h-10 bg-white border-2 border-dashed border-gray-300 group-hover:border-pink-300 rounded-full flex items-center justify-center text-gray-300 group-hover:text-pink-300 transition-colors mb-1">
                                    <Plus size={20} strokeWidth={3} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 group-hover:text-pink-400 transition-colors">Tap to Log</span>
                            </div>
                        )}
                    </div>
                </PrivacyMask>
            </WidgetCard>

            {/* Mood Widget */}
            <WidgetCard title="Current Mood" onClick={onOpenLog} themeColor={themeColor}>
                <PrivacyMask isActive={privacyMode} className="w-full h-full flex flex-col items-center justify-center">
                    <div className={`flex flex-col items-center justify-center w-full`}>
                        {log.mood ? (
                            <div className="text-5xl text-yellow-400 drop-shadow-sm animate-in zoom-in duration-300 transform hover:scale-110 transition-transform">
                                {log.mood === 'Sad' || log.mood === 'Tired' || log.mood === 'Gloomy' 
                                    ? <Frown size={42} fill="#FCD34D" strokeWidth={1.5} className="text-yellow-600"/> 
                                    : log.mood === 'Happy' || log.mood === 'Grateful' || log.mood === 'Excited'
                                        ? <Smile size={42} fill="#FCD34D" strokeWidth={1.5} className="text-yellow-600" />
                                        : <Meh size={42} fill="#FCD34D" strokeWidth={1.5} className="text-yellow-600" />
                                }
                            </div>
                        ) : (
                                <div className="w-10 h-10 bg-white border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-300">
                                    <Smile size={20} />
                                </div>
                        )}
                    </div>
                </PrivacyMask>
            </WidgetCard>
         </div>
      </div>
    </div>
  );
};
