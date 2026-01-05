
import { CyclePhase, CycleData, UserStats, DailyLog, ThemeColor } from './types';
import { 
  Zap, 
  Activity, 
  Cloud, 
  Battery, 
  AlertCircle, 
  Thermometer, 
  Coffee, 
  Moon, 
  Repeat, 
  Heart, 
  Snowflake 
} from 'lucide-react';

export const MOCK_USER: UserStats = {
  name: 'User',
  streak: 12,
  points: 450,
  level: 5,
  unlockedBadges: ['badge_newbie'],
};

export const MOCK_CYCLE: CycleData = {
  currentDay: 25,
  totalCycleLength: 28,
  phase: CyclePhase.LUTEAL,
  prediction: 'Within 1-2 days',
  nextPeriodDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
};

export const MOCK_TODAY_LOG: DailyLog = {
  symptoms: ['Headache'],
  mood: 'Sad',
  waterIntake: 4,
  waterGoal: 8,
};

// Shared Lists
export const SYMPTOMS_LIST = [
  { id: 'Cramps', icon: Zap, label: 'Cramps' },
  { id: 'Headache', icon: Activity, label: 'Headache' },
  { id: 'Bloating', icon: Cloud, label: 'Bloating' },
  { id: 'Fatigue', icon: Battery, label: 'Fatigue' },
  { id: 'Acne', icon: AlertCircle, label: 'Acne' },
  { id: 'Backache', icon: Activity, label: 'Backache' }, 
  { id: 'Nausea', icon: Thermometer, label: 'Nausea' },
  { id: 'Cravings', icon: Coffee, label: 'Cravings' },
  { id: 'Insomnia', icon: Moon, label: 'Insomnia' },
  { id: 'Mood Swings', icon: Repeat, label: 'Swings' },
  { id: 'Tenderness', icon: Heart, label: 'Tenderness' },
  { id: 'Chills', icon: Snowflake, label: 'Chills' },
];

export const MOOD_LIST = [
  { label: 'Happy', emoji: '😄' },
  { label: 'Sad', emoji: '☹️' },
  { label: 'Anxious', emoji: '😰' },
  { label: 'Angry', emoji: '😠' },
  { label: 'Grateful', emoji: '😇' },
  { label: 'Gloomy', emoji: '😞' },
  { label: 'Sleepy', emoji: '😴' },
  { label: 'Energetic', emoji: '🤩' },
];

// Configuration for phase visuals
export const PHASE_CONFIG = {
  [CyclePhase.MENSTRUAL]: { name: 'Menstrual', color: '#E11D48' },   // Darker Red/Pink for contrast
  [CyclePhase.FOLLICULAR]: { name: 'Follicular', color: '#3B82F6' }, // Stronger Blue
  [CyclePhase.OVULATION]: { name: 'Ovulation', color: '#8B5CF6' },   // Stronger Purple
  [CyclePhase.LUTEAL]: { name: 'Luteal', color: '#4B5563' },         // Darker Gray
};

// Theme Configuration
export interface ThemeDef {
    id: string;
    name: string;
    bgClass: string;
    color: ThemeColor;
    primary: string; // Hex for canvas/svg
}

export const THEME_CONFIG: Record<string, ThemeDef> = {
    'Pretty in Pink': { 
        id: 'pink', 
        name: 'Pretty in Pink', 
        bgClass: 'bg-gradient-to-br from-[#FFF0F5] to-[#FAFAFA]', 
        color: 'pink',
        primary: '#DB2777' // Darker pink for better contrast
    },
    'Forest Fairy': { 
        id: 'emerald', 
        name: 'Forest Fairy', 
        bgClass: 'bg-gradient-to-br from-[#F0FDF4] to-[#ECFCCB]', 
        color: 'emerald',
        primary: '#059669'
    },
    'Magical Muse': { 
        id: 'violet', 
        name: 'Magical Muse', 
        bgClass: 'bg-gradient-to-br from-[#F3E8FF] to-[#E0E7FF]', 
        color: 'violet',
        primary: '#7C3AED'
    },
    'Deep Sea Diver': { 
        id: 'cyan', 
        name: 'Deep Sea Diver', 
        bgClass: 'bg-gradient-to-br from-[#ECFEFF] to-[#CFFAFE]', 
        color: 'cyan',
        primary: '#0891B2'
    },
    'Privacy': { 
        id: 'neutral', 
        name: 'Privacy', 
        bgClass: 'bg-slate-900', // Dark Mode background
        color: 'neutral',
        primary: '#64748b'
    },
};

