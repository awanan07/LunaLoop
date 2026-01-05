import React from 'react';
import { Home, Calendar, ChartBar, Award, Plus } from 'lucide-react';
import { ThemeColor } from '../types';
import { getThemeClasses } from '../constants';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  themeColor: ThemeColor;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab, themeColor }) => {
  const theme = getThemeClasses(themeColor);
  
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'track', icon: Plus, label: 'Track', isSpecial: true },
    { id: 'analysis', icon: ChartBar, label: 'Analysis' },
    { id: 'badges', icon: Award, label: 'Badges' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pb-6 pt-2 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
      <div className="flex justify-between items-end">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          
          if (item.isSpecial) {
             return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="flex flex-col items-center justify-center -mt-8 active:scale-95 transition-transform"
                  aria-label="Track Symptoms"
                >
                  <div className={`w-14 h-14 ${theme.bgLight} rounded-2xl flex items-center justify-center shadow-lg ${theme.text} transition-colors border ${theme.border}`}>
                    <Plus size={28} strokeWidth={3} />
                  </div>
                  <span className={`text-xs mt-1 font-medium text-gray-400`}>
                    {item.label}
                  </span>
                </button>
             );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center gap-1 min-w-[3.5rem] p-2"
              aria-label={item.label}
            >
              <item.icon
                size={24}
                className={`transition-colors ${isActive ? theme.text : 'text-gray-300'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? theme.text : 'text-gray-300'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};