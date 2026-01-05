
import React, { useEffect, useState } from 'react';
import { ChevronRight, Droplet, Palette, Star, CheckCircle, Zap, ShieldCheck } from 'lucide-react';
import { getNextThemeReward, getLevelProgress, getUserStats, getLogForDate, POINTS, getWeeklyActivity } from '../services/storageService';
import { ThemeColor } from '../types';
import { getThemeClasses } from '../constants';

interface BadgeIconProps {
  size?: "sm" | "lg";
  level: number;
}

const BadgeIcon: React.FC<BadgeIconProps> = ({ size = "lg", level }) => {
  const isLarge = size === "lg";
  const containerClass = isLarge ? "w-32 h-36" : "w-14 h-16";
  const rosetteSize = isLarge ? 110 : 48;
  const centerSize = isLarge ? "w-16 h-16" : "w-8 h-8";
  const iconSize = isLarge ? 32 : 16;
  const ribbonWidth = isLarge ? "w-12" : "w-6";
  const ribbonHeight = isLarge ? "h-14" : "h-7";
  const ribbonText = isLarge ? "text-xl" : "text-[10px]";
  const ribbonTop = isLarge ? "-mt-6" : "-mt-3";

  return (
    <div className={`relative flex flex-col items-center justify-start ${containerClass} drop-shadow-2xl`}>
      <div className="relative z-20 flex items-center justify-center">
        <svg 
            width={rosetteSize} 
            height={rosetteSize} 
            viewBox="0 0 100 100" 
            className="text-white"
            fill="currentColor"
        >
            <path d="M50 0 C60 0 70 5 75 15 C80 5 90 0 100 0 C100 10 95 20 85 25 C95 30 100 40 100 50 C100 60 95 70 85 75 C95 80 100 90 100 100 C90 100 80 95 75 85 C70 95 60 100 50 100 C40 100 30 95 25 85 C20 95 10 100 0 100 C0 90 5 80 15 75 C5 70 0 60 0 50 C0 40 5 30 15 25 C5 20 0 10 0 0 C10 0 20 5 25 15 C30 5 40 0 50 0 Z" transform="scale(0.9) translate(5,5)" />
        </svg>
        <div className={`absolute rounded-full bg-white/20 backdrop-blur-sm border-[4px] border-white/50 flex items-center justify-center ${isLarge ? 'w-20 h-20' : 'w-9 h-9'}`}>
             <div className={`${centerSize} bg-black/10 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden ring-2 ring-white/30`}>
                <Droplet className="text-white fill-white relative z-10" size={iconSize} />
                <div className="absolute top-1 right-2 w-full h-full bg-white opacity-20 rounded-full blur-[2px]"></div>
             </div>
        </div>
      </div>
      <div 
        className={`${ribbonWidth} ${ribbonHeight} bg-white relative z-10 ${ribbonTop} flex items-end justify-center pb-2 shadow-sm`}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
      >
        <span className={`${ribbonText} font-black text-gray-800`}>{level}</span>
      </div>
    </div>
  );
};

