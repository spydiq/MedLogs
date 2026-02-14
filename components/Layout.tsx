
import React from 'react';
import { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-background-light dark:bg-background-dark relative overflow-hidden flex flex-col border-x border-slate-200 dark:border-border-dark shadow-2xl">
      <div className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
        {children}
      </div>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 dark:bg-background-dark/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-50">
        <button 
          onClick={() => onTabChange('schedule')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'schedule' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="material-icons-round text-2xl">calendar_today</span>
          <span className={`text-[10px] font-bold ${activeTab === 'schedule' ? 'opacity-100' : 'opacity-60'}`}>Schedule</span>
        </button>
        
        <button 
          onClick={() => onTabChange('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="material-icons-round text-2xl">history</span>
          <span className={`text-[10px] font-bold ${activeTab === 'history' ? 'opacity-100' : 'opacity-60'}`}>History</span>
        </button>

        <button 
          onClick={() => onTabChange('list')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'list' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="material-icons-round text-2xl">format_list_bulleted</span>
          <span className={`text-[10px] font-bold ${activeTab === 'list' ? 'opacity-100' : 'opacity-60'}`}>List</span>
        </button>

        <button 
          onClick={() => onTabChange('alerts')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'alerts' ? 'text-primary' : 'text-slate-400'}`}
        >
          <span className="material-icons-round text-2xl">notifications</span>
          <span className={`text-[10px] font-bold ${activeTab === 'alerts' ? 'opacity-100' : 'opacity-60'}`}>Alerts</span>
        </button>
      </nav>
      
      {/* Home Indicator Spacer */}
      <div className="fixed bottom-0 left-0 right-0 h-1.5 w-full max-w-[430px] mx-auto bg-background-light dark:bg-background-dark pointer-events-none">
        <div className="w-32 h-1 bg-slate-300 dark:bg-primary/20 rounded-full mx-auto mt-0.5"></div>
      </div>
    </div>
  );
};
