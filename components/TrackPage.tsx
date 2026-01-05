
import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Check,
  Droplet,
  Trash2,
  Copy,
  Sparkles,
  Loader
} from 'lucide-react';
import { LogEntry, ThemeColor } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { getLocalDateString, getLogForDate, POINTS } from '../services/storageService';
import { getThemeClasses, SYMPTOMS_LIST, MOOD_LIST } from '../constants';
import { ConfirmationModal } from './ConfirmationModal';

interface TrackPageProps {
  onClose: () => void;
  onSave: (log: LogEntry) => void;
  onDelete: (date: string) => void;
  onDateChange?: (date: string) => void;
  initialData: LogEntry | null;
  targetDate?: string;
  themeColor: ThemeColor;
}

const SectionHeader: React.FC<{ title: string; subtitle?: string; icon?: React.ReactNode }> = ({ title, subtitle, icon }) => (
  <div className="flex items-end justify-between mb-4 mt-8 px-1">
    <div>
      <h2 className="text-lg font-black text-gray-800 flex items-center gap-2 leading-none">
        {icon}
        {title}
      </h2>
      {subtitle && <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1.5">{subtitle}</p>}
    </div>
  </div>
);

const Chip: React.FC<{
  label: string;
  icon?: React.ElementType;
  isSelected: boolean;
  onClick: () => void;
  activeClass: string;
  activeText: string;
}> = ({ label, icon: Icon, isSelected, onClick, activeClass, activeText }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-[10px] font-bold transition-all duration-200 border-2 touch-manipulation aspect-[4/3] sm:aspect-auto sm:flex-row sm:h-10 w-full
      ${isSelected
        ? `${activeClass} text-white shadow-md transform scale-[1.02] border-transparent`
        : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
      }
    `}
    aria-label={isSelected ? `Remove ${label}` : `Add ${label}`}
  >
    {Icon && <Icon size={18} className={isSelected ? 'text-white' : activeText} strokeWidth={2.5} />}
    <span>{label}</span>
  </button>
);

const FlowCard: React.FC<{
  level: string;
  isSelected: boolean;
  onClick: () => void;
  themeColor: ThemeColor;
}> = ({ level, isSelected, onClick, themeColor }) => {
  const theme = getThemeClasses(themeColor);
  const size = level === 'Light' ? 18 : level === 'Medium' ? 24 : level === 'Heavy' ? 30 : 36;
  const opacity = level === 'Light' ? 'opacity-40' : level === 'Medium' ? 'opacity-60' : level === 'Heavy' ? 'opacity-80' : 'opacity-100';

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 w-full aspect-[4/5] touch-manipulation relative overflow-hidden
        ${isSelected
          ? `${theme.bgLight} ${theme.borderStrong} shadow-md transform scale-[1.02]`
          : `bg-white border-gray-100 hover:${theme.border}`
        }
      `}
      aria-label={`Flow Level: ${level}`}
    >
      <div className={`${theme.text} ${opacity} transition-all duration-300 ${isSelected ? 'scale-110 drop-shadow-sm' : ''}`}>
        <Droplet size={size} fill="currentColor" />
      </div>
      <span className={`text-xs font-bold ${isSelected ? theme.textDark : 'text-gray-400'}`}>{level}</span>
      {isSelected && <div className={`absolute top-2 right-2 w-2 h-2 ${theme.bg} rounded-full animate-in zoom-in`}></div>}
    </button>
  );
};

