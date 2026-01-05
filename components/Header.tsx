
import React, { useMemo } from 'react';
import { Settings, Flame, Eye, EyeOff, Sparkles } from 'lucide-react';
import { ThemeColor } from '../types';
import { UserStats } from '../types';
import { getLevelProgress } from '../services/storageService';
import { getThemeClasses } from '../constants';

interface HeaderProps {
  user: UserStats;
  privacyMode: boolean;
  togglePrivacy: () => void;
  onOpenSettings: () => void;
  onShowInsight: () => void;
  themeColor: ThemeColor;
}

export const Header: React.FC<HeaderProps> = ({ user, privacyMode, togglePrivacy, onOpenSettings, onShowInsight, themeColor }) => {
  const progress = useMemo(() => getLevelProgress(user.points, user.level), [user.points, user.level]);
  const theme = getThemeClasses(themeColor);

  return (
    <header className="flex items-center justify-between px-6 py-4 pt-12 bg-white/0 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="relative">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="Profile" className={`w-full h-full object-cover ${theme.bgLight}`} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-black text-yellow-900 border-2 border-white">
                    {user.level}
                </div>
            </div>
        </div>
        
        <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 mb-0.5">
                <h1 className="text-gray-800 font-black text-lg leading-none">{user.name}</h1>
            </div>
            
            {/* Gamification Stats Row */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded-md">
                    <Flame size={12} className="text-orange-500 fill-orange-500" />
                    <span className="text-orange-700 font-bold text-xs">{user.streak}</span>
                </div>
                <div className="w-[1px] h-3 bg-gray-300/50"></div>
                <div className="flex flex-col w-16 gap-0.5">
                     <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-black/5">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${theme.gradient}`}
                            style={{ width: `${progress.percentage}%` }}
                        />
                     </div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
            onClick={onShowInsight}
            className={`w-10 h-10 flex items-center justify-center ${theme.text} bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm border border-white/50 active:scale-95`}
            aria-label="AI Insight"
        >
            <Sparkles size={18} />
        </button>

        <button 
            onClick={togglePrivacy}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95 ${
                privacyMode 
                ? 'bg-gray-800 text-white shadow-inner' 
                : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-white border border-white/50'
            }`}
            aria-label={privacyMode ? "Disable Privacy Mode" : "Enable Privacy Mode"}
        >
            {privacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>

        <button 
            onClick={onOpenSettings}
            className="w-10 h-10 flex items-center justify-center text-gray-500 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm border border-white/50 active:scale-95"
            aria-label="Settings"
        >
            <Settings size={18} />
        </button>
      </div>
    </header>
  );
};
