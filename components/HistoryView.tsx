
import React, { useState } from 'react';
import { IntakeLog } from '../types';

interface HistoryViewProps {
  logs: IntakeLog[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.medicationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = selectedDateFilter ? log.date === selectedDateFilter : true;
    return matchesSearch && matchesDate;
  });

  // Group logs by date
  const groupedLogs = filteredLogs.reduce((groups: Record<string, IntakeLog[]>, log) => {
    const date = log.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
    return groups;
  }, {});

  const dates = Object.keys(groupedLogs).sort().reverse();
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="pt-12 px-6 pb-20">
      <header className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">MedLog Pro</span>
          <div className="relative">
            {/* Transparent input overlaying the icon for perfect clickability */}
            <input 
              type="date" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
            />
            <div 
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all relative z-10 ${selectedDateFilter ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'bg-primary/10 text-primary'}`}
            >
              <span className="material-icons-round text-lg">{selectedDateFilter ? 'event_available' : 'calendar_today'}</span>
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Intake History</h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Tracking your consistency over time.</p>
          {selectedDateFilter && (
            <button 
              onClick={() => setSelectedDateFilter('')}
              className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-1 rounded-md relative z-30"
            >
              Clear Filter
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 p-4 rounded-xl">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Total Logs</p>
          <p className="text-2xl font-bold mt-1">{filteredLogs.length}</p>
        </div>
        <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/10 p-4 rounded-xl">
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Selected</p>
          <p className="text-2xl font-bold mt-1">
            {selectedDateFilter ? '1' : 'All'} <span className="text-primary text-sm font-normal">days</span>
          </p>
        </div>
      </div>

      <div className="relative mb-8">
        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all" 
          placeholder="Search history..." 
          type="text"
        />
      </div>

      <div className="space-y-8">
        {dates.length === 0 && (
          <div className="text-center py-12 text-slate-500 opacity-50 flex flex-col items-center">
            <span className="material-icons-round text-5xl mb-4">history_toggle_off</span>
            <p className="font-medium">No intake records found</p>
            <p className="text-xs mt-1">Try adjusting your filters or search terms</p>
          </div>
        )}

        {dates.map(date => (
          <div key={date} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${date === todayStr ? 'text-primary' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${date === todayStr ? 'bg-primary animate-pulse' : 'bg-slate-400'}`}></span>
              {date === todayStr ? 'Today' : new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h2>
            <div className="space-y-3">
              {groupedLogs[date].map(log => (
                <div key={log.id} className="flex items-center gap-4 bg-white dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-800/50 shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <span className="material-icons-round">done_all</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold leading-tight">{log.medicationName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Confirmed dose taken</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{log.time}</p>
                    <span className="text-[10px] text-primary uppercase font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
