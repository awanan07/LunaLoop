
import { UserStats, LogEntry, AppSettings, CycleData, CyclePhase, ReminderSettings, CalendarProjection } from '../types';

// Keys for LocalStorage
const STORAGE_KEYS = {
    USER: 'lunaloop_user',
    LOGS: 'lunaloop_logs',
    SETTINGS: 'lunaloop_settings',
    REMINDERS: 'lunaloop_reminders',
    LAST_LOGIN: 'lunaloop_last_login',
};

// --- GAMIFICATION CONFIGURATION ---

export const LEVELS = {
    1: { xp: 0, reward: 'Pretty in Pink' },
    2: { xp: 500, reward: null },
    3: { xp: 1200, reward: 'Forest Fairy' },
    4: { xp: 2000, reward: null },
    5: { xp: 3000, reward: 'Magical Muse' },
    6: { xp: 4500, reward: null },
    7: { xp: 6000, reward: null },
    8: { xp: 8000, reward: 'Deep Sea Diver' },
    9: { xp: 10000, reward: null },
    10: { xp: 12500, reward: 'Cosmic Queen' }
};

export const POINTS = {
    DAILY_LOG: 50,
    WATER_GOAL: 25,
    STREAK_BONUS: 100,
    BADGE_UNLOCK: 200
};

export const BADGE_DEFINITIONS = [
    { id: 'badge_newbie', name: 'Newbie', desc: 'Create your account', icon: 'sparkle', target: 1 },
    { id: 'badge_first_log', name: 'First Step', desc: 'Log your first symptom', icon: 'brush', target: 1 },
    { id: 'badge_streak_7', name: 'On Fire', desc: 'Achieve a 7-day streak', icon: 'flame', target: 7 },
    { id: 'badge_hydration_10', name: 'Hydration Hero', desc: 'Hit water goal 10 times', icon: 'water', target: 10 },
    { id: 'badge_mood_20', name: 'Zen Master', desc: 'Log moods 20 times', icon: 'smile', target: 20 },
    { id: 'badge_cycle_3', name: 'Period Prophet', desc: 'Track 3 full cycles', icon: 'eye', target: 3 }
];

// --- CORE DATE HELPERS ---

/**
 * Returns a YYYY-MM-DD string based on the USER'S local time, not UTC.
 * This fixes the bug where logging late at night saves as the next day.
 */
export const getLocalDateString = (date: Date = new Date()): string => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

const diffInDays = (d1: string, d2: string): number => {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    // Set to noon to avoid DST issues
    date1.setHours(12, 0, 0, 0);
    date2.setHours(12, 0, 0, 0);
    return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
};

const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr + 'T12:00:00');
    date.setDate(date.getDate() + days);
    return getLocalDateString(date);
};

// --- DATA INITIALIZATION ---

const DEFAULT_USER: UserStats = {
    name: 'User',
    streak: 0,
    points: 100,
    level: 1,
    unlockedBadges: ['badge_newbie'],
};

const DEFAULT_SETTINGS: AppSettings = {
    privacyMode: false,
    onboarded: false,
    cycleLength: 28,
    periodLength: 5,
    theme: 'Pretty in Pink'
};

const DEFAULT_REMINDERS: ReminderSettings = {
    dailyCheckIn: { enabled: false, time: '20:00' },
    periodPrediction: { enabled: true, daysBefore: 1, time: '09:00' },
    pill: { enabled: false, time: '09:00' },
    fertileWindow: { enabled: true, time: '09:00' }
};

// --- CORE CRUD OPERATIONS ---

const safeGet = <T>(key: string, fallback: T): T => {
    if (typeof window === 'undefined') return fallback;
    const data = localStorage.getItem(key);
    if (data === null) return fallback;
    try {
        return JSON.parse(data);
    } catch (e) {
        return fallback;
    }
};

