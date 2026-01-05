
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Clock, Calendar, CheckCircle2, Zap, Bell, AlertTriangle, Send } from 'lucide-react';
import * as db from '../services/storageService';
import { ReminderSettings, ThemeColor } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { Toast } from './Toast';
import { getThemeClasses } from '../constants';

interface RemindersPageProps {
  onBack: () => void;
  themeColor: ThemeColor;
}

const ReminderItem: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    isEnabled: boolean;
    onToggle: () => void;
    children?: React.ReactNode;
    themeColor: ThemeColor;
}> = ({ title, description, icon, isEnabled, onToggle, children, themeColor }) => {
    const theme = getThemeClasses(themeColor);
    return (
        <div className={`bg-white border rounded-2xl p-4 mb-4 transition-all duration-300 ${isEnabled ? `${theme.border} shadow-md` : 'border-gray-100 shadow-sm'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isEnabled ? `${theme.bgLight} ${theme.text}` : 'bg-gray-50 text-gray-400'}`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className={`text-sm font-bold ${isEnabled ? 'text-gray-800' : 'text-gray-500'}`}>{title}</h3>
                        <p className="text-xs text-gray-400 max-w-[200px]">{description}</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => { triggerHaptic('light'); onToggle(); }}
                    className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors duration-300 ${isEnabled ? theme.bg : 'bg-gray-200'}`}
                    aria-label={`Toggle ${title}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>

            {/* Expandable Configuration Area */}
            {isEnabled && children && (
                <div className="mt-4 pt-4 border-t border-gray-50 animate-in slide-in-from-top-2 fade-in duration-300">
                    {children}
                </div>
            )}
        </div>
    );
};

const TimePicker: React.FC<{
    value: string;
    onChange: (val: string) => void;
    label?: string;
    themeColor: ThemeColor;
}> = ({ value, onChange, label, themeColor }) => {
    const theme = getThemeClasses(themeColor);
    return (
        <div className="flex flex-col items-end">
            {label && <span className="text-xs font-bold text-gray-500 mb-1">{label}</span>}
            <input 
                type="time" 
                value={value || '09:00'}
                onChange={(e) => onChange(e.target.value)}
                className={`bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 shadow-sm focus:ring-2 focus:${theme.ring} outline-none w-28 text-center`}
            />
        </div>
    );
};

