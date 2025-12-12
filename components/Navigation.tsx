import React from 'react';
import { Home, ScanEye, Radio, MessageSquare, Sparkles } from 'lucide-react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: View.HOME, icon: Home, label: 'Hub' },
    { view: View.VISION, icon: ScanEye, label: 'Scan' },
    { view: View.AUDIO, icon: Radio, label: 'Listen' },
    { view: View.CHAT, icon: MessageSquare, label: 'Ask' },
    { view: View.KIDS, icon: Sparkles, label: 'Create' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="glass-panel px-6 py-4 rounded-full flex items-center gap-2 shadow-glass hover:shadow-glass-hover transition-all duration-500 border border-white/10 backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className="relative group w-14 h-12 flex flex-col items-center justify-center transition-all duration-300"
            >
              {/* Active Background Indicator */}
              {isActive && (
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-md scale-75 animate-pulse-slow"></div>
              )}
              
              {/* Icon */}
              <div className={`relative z-10 transition-all duration-300 transform group-hover:-translate-y-1 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${
                    isActive 
                      ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' 
                      : 'text-solar-subtext group-hover:text-white'
                  }`}
                />
              </div>

              {/* Dot Indicator for Active */}
              <span className={`absolute bottom-0 w-1 h-1 rounded-full transition-all duration-300 ${
                isActive ? 'bg-solar-gold shadow-[0_0_5px_#D4AF37] opacity-100' : 'bg-transparent opacity-0'
              }`}></span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};