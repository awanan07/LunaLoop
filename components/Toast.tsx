import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
      <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg border ${
        type === 'success' 
          ? 'bg-white border-green-100 text-green-800' 
          : type === 'error'
            ? 'bg-white border-red-100 text-red-800'
            : 'bg-white border-blue-100 text-blue-800'
      }`}>
        {type === 'success' ? (
          <CheckCircle size={20} className="text-green-500" />
        ) : type === 'error' ? (
          <XCircle size={20} className="text-red-500" />
        ) : (
          <Info size={20} className="text-blue-500" />
        )}
        <span className="font-bold text-sm">{message}</span>
      </div>
    </div>
  );
};