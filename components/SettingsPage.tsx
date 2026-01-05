
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Trash2, ShieldCheck, Moon, Database, Palette, Bell, Calendar, User } from 'lucide-react';
import * as db from '../services/storageService';
import { triggerHaptic } from '../utils/haptics';
import { Toast } from './Toast';
import { AppSettings, ThemeColor } from '../types';
import { getThemeClasses } from '../constants';
import { ConfirmationModal } from './ConfirmationModal';

interface SettingsPageProps {
    onBack: () => void;
    privacyMode: boolean;
    togglePrivacy: () => void;
    onOpenReminders?: () => void;
    onOpenThemes?: () => void;
    onUpdate?: () => void;
    themeColor: ThemeColor;
}

// Sub-component for list items to ensure consistency
const SettingsItem: React.FC<{
    icon: React.ReactNode;
    title: string;
    value?: string;
    onClick: () => void;
    isDestructive?: boolean;
    rightElement?: React.ReactNode;
    themeColor: ThemeColor;
}> = ({ icon, title, value, onClick, isDestructive, rightElement, themeColor }) => {
    const theme = getThemeClasses(themeColor);
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm active:scale-[0.98] transition-all group mb-3`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDestructive ? 'bg-red-50 text-red-500' : `bg-gray-50 text-gray-500 group-hover:${theme.bgLight} group-hover:${theme.text}`}`}>
                    {icon}
                </div>
                <div className="flex flex-col items-start">
                    <span className={`text-sm font-bold ${isDestructive ? 'text-red-500' : 'text-gray-700'}`}>{title}</span>
                    {value && <span className="text-xs text-gray-400 font-medium">{value}</span>}
                </div>
            </div>
            {rightElement || <ChevronRight size={18} className="text-gray-300" />}
        </button>
    );
};