// Helper to get color classes based on theme
export const getThemeClasses = (color: ThemeColor) => {
    switch (color) {
        case 'emerald':
            return {
                text: 'text-emerald-700', // Darkened
                textDark: 'text-emerald-900',
                textLight: 'text-emerald-600',
                bg: 'bg-emerald-600',
                bgHover: 'hover:bg-emerald-700',
                bgLight: 'bg-emerald-50',
                bgLightHover: 'hover:bg-emerald-100',
                bgMedium: 'bg-emerald-200',
                border: 'border-emerald-200',
                borderStrong: 'border-emerald-500',
                ring: 'ring-emerald-300',
                fill: 'fill-emerald-300',
                stroke: 'stroke-emerald-500',
                gradient: 'bg-gradient-to-r from-emerald-500 to-teal-600',
                gradientVertical: 'bg-gradient-to-b from-emerald-600 to-teal-800',
                shadow: 'shadow-emerald-200',
                icon: 'text-emerald-600',
                accent: '#059669'
            };
        case 'violet':
            return {
                text: 'text-violet-700',
                textDark: 'text-violet-900',
                textLight: 'text-violet-600',
                bg: 'bg-violet-600',
                bgHover: 'hover:bg-violet-700',
                bgLight: 'bg-violet-50',
                bgLightHover: 'hover:bg-violet-100',
                bgMedium: 'bg-violet-200',
                border: 'border-violet-200',
                borderStrong: 'border-violet-500',
                ring: 'ring-violet-300',
                fill: 'fill-violet-300',
                stroke: 'stroke-violet-500',
                gradient: 'bg-gradient-to-r from-violet-500 to-purple-600',
                gradientVertical: 'bg-gradient-to-b from-violet-600 to-purple-800',
                shadow: 'shadow-violet-200',
                icon: 'text-violet-600',
                accent: '#7C3AED'
            };
        case 'cyan':
            return {
                text: 'text-cyan-700',
                textDark: 'text-cyan-900',
                textLight: 'text-cyan-600',
                bg: 'bg-cyan-600',
                bgHover: 'hover:bg-cyan-700',
                bgLight: 'bg-cyan-50',
                bgLightHover: 'hover:bg-cyan-100',
                bgMedium: 'bg-cyan-200',
                border: 'border-cyan-200',
                borderStrong: 'border-cyan-500',
                ring: 'ring-cyan-300',
                fill: 'fill-cyan-300',
                stroke: 'stroke-cyan-500',
                gradient: 'bg-gradient-to-r from-cyan-500 to-blue-600',
                gradientVertical: 'bg-gradient-to-b from-cyan-600 to-blue-800',
                shadow: 'shadow-cyan-200',
                icon: 'text-cyan-600',
                accent: '#0891B2'
            };
        case 'neutral':
            return {
                text: 'text-slate-600',
                textDark: 'text-slate-900',
                textLight: 'text-slate-500',
                bg: 'bg-slate-700',
                bgHover: 'hover:bg-slate-800',
                bgLight: 'bg-slate-100',
                bgLightHover: 'hover:bg-slate-200',
                bgMedium: 'bg-slate-200',
                border: 'border-slate-200',
                borderStrong: 'border-slate-500',
                ring: 'ring-slate-300',
                fill: 'fill-slate-300',
                stroke: 'stroke-slate-500',
                gradient: 'bg-gradient-to-r from-slate-600 to-gray-700',
                gradientVertical: 'bg-gradient-to-b from-slate-700 to-gray-800',
                shadow: 'shadow-slate-200',
                icon: 'text-slate-600',
                accent: '#64748b'
            };
        case 'pink':
        default:
            return {
                text: 'text-pink-600', // Darkened from 500
                textDark: 'text-pink-800',
                textLight: 'text-pink-500',
                bg: 'bg-pink-600',
                bgHover: 'hover:bg-pink-700',
                bgLight: 'bg-pink-50',
                bgLightHover: 'hover:bg-pink-100',
                bgMedium: 'bg-pink-200',
                border: 'border-pink-200',
                borderStrong: 'border-pink-500',
                ring: 'ring-pink-300',
                fill: 'fill-pink-300',
                stroke: 'stroke-pink-500',
                gradient: 'bg-gradient-to-r from-pink-500 to-rose-600',
                gradientVertical: 'bg-gradient-to-b from-pink-600 to-purple-700',
                shadow: 'shadow-pink-200',
                icon: 'text-pink-600',
                accent: '#DB2777'
            };
    }
};