const safeSet = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error saving ${key}`, e);
    }
};

export const getUserStats = (): UserStats => safeGet(STORAGE_KEYS.USER, DEFAULT_USER);
export const saveUserStats = (stats: UserStats) => safeSet(STORAGE_KEYS.USER, stats);

export const getLogs = (): LogEntry[] => safeGet(STORAGE_KEYS.LOGS, []);

export const getLogForDate = (dateStr: string): LogEntry | null => {
    const logs = getLogs();
    return logs.find(l => l.date === dateStr) || null;
};

export const deleteLog = (dateStr: string) => {
    let logs = getLogs();
    logs = logs.filter(l => l.date !== dateStr);
    safeSet(STORAGE_KEYS.LOGS, logs);
    recalculateStreak();
};

export interface GamificationResult {
    unlockedBadges: string[];
    levelUp: boolean;
    newLevel: number;
    pointsEarned: number;
}

// --- GAMIFICATION LOGIC ---

export const recalculateStreak = () => {
    const logs = getLogs();
    if (logs.length === 0) return 0;

    const dates = [...new Set(logs.map(l => l.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = getLocalDateString();
    const todayIndex = dates.indexOf(today);

    let currentStreak = 0;
    let isAlive = false;
    if (todayIndex !== -1) isAlive = true;
    else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (dates.includes(getLocalDateString(yesterday))) isAlive = true;
    }

    if (isAlive) {
        currentStreak = 1;
        for (let i = 0; i < dates.length - 1; i++) {
            const current = dates[i];
            const next = dates[i + 1];
            if (diffInDays(next, current) === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
    }

    const user = getUserStats();
    if (user.streak !== currentStreak) {
        user.streak = currentStreak;
        if (user.streak >= 7 && !user.unlockedBadges.includes('badge_streak_7')) {
            user.unlockedBadges.push('badge_streak_7');
            user.points += POINTS.BADGE_UNLOCK;
        }
        saveUserStats(user);
    }
};

export const getLevelProgress = (points: number, level: number) => {
    const currentLevelDef = LEVELS[level as keyof typeof LEVELS] || { xp: 0 };
    const nextLevelDef = LEVELS[(level + 1) as keyof typeof LEVELS];

    if (!nextLevelDef) {
        return {
            currentPoints: points,
            nextLevelPoints: points,
            pointsRemaining: 0,
            percentage: 100
        };
    }

    const levelBaseXP = currentLevelDef.xp;
    const nextLevelXP = nextLevelDef.xp;

    const pointsInLevel = Math.max(0, points - levelBaseXP);
    const pointsNeededForLevel = nextLevelXP - levelBaseXP;
    const percentage = Math.min(100, Math.max(0, (pointsInLevel / pointsNeededForLevel) * 100));

    return {
        currentPoints: points,
        nextLevelPoints: nextLevelXP,
        pointsRemaining: nextLevelXP - points,
        percentage
    };
};

export const getNextThemeReward = (currentLevel: number) => {
    const levels = Object.entries(LEVELS).map(([lvl, data]) => ({ level: parseInt(lvl), ...data }));
    const nextReward = levels.find(l => l.level > currentLevel && l.reward !== null);
    return nextReward || null;
};

export const getBadgeProgress = (badgeId: string) => {
    const badge = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badge) return null;

    const logs = getLogs();
    const user = getUserStats();

    let current = 0;
    let label = 'actions';

    switch (badgeId) {
        case 'badge_newbie': current = 1; break;
        case 'badge_first_log': current = logs.length > 0 ? 1 : 0; break;
        case 'badge_streak_7': current = user.streak; label = 'days'; break;
        case 'badge_hydration_10': current = logs.filter(l => l.waterIntake >= 8).length; label = 'days'; break;
        case 'badge_mood_20': current = logs.filter(l => l.mood !== null).length; label = 'moods'; break;
        case 'badge_cycle_3':
            if (logs.length > 0) {
                const dates = logs.map(l => new Date(l.date).getTime()).sort((a, b) => a - b);
                const span = (dates[dates.length - 1] - dates[0]) / (1000 * 3600 * 24);
                current = Math.min(3, Math.floor(span / 28));
            }
            label = 'cycles';
            break;
    }

    return { current, target: badge.target, label };
};

export const getWeeklyActivity = () => {
    const today = new Date();
    const activity = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const iso = getLocalDateString(d);
        const log = getLogForDate(iso);
        activity.push({
            date: iso,
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
            isLogged: !!log,
            isToday: i === 0
        });
    }
    return activity;
};

export const checkGamificationRules = (isNewLogForDay: boolean, entry: LogEntry): GamificationResult => {
    const user = getUserStats();
    let pointsEarned = 0;
    const unlockedBadges: string[] = [];
    let levelUp = false;
    let newLevel = user.level;

    if (isNewLogForDay) {
        pointsEarned += POINTS.DAILY_LOG;
        if (!user.unlockedBadges.includes('badge_first_log')) {
            unlockedBadges.push('badge_first_log');
            pointsEarned += POINTS.BADGE_UNLOCK;
        }
    }

    const logs = getLogs();

    // Hydration Badge
    const hydrationCount = logs.filter(l => l.waterIntake >= 8).length;
    if (hydrationCount >= 10 && !user.unlockedBadges.includes('badge_hydration_10')) {
        unlockedBadges.push('badge_hydration_10');
        pointsEarned += POINTS.BADGE_UNLOCK;
    }

    if (entry.waterIntake >= 8 && isNewLogForDay) {
        pointsEarned += POINTS.WATER_GOAL;
    }

    // Mood Badge
    const moodCount = logs.filter(l => l.mood !== null).length;
    if (moodCount >= 20 && !user.unlockedBadges.includes('badge_mood_20')) {
        unlockedBadges.push('badge_mood_20');
        pointsEarned += POINTS.BADGE_UNLOCK;
    }

    // Cycle Badge
    if (logs.length > 0) {
        const dates = logs.map(l => new Date(l.date).getTime()).sort((a, b) => a - b);
        if (dates.length > 0) {
            const span = (dates[dates.length - 1] - dates[0]) / (1000 * 3600 * 24);
            if (span >= 80 && !user.unlockedBadges.includes('badge_cycle_3')) {
                unlockedBadges.push('badge_cycle_3');
                pointsEarned += POINTS.BADGE_UNLOCK;
            }
        }
    }

    if (pointsEarned > 0 || unlockedBadges.length > 0) {
        user.points += pointsEarned;
        const nextLevel = LEVELS[(user.level + 1) as keyof typeof LEVELS];
        if (nextLevel && user.points >= nextLevel.xp) {
            user.level += 1;
            levelUp = true;
            newLevel = user.level;
        }
        user.unlockedBadges = [...user.unlockedBadges, ...unlockedBadges];
        saveUserStats(user);
    }

    return { unlockedBadges, levelUp, newLevel, pointsEarned };
};

export const updateStreakOnLoad = () => {
    recalculateStreak();
};

export const saveLog = (entry: LogEntry): GamificationResult => {
    const logs = getLogs();
    const existingIndex = logs.findIndex(l => l.date === entry.date);
    let isNewLogForDay = false;

    if (existingIndex >= 0) {
        logs[existingIndex] = { ...logs[existingIndex], ...entry };
    } else {
        logs.push(entry);
        isNewLogForDay = true;
    }

    safeSet(STORAGE_KEYS.LOGS, logs);
    recalculateStreak();
    return checkGamificationRules(isNewLogForDay, entry);
};

export const getSettings = (): AppSettings => {
    return safeGet(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
};

export const saveSettings = (settings: AppSettings) => safeSet(STORAGE_KEYS.SETTINGS, settings);

export const getReminders = (): ReminderSettings => {
    const raw = safeGet(STORAGE_KEYS.REMINDERS, DEFAULT_REMINDERS);
    if ('timeBased' in raw) return DEFAULT_REMINDERS;
    return raw;
};

export const saveReminders = (settings: ReminderSettings) => safeSet(STORAGE_KEYS.REMINDERS, settings);

export const clearAllData = () => {
    try {
        localStorage.clear();
    } catch (e) {
        console.error("Failed to clear data", e);
    }
};

export const generateCSV = (): string => {
    const logs = getLogs();
    const headers = ['Date', 'Flow', 'Spotting', 'Mood', 'WaterIntake', 'Symptoms'];
    const rows = logs.map(l => [
        l.date,
        l.flow || '',
        l.spotting || '',
        l.mood || '',
        l.waterIntake.toString(),
        l.symptoms.join(';')
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

export const seedDatabase = () => {
    try {
        clearAllData();
        const settings: AppSettings = { privacyMode: false, onboarded: true, cycleLength: 29, periodLength: 5, theme: 'Forest Fairy' };
        const user: UserStats = { name: 'Demo User', streak: 0, points: 3450, level: 5, unlockedBadges: ['badge_newbie', 'badge_first_log', 'badge_hydration_10', 'badge_mood_20'] };
        const reminders: ReminderSettings = { dailyCheckIn: { enabled: true, time: '20:00' }, periodPrediction: { enabled: true, daysBefore: 2, time: '09:00' }, pill: { enabled: true, time: '08:00' }, fertileWindow: { enabled: true, time: '10:00' } };

        const logs: LogEntry[] = [];
        const today = new Date();

        for (let c = 0; c < 3; c++) {
            const daysBackStart = 5 + (c * 30);
            for (let day = 0; day < 5; day++) {
                const d = new Date(today);
                d.setDate(d.getDate() - (daysBackStart - day));
                logs.push({
                    date: getLocalDateString(d),
                    flow: day === 1 ? 'Heavy' : day === 2 ? 'Medium' : 'Light',
                    symptoms: ['Cramps', 'Headache'],
                    mood: c % 2 === 0 ? 'Tired' : 'Happy',
                    waterIntake: 4,
                    spotting: null
                });
            }
        }

        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
        localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));

        recalculateStreak();

        if (typeof window !== 'undefined') window.location.reload();
    } catch (e) {
        console.error("Seeding failed", e);
    }
}

// --- ANALYTICS ENGINE ---
export interface AnalyticsData {
    avgPeriod: number;
    avgCycle: number;
    variability: number;
    consistencyScore: number;
    cycleStatus: string;
    chartData: Array<{ month: string, total: number, period: number, startDate: string, endDate: string }>;
    hasEnoughData: boolean;
    symptomStats: Array<{ name: string, count: number, pct: number }>;
    moodStats: Array<{ name: string, count: number }>;
    flowStats: { light: number, medium: number, heavy: number, score: number };
}

export const getAnalytics = (): AnalyticsData => {
    const logs = getLogs();
    const settings = getSettings();

    const symptomCounts: Record<string, number> = {};
    const moodCounts: Record<string, number> = {};
    const flowCounts = { light: 0, medium: 0, heavy: 0 };
    let totalFlowLogs = 0;
    let weightedFlowSum = 0;

    logs.forEach(log => {
        if (log.symptoms) log.symptoms.forEach(sym => symptomCounts[sym] = (symptomCounts[sym] || 0) + 1);
        if (log.mood) moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
        if (log.flow) {
            totalFlowLogs++;
            if (log.flow === 'Light') { flowCounts.light++; weightedFlowSum += 1; }
            if (log.flow === 'Medium') { flowCounts.medium++; weightedFlowSum += 2; }
            if (log.flow === 'Heavy' || log.flow === 'Super') { flowCounts.heavy++; weightedFlowSum += 3; }
        }
    });

    const symptomStats = Object.entries(symptomCounts)
        .map(([name, count]) => ({ name, count, pct: Math.round((count / logs.length) * 100) }))
        .sort((a, b) => b.count - a.count).slice(0, 3);

    const moodStats = Object.entries(moodCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count).slice(0, 3);

    const flowScore = totalFlowLogs > 0 ? ((weightedFlowSum / totalFlowLogs) / 3) * 100 : 0;

    // Re-fetch logic for outlier detection in chart data
    const periodStartDates: { date: string, length: number }[] = [];
    const forwardLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentStart = null;
    let lastLogDate = null;

    for (const log of forwardLogs) {
        if (log.flow) {
            if (currentStart === null) {
                currentStart = log.date;
                periodStartDates.push({ date: log.date, length: 0 }); // Length calculated later
            } else if (lastLogDate && diffInDays(lastLogDate, log.date) > 7) {
                currentStart = log.date;
                periodStartDates.push({ date: log.date, length: 0 });
            }
            lastLogDate = log.date;
        }
    }

    // Calculate actual cycle lengths for analytics
    const chartData = [];
    let consistencyScore = 100;

    if (periodStartDates.length >= 2) {
        for (let i = 0; i < periodStartDates.length - 1; i++) {
            const start = periodStartDates[i].date;
            const next = periodStartDates[i + 1].date;
            const length = diffInDays(start, next);

            // Filter outliers for display and score
            if (length >= 15 && length <= 50) {
                const month = new Date(start).toLocaleString('default', { month: 'short' });

                // Calculate period duration within this cycle
                const cycleLogs = logs.filter(l => l.date >= start && l.date < next && l.flow);
                const periodDuration = cycleLogs.length;

                chartData.push({
                    month,
                    total: length,
                    period: periodDuration,
                    startDate: start,
                    endDate: next
                });
            }
        }

        // Variability Calculation
        if (chartData.length > 1) {
            const lengths = chartData.map(c => c.total);
            const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / lengths.length;
            const stdDev = Math.sqrt(variance);
            // Score 100 = 0 dev, Score 0 = >5 dev
            consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev * 10)));
        }
    }

    return {
        avgPeriod: settings.periodLength,
        avgCycle: settings.cycleLength,
        variability: 0,
        consistencyScore: Math.round(consistencyScore),
        cycleStatus: consistencyScore > 80 ? "Regular" : consistencyScore > 50 ? "Variable" : "Irregular",
        chartData: chartData.slice(-6), // Last 6 valid cycles
        hasEnoughData: chartData.length >= 2,
        symptomStats,
        moodStats,
        flowStats: { ...flowCounts, score: flowScore }
    };
};

/**
 * SCIENTIFIC CALCULATION UPDATE:
 * Phases are now calculated based on the Luteal Phase anchor (Standard ~14 days).
 * Ovulation is calculated as TotalCycleLength - 14.
 * Fertile Window is 5 days leading up to ovulation + ovulation day (6 days total).
 * Outliers (Missed logs) are ignored for average calculation.
 */
export const calculateCycleData = (): CycleData => {
    const settings = getSettings();
    const logs = getLogs();

    // 1. Identify Cycle Starts (Simple gap detection)
    const periodStartDates: string[] = [];
    const forwardLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentStart = null;
    let lastLogDate = null;

    for (const log of forwardLogs) {
        if (log.flow) {
            if (currentStart === null) {
                currentStart = log.date;
                periodStartDates.push(log.date);
            } else if (lastLogDate && diffInDays(lastLogDate, log.date) > 7) {
                currentStart = log.date;
                periodStartDates.push(log.date);
            }
            lastLogDate = log.date;
        }
    }

    // 2. Calculate Average Cycle Length with Outlier Rejection
    let effectiveCycleLength = settings.cycleLength;
    if (periodStartDates.length >= 2) {
        let totalDiff = 0;
        let validCycles = 0;
        const recentStarts = [...periodStartDates].reverse(); // Copy before reverse

        for (let i = 0; i < recentStarts.length - 1; i++) {
            const diff = diffInDays(recentStarts[i + 1], recentStarts[i]);
            // UPDATED: Widen filter to 15-60 days to support more irregular cycles ("Universal Usability")
            if (diff >= 15 && diff <= 60) {
                totalDiff += diff;
                validCycles++;
            }
        }

        if (validCycles > 0) {
            effectiveCycleLength = Math.round(totalDiff / validCycles);
        }
    }

    // 3. Determine Current Status
    // If no logs, assume cycle started based on settings
    const lastPeriodStart = periodStartDates.length > 0
        ? periodStartDates[periodStartDates.length - 1]
        : getLocalDateString(new Date(Date.now() - (settings.cycleLength * 86400000)));

    const today = getLocalDateString(new Date());
    const daysSinceStart = diffInDays(lastPeriodStart, today);
    let currentDay = daysSinceStart + 1;

    const nextPeriodDate = addDays(lastPeriodStart, effectiveCycleLength);
    const daysUntilNext = effectiveCycleLength - daysSinceStart;

    // 4. Determine Phase (Scientific Method with Standard 14-day Luteal)
    const lutealLength = 14;
    const ovulationDay = effectiveCycleLength - lutealLength;
    const fertileWindowStart = ovulationDay - 5;

    let phase = CyclePhase.FOLLICULAR;
    // Normalize day if user hasn't logged start of new period yet but is past due
    const normalizedDay = currentDay > effectiveCycleLength ? currentDay : ((currentDay - 1) % effectiveCycleLength) + 1;

    if (normalizedDay <= settings.periodLength) {
        phase = CyclePhase.MENSTRUAL;
    } else if (normalizedDay >= fertileWindowStart && normalizedDay <= ovulationDay) {
        phase = CyclePhase.OVULATION;
    } else if (normalizedDay > ovulationDay) {
        phase = CyclePhase.LUTEAL;
    } else {
        phase = CyclePhase.FOLLICULAR;
    }

    let prediction = daysUntilNext < 0 ? `Late by ${Math.abs(daysUntilNext)} days` : daysUntilNext === 0 ? "Expected Today" : daysUntilNext === 1 ? "Tomorrow" : `${new Date(nextPeriodDate + 'T12:00:00').toLocaleString('default', { month: 'short' })} ${new Date(nextPeriodDate + 'T12:00:00').getDate()}`;

    return {
        currentDay: Math.max(1, currentDay),
        totalCycleLength: effectiveCycleLength,
        phase,
        prediction,
        nextPeriodDate
    };
};

export const getCalendarProjections = (monthsAhead: number = 3): CalendarProjection[] => {
    const settings = getSettings();
    const cycleData = calculateCycleData();
    const projections: CalendarProjection[] = [];

    let nextStart = cycleData.nextPeriodDate;
    const cycleLen = cycleData.totalCycleLength;
    const lutealLength = 14;

    for (let i = 0; i < monthsAhead; i++) {
        for (let d = 0; d < settings.periodLength; d++) {
            projections.push({ date: addDays(nextStart, d), type: 'period' });
        }

        // Calculate ovulation based on standard luteal phase
        const ovulationDayOffset = cycleLen - lutealLength;
        const ovulationDate = addDays(nextStart, ovulationDayOffset);

        projections.push({ date: ovulationDate, type: 'ovulation' });

        nextStart = addDays(nextStart, cycleLen);
    }
    return projections;
}
