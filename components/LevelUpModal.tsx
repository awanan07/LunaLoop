
import React from 'react';
import { Trophy, Star, X, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  type: 'level' | 'badge';
  title: string;
  subtitle: string;
  onClose: () => void;
}

const ConfettiPiece: React.FC<{ delay: string; left: string; color: string }> = ({ delay, left, color }) => (
    <div 
        className="absolute top-0 w-2 h-4 rounded-sm animate-[fall_3s_ease-in-out_infinite]"
        style={{ 
            left, 
            backgroundColor: color, 
            animationDelay: delay,
            opacity: 0,
            animationName: 'fall'
        }}
    />
);

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ type, title, subtitle, onClose }) => {
  // Styles injected here to avoid external CSS dependency for MVP
  const style = `
    @keyframes fall {
      0% { top: -10%; opacity: 1; transform: rotate(0deg); }
      100% { top: 110%; opacity: 0; transform: rotate(360deg); }
    }
  `;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300 overflow-hidden">
      <style>{style}</style>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* CSS Confetti */}
      <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(20)].map((_, i) => (
              <ConfettiPiece 
                key={i}
                delay={`${Math.random() * 2}s`}
                left={`${Math.random() * 100}%`}
                color={['#FF69B4', '#FFD700', '#00BFFF', '#ADFF2F'][Math.floor(Math.random() * 4)]}
              />
          ))}
      </div>
      
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm relative z-10 p-8 pt-12 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 overflow-hidden">
        
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-yellow-50 to-transparent pointer-events-none"></div>

        <div className="absolute -top-16 z-20">
            <div className="w-32 h-32 bg-gradient-to-tr from-yellow-300 via-orange-400 to-pink-500 rounded-full flex items-center justify-center border-[6px] border-white shadow-xl relative animate-[bounce_2s_infinite]">
                {type === 'level' ? (
                    <Trophy size={56} className="text-white drop-shadow-md" />
                ) : (
                    <Star size={56} className="text-white drop-shadow-md fill-white" />
                )}
                {/* Particles */}
                <div className="absolute top-0 right-0 w-4 h-4 bg-pink-400 rounded-full animate-bounce delay-75 shadow-md border-2 border-white"></div>
                <div className="absolute bottom-1 left-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-md border-2 border-white"></div>
                <Sparkles className="absolute -left-8 top-10 text-yellow-400 animate-pulse" size={32} />
                <Sparkles className="absolute -right-8 top-4 text-pink-400 animate-pulse delay-100" size={24} />
            </div>
        </div>

        <h2 className="mt-8 text-3xl font-black text-gray-800 mb-2 leading-tight tracking-tight">{title}</h2>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed text-sm px-4">{subtitle}</p>

        <button 
            onClick={onClose}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
        >
            Awesome!
        </button>
      </div>
    </div>
  );
};
