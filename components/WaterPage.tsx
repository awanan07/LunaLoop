
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { ThemeColor } from '../types';
import { getThemeClasses } from '../constants';

interface WaterPageProps {
  onClose: () => void;
  currentIntake: number;
  onSave: (intake: number) => void;
  themeColor: ThemeColor;
}

export const WaterPage: React.FC<WaterPageProps> = ({ onClose, currentIntake, onSave, themeColor }) => {
  const [intake, setIntake] = useState(currentIntake);
  const totalGlasses = 8;
  const theme = getThemeClasses(themeColor);

  const toggleGlass = (index: number) => {
    // If clicking the glass that matches current count (e.g. clicking 4th glass when intake is 4), toggle it off (intake 3)
    // Otherwise set intake to that glass number
    const glassNumber = index + 1;
    let newIntake = glassNumber;
    
    if (intake === glassNumber) {
        newIntake = glassNumber - 1;
    }
    
    setIntake(newIntake);
    
    // Haptic feedback depends on whether we filled or emptied
    if (newIntake > intake) {
        triggerHaptic('medium'); // Filling feeling
    } else {
        triggerHaptic('light');
    }
  };

  const handleSave = () => {
    triggerHaptic('success');
    onSave(intake);
    onClose();
  };

  const suffixes = ["st", "nd", "rd", "th", "th", "th", "th", "th"];

  return (
    <div className="h-full bg-white px-6 pt-10 pb-10 flex flex-col font-sans animate-in slide-in-from-bottom-10 duration-300 relative z-50">
      
      {/* Header */}
      <div className="flex justify-start mb-6 shrink-0">
        <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Hero Banner */}
      <div className={`${theme.bgMedium} rounded-2xl p-3 py-5 flex items-center justify-center gap-5 mb-10 border-2 ${theme.borderStrong} shadow-sm shrink-0`}>
         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm p-3">
             <img 
               src="https://cdn-icons-png.flaticon.com/512/3248/3248369.png" 
               alt="Happy Water" 
               className="w-full h-full object-contain" 
             />
         </div>
         <span className={`text-white font-bold text-2xl drop-shadow-sm tracking-wide mix-blend-multiply opacity-80`}>Stay Hydrated!</span>
      </div>

      {/* List */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pb-24 min-h-0">
        {Array.from({ length: totalGlasses }).map((_, i) => {
            const isSelected = i < intake;
            const glassNum = i + 1;
            const label = `${glassNum}${suffixes[Math.min(i, 7)] || 'th'} Glass`;

            return (
                <button
                    key={i}
                    onClick={() => toggleGlass(i)}
                    className={`
                        w-full py-4 rounded-2xl font-bold text-sm transition-all border-2 relative shrink-0
                        ${isSelected
                            ? `${theme.bgLight} ${theme.borderStrong} ${theme.textDark} shadow-md translate-y-[1px]`
                            : `bg-[#DCDCDC] ${theme.border} text-gray-500 hover:bg-[#d4d4d4]`
                        }
                        active:shadow-none active:translate-y-[4px]
                    `}
                >
                    {label}
                </button>
            )
        })}
      </div>

      {/* Footer Save Button */}
      <div className="fixed bottom-10 left-0 right-0 px-16 flex justify-center bg-gradient-to-t from-white via-white to-transparent pt-4 pb-2">
         <button 
            onClick={handleSave}
            className={`w-full max-w-xs ${theme.bg} text-white font-bold py-3.5 rounded-full shadow-lg ${theme.shadow} hover:opacity-90 active:scale-95 transition-all`}
         >
            SAVE
         </button>
      </div>
    </div>
  );
};
