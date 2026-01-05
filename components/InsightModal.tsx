
import React from 'react';
import { Sparkles, X } from 'lucide-react';

interface InsightModalProps {
  insight: string;
  loading: boolean;
  onClose: () => void;
}

export const InsightModal: React.FC<InsightModalProps> = ({ insight, loading, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl w-full max-w-sm relative z-10 p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
        </button>
        
        <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg mb-4">
                <Sparkles className="text-white" size={24} />
            </div>
            
            <h3 className="text-xl font-black text-gray-800 mb-2">Daily Insight</h3>
            
            <div className="min-h-[60px] flex items-center justify-center w-full">
                {loading ? (
                    <div className="flex gap-2">
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                ) : (
                    <p className="text-gray-600 font-medium leading-relaxed">
                        "{insight}"
                    </p>
                )}
            </div>

            {!loading && (
                <button 
                    onClick={onClose}
                    className="mt-6 w-full bg-gray-100 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    Got it
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
