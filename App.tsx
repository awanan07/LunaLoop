
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import CycleWheel from './components/CycleWheel';
import { DashboardWidgets } from './components/Widgets';
import { Navigation } from './components/Navigation';
import { CalendarView } from './components/CalendarView';
import { TrackPage } from './components/TrackPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { BadgesPage } from './components/BadgesPage';
import { BadgesGridPage } from './components/BadgesGridPage';
import { SettingsPage } from './components/SettingsPage';
import { RemindersPage } from './components/RemindersPage';
import { WaterPage } from './components/WaterPage';
import { ThemesPage } from './components/ThemesPage';
import { OnboardingPage } from './components/OnboardingPage';
import { Toast } from './components/Toast';
import { LevelUpModal } from './components/LevelUpModal';
import { InsightModal } from './components/InsightModal';

import { getCycleInsight } from './services/geminiService';

// Backend Services
import * as db from './services/storageService';
import { CycleData, UserStats, LogEntry, AppSettings, ThemeColor } from './types';
import { THEME_CONFIG } from './constants';
import { triggerHaptic } from './utils/haptics';

const App: React.FC = () => {
  // Global App State
  const [onboarded, setOnboarded] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [themeId, setThemeId] = useState<string>('Pretty in Pink');
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  // Modal State
  const [showLevelUp, setShowLevelUp] = useState<{type: 'level'|'badge', title: string, subtitle: string} | null>(null);
  const [showInsightModal, setShowInsightModal] = useState(false);

  // Data State
  const [user, setUser] = useState<UserStats>(db.getUserStats());
  const [cycleData, setCycleData] = useState<CycleData>(db.calculateCycleData());
  const [todayLog, setTodayLog] = useState<LogEntry | null>(null);
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  
  // Track Page State
  const [trackDate, setTrackDate] = useState<string | null>(null);

  // AI State
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Computed Theme Properties
  const userSelectedTheme = THEME_CONFIG[themeId] || THEME_CONFIG['Pretty in Pink'];
  // Override theme if privacy mode is active
  const activeThemeDef = privacyMode ? THEME_CONFIG['Privacy'] : userSelectedTheme;
  const themeColor: ThemeColor = activeThemeDef.color;

  // --- LIFECYCLE MANAGEMENT ---
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                db.updateStreakOnLoad();
                refreshData();
            }
        };

        const loadedSettings = db.getSettings();
        if (loadedSettings.onboarded) {
            setOnboarded(true);
            loadApp(loadedSettings);
        }
        
        if (loadedSettings.onboarded && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        document.addEventListener('visibilitychange', handleVisibilityChange);
        const reminderInterval = setInterval(checkReminders, 60000);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            clearInterval(reminderInterval);
        };
    }
  }, []);

  const loadApp = (loadedSettings: AppSettings) => {
    setSettings(loadedSettings);
    db.updateStreakOnLoad();
    refreshData();
    setPrivacyMode(loadedSettings.privacyMode);
    if (loadedSettings.theme && THEME_CONFIG[loadedSettings.theme]) {
        setThemeId(loadedSettings.theme);
    }
    checkReminders();
  };

  const refreshData = () => {
    setUser(db.getUserStats());
    const newCycleData = db.calculateCycleData();
    setCycleData(newCycleData);
    setSettings(db.getSettings());
    const dateStr = db.getLocalDateString();
    const log = db.getLogForDate(dateStr);
    setTodayLog(log);
    
    const currentSettings = db.getSettings();
    if (currentSettings.theme && THEME_CONFIG[currentSettings.theme]) {
        setThemeId(currentSettings.theme);
    }
  };

  const checkReminders = () => {
      const reminders = db.getReminders();
      const now = new Date();
      const currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const todayStr = db.getLocalDateString();
      const isPrivate = db.getSettings().privacyMode;
      
      const sendNotification = (title: string, body: string, id: string) => {
          const sentKey = `notif_${id}_${todayStr}`;
          if (sessionStorage.getItem(sentKey)) return;

          const safeTitle = isPrivate ? "LunaLoop" : title;
          const safeBody = isPrivate ? "New health update available." : body;

          if ('Notification' in window && Notification.permission === 'granted') {
              try {
                  new Notification(safeTitle, { body: safeBody, icon: '/icon.png' });
              } catch (e) {
                  setToast({ msg: `🔔 ${safeTitle}: ${safeBody}`, type: 'info' });
              }
          } else {
              setToast({ msg: `🔔 ${safeTitle}: ${safeBody}`, type: 'info' });
          }
          sessionStorage.setItem(sentKey, 'true');
      };

      if (reminders.pill.enabled && reminders.pill.time === currentTime) {
          sendNotification("Pill Reminder", "Time to take your daily contraceptive.", "pill");
      }
      if (reminders.dailyCheckIn.enabled && reminders.dailyCheckIn.time === currentTime) {
          sendNotification("Daily Check-in", "How are you feeling today? Log your symptoms.", "daily");
      }
      if (reminders.periodPrediction.enabled && reminders.periodPrediction.time === currentTime) {
          const currentCycle = db.calculateCycleData(); // Recalculate to be sure
          const daysUntil = parseInt(currentCycle.prediction.match(/\d+/)?.[0] || '0');
          const isLate = currentCycle.prediction.toLowerCase().includes('late');
          
          if (!isLate && daysUntil <= reminders.periodPrediction.daysBefore && daysUntil >= 0) {
              sendNotification("Cycle Update", `Your period is expected in ${daysUntil} days.`, "cycle");
          }
      }
      if (reminders.fertileWindow.enabled && reminders.fertileWindow.time === currentTime) {
          const currentCycle = db.calculateCycleData();
          if (currentCycle.phase === 'Ovulation') {
               sendNotification("Fertile Window", "You are entering your fertile window.", "fertile");
          }
      }
  };

  const handleShowInsight = async () => {
      triggerHaptic('medium');
      setShowInsightModal(true);

      if (!aiInsight && !loadingInsight) {
          setLoadingInsight(true);
          try {
              const insight = await getCycleInsight(
                  cycleData.phase, 
                  cycleData.currentDay, 
                  todayLog?.mood || "Neutral"
              );
              setAiInsight(insight);
          } catch (e) {
              setAiInsight("Stay hydrated and listen to body today.");
          } finally {
              setLoadingInsight(false);
          }
      }
  };

  const handleTogglePrivacy = () => {
    triggerHaptic('medium');
    const newVal = !privacyMode;
    setPrivacyMode(newVal);
    const updatedSettings = db.getSettings();
    db.saveSettings({ ...updatedSettings, privacyMode: newVal });
    showToast(newVal ? "Privacy Mode Enabled" : "Privacy Mode Disabled");
  };

  const handleSaveWater = (amount: number) => {
    const dateStr = db.getLocalDateString();
    const currentLog = db.getLogForDate(dateStr) || {
        date: dateStr,
        symptoms: [],
        mood: null,
        flow: null,
        spotting: null,
        waterIntake: 0
    };

    const updatedLog: LogEntry = { ...currentLog, waterIntake: amount };
    const gamification = db.saveLog(updatedLog);
    refreshData();
    handleGamificationResults(gamification);
    
    // Explicit feedback for XP
    if (gamification.pointsEarned > 0) {
        showToast(`Hydration logged! +${gamification.pointsEarned} XP`);
    } else {
        showToast("Water intake updated!");
    }
  };

  const handleQuickLogMood = (mood: string) => {
      triggerHaptic('success');
      const dateStr = db.getLocalDateString();
      const currentLog = db.getLogForDate(dateStr) || {
          date: dateStr,
          symptoms: [],
          mood: null,
          flow: null,
          spotting: null,
          waterIntake: 0
      };
      
      let gamification;
      let msg = "";

      if (mood === 'Cramps') {
          if (!currentLog.symptoms.includes('Cramps')) {
              currentLog.symptoms.push('Cramps');
              gamification = db.saveLog(currentLog);
              msg = "Cramps logged";
          } else {
              showToast("Already logged", 'info');
              return;
          }
      } else {
          gamification = db.saveLog({ ...currentLog, mood });
          msg = `Mood set to ${mood}`;
      }
      
      refreshData();
      handleGamificationResults(gamification);
      
      if (gamification.pointsEarned > 0) {
          msg += ` (+${gamification.pointsEarned} XP)`;
      }
      showToast(msg);
  };

  const handleQuickLogWater = () => {
      triggerHaptic('medium');
      const current = todayLog?.waterIntake || 0;
      handleSaveWater(current + 1);
  };

  const handleCalendarDayClick = (date: string) => {
    setTrackDate(date);
    setActiveTab('track');
  };

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    if (privacyMode) {
        const sensitiveKeywords = ['Cramps', 'Period', 'Flow', 'Mood', 'Symptom', 'Late', 'Expected'];
        if (sensitiveKeywords.some(k => msg.includes(k))) {
             setToast({ msg: "Entry saved securely.", type: 'success' }); 
             return;
        }
    }
    setToast({ msg, type });
  };

  const handleOnboardingComplete = () => {
      const newSettings = db.getSettings();
      setOnboarded(true);
      loadApp(newSettings);
      if ('Notification' in window) {
          Notification.requestPermission();
      }
  };

  const handleGamificationResults = (results: db.GamificationResult) => {
      if (results.levelUp) {
          // Delay slightly to let the toast settle
          setTimeout(() => {
            setShowLevelUp({
                type: 'level',
                title: `Level ${results.newLevel} Unlocked!`,
                subtitle: "You're consistent and amazing. Keep it up!"
            });
          }, 500);
      } else if (results.unlockedBadges.length > 0) {
          setTimeout(() => {
            setShowLevelUp({
                type: 'badge',
                title: "New Badge Unlocked!",
                subtitle: "You just earned a new achievement."
            });
          }, 500);
      }
  };

  const handleTrackSave = (logData: LogEntry) => {
      const gamification = db.saveLog(logData);
      refreshData();
      
      // Explicit XP feedback
      const xpMsg = gamification.pointsEarned > 0 ? ` +${gamification.pointsEarned} XP` : '';
      showToast(`Symptoms logged!${xpMsg}`);

      handleGamificationResults(gamification);

      setTrackDate(null);
      setActiveTab('home');
  };

  const handleTrackDelete = (dateStr: string) => {
      db.deleteLog(dateStr);
      refreshData();
      showToast("Entry deleted", "info");
      setTrackDate(null);
      setActiveTab('home');
  };

  // --- RENDER ---

  if (!onboarded) {
      return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    const todayDate = db.getLocalDateString();
    const loggingDate = trackDate || todayDate;
    
    switch (activeTab) {
      case 'reminders':
        return <RemindersPage onBack={() => setActiveTab('settings')} themeColor={themeColor} />;
      case 'badges-list':
        return <BadgesGridPage onBack={() => setActiveTab('badges')} unlockedBadges={user.unlockedBadges} themeColor={themeColor} />;
      case 'themes':
        return <ThemesPage onBack={() => { refreshData(); setActiveTab('settings'); }} themeColor={themeColor} />; 
      case 'water':
        return (
          <WaterPage 
             currentIntake={todayLog?.waterIntake || 0}
             onSave={handleSaveWater}
             onClose={() => setActiveTab('home')}
             themeColor={themeColor}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            onBack={() => {
                refreshData(); 
                setActiveTab('home');
            }} 
            privacyMode={privacyMode}
            togglePrivacy={handleTogglePrivacy}
            onOpenReminders={() => setActiveTab('reminders')}
            onOpenThemes={() => setActiveTab('themes')}
            onUpdate={refreshData}
            themeColor={themeColor}
          />
        );
      case 'badges':
        return (
            <BadgesPage 
                userLevel={user.level}
                onOpenThemes={() => setActiveTab('themes')} 
                onOpenBadges={() => setActiveTab('badges-list')} 
                themeColor={themeColor}
            />
        );
      case 'analysis':
        return <AnalyticsPage privacyMode={privacyMode} themeColor={themeColor} />;
      case 'track':
        return (
            <TrackPage 
                key={loggingDate} 
                onClose={() => {
                    setTrackDate(null);
                    setActiveTab('home');
                }} 
                onSave={handleTrackSave}
                onDelete={handleTrackDelete}
                onDateChange={(newDate) => setTrackDate(newDate)}
                initialData={db.getLogForDate(loggingDate)}
                targetDate={loggingDate}
                themeColor={themeColor}
            />
        );
      case 'calendar':
        return (
            <CalendarView 
                key={todayLog?.date} 
                onClose={() => setActiveTab('home')} 
                onDayClick={handleCalendarDayClick} 
                themeColor={themeColor}
            />
        );
      case 'home':
      default:
        return (
          <div className="flex flex-col h-full overflow-hidden">
            <Header 
              user={user} 
              privacyMode={privacyMode} 
              togglePrivacy={handleTogglePrivacy} 
              onOpenSettings={() => setActiveTab('settings')}
              onShowInsight={handleShowInsight}
              themeColor={themeColor}
            />

            <main className="flex-1 flex flex-col items-center w-full max-w-md mx-auto relative animate-in fade-in duration-500 overflow-y-auto no-scrollbar pb-28 pt-2">
              <div className="mb-2 shrink-0">
                <CycleWheel 
                  currentDay={cycleData.currentDay} 
                  cycleLength={settings.cycleLength}
                  periodLength={settings.periodLength}
                  phaseName={cycleData.phase}
                  privacyMode={privacyMode}
                  themeColor={themeColor}
                />
              </div>

              <DashboardWidgets 
                  log={{
                      symptoms: todayLog?.symptoms || [],
                      mood: todayLog?.mood || null,
                      waterIntake: todayLog?.waterIntake || 0,
                      waterGoal: 8
                  }}
                  cycle={{
                      prediction: cycleData.prediction,
                      phase: cycleData.phase
                  }}
                  privacyMode={privacyMode}
                  onOpenWater={() => setActiveTab('water')}
                  onOpenLog={() => {
                      setTrackDate(db.getLocalDateString());
                      setActiveTab('track');
                  }}
                  onQuickLogWater={handleQuickLogWater}
                  onQuickLogMood={handleQuickLogMood}
                  themeColor={themeColor}
                  userStreak={user.streak}
              />
            </main>
          </div>
        );
    }
  };

  return (
    <div className={`h-[100dvh] overflow-hidden ${activeThemeDef.bgClass} text-gray-800 font-sans selection:bg-pink-100 transition-colors duration-500 flex flex-col`}>
      
      {toast && (
        <Toast 
            message={toast.msg} 
            type={toast.type as 'success' | 'error' | 'info'} 
            onClose={() => setToast(null)} 
        />
      )}

      {showLevelUp && (
          <LevelUpModal 
            type={showLevelUp.type}
            title={showLevelUp.title}
            subtitle={showLevelUp.subtitle}
            onClose={() => setShowLevelUp(null)}
          />
      )}

      {showInsightModal && (
          <InsightModal 
             insight={aiInsight}
             loading={loadingInsight}
             onClose={() => setShowInsightModal(false)}
          />
      )}

      <div className="flex-1 overflow-hidden relative">
          {renderContent()}
      </div>

      {!['settings', 'water', 'themes', 'badges-list', 'reminders', 'track'].includes(activeTab) && (
         <Navigation activeTab={activeTab} setActiveTab={setActiveTab} themeColor={themeColor} />
      )}
    </div>
  );
};

export default App;
