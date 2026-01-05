
import React, { useEffect, useState } from 'react';
import { HelpCircle, Smile, Info, X, Activity, Droplet, BarChart2, AlertCircle, Repeat, Clock, Star } from 'lucide-react';
import * as db from '../services/storageService';
import { triggerHaptic } from '../utils/haptics';
import { SYMPTOMS_LIST, getThemeClasses } from '../constants';
import { ThemeColor } from '../types';

interface AnalyticsPageProps {
  privacyMode: boolean;
  themeColor: ThemeColor;
}

const EMOJI_MAP: Record<string, string> = {
    'Happy': '😄',
    'Sad': '☹️',
    'Anxious': '😰',
    'Angry': '😠',
    'Swing': '🎭',
    'Crying': '😭',
    'Grateful': '😇',
    'Insecure': '😣',
    'Gloomy': '😞',
    'Sleepy': '😴'
};

const EmptyState: React.FC<{ icon: React.ReactNode, title: string, text: string }> = ({ icon, title, text }) => (
    <div className="flex flex-col items-center justify-center text-center py-2 opacity-70">
        <div className="w-8 h-8 bg-pink-50 rounded-full flex items-center justify-center mb-1 text-pink-400">
            {icon}
        </div>
        <p className="text-gray-600 font-bold text-[10px] mb-0">{title}</p>
        <p className="text-[9px] text-gray-400 max-w-[120px] leading-tight">{text}</p>
    </div>
);

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-2xl p-3 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center gap-3 flex-1 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${color.replace('text-', 'bg-').replace('500', '50')} ${color}`}>
            {icon}
        </div>
        <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{title}</p>
            <p className="text-xl font-black text-gray-800 leading-none truncate">{value}</p>
        </div>
    </div>
);

// Ghost Chart for empty state affordance
const GhostChart = () => (
    <div className="flex justify-between items-end h-20 mb-2 gap-2 sm:gap-4 opacity-30">
        {[40, 65, 30, 80, 50, 70].map((h, i) => (
             <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
                <div 
                    className="w-2 rounded-full bg-gray-300"
                    style={{ height: `${h}%` }}
                ></div>
             </div>
        ))}
    </div>
);

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ privacyMode, themeColor }) => {
    const [data, setData] = useState<db.AnalyticsData | null>(null);
    const [selectedCycle, setSelectedCycle] = useState<any>(null);
    const [showHelp, setShowHelp] = useState(false);
    const [showVariabilityHelp, setShowVariabilityHelp] = useState(false);

    const theme = getThemeClasses(themeColor);

    useEffect(() => {
        const stats = db.getAnalytics();
        setData(stats);
        if (stats?.chartData?.length > 0) {
            setSelectedCycle(stats.chartData[stats.chartData.length - 1]);
        }
    }, []);

    const maxDays = 40; 
    const blurClass = privacyMode ? "blur-md opacity-30 pointer-events-none select-none" : "";

    const handleBarClick = (d: any) => {
        triggerHaptic('light');
        setSelectedCycle(d);
    };

    if (!data) return <div className="p-10 text-center text-gray-500 font-bold text-sm">Crunching numbers...</div>;

    // Consistency Score Visual Logic
    const scoreColor = data.consistencyScore >= 80 ? 'text-emerald-600' : data.consistencyScore >= 50 ? 'text-amber-600' : 'text-orange-600';
    const ringColor = data.consistencyScore >= 80 ? 'stroke-emerald-500' : data.consistencyScore >= 50 ? 'stroke-amber-500' : 'stroke-orange-500';

    const getFlowGradient = (score: number) => {
        if (score < 30) return 'from-blue-200 to-blue-300';
        if (score < 70) return 'from-blue-300 to-indigo-400';
        return 'from-indigo-400 to-purple-600';
    };

    const formatDateShort = (iso: string) => {
        const d = new Date(iso);
        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
    };

    const getPersona = (score: number) => {
        if (score >= 90) return { title: "Clockwork Queen", subtitle: "Your cycle is incredibly regular!", icon: "👑" };
        if (score >= 75) return { title: "Regular Rhythm", subtitle: "You have a steady, predictable flow.", icon: "🎵" };
        if (score >= 50) return { title: "Free Spirit", subtitle: "A bit variable, but that's natural.", icon: "🍃" };
        return { title: "Wild Wave", subtitle: "Your cycle varies. Keep tracking!", icon: "🌊" };
    };

    const persona = getPersona(data.consistencyScore);

    return (
        <div className={`h-[100dvh] ${theme.bgLight} px-6 pt-10 pb-24 font-sans animate-in fade-in duration-500 flex flex-col overflow-hidden`}>
            
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h1 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
                    <Activity className={theme.text} size={20} />
                    Cycle Analysis
                </h1>
                <button 
                    onClick={() => { triggerHaptic('light'); setShowHelp(true); }}
                    className={`p-2 bg-white rounded-full text-gray-500 hover:${theme.text} shadow-sm active:scale-95 transition-transform`}
                    aria-label="Analytics Help"
                >
                    <Info size={18} />
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto no-scrollbar pb-10">
                
                {/* 0. Persona Card (Gamified Summary) */}
                <div className={`bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-4 shadow-lg text-white relative overflow-hidden shrink-0 ${blurClass}`}>
                    <div className="absolute right-0 top-0 text-9xl opacity-10 pointer-events-none -mr-4 -mt-4">{persona.icon}</div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl">{persona.icon}</span>
                            <h2 className="text-lg font-black italic tracking-wide">{persona.title}</h2>
                        </div>
                        <p className="text-xs font-medium text-pink-100 max-w-[80%]">{persona.subtitle}</p>
                    </div>
                </div>

                {/* 1. Key Averages Row */}
                <div className={`flex gap-3 shrink-0 ${blurClass}`}>
                    <StatCard 
                        title="Avg Cycle" 
                        value={`${data.avgCycle} Days`} 
                        icon={<Repeat size={18} />} 
                        color="text-purple-500" 
                    />
                    <StatCard 
                        title="Avg Period" 
                        value={`${data.avgPeriod} Days`} 
                        icon={<Droplet size={18} />} 
                        color="text-pink-500" 
                    />
                </div>

                {/* 2. Consistency Score Card */}
                <div className={`bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center justify-between relative overflow-hidden shrink-0 ${blurClass}`}>
                    <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-pink-50 to-transparent rounded-full -mr-8 -mt-8 opacity-60"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Consistency Score</h2>
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    triggerHaptic('light');
                                    setShowVariabilityHelp(true); 
                                }}
                                className={`${theme.text} ${theme.bgLight} p-1 rounded-full hover:bg-white transition-colors`}
                                aria-label="What is this score?"
                            >
                                <HelpCircle size={14} />
                            </button>
                        </div>
                        <p className={`text-base font-black ${scoreColor} mb-0.5`}>{data.cycleStatus}</p>
                    </div>
                    
                    <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="#F3F4F6" strokeWidth="5" fill="none" />
                            <circle 
                                cx="32" cy="32" r="26" 
                                className={`${ringColor} transition-all duration-1000 ease-out`}
                                strokeWidth="5" 
                                fill="none" 
                                strokeDasharray="163" 
                                strokeDashoffset={163 - (163 * data.consistencyScore) / 100} 
                                strokeLinecap="round"
                            />
                        </svg>
                        <span className={`absolute text-lg font-black ${scoreColor}`}>{data.consistencyScore}</span>
                    </div>
                </div>

                {/* 3. Cycle History Chart (Scrollable) */}
                <div className={`bg-white rounded-2xl p-4 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col ${blurClass} min-h-[240px]`}>
                    <div className="flex justify-between items-center w-full mb-3">
                        <span className="text-xs font-bold text-gray-800">Cycle History</span>
                        <div className="flex items-center gap-2">
                             <div className="flex items-center gap-1">
                                 <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                                 <span className="text-[8px] font-bold text-gray-400 uppercase">Period</span>
                             </div>
                             <div className="flex items-center gap-1">
                                 <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                 <span className="text-[8px] font-bold text-gray-400 uppercase">Cycle</span>
                             </div>
                        </div>
                    </div>

                    {!data.hasEnoughData ? (
                        <div className="relative flex-1 flex flex-col justify-center">
                            <GhostChart />
                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                                <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 text-center max-w-[150px]">
                                    <BarChart2 size={20} className="text-pink-300 mx-auto mb-2" />
                                    <p className="text-[10px] text-gray-500 font-bold">Log at least 2 cycles to see trends.</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-end">
                            {/* Horizontal Scroll Container */}
                            <div className="overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
                                <div className="flex items-end h-32 gap-3 min-w-max">
                                    {data.chartData.map((d: any, i: number) => {
                                        const totalHeightPct = Math.min((d.total / maxDays) * 100, 100);
                                        const periodHeightPct = (d.period / d.total) * 100; 
                                        const isSelected = selectedCycle?.month === d.month;

                                        return (
                                            <button 
                                                key={i} 
                                                onClick={() => handleBarClick(d)}
                                                className="flex flex-col items-center h-full justify-end group cursor-pointer focus:outline-none relative w-8"
                                                aria-label={`Cycle for ${d.month}: ${d.total} days`}
                                            >
                                                <div 
                                                    className={`w-3 sm:w-4 rounded-full overflow-hidden flex flex-col justify-end relative transition-all duration-300 
                                                    ${isSelected ? 'scale-110 shadow-lg shadow-pink-100 ring-2 ring-pink-200' : 'opacity-80 hover:opacity-100'}`}
                                                    style={{ height: `${totalHeightPct}%`, backgroundColor: isSelected ? '#DDD6FE' : '#F3F4F6' }}
                                                >
                                                    <div 
                                                        className={`w-full absolute bottom-0 transition-colors ${isSelected ? 'bg-pink-500' : 'bg-pink-300'}`}
                                                        style={{ height: `${periodHeightPct}%` }} 
                                                    ></div>
                                                </div>
                                                <span className={`text-[9px] mt-2 font-bold uppercase transition-colors ${isSelected ? 'text-pink-600' : 'text-gray-400'}`}>{d.month}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            
                            {selectedCycle && (
                                <div className="bg-pink-50/50 rounded-lg p-3 border border-pink-100 animate-in fade-in slide-in-from-top-2 duration-200 flex justify-between items-center shrink-0 mt-2">
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{selectedCycle.month} Breakdown</div>
                                        <div className="text-[10px] text-pink-500 font-bold">{formatDateShort(selectedCycle.startDate)} - {formatDateShort(selectedCycle.endDate)}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="text-[9px] font-bold text-gray-400 block uppercase">Cycle</span>
                                            <span className="text-xs font-black text-gray-800">{selectedCycle.total}d</span>
                                        </div>
                                        <div className="w-[1px] h-4 bg-pink-200"></div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-bold text-gray-400 block uppercase">Period</span>
                                            <span className="text-xs font-black text-pink-500">{selectedCycle.period}d</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Bottom Grid */}
                <div className={`grid grid-cols-2 gap-3 shrink-0 ${blurClass}`}>
                    
                    {/* Symptom Rankings (With Icons) */}
                    <div className="bg-white rounded-2xl p-3 shadow-[0_4px_15px_rgba(0,0,0,0.03)] col-span-2 overflow-hidden">
                        <h3 className="text-gray-800 font-bold text-[10px] mb-2 flex items-center gap-2">
                            <Activity size={12} className="text-orange-400" />
                            Top Symptoms
                        </h3>
                        {data.symptomStats.length > 0 ? (
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {data.symptomStats.map((s, i) => {
                                    const def = SYMPTOMS_LIST.find(def => def.id === s.name);
                                    const Icon = def ? def.icon : Activity;
                                    return (
                                        <div key={i} className="flex-none bg-gray-50 rounded-lg px-2 py-2 min-w-[80px] flex flex-col justify-between h-[60px]">
                                            <div className="flex justify-between items-start">
                                                <div className="bg-white p-1 rounded-full shadow-sm text-pink-500">
                                                    <Icon size={12} />
                                                </div>
                                                <span className="text-[10px] font-black text-orange-500">{s.count}</span>
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-bold text-gray-600 block truncate">{s.name}</span>
                                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden mt-1">
                                                    <div 
                                                        className="h-full bg-orange-400 rounded-full"
                                                        style={{ width: `${(s.count / data.symptomStats[0].count) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <EmptyState icon={<Activity size={14} />} title="No Data" text="Log symptoms to see trends." />
                        )}
                    </div>

                    {/* Mood Dominance */}
                    <div className="bg-white rounded-2xl p-3 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                        <h3 className="text-gray-800 font-bold text-[9px] mb-1 flex items-center gap-1 self-start">
                            <Smile size={10} className="text-yellow-500" />
                            Mood
                        </h3>
                        {data.moodStats.length > 0 ? (
                            <>
                                <span className="text-3xl mb-1">{EMOJI_MAP[data.moodStats[0].name] || '😐'}</span>
                                <p className="text-[10px] font-black text-gray-800 text-center leading-tight">{data.moodStats[0].name}</p>
                            </>
                        ) : (
                            <span className="text-gray-400 text-[9px] font-bold">No data</span>
                        )}
                    </div>

                    {/* Flow Intensity Gauge */}
                    <div className="bg-white rounded-2xl p-3 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col items-center justify-center">
                        <h3 className="text-gray-800 font-bold text-[9px] mb-1 flex items-center gap-1 self-start">
                            <Droplet size={10} className="text-blue-500" />
                            Flow
                        </h3>
                        <div className="w-full flex items-center justify-center">
                            <div className="h-2 w-full bg-gray-100 rounded-full relative overflow-hidden">
                                <div 
                                    className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${getFlowGradient(data.flowStats.score)}`}
                                    style={{ width: `${data.flowStats.score}%` }}
                                ></div>
                            </div>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 mt-2">Avg Intensity</span>
                    </div>

                </div>
            </div>
            
            {/* Privacy Mode Overlay */}
            {privacyMode && (
                <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="bg-white/90 p-4 rounded-2xl shadow-xl text-center backdrop-blur-md border border-gray-200 w-56 pointer-events-auto">
                        <AlertCircle className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-gray-800 font-bold mb-1 text-sm">Privacy Mode</p>
                        <p className="text-xs text-gray-500">Sensitive analytics hidden.</p>
                    </div>
                </div>
            )}
            
            {/* General Help Modal */}
            {showHelp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHelp(false)}></div>
                    <div className="bg-white rounded-[2rem] p-6 shadow-2xl relative z-10 w-full max-w-sm animate-in zoom-in-95 duration-200">
                        <button onClick={() => setShowHelp(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-2 rounded-full">
                            <X size={20} />
                        </button>
                        <h3 className="font-bold text-lg text-gray-800 mb-4">Analytics Guide</h3>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            Charts require at least 2 full cycles of data to show meaningful trends. Keep logging daily!
                        </p>
                        <button 
                            onClick={() => setShowHelp(false)}
                            className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* Specific Variability Help Modal */}
            {showVariabilityHelp && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowVariabilityHelp(false)}></div>
                    <div className="bg-white rounded-[2rem] p-6 shadow-2xl relative z-10 w-full max-w-sm animate-in zoom-in-95 duration-200 border-4 border-pink-50">
                        <button onClick={() => setShowVariabilityHelp(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-100 p-2 rounded-full">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-pink-100 p-3 rounded-full text-pink-600">
                                <Activity size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900">Consistency Score</h3>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-2">
                            This score measures how regular your cycle length is.
                        </p>
                        <ul className="text-sm text-gray-600 leading-relaxed mb-6 space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-emerald-500 font-bold">80-100:</span> Highly predictable.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-amber-500 font-bold">50-79:</span> Normal variation.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-orange-500 font-bold">0-49:</span> Irregular cycle.
                            </li>
                        </ul>
                        <button 
                            onClick={() => setShowVariabilityHelp(false)}
                            className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-pink-200"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