const StepperControl: React.FC<{
    label: string;
    value: number;
    unit: string;
    onIncrease: () => void;
    onDecrease: () => void;
    helperText?: string;
    themeColor: ThemeColor;
}> = ({ label, value, unit, onIncrease, onDecrease, helperText, themeColor }) => {
    const theme = getThemeClasses(themeColor);
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm mb-3">
            <div className="flex justify-between items-center mb-1">
                <span className="text-gray-700 font-bold text-sm flex items-center gap-2">
                    <Calendar size={16} className={theme.textLight} />
                    {label}
                </span>
                <span className={`${theme.text} font-black text-lg`}>{value} <span className="text-xs text-gray-400 font-medium uppercase">{unit}</span></span>
            </div>
            {helperText && <p className="text-[10px] text-gray-400 mb-3 leading-tight">{helperText}</p>}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => { triggerHaptic('light'); onDecrease(); }}
                    className="flex-1 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg active:scale-95 transition-all"
                >
                    -
                </button>
                <button
                    onClick={() => { triggerHaptic('light'); onIncrease(); }}
                    className="flex-1 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg active:scale-95 transition-all"
                >
                    +
                </button>
            </div>
        </div>
    );
};

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, privacyMode, togglePrivacy, onOpenReminders, onOpenThemes, onUpdate, themeColor }) => {
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const [settings, setSettings] = useState<AppSettings>(db.getSettings());

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        action: 'reset' | 'demo' | null;
    }>({ isOpen: false, title: '', message: '', action: null });

    const theme = getThemeClasses(themeColor);

    const handleUpdateSetting = (key: keyof AppSettings, val: any) => {
        const newSettings = { ...settings, [key]: val };
        setSettings(newSettings);
        db.saveSettings(newSettings);
        if (onUpdate) onUpdate();
    };

    const handleExport = () => {
        triggerHaptic('success');
        const csvContent = db.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `lunaloop_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ msg: "Data exported to CSV", type: "success" });
    };

    const triggerModal = (action: 'reset' | 'demo', title: string, message: string) => {
        setModalConfig({ isOpen: true, title, message, action });
    };

    const closeModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    const onConfirmAction = () => {
        closeModal();
        if (modalConfig.action === 'reset') {
            triggerHaptic('heavy');
            db.clearAllData();
            window.location.reload();
        } else if (modalConfig.action === 'demo') {
            triggerHaptic('heavy');
            db.seedDatabase();
        }
    };

    return (
        <div className="h-full bg-[#F9FAFB] text-gray-800 font-sans flex flex-col animate-in slide-in-from-right duration-300">

            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex items-center px-6 py-6 pt-10 bg-white border-b border-gray-100 sticky top-0 z-20 shrink-0">
                <button
                    onClick={() => { triggerHaptic('light'); onBack(); }}
                    className="p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors active:scale-90"
                >
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-xl font-black text-gray-800 flex-1 text-center pr-8">Settings</h1>
            </div>

            <div className="flex-1 px-6 pb-24 overflow-y-auto no-scrollbar pt-6 min-h-0">

                {/* Profile Teaser */}
                <div className="flex items-center gap-4 mb-8">
                    <div className={`w-16 h-16 rounded-full p-1 shadow-md ${theme.gradient}`}>
                        <div className="w-full h-full bg-white rounded-full overflow-hidden">
                            <img src="https://picsum.photos/100/100" alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">My Account</h2>
                        <p className="text-xs text-gray-400">Manage your data and cycle</p>
                    </div>
                </div>

                {/* Section: My Cycle */}
                <div className="mb-8">
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4 pl-1">My Cycle</h3>

                    <StepperControl
                        label="Cycle Length"
                        value={settings.cycleLength}
                        unit="Days"
                        onDecrease={() => handleUpdateSetting('cycleLength', Math.max(21, settings.cycleLength - 1))}
                        onIncrease={() => handleUpdateSetting('cycleLength', Math.min(45, settings.cycleLength + 1))}
                        themeColor={themeColor}
                    />

                    <StepperControl
                        label="Period Length"
                        value={settings.periodLength}
                        unit="Days"
                        onDecrease={() => handleUpdateSetting('periodLength', Math.max(2, settings.periodLength - 1))}
                        onIncrease={() => handleUpdateSetting('periodLength', Math.min(10, settings.periodLength + 1))}
                        themeColor={themeColor}
                    />
                </div>

                {/* Section: App Preferences */}
                <div className="mb-8">
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4 pl-1">App Preferences</h3>

                    <SettingsItem
                        icon={<Palette size={20} />}
                        title="Theme Gallery"
                        value={settings.theme}
                        onClick={() => { triggerHaptic('light'); onOpenThemes?.(); }}
                        themeColor={themeColor}
                    />

                    <SettingsItem
                        icon={<Bell size={20} />}
                        title="Reminders"
                        value="Notifications & Alerts"
                        onClick={() => { triggerHaptic('light'); onOpenReminders?.(); }}
                        themeColor={themeColor}
                    />

                    <SettingsItem
                        icon={<ShieldCheck size={20} />}
                        title="Privacy Mode"
                        value={privacyMode ? "On (Blur sensitive data)" : "Off"}
                        onClick={() => { triggerHaptic('light'); togglePrivacy(); }}
                        rightElement={
                            <div className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${privacyMode ? 'bg-green-500' : 'bg-gray-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${privacyMode ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        }
                        themeColor={themeColor}
                    />
                </div>

                {/* Section: Data Zone */}
                <div className="mb-8">
                    <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4 pl-1">Data Zone</h3>

                    <SettingsItem
                        icon={<Download size={20} />}
                        title="Export Data"
                        value="Download CSV"
                        onClick={handleExport}
                        themeColor={themeColor}
                    />

                    <SettingsItem
                        icon={<Database size={20} />}
                        title="Load Demo Data"
                        value="For testing only"
                        onClick={() => triggerModal('demo', 'Load Demo Data?', 'This will OVERWRITE your current data with sample data. This cannot be undone.')}
                        themeColor={themeColor}
                    />

                    <SettingsItem
                        icon={<Trash2 size={20} />}
                        title="Reset All Data"
                        onClick={() => triggerModal('reset', 'Reset All Data?', 'Are you sure you want to delete EVERYTHING? This action is irreversible.')}
                        isDestructive
                        themeColor={themeColor}
                    />
                </div>

                <p className="text-center text-xs text-gray-300 font-bold pt-4">LunaLoop v1.2.2</p>
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                onConfirm={onConfirmAction}
                onCancel={closeModal}
                themeColor={themeColor}
                isDestructive={true} // Both demo overwrite and delete are destructive
                confirmText={modalConfig.action === 'reset' ? 'Delete All' : 'Overwrite'}
            />
        </div>
    );
};