export const TrackPage: React.FC<TrackPageProps> = ({ onClose, onSave, onDelete, onDateChange, initialData, targetDate, themeColor }) => {
  const [selectedFlow, setSelectedFlow] = useState<string | null>(initialData?.flow || null);
  const [selectedSpotting, setSelectedSpotting] = useState<string | null>(initialData?.spotting || null);
  const [selectedMood, setSelectedMood] = useState<string | null>(initialData?.mood || null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(initialData?.symptoms || []);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: 'discard' | 'delete' | 'changeDate' | null;
    meta?: any; // To store extra data like the new date
  }>({ isOpen: false, title: '', message: '', action: null });

  const theme = getThemeClasses(themeColor);
  const isoDate = targetDate || getLocalDateString();
  const safeDate = new Date(isoDate + 'T00:00:00');

  // --- SHORTCUT LOGIC: YESTERDAY'S DATA ---
  const yesterdayLog = useMemo(() => {
    const y = new Date(safeDate);
    y.setDate(safeDate.getDate() - 1);
    const yIso = getLocalDateString(y);
    return getLogForDate(yIso);
  }, [safeDate]);

  // --- GAMIFICATION: XP PREVIEW ---
  const potentialXP = useMemo(() => {
    let xp = 0;
    if (!initialData) xp += POINTS.DAILY_LOG;
    return xp;
  }, [initialData]);

  useEffect(() => {
    setSelectedFlow(initialData?.flow || null);
    setSelectedSpotting(initialData?.spotting || null);
    setSelectedMood(initialData?.mood || null);
    setSelectedSymptoms(initialData?.symptoms || []);
    setIsDirty(false);
  }, [initialData, targetDate]);

  const handleCopyYesterday = () => {
    if (yesterdayLog) {
      triggerHaptic('success');
      setSelectedFlow(yesterdayLog.flow);
      setSelectedSpotting(yesterdayLog.spotting);
      setSelectedMood(yesterdayLog.mood);
      setSelectedSymptoms([...yesterdayLog.symptoms]);
      setIsDirty(true);
    }
  };

  const handleFlowToggle = (level: string) => {
    triggerHaptic('light');
    setSelectedFlow(prev => prev === level ? null : level);
    setIsDirty(true);
  };

  const handleSpottingToggle = (type: string) => {
    triggerHaptic('light');
    setSelectedSpotting(prev => prev === type ? null : type);
    setIsDirty(true);
  };

  const handleMoodToggle = (mood: string) => {
    triggerHaptic('medium');
    setSelectedMood(prev => prev === mood ? null : mood);
    setIsDirty(true);
  };

  const handleSymptomToggle = (symptom: string) => {
    triggerHaptic('light');
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) return prev.filter(s => s !== symptom);
      return [...prev, symptom];
    });
    setIsDirty(true);
  };

  // --- MODAL HANDLERS ---
  const triggerModal = (action: 'discard' | 'delete' | 'changeDate', title: string, message: string, meta?: any) => {
    setModalConfig({ isOpen: true, title, message, action, meta });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  const onConfirmAction = () => {
    closeModal();
    switch (modalConfig.action) {
      case 'discard':
        onClose();
        break;
      case 'delete':
        triggerHaptic('heavy');
        onDelete(isoDate);
        break;
      case 'changeDate':
        if (onDateChange && modalConfig.meta) {
          onDateChange(modalConfig.meta);
        }
        break;
    }
  };

  const handleClose = () => {
    if (isDirty) {
      triggerModal(
        'discard',
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?'
      );
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    if (isSaving) return;

    // Check if component is mounted to avoid memory leak warnings if quickly closed
    let isMounted = true;

    setIsSaving(true);
    triggerHaptic('success');

    const logData: LogEntry = {
      date: isoDate,
      flow: selectedFlow,
      spotting: selectedSpotting,
      mood: selectedMood,
      symptoms: selectedSymptoms,
      waterIntake: initialData?.waterIntake || 0,
    };

    // Provide visual feedback before closing
    setTimeout(() => {
      if (!isMounted) return;
      onSave(logData);
      setIsDirty(false);
      setIsSaving(false);
    }, 600);

    return () => { isMounted = false; };
  };

  const handleDelete = () => {
    triggerModal(
      'delete',
      'Delete Entry?',
      'This will permanently remove the log for this day. This action cannot be undone.',
      null
    );
  };

  const handleDateChange = (newDate: string) => {
    if (isDirty) {
      triggerModal(
        'changeDate',
        'Unsaved Changes',
        'You have unsaved changes which will be lost if you switch dates. Continue?',
        newDate
      );
    } else {
      if (onDateChange) onDateChange(newDate);
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(safeDate);
    d.setDate(safeDate.getDate() - 3 + i);
    return {
      dateObj: d,
      day: d.getDate(),
      iso: getLocalDateString(d),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isSelected: getLocalDateString(d) === isoDate,
      isFuture: d > new Date()
    };
  });

  return (
    <>
      <div className="flex flex-col w-full h-full bg-white relative animate-in slide-in-from-bottom-6 duration-300 sm:rounded-t-[2rem] overflow-hidden">

        {/* --- HEADER --- */}
        <div className="flex justify-between items-center px-6 pt-12 pb-2 bg-white sticky top-0 z-30 shadow-sm border-b border-gray-50">
          <button
            onClick={handleClose}
            className="p-3 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
            aria-label="Close"
          >
            <X size={26} />
          </button>

          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-gray-900">
              {safeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="relative">
            <button className="p-3 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <CalendarIcon size={24} />
            </button>
            <input
              type="date"
              value={isoDate}
              max={getLocalDateString(new Date())}
              onChange={(e) => handleDateChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
              aria-label="Change Date"
            />
          </div>
        </div>

        {/* --- WEEK STRIP --- */}
        <div className="px-2 pb-4 pt-2 bg-white sticky top-[88px] z-20 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center max-w-sm mx-auto">
            {weekDays.map((d) => (
              <button
                key={d.iso}
                onClick={() => !d.isFuture && handleDateChange(d.iso)}
                disabled={d.isFuture}
                className={`
                            flex flex-col items-center gap-1 min-w-[44px] py-2 rounded-2xl transition-all touch-manipulation
                            ${d.isSelected
                    ? 'bg-black text-white shadow-lg scale-110'
                    : d.isFuture
                      ? 'opacity-30 cursor-not-allowed'
                      : 'text-gray-400 hover:bg-gray-50'
                  }
                        `}
                aria-label={`Select ${d.dayName} ${d.day}`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">{d.dayName}</span>
                <span className="text-sm font-black">{d.day}</span>
                {d.isSelected && <div className="w-1 h-1 bg-white rounded-full mt-1"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* --- SHORTCUT ACTION --- */}
        {yesterdayLog && !initialData && !isDirty && (
          <div className="px-6 mt-4">
            <button
              onClick={handleCopyYesterday}
              className={`w-full py-3 ${theme.bgLight} ${theme.bgLightHover} ${theme.text} rounded-xl font-bold text-sm flex items-center justify-center gap-2 border ${theme.border} border-dashed active:scale-[0.98] transition-all`}
            >
              <Copy size={16} />
              Copy Yesterday's Log
            </button>
          </div>
        )}

        {/* --- CONTENT SCROLL AREA --- */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-40 pt-2">

          {/* SECTION: CYCLE */}
          <SectionHeader title="Cycle" subtitle="Period & Spotting" />
          <div className="grid grid-cols-4 gap-3 mb-6">
            {['Light', 'Medium', 'Heavy', 'Super'].map((level) => (
              <FlowCard
                key={level}
                level={level}
                isSelected={selectedFlow === level}
                onClick={() => handleFlowToggle(level)}
                themeColor={themeColor}
              />
            ))}
          </div>

          <div className="flex gap-3 mb-8">
            {['Red', 'Brown'].map((color) => (
              <button
                key={color}
                onClick={() => handleSpottingToggle(color)}
                className={`
                            flex-1 py-4 px-4 rounded-xl border-2 flex items-center justify-center gap-2 transition-all touch-manipulation
                            ${selectedSpotting === color
                    ? `${theme.borderStrong} ${theme.bgLight} ${theme.textDark} font-bold`
                    : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50'
                  }
                        `}
              >
                <div className={`w-3 h-3 rounded-full ${color === 'Red' ? 'bg-red-500' : 'bg-[#795548]'}`}></div>
                <span className="text-sm font-bold">Spotting ({color})</span>
              </button>
            ))}
          </div>

          {/* SECTION: BODY */}
          <SectionHeader title="Body" subtitle="Common Symptoms" />
          <div className="grid grid-cols-4 gap-2 mb-8">
            {SYMPTOMS_LIST.map((s) => (
              <Chip
                key={s.id}
                label={s.label}
                icon={s.icon}
                isSelected={selectedSymptoms.includes(s.id)}
                onClick={() => handleSymptomToggle(s.id)}
                activeClass={theme.bg}
                activeText={theme.text}
              />
            ))}
          </div>

          {/* SECTION: MIND */}
          <SectionHeader title="Mind" subtitle="Mood" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {MOOD_LIST.map((m) => (
              <button
                key={m.label}
                onClick={() => handleMoodToggle(m.label)}
                className={`
                            flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95 touch-manipulation
                            ${selectedMood === m.label
                    ? 'border-yellow-400 bg-yellow-50 shadow-md scale-105'
                    : 'border-transparent hover:bg-gray-50'
                  }
                        `}
                aria-label={`Mood: ${m.label}`}
              >
                <span className="text-4xl filter drop-shadow-sm transition-transform duration-300 hover:scale-110">{m.emoji}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wide ${selectedMood === m.label ? 'text-gray-800' : 'text-gray-400'}`}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>

        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 z-40 pb-10 flex gap-3">
          {initialData && (
            <button
              onClick={handleDelete}
              className="bg-red-50 text-red-500 p-4 rounded-2xl active:scale-95 transition-all hover:bg-red-100"
              aria-label="Delete Entry"
              disabled={isSaving}
            >
              <Trash2 size={24} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 ${isSaving ? 'bg-green-500' : theme.bg} text-white text-lg font-bold py-4 rounded-2xl shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
          >
            {isSaving ? (
              <>
                <Loader size={24} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={24} strokeWidth={3} />
                <span>Save Entry</span>
                {potentialXP > 0 && !initialData && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs flex items-center gap-1">
                    <Sparkles size={12} /> +{potentialXP} XP
                  </span>
                )}
              </>
            )}
          </button>
        </div>

      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={onConfirmAction}
        onCancel={closeModal}
        themeColor={themeColor}
        isDestructive={modalConfig.action === 'delete'}
        confirmText={modalConfig.action === 'delete' ? 'Delete' : 'Confirm'}
      />
    </>
  );
};
