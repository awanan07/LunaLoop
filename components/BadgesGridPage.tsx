
import React, { useState } from 'react';
import { ChevronLeft, Lock, Droplet, Brush, ClipboardCheck, Flame, Smile, Eye, X, Star } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { BADGE_DEFINITIONS, getBadgeProgress, POINTS } from '../services/storageService';
import { ThemeColor } from '../types';
import { getThemeClasses } from '../constants';

interface BadgesGridPageProps {
  onBack: () => void;
  unlockedBadges: string[];
  themeColor: ThemeColor;
}

const getIcon = (iconName: string, colorClass: string, size: number = 24) => {
    switch(iconName) {
        case 'sparkle': return <Droplet size={size} className={colorClass} fill="currentColor" />;
        case 'brush': return <Brush size={size} className={colorClass} fill="currentColor" />;
        case 'water': return <ClipboardCheck size={size} className={colorClass} />;
        case 'flame': return <Flame size={size} className={colorClass} fill="currentColor" />;
        case 'smile': return <Smile size={size} className={colorClass} />;
        case 'eye': return <Eye size={size} className={colorClass} />;
        default: return <Droplet size={size} className={colorClass} />;
    }
}

// Badge Details Modal Component
const BadgeDetailsModal: React.FC<{
    badge: typeof BADGE_DEFINITIONS[0];
    isUnlocked: boolean;
    onClose: () => void;
}> = ({ badge, isUnlocked, onClose }) => {
    const progress = getBadgeProgress(badge.id);
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                </button>

                <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-4 border-[6px] shadow-inner ${isUnlocked ? 'bg-pink-50 border-pink-100' : 'bg-gray-50 border-gray-100'}`}>
                     {getIcon(badge.icon, isUnlocked ? "text-pink-500" : "text-gray-400", 48)}
                </div>

                <h3 className="text-xl font-black text-gray-800 mb-1">{badge.name}</h3>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-5 px-3 py-1 rounded-full border ${isUnlocked ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                </div>

                <p className="text-gray-500 text-sm mb-6 leading-relaxed px-4 font-medium">
                    {badge.desc}
                </p>

                {/* Rewards Info */}
                <div className="flex items-center gap-2 mb-6 bg-yellow-50 px-4 py-3 rounded-2xl border border-yellow-100 w-full justify-center">
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-yellow-700 font-bold text-sm">Reward: {POINTS.BADGE_UNLOCK} XP</span>
                </div>

                {/* Progress Bar (if locked and trackable) */}
                {!isUnlocked && progress && (
                    <div className="w-full bg-gray-50 rounded-2xl p-4 mb-2 border border-gray-100">
                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                            <span>Progress</span>
                            <span>{progress.current} / {progress.target} {progress.label}</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-pink-400 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((progress.current / progress.target) * 100, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const BadgeItem: React.FC<{
  def: { id: string, name: string, desc: string, icon: string };
  locked: boolean;
  onPress: () => void;
}> = ({ def, locked, onPress }) => {
  const rosettePath = "M50 0 C60 0 70 5 75 15 C80 5 90 0 100 0 C100 10 95 20 85 25 C95 30 100 40 100 50 C100 60 95 70 85 75 C95 80 100 90 100 100 C90 100 80 95 75 85 C70 95 60 100 50 100 C40 100 30 95 25 85 C20 95 10 100 0 100 C0 90 5 80 15 75 C5 70 0 60 0 50 C0 40 5 30 15 25 C5 20 0 10 0 0 C10 0 20 5 25 15 C30 5 40 0 50 0 Z";

  return (
    <button 
        onClick={() => { triggerHaptic('light'); onPress(); }}
        className="flex flex-col items-center gap-3 w-full max-w-[100px] transition-transform active:scale-95 focus:outline-none group"
    >
      <div className="relative w-24 h-24 flex items-center justify-center filter transition-all duration-300">
        
        {/* Shadow/Backdrop */}
        <div className={`absolute inset-2 rounded-full blur-md opacity-40 transition-all duration-300 ${locked ? 'bg-gray-200' : 'bg-pink-400 group-hover:scale-110'}`}></div>

        {/* Rosette SVG */}
        <svg width="100%" height="100%" viewBox="0 0 100 100" className={`absolute drop-shadow-sm transition-all duration-300 ${locked ? 'opacity-80' : ''}`}>
            <path d={rosettePath} fill={locked ? "#F9FAFB" : "#FFFFFF"} transform="scale(0.95) translate(2.5,2.5)" />
        </svg>

        {/* Center Circle */}
        <div className={`
            relative z-10 rounded-full w-12 h-12 flex items-center justify-center border-[3px] shadow-inner transition-colors duration-300
            ${locked 
                ? 'bg-gray-100 border-gray-200' 
                : 'bg-pink-50 border-pink-200'
            }
        `}>
             {/* If locked, show icon in grey instead of lock icon, to encourage clicking */}
             {locked ? (
                 <div className="opacity-40 grayscale">
                    {getIcon(def.icon, "text-gray-400", 22)}
                 </div>
             ) : (
                 <div className="text-[#5D2E2E]">
                    {getIcon(def.icon, "text-pink-500", 22)}
                 </div>
             )}
        </div>
        
        {/* Lock Overlay (Small) - Better affordance than replacing the whole icon */}
        {locked && (
             <div className="absolute bottom-2 right-2 bg-gray-200 rounded-full p-1 border border-white z-20">
                 <Lock size={10} className="text-gray-500" />
             </div>
        )}
        
        {/* Ribbon Tail (Visual Polish) */}
        {!locked && (
             <div className="absolute -bottom-1 w-6 h-6 bg-pink-100 rotate-45 z-0 rounded-sm shadow-sm" style={{ top: '65%' }}></div>
        )}
      </div>
      
      {/* Label - Properly separated from graphic */}
      <div className="flex flex-col items-center gap-0.5 w-full">
         <span className={`text-xs font-bold text-center leading-tight line-clamp-2 ${locked ? 'text-gray-400' : 'text-gray-800'}`}>
            {def.name}
         </span>
      </div>
    </button>
  );
};

export const BadgesGridPage: React.FC<BadgesGridPageProps> = ({ onBack, unlockedBadges, themeColor }) => {
  const [selectedBadge, setSelectedBadge] = useState<typeof BADGE_DEFINITIONS[0] | null>(null);

  const unlockedCount = unlockedBadges.length;
  const totalBadges = BADGE_DEFINITIONS.length;
  const theme = getThemeClasses(themeColor);

  return (
    <div className="h-full bg-white flex flex-col font-sans animate-in slide-in-from-right duration-300">
      
      {selectedBadge && (
          <BadgeDetailsModal 
             badge={selectedBadge}
             isUnlocked={unlockedBadges.includes(selectedBadge.id)}
             onClose={() => setSelectedBadge(null)}
          />
      )}
      
      <div className="px-6 pt-10 pb-4 relative flex items-center justify-center shrink-0 border-b border-gray-50">
        <button 
            onClick={() => { triggerHaptic('light'); onBack(); }}
            className="absolute left-6 p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"
        >
          <ChevronLeft size={32} strokeWidth={3} />
        </button>
        <div className="flex flex-col items-center">
             <h1 className="text-gray-800 font-black text-xl tracking-tight">Badges Collection</h1>
             <span className={`${theme.text} font-bold text-xs ${theme.bgLight} px-3 py-1 rounded-full mt-1`}>{unlockedCount} / {totalBadges} Unlocked</span>
        </div>
      </div>

      <div className="flex-1 p-8 pb-12 overflow-y-auto no-scrollbar min-h-0 bg-[#FAFAFA]">
         <div className="grid grid-cols-3 gap-y-10 gap-x-4 place-items-start justify-items-center">
            {BADGE_DEFINITIONS.map(def => (
                <BadgeItem 
                    key={def.id}
                    def={def}
                    locked={!unlockedBadges.includes(def.id)}
                    onPress={() => setSelectedBadge(def)}
                />
            ))}
         </div>
      </div>
    </div>
  );
};
