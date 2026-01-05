
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Sparkles, Edit3 } from 'lucide-react';
import * as db from '../services/storageService';
import { LogEntry, CalendarProjection, ThemeColor } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { getThemeClasses } from '../constants';

interface CalendarViewProps {
  onClose: () => void;
  onDayClick?: (dateStr: string) => void; 
  themeColor: ThemeColor;
}

const LegendItem: React.FC<{ color: string; label: string; icon?: React.ReactNode }> = ({ color, label, icon }) => (
    <div className="flex items-center gap-1.5">
        <div className={`w-3 h-3 rounded-full flex items-center justify-center ${color} shadow-sm border border-black/5`}>
            {icon}
        </div>
        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wide">{label}</span>
    </div>
);

export const CalendarView: React.FC<CalendarViewProps> = ({ onClose, onDayClick, themeColor }) => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [projections, setProjections] = useState<CalendarProjection[]>([]);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Touch handling state
  const touchStart = useRef<{x: number, y: number} | null>(null);
  const touchEnd = useRef<{x: number, y: number} | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  const theme = getThemeClasses(themeColor);
  const isNeutral = themeColor === 'neutral';

  useEffect(() => {
    setLogs(db.getLogs());
    setProjections(db.getCalendarProjections(6)); 
  }, []);

  const toIsoDate = (d: Date) => {
      return db.getLocalDateString(d);
  };

  const getLogForDay = (date: Date) => {
      const iso = toIsoDate(date);
      return logs.find(l => l.date === iso);
  };

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); 
    
    const grid = [];
    for (let i = 0; i < firstDayIndex; i++) {
        grid.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        grid.push(new Date(year, month, i));
    }
    while (grid.length < 42) {
        grid.push(null);
    }
    return grid;
  }, [currentDate]);

  const changeMonth = (direction: 'prev' | 'next') => {
      if (isAnimating) return;
      triggerHaptic('light');
      setIsAnimating(true);
      setSlideDirection(direction === 'prev' ? 'right' : 'left');
      
      setTimeout(() => {
          const newDate = new Date(currentDate);
          if (direction === 'prev') newDate.setMonth(currentDate.getMonth() - 1);
          else newDate.setMonth(currentDate.getMonth() + 1);
          
          setCurrentDate(newDate);
          setSlideDirection(null); 
          setIsAnimating(false);
      }, 300);
  };

  const jumpToToday = () => {
      triggerHaptic('medium');
      const today = new Date();
      setSelectedDate(today);
      
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const todayMonth = today.getMonth();
      const todayYear = today.getFullYear();

      if (todayMonth !== currentMonth || todayYear !== currentYear) {
        // Determine direction
        const isFuture = todayYear > currentYear || (todayYear === currentYear && todayMonth > currentMonth);
        setSlideDirection(isFuture ? 'left' : 'right');
        
        setTimeout(() => {
            setCurrentDate(today);
            setSlideDirection(null);
        }, 300);
      }
  };

  const handleDateSelect = (date: Date) => {
      triggerHaptic('light');
      setSelectedDate(date);
  };

  const handleEditSelected = () => {
      if (onDayClick) {
          onDayClick(toIsoDate(selectedDate));
      }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null; 
    isHorizontalSwipe.current = null;
    touchStart.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    
    const xDiff = Math.abs(currentX - touchStart.current.x);
    const yDiff = Math.abs(currentY - touchStart.current.y);

    if (isHorizontalSwipe.current === null) {
        if (xDiff > 5 || yDiff > 5) { 
            isHorizontalSwipe.current = xDiff > yDiff;
        }
    }

    touchEnd.current = { x: currentX, y: currentY };
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    
    if (isHorizontalSwipe.current) {
        const xDiff = touchStart.current.x - touchEnd.current.x;
        if (Math.abs(xDiff) > 50) { 
            if (xDiff > 0) changeMonth('next');
            else changeMonth('prev');
        }
    }
    
    touchStart.current = null;
    touchEnd.current = null;
    isHorizontalSwipe.current = null;
  };

  const getDayStatus = (date: Date) => {
      const iso = toIsoDate(date);
      const log = logs.find(l => l.date === iso);
      const proj = projections.find(p => p.date === iso);
      
      let isFertile = false;
      const ovulationProj = projections.find(p => p.type === 'ovulation' && p.date >= iso);
      
      if (ovulationProj) {
          const d1 = new Date(ovulationProj.date + 'T12:00:00').getTime();
          const d2 = new Date(iso + 'T12:00:00').getTime();
          const daysDiff = (d1 - d2) / (1000 * 3600 * 24);
          
          if (daysDiff >= 0 && daysDiff <= 5) isFertile = true;
      }

      return {
          isLoggedPeriod: log?.flow !== null && log?.flow !== undefined,
          isPredictedPeriod: !log && proj?.type === 'period',
          isOvulation: proj?.type === 'ovulation',
          isFertile: !log && isFertile,
          isToday: iso === db.getLocalDateString(new Date()),
          isSelected: iso === toIsoDate(selectedDate),
          hasSymptoms: log && log.symptoms.length > 0,
          hasMood: log && log.mood !== null
      };
  };

  const selectedLog = getLogForDay(selectedDate);
  const selectedStatus = getDayStatus(selectedDate);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className={`flex flex-col w-full h-full bg-[#FFF5F7] animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20`}>
      
      <div className="flex justify-between items-center px-6 pt-10 pb-2 shrink-0">
        <button 
          onClick={() => { triggerHaptic('light'); onClose(); }}
          className="p-2 -ml-2 text-gray-500 hover:bg-white rounded-full transition-colors active:scale-90"
          aria-label="Close Calendar"
        >
            <X size={24} />
        </button>
        <h2 className="text-gray-900 font-black text-lg">Calendar</h2>
        <div className="w-10"></div> 
      </div>

      <div className="flex-1 flex flex-col justify-start min-h-0 px-4">
          <div 
            className="flex flex-col flex-1 select-none touch-pan-y" 
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex items-center justify-between mb-2 w-full max-w-sm mx-auto shrink-0">
                <button onClick={() => changeMonth('prev')} className={`p-3 text-gray-600 hover:bg-white active:${theme.bgLight} rounded-full transition-colors`} aria-label="Previous Month">
                  <ChevronLeft size={24} />
                </button>
                <div className="text-center">
                    <span className="block text-xl font-black text-gray-800 transition-all duration-300">{monthNames[currentDate.getMonth()]}</span>
                    <span className="block text-xs font-bold text-gray-500 tracking-widest uppercase">{currentDate.getFullYear()}</span>
                </div>
                <button onClick={() => changeMonth('next')} className={`p-3 text-gray-600 hover:bg-white active:${theme.bgLight} rounded-full transition-colors`} aria-label="Next Month">
                  <ChevronRight size={24} />
                </button>
            </div>

            <div className="grid grid-cols-7 mb-1 w-full max-w-sm mx-auto shrink-0">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-gray-400">{d}</div>
                ))}
            </div>

            <div className="flex-1 w-full max-w-sm mx-auto min-h-0 relative overflow-hidden">
                <div 
                    className={`grid grid-cols-7 h-full gap-1 transition-transform duration-300 ease-out absolute inset-0
                    ${slideDirection === 'left' ? '-translate-x-[100%] opacity-0' : ''}
                    ${slideDirection === 'right' ? 'translate-x-[100%] opacity-0' : ''}
                    ${slideDirection === null ? 'translate-x-0 opacity-100' : ''}
                    `}
                >
                    {calendarGrid.map((date, i) => {
                        if (!date) return <div key={i} className="w-full h-full" />;
                        const status = getDayStatus(date);
                        
                        return (
                            <button
                                key={i}
                                onClick={() => handleDateSelect(date)}
                                className="relative flex items-center justify-center w-full h-full focus:outline-none"
                                aria-label={`Select ${date.toDateString()}`}
                            >
                                <div className={`
                                    w-[80%] h-[80%] max-w-[40px] max-h-[40px] aspect-square rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all relative z-10 border-[2px]
                                    ${status.isSelected 
                                        ? 'border-gray-800 scale-105 shadow-xl z-20' 
                                        : 'border-transparent'
                                    }
                                    ${status.isLoggedPeriod 
                                        ? (isNeutral ? 'bg-slate-700 text-white' : 'bg-[#FF4D8C] text-white shadow-sm')
                                        : status.isPredictedPeriod
                                            ? (isNeutral ? 'bg-slate-100 text-slate-500 border-slate-200 border-dashed' : 'bg-pink-100 text-pink-600 border-pink-200 border-dashed')
                                            : status.isOvulation
                                                ? (isNeutral ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-purple-100 text-purple-700 border-purple-200')
                                                : status.isFertile
                                                    ? (isNeutral ? 'bg-slate-100 text-slate-600' : 'bg-purple-50 text-purple-700')
                                                    : status.isToday
                                                        ? 'bg-black text-white'
                                                        : 'text-gray-700 hover:bg-white'
                                    }
                                `}>
                                    {date.getDate()}

                                    <div className="absolute -bottom-1 flex gap-0.5">
                                        {status.hasMood && (
                                            <div className={`w-1 h-1 rounded-full ${status.isLoggedPeriod ? 'bg-white' : 'bg-yellow-400'}`}></div>
                                        )}
                                        {status.hasSymptoms && (
                                            <div className={`w-1 h-1 rounded-full ${status.isLoggedPeriod ? 'bg-white' : theme.bg}`}></div>
                                        )}
                                    </div>

                                    {status.isOvulation && (
                                        <div className="absolute -top-1 -right-1 bg-white rounded-full p-[1px]">
                                            <Sparkles size={8} className={isNeutral ? "text-slate-500 fill-slate-200" : "text-purple-500 fill-purple-200"} />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2 shrink-0">
                <LegendItem color={isNeutral ? "bg-slate-700" : "bg-[#FF4D8C]"} label="Period" />
                <LegendItem color={isNeutral ? "bg-slate-100 border border-slate-200 border-dashed" : "bg-pink-100 border border-pink-200 border-dashed"} label="Prediction" />
                <LegendItem color={isNeutral ? "bg-slate-200 text-slate-600" : "bg-purple-100 text-purple-600"} label="Fertile/Ovulation" />
            </div>

            {!getDayStatus(currentDate).isToday && (
                <div className="flex justify-center mt-3 shrink-0">
                    <button 
                        onClick={jumpToToday}
                        className={`bg-white px-4 py-2 rounded-full shadow-md text-[10px] font-bold text-gray-700 flex items-center gap-1.5 border border-gray-100 hover:bg-gray-50 active:scale-95 transition-transform`}
                    >
                        <CalendarIcon size={12} />
                        Jump to Today
                    </button>
                </div>
            )}
          </div>
      </div>

      <div className="bg-white rounded-t-[1.5rem] shadow-[0_-5px_30px_rgba(0,0,0,0.08)] p-4 shrink-0 z-30">
         <div className="flex items-center justify-between mb-2">
             <div>
                 <h3 className="text-base font-black text-gray-800">
                    {selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                 </h3>
                 <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">
                    {selectedStatus.isToday ? 'Today' : selectedDate.toLocaleDateString('default', { weekday: 'long' })}
                 </p>
             </div>
             
             {selectedStatus.isLoggedPeriod ? (
                 <span className={`${isNeutral ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-pink-100 text-pink-600 border-pink-200'} px-3 py-1 rounded-full text-[10px] font-bold border`}>Period Day</span>
             ) : selectedStatus.isOvulation ? (
                 <span className={`${isNeutral ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-purple-100 text-purple-600 border-purple-200'} px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border`}>
                     <Sparkles size={10} /> Ovulation
                 </span>
             ) : selectedStatus.isFertile ? (
                 <span className={`${isNeutral ? 'bg-slate-50 text-slate-600 border-slate-100' : 'bg-purple-50 text-purple-600 border-purple-100'} px-3 py-1 rounded-full text-[10px] font-bold border`}>Fertile Window</span>
             ) : null}
         </div>

         <div className="grid grid-cols-2 gap-2 mb-3">
             <div className="bg-stone-50 rounded-lg p-2 border border-stone-100 flex flex-col justify-center min-h-[50px]">
                 <div className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Symptoms</div>
                 {selectedLog?.symptoms?.length ? (
                     <div className="flex flex-wrap gap-1">
                         {selectedLog.symptoms.slice(0, 2).map((s, i) => (
                             <span key={i} className="text-[9px] bg-white border border-gray-200 px-1 py-0.5 rounded text-gray-700 font-bold truncate max-w-full">{s}</span>
                         ))}
                         {selectedLog.symptoms.length > 2 && <span className="text-[9px] text-gray-400 flex items-center">+{selectedLog.symptoms.length - 2}</span>}
                     </div>
                 ) : (
                     <span className="text-[9px] text-gray-400 italic">None recorded</span>
                 )}
             </div>

             <div className="bg-stone-50 rounded-lg p-2 border border-stone-100 flex flex-col justify-center min-h-[50px]">
                 <div className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">Mood</div>
                 {selectedLog?.mood ? (
                     <span className="text-xs font-black text-gray-800">{selectedLog.mood}</span>
                 ) : (
                     <span className="text-[9px] text-gray-400 italic">Not recorded</span>
                 )}
             </div>
         </div>

         <button 
            onClick={handleEditSelected}
            className={`w-full ${theme.bg} text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all text-sm`}
         >
            <Edit3 size={16} />
            {selectedLog ? 'Edit Entry' : 'Log Details'}
         </button>
      </div>

    </div>
  );
};
