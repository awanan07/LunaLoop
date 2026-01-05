
import React, { useState } from 'react';
import { EyeOff } from 'lucide-react';

interface PrivacyMaskProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
}

export const PrivacyMask: React.FC<PrivacyMaskProps> = ({ children, isActive, className = '' }) => {
  const [isPeeking, setIsPeeking] = useState(false);

  if (!isActive) {
    return <>{children}</>;
  }

  return (
    <div 
        className="relative w-full h-full group cursor-pointer" 
        onClick={() => setIsPeeking(prev => !prev)}
        title="Privacy Mode Active - Tap to Peek"
    >
      <div className={`transition-all duration-300 ${className} ${isPeeking ? 'opacity-100 blur-none' : 'opacity-30 blur-md select-none'}`}>
        {children}
      </div>
      
      {!isPeeking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <EyeOff className="text-gray-400/50" size={24} />
          </div>
      )}
    </div>
  );
};
