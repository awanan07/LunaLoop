
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Flower2, Sprout, Wand2, Lock, Droplet } from 'lucide-react';
import * as db from '../services/storageService';
import { ThemeColor } from '../types';
import { getThemeClasses } from '../constants';

interface ThemesPageProps {
  onBack: () => void;
  themeColor: ThemeColor;
}

const JellyfishIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 10V9a6 6 0 0 1 12 0v1" />
    <path d="M6 10h12" />
    <path d="M8 10v6c0 1.5-1 2-1 3" />
    <path d="M12 10v6c0 1.5 0 2.5 0 3" />
    <path d="M16 10v6c0 1.5 1 2 1 3" />
  </svg>
);

const ThemeCard: React.FC<{
  title: string;
  isActive?: boolean;
  isLocked?: boolean;
  requiredLevel?: number;
  onClick: () => void;
  gradient: string;
  icon: React.ReactNode;
  decorations: React.ReactNode;
  darkText?: boolean; 
}> = ({ title, isActive, isLocked, requiredLevel, onClick, gradient, icon, decorations, darkText = false }) => (
  <button 
    onClick={isLocked ? undefined : onClick}
    className={`w-full h-32 rounded-3xl mb-4 relative overflow-hidden shadow-sm flex items-center px-6 transition-all 
      ${isLocked ? 'grayscale opacity-90 cursor-not-allowed' : 'active:scale-95 cursor-pointer'}
      ${gradient} 
      ${isActive ? 'ring-4 ring-pink-300 ring-offset-2' : ''}`}
    aria-label={`Select ${title} Theme`}
  >
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        {decorations}
    </div>

    {isLocked && (
        <div className="absolute inset-0 bg-gray-900/40 z-20 backdrop-blur-[2px] flex flex-col items-center justify-center text-white">
            <div className="bg-black/50 p-3 rounded-full mb-2">
                <Lock size={20} />
            </div>
            <span className="font-bold text-xs uppercase tracking-widest">Unlocks at Level {requiredLevel}</span>
        </div>
    )}

    <div className="relative z-10 flex items-center gap-6 w-full">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-sm ${darkText ? 'bg-white/40 border-white/60' : 'bg-white/20 border-white/40 backdrop-blur-sm'}`}>
            {icon}
        </div>
        <div className="flex flex-col items-start">
            <span className={`font-bold text-xl drop-shadow-sm ${darkText ? 'text-gray-800' : 'text-white'}`}>{title}</span>
            {isActive && (
                <span className={`font-bold text-lg ${darkText ? 'text-gray-700' : 'text-white/90'}`}>(ACTIVE)</span>
            )}
        </div>
    </div>
  </button>
);

export const ThemesPage: React.FC<ThemesPageProps> = ({ onBack, themeColor }) => {
  const [activeTheme, setActiveTheme] = useState('Pretty in Pink');
  const [userLevel, setUserLevel] = useState(1);
  const theme = getThemeClasses(themeColor);

  useEffect(() => {
    const settings = db.getSettings();
    const user = db.getUserStats();
    setActiveTheme(settings.theme || 'Pretty in Pink');
    setUserLevel(user.level);
  }, []);

  const handleSelectTheme = (themeName: string) => {
    setActiveTheme(themeName);
    const settings = db.getSettings();
    db.saveSettings({ ...settings, theme: themeName });
  };

  return (
    <div className={`h-full ${theme.bgLight} flex flex-col font-sans animate-in slide-in-from-right duration-300`}>
      
      {/* Header */}
      <div className="px-6 pt-10 pb-4 relative flex items-center justify-center shrink-0">
        <button 
            onClick={onBack} 
            className={`absolute left-6 p-2 -ml-2 ${theme.textLight} hover:bg-white/50 rounded-full transition-colors`}
        >
          <ChevronLeft size={32} strokeWidth={3} />
        </button>
        <h1 className={`${theme.text} font-bold text-3xl`}>Themes</h1>
      </div>

      <div className="flex-1 px-6 pt-4 pb-12 overflow-y-auto no-scrollbar min-h-0">
        <p className="text-center text-gray-400 text-xs font-bold mb-6 uppercase tracking-wider">Level up to unlock more themes</p>

        <ThemeCard 
            title="Pretty in Pink"
            isActive={activeTheme === 'Pretty in Pink'}
            onClick={() => handleSelectTheme('Pretty in Pink')}
            gradient="bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF]"
            icon={<Flower2 size={32} className="text-white fill-white" />}
            decorations={
                <>
                    <Flower2 size={16} className="absolute top-4 left-32 text-white animate-pulse" />
                    <Flower2 size={12} className="absolute bottom-4 left-40 text-white" />
                </>
            }
        />

        <ThemeCard 
            title="Forest Fairy"
            requiredLevel={3}
            isLocked={userLevel < 3}
            isActive={activeTheme === 'Forest Fairy'}
            onClick={() => handleSelectTheme('Forest Fairy')}
            gradient="bg-gradient-to-r from-[#4CA1AF] to-[#C4E0E5]"
            icon={<Sprout size={32} className="text-white fill-white" />}
            decorations={
                <>
                    <Sprout size={18} className="absolute top-3 left-48 text-white rotate-45" />
                    <Sprout size={14} className="absolute bottom-6 right-20 text-white -rotate-12" />
                </>
            }
        />

        <ThemeCard 
            title="Magical Muse"
            requiredLevel={5}
            isLocked={userLevel < 5}
            isActive={activeTheme === 'Magical Muse'}
            onClick={() => handleSelectTheme('Magical Muse')}
            gradient="bg-gradient-to-r from-[#7F7FD5] via-[#86A8E7] to-[#91EAE4]"
            icon={<Wand2 size={32} className="text-white fill-white" />}
            decorations={
                <>
                   <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                </>
            }
        />

        <ThemeCard 
            title="Deep Sea Diver"
            requiredLevel={8}
            isLocked={userLevel < 8}
            isActive={activeTheme === 'Deep Sea Diver'}
            onClick={() => handleSelectTheme('Deep Sea Diver')}
            gradient="bg-gradient-to-r from-[#0F2027] via-[#203A43] to-[#2C5364]"
            icon={<JellyfishIcon className="w-8 h-8 text-white fill-white/20" />}
            decorations={
                <>
                    <div className="absolute bottom-4 left-32 w-2 h-2 bg-white/40 rounded-full border border-white animate-bounce"></div>
                </>
            }
        />

      </div>
    </div>
  );
};
