
import React from 'react';
import { getThemeClasses } from '../constants';
import { ThemeColor } from '../types';
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    themeColor: ThemeColor;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false,
    themeColor
}) => {
    if (!isOpen) return null;

    const theme = getThemeClasses(themeColor);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Modal Card */}
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 border border-gray-100">

                <div className="flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-50 text-red-500' : `${theme.bgLight} ${theme.text}`}`}>
                        {isDestructive ? <AlertTriangle size={28} /> : <Info size={28} />}
                    </div>

                    <h3 className="text-xl font-black text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3.5 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3.5 font-bold rounded-xl text-white shadow-lg active:scale-95 transition-all ${isDestructive ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : `${theme.bg} ${theme.bgHover} ${theme.shadow}`}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};