export const RemindersPage: React.FC<RemindersPageProps> = ({ onBack, themeColor }) => {
  const [reminders, setReminders] = useState<ReminderSettings | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  const theme = getThemeClasses(themeColor);

  useEffect(() => {
    setReminders(db.getReminders());
    if ('Notification' in window) {
        setPermissionState(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
      if ('Notification' in window) {
          const result = await Notification.requestPermission();
          setPermissionState(result);
          if (result === 'granted') {
              setToast({ msg: "Notifications enabled!", type: 'success' });
          } else if (result === 'denied') {
              setToast({ msg: "Permission denied. Check browser settings.", type: 'error' });
          }
      }
  };

  const sendTestNotification = () => {
      triggerHaptic('medium');
      if (permissionState !== 'granted') {
          requestPermission();
          return;
      }
      
      try {
          new Notification("Test Notification", {
              body: "This is how your alerts will look! ✨",
              icon: '/icon.png' 
          });
          setToast({ msg: "Test notification sent!", type: 'success' });
      } catch (e) {
          console.error(e);
          setToast({ msg: "Failed to send. Is Do Not Disturb on?", type: 'error' });
      }
  };

  const saveState = (newState: ReminderSettings) => {
    setReminders(newState);
    db.saveReminders(newState);
  };

  const updateSetting = <K extends keyof ReminderSettings>(
      section: K, 
      field: keyof ReminderSettings[K], 
      value: any
  ) => {
      if (!reminders) return;
      const updatedSection = { ...reminders[section], [field]: value };
      const newState = { ...reminders, [section]: updatedSection };
      saveState(newState);
  };

  if (!reminders) return <div className="p-10">Loading settings...</div>;

  return (
    <div className="h-full bg-[#F9FAFB] text-gray-800 font-sans flex flex-col animate-in slide-in-from-right duration-300">
      
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-center px-6 py-6 pt-10 bg-white border-b border-gray-100 sticky top-0 z-20 shrink-0">
        <button onClick={() => { triggerHaptic('light'); onBack(); }} className="p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors active:scale-90">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-black text-gray-800 flex-1 text-center pr-8">Notifications</h1>
      </div>

      <div className="flex-1 px-6 pb-12 pt-6 overflow-y-auto no-scrollbar min-h-0">
        
        {/* Permission Banner */}
        {permissionState !== 'granted' && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-orange-800">Notifications are disabled</h3>
                    <p className="text-xs text-orange-600 mb-2 leading-relaxed">
                        Enable permissions to receive cycle alerts and reminders.
                    </p>
                    <button 
                        onClick={requestPermission}
                        className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-orange-600 transition-colors"
                    >
                        Enable Now
                    </button>
                </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-6">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider pl-1">
                Customize your alerts
            </p>
            {permissionState === 'granted' && (
                <button 
                    onClick={sendTestNotification}
                    className={`text-[10px] font-bold ${theme.text} flex items-center gap-1 ${theme.bgLight} px-2 py-1 rounded-full active:scale-95 transition-transform`}
                >
                    <Send size={10} /> Test
                </button>
            )}
        </div>

        {/* 1. Period Prediction Reminder */}
        <ReminderItem
            title="Period Prediction"
            description="Get notified before your cycle starts."
            icon={<Calendar size={24} />}
            isEnabled={reminders.periodPrediction.enabled}
            onToggle={() => updateSetting('periodPrediction', 'enabled', !reminders.periodPrediction.enabled)}
            themeColor={themeColor}
        >
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-500 mb-1">Notify me</span>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => updateSetting('periodPrediction', 'daysBefore', Math.max(1, reminders.periodPrediction.daysBefore - 1))} 
                            className="w-8 h-8 bg-white rounded-lg shadow-sm text-gray-600 font-bold hover:bg-gray-100"
                        >-</button>
                        <span className={`text-sm font-black ${theme.text} w-12 text-center`}>{reminders.periodPrediction.daysBefore} Days</span>
                        <button 
                            onClick={() => updateSetting('periodPrediction', 'daysBefore', Math.min(7, reminders.periodPrediction.daysBefore + 1))} 
                            className="w-8 h-8 bg-white rounded-lg shadow-sm text-gray-600 font-bold hover:bg-gray-100"
                        >+</button>
                    </div>
                </div>
                <TimePicker 
                    value={reminders.periodPrediction.time}
                    onChange={(val) => updateSetting('periodPrediction', 'time', val)}
                    label="At time"
                    themeColor={themeColor}
                />
            </div>
            <p className="text-[10px] text-gray-400 mt-2 px-1">
                * Alert sent {reminders.periodPrediction.daysBefore} days before expected start.
            </p>
        </ReminderItem>

        {/* 2. Daily Check-in */}
        <ReminderItem
            title="Daily Check-in"
            description="Build a habit of logging your symptoms."
            icon={<CheckCircle2 size={24} />}
            isEnabled={reminders.dailyCheckIn.enabled}
            onToggle={() => updateSetting('dailyCheckIn', 'enabled', !reminders.dailyCheckIn.enabled)}
            themeColor={themeColor}
        >
             <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 px-4">
                <span className="text-xs font-bold text-gray-500">Remind me daily at</span>
                <TimePicker 
                    value={reminders.dailyCheckIn.time}
                    onChange={(val) => updateSetting('dailyCheckIn', 'time', val)}
                    themeColor={themeColor}
                />
            </div>
        </ReminderItem>

        {/* 3. Pill Reminder */}
        <ReminderItem
            title="Contraceptive Pill"
            description="Never miss your daily pill."
            icon={<Bell size={24} />}
            isEnabled={reminders.pill.enabled}
            onToggle={() => updateSetting('pill', 'enabled', !reminders.pill.enabled)}
            themeColor={themeColor}
        >
             <div className="flex items-center justify-between bg-blue-50/50 rounded-xl p-3 px-4 border border-blue-100">
                 <div className="flex items-center gap-2 text-blue-700">
                     <Clock size={16} />
                     <span className="text-xs font-bold">Take pill at</span>
                 </div>
                 <TimePicker 
                    value={reminders.pill.time}
                    onChange={(val) => updateSetting('pill', 'time', val)}
                    themeColor={themeColor}
                />
             </div>
        </ReminderItem>

        {/* 4. Fertile Window */}
        <ReminderItem
            title="Fertile Window"
            description="Know when your ovulation phase begins."
            icon={<Zap size={24} />}
            isEnabled={reminders.fertileWindow.enabled}
            onToggle={() => updateSetting('fertileWindow', 'enabled', !reminders.fertileWindow.enabled)}
            themeColor={themeColor}
        >
             <div className="flex items-center justify-between bg-purple-50/50 rounded-xl p-3 px-4 border border-purple-100">
                 <div className="flex items-center gap-2 text-purple-700">
                     <Clock size={16} />
                     <span className="text-xs font-bold">Alert at</span>
                 </div>
                 <TimePicker 
                    value={reminders.fertileWindow.time}
                    onChange={(val) => updateSetting('fertileWindow', 'time', val)}
                    themeColor={themeColor}
                 />
             </div>
        </ReminderItem>

      </div>
    </div>
  );
};