const StreakCalendar: React.FC = () => {
    const activity = getWeeklyActivity();
    
    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20">
            <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-white font-bold text-xs uppercase tracking-wider opacity-90">7-Day Activity</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                    <ShieldCheck size={10} /> Consistent
                </span>
            </div>
            <div className="flex justify-between items-center">
                {activity.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                            ${day.isLogged 
                                ? 'bg-white border-white text-gray-500 shadow-lg scale-110' 
                                : 'bg-transparent border-white/30 text-white/50'
                            }
                            ${day.isToday && !day.isLogged ? 'animate-pulse border-white/60' : ''}
                        `}>
                            {day.isLogged ? <CheckCircle size={18} fill="currentColor" className="text-green-500 bg-white rounded-full" /> : <div className="w-1.5 h-1.5 bg-white/30 rounded-full"></div>}
                        </div>
                        <span className={`text-[9px] font-bold ${day.isToday ? 'text-white' : 'text-white/60'}`}>
                            {day.dayName}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const QuestItem: React.FC<{ title: string; xp: number; completed: boolean }> = ({ title, xp, completed }) => (
    <div className={`flex items-center justify-between p-4 rounded-2xl border mb-2 transition-all duration-300 ${completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${completed ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                {completed ? <CheckCircle size={20} /> : <Zap size={20} />}
            </div>
            <div>
                <span className={`text-sm font-bold block ${completed ? 'text-green-800' : 'text-gray-700'}`}>{title}</span>
                <span className={`text-[10px] font-bold ${completed ? 'text-green-600' : 'text-gray-400'}`}>
                    {completed ? 'Completed' : `+${xp} XP Reward`}
                </span>
            </div>
        </div>
    </div>
);

const MenuItem: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; onClick?: () => void; themeColor: ThemeColor }> = ({ title, subtitle, icon, onClick, themeColor }) => {
    const theme = getThemeClasses(themeColor);
    return (
        <div 
            onClick={onClick}
            className={`bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm mb-3 active:scale-[0.99] transition-transform cursor-pointer group border border-gray-100 hover:${theme.border} hover:shadow-md`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 relative flex items-center justify-center ${theme.bgLight} rounded-2xl ${theme.text} group-hover:${theme.bg} group-hover:text-white transition-colors duration-300`}>
                    {icon}
                </div>
                <div>
                    <span className="font-bold text-gray-800 block text-sm">{title}</span>
                    {subtitle && <span className="text-[10px] font-bold text-gray-400 block">{subtitle}</span>}
                </div>
            </div>
            <ChevronRight className={`text-gray-300 group-hover:${theme.textLight} transition-colors`} size={20} />
        </div>
    );
};

interface BadgesPageProps {
    onOpenThemes?: () => void;
    onOpenBadges?: () => void;
    userLevel: number;
    themeColor: ThemeColor;
}

export const BadgesPage: React.FC<BadgesPageProps> = ({ onOpenThemes, onOpenBadges, userLevel, themeColor }) => {
  const [nextReward, setNextReward] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  
  const theme = getThemeClasses(themeColor);

  useEffect(() => {
      const stats = getUserStats();
      const nextRwd = getNextThemeReward(stats.level);
      setNextReward(nextRwd);

      const prog = getLevelProgress(stats.points, stats.level);
      setProgress(prog);

      const today = new Date().toISOString().split('T')[0];
      const todayLog = getLogForDate(today);
      
      const newQuests = [
          { 
              title: "Log Symptoms", 
              xp: POINTS.DAILY_LOG, 
              completed: !!todayLog 
          },
          { 
              title: "Reach Hydration Goal", 
              xp: POINTS.WATER_GOAL, 
              completed: !!todayLog && todayLog.waterIntake >= 8 
          },
          { 
              title: "Maintain Streak", 
              xp: POINTS.STREAK_BONUS, 
              completed: stats.streak > 0 && stats.streak % 7 === 0
          }
      ];
      setQuests(newQuests);

  }, [userLevel]);

  return (
    <div className={`h-[100dvh] ${theme.gradientVertical} flex flex-col font-sans animate-in fade-in duration-500 overflow-hidden pb-24`}>
      
      {/* Top Section: Level & XP - Fixed */}
      <div className="flex-none pt-10 px-6 pb-6 flex flex-col items-center relative shrink-0">
         {/* Decorative Particles */}
         <Star className="absolute top-16 left-8 text-white/30 animate-pulse" size={20} />
         <Star className="absolute top-32 right-8 text-white/20 animate-pulse delay-75" size={16} />
         <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
         
         <div className="flex flex-col items-center mb-6">
             <BadgeIcon level={userLevel} size="lg" />
             <h1 className="text-white font-black text-3xl italic tracking-tight mt-4 drop-shadow-md">LEVEL {userLevel}</h1>
         </div>

         {/* XP Progress Bar */}
         {progress && (
            <div className="w-full max-w-sm bg-black/20 rounded-2xl p-2 backdrop-blur-sm mb-4 border border-white/10 shadow-xl">
                <div className="flex justify-between text-[10px] font-bold text-white mb-1.5 px-1">
                    <span>{progress.currentPoints} XP</span>
                    <span className="opacity-80">{progress.nextLevelPoints} XP</span>
                </div>
                <div className="h-3 bg-black/40 rounded-full overflow-hidden w-full relative">
                    <div 
                        className="h-full bg-gradient-to-r from-yellow-300 via-orange-400 to-white rounded-full shadow-[0_0_10px_rgba(255,200,0,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${progress.percentage}%` }}
                    >
                         <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
                <div className="text-center mt-1.5">
                     <span className="text-[10px] text-white/90 font-bold bg-white/10 px-2 py-0.5 rounded-lg">{progress.pointsRemaining} XP to next level</span>
                </div>
            </div>
         )}
         
         <div className="w-full max-w-sm">
            <StreakCalendar />
         </div>

      </div>

      {/* Main Content Card - Scrollable */}
      <div className="flex-1 bg-gray-50 rounded-t-[2.5rem] shadow-[0_-10px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-0 relative z-10">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1"></div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2">
            
            {/* Daily Quests Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider">Today's Quests</h3>
                    <span className="text-[10px] font-bold text-gray-400">{quests.filter(q => q.completed).length}/{quests.length} Done</span>
                </div>
                <div className="flex flex-col gap-1">
                    {quests.map((q, i) => (
                        <QuestItem key={i} title={q.title} xp={q.xp} completed={q.completed} />
                    ))}
                </div>
            </div>

            {/* Next Reward */}
            {nextReward && (
                <div className="mb-8">
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3 pl-1">Up Next</h3>
                    <div className={`w-full bg-gradient-to-br from-white ${theme.bgLight} rounded-3xl p-1 shadow-sm border ${theme.border}`}>
                        <div className="border border-white/50 rounded-[1.3rem] p-4 flex items-center gap-4 relative overflow-hidden">
                            <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                                <Palette size={100} />
                            </div>
                            <div className={`bg-white p-3 rounded-2xl shadow-md ${theme.text} relative z-10`}>
                                <Palette size={24} />
                            </div>
                            <div className="flex-1 relative z-10">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-[10px] font-bold ${theme.text} ${theme.bgLight} px-1.5 py-0.5 rounded uppercase`}>Level {nextReward.level}</span>
                                </div>
                                <p className="text-base font-black text-gray-800 leading-tight">
                                    Unlock "{nextReward.reward}" Theme
                                </p>
                            </div>
                            <div className="bg-gray-100 px-3 py-1.5 rounded-xl text-[10px] font-bold text-gray-500 border border-gray-200 shadow-inner">
                                Locked
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="w-full h-px bg-gray-200 mb-6"></div>

            <MenuItem 
                title="Badges Collection" 
                subtitle="View your unlocked achievements"
                onClick={onOpenBadges}
                icon={<Droplet size={24} />} 
                themeColor={themeColor}
            />
            
            <MenuItem 
                title="Theme Gallery"
                subtitle="Personalize your experience"
                onClick={onOpenThemes}
                icon={<Palette size={24} />} 
                themeColor={themeColor}
            />
          </div>
      </div>
    </div>
  );
};
