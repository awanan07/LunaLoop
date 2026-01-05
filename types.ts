
import React from 'react';

export enum CyclePhase {
  MENSTRUAL = 'Menstrual',
  FOLLICULAR = 'Follicular',
  OVULATION = 'Ovulation',
  LUTEAL = 'Luteal',
}

export type ThemeColor = 'pink' | 'emerald' | 'violet' | 'cyan' | 'neutral';

export interface CycleData {
  currentDay: number;
  totalCycleLength: number;
  phase: CyclePhase;
  prediction: string;
  nextPeriodDate: string; // ISO Date string
}

export interface UserStats {
  streak: number;
  points: number;
  name: string;
  level: number;
  unlockedBadges: string[]; // Array of badge IDs
}

export interface LogEntry {
  date: string; // ISO Date string (YYYY-MM-DD)
  symptoms: string[];
  mood: string | null;
  flow: string | null; // Light, Medium, Heavy
  waterIntake: number;
  spotting: string | null;
}

export interface DailyLog {
  symptoms: string[];
  mood: string | null;
  waterIntake: number;
  waterGoal: number;
}

export interface AppSettings {
  privacyMode: boolean;
  onboarded: boolean;
  cycleLength: number;
  periodLength: number;
  theme: string;
}

export interface ReminderSettings {
  dailyCheckIn: {
    enabled: boolean;
    time: string;
  };
  periodPrediction: {
    enabled: boolean;
    daysBefore: number;
    time: string;
  };
  pill: {
    enabled: boolean;
    time: string;
  };
  fertileWindow: {
    enabled: boolean;
    time: string;
  };
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface CalendarProjection {
  date: string;
  type: 'period' | 'ovulation';
}
