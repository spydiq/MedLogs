
import React, { useState, useMemo } from 'react';
import { Medication, IntakeLog } from '../types';

interface MedicationListViewProps {
  medications: Medication[];
  logs: IntakeLog[];
  onAddClick: () => void;
  onEditClick: (med: Medication) => void;
  onDeleteMed: (id: string) => void;
}

type FilterType = 'All' | 'Morning' | 'Afternoon';

export const MedicationListView: React.FC<MedicationListViewProps> = ({ medications, logs, onAddClick, onEditClick, onDeleteMed }) => {
  const [timeFilter, setTimeFilter] = useState<FilterType>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter medications based on search and time filter
  const filteredMedications = useMemo(() => {
    return medications.filter(med => {
      const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           med.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      if (timeFilter === 'All') return true;

      // Logic: Morning is any dose with AM, Afternoon/Evening is any dose with PM
      return med.scheduledTimes.some(time => {
        if (timeFilter === 'Morning') return time.includes('AM');
        if (timeFilter === 'Afternoon') return time.includes('PM');
        return false;
      });
    });
  }, [medications, searchTerm, timeFilter]);

  // Calculate dynamic weekly adherence
  const weeklyStats = useMemo(() => {
    const stats = [];
    const today = new Date();
    let totalScheduledLast7Days = 0;
    let totalTakenLast7Days = 0;

    // Calculate for last 7 days (including today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });

      // Count how many doses should have been taken across all medications active on this day
      const expectedDoses = medications.reduce((acc, med) => acc + med.frequency, 0);
      
      // Count logs for this specific date
      const takenDoses = logs.filter(l => l.date === dateStr).length;

      stats.push({
        label: dayLabel,
        height: expectedDoses > 0 ? Math.min((takenDoses / expectedDoses) * 40, 40) : 0, // 0 height if no expected meds
        isToday: i === 0,
        percentage: expectedDoses > 0 ? (takenDoses / expectedDoses) : 0
      });

      totalScheduledLast7Days += expectedDoses;
      totalTakenLast7Days += takenDoses;
    }

    const overallSuccess = totalScheduledLast7Days > 0 
      ? Math.round((totalTakenLast7Days / totalScheduledLast7Days) * 100) 
      : 0;

    return { stats, overallSuccess };
  }, [medications, logs]);

  return (
    <div className="pt-12 px-6">
      <header className="flex justify-between items-end mb-8 pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medications</h1>
          <p className="text-primary/60 text-sm mt-1">{medications.length} active prescriptions</p>
        </div>
        <button 
          onClick={onAddClick}
          className="bg-primary hover:bg-primary/90 text-background-dark h-12 w-12 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-primary/20"
        >
          <span className="material-icons-round text-3xl">add</span>
        </button>
      </header>

      <div className="relative mb-6">
        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-200/50 dark:bg-primary/5 border-none rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-display text-sm" 
          placeholder="Search your medications..." 
          type="text"
        />
      </div>

      {/* Improved filter buttons with better hit areas and clear active state */}
      <div className="flex gap-2 mb-8 overflow-x-auto hide-scrollbar relative z-10">
        {(['All', 'Morning', 'Afternoon'] as FilterType[]).map(filter => (
          <button 
            key={filter}
            onClick={(e) => {
              e.preventDefault();
              setTimeFilter(filter);
            }}
            className={`px-6 py-2 rounded-full text-xs font-bold transition-all border shrink-0 ${
              timeFilter === filter 
              ? 'bg-primary text-background-dark border-primary shadow-md shadow-primary/20' 
              : 'bg-slate-200/50 dark:bg-primary/10 border-transparent text-slate-500 dark:text-primary/60 hover:bg-primary/5'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredMedications.length === 0 ? (
          <div className="py-12 text-center text-slate-500 opacity-40">
            <div className="w-16 h-16 bg-slate-200 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-icons-round text-3xl">search_off</span>
            </div>
            <p className="font-display font-medium">No medications found</p>
            <p className="text-[10px] uppercase font-bold tracking-widest mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredMedications.map(med => (
            <div key={med.id} className="bg-white dark:bg-primary/5 border border-slate-100 dark:border-primary/10 p-5 rounded-2xl shadow-sm relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl ${med.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-slate-300/50 text-slate-500'} flex items-center justify-center border border-primary/10`}>
                    <span className="material-icons-round text-2xl">
                      {med.type === 'Syringe' ? 'colorize' : 'medication'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{med.name}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-primary/60 uppercase tracking-widest font-bold mt-1">{med.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase mb-1">Active</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 py-4 border-t border-slate-100 dark:border-primary/10">
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-primary/40 uppercase font-bold tracking-widest">Dosage</p>
                  <p className="text-sm font-bold mt-0.5">{med.dosage} {med.dosageUnit || 'mg'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-primary/40 uppercase font-bold tracking-widest">Frequency</p>
                  <p className="text-sm font-bold mt-0.5">{med.frequency}x Daily</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-primary/40 uppercase font-bold tracking-widest">Type</p>
                  <p className="text-sm font-bold mt-0.5">{med.type}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-primary/40 uppercase font-bold tracking-widest">Times</p>
                  <p className="text-[10px] font-bold text-primary flex flex-wrap gap-1 mt-1">
                    {med.scheduledTimes.map(t => (
                      <span key={t} className="bg-primary/10 px-1.5 py-0.5 rounded">{t}</span>
                    ))}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => onEditClick(med)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-primary/10 text-slate-600 dark:text-slate-300 hover:text-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-transparent hover:border-primary/20"
                >
                  <span className="material-icons-round text-sm">edit</span> Edit
                </button>
                <button 
                  onClick={() => onDeleteMed(med.id)}
                  className="px-4 py-2.5 bg-red-500/5 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center border border-red-500/10"
                >
                  <span className="material-icons-round text-sm">delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-10 p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <h4 className="text-sm font-bold mb-6 flex items-center gap-2 relative z-10">
          <span className="material-icons-round text-primary text-sm">insights</span> Weekly Adherence
        </h4>
        <div className="flex justify-between items-end px-1 h-20 mb-2 relative z-10">
          {weeklyStats.stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 group">
              <div 
                className={`w-2.5 bg-primary rounded-full transition-all duration-500 ${
                  stat.isToday ? 'shadow-[0_0_12px_rgba(19,236,128,0.6)]' : 
                  stat.percentage < 0.5 ? 'opacity-30' : 'opacity-70'
                }`}
                style={{ height: `${stat.height}px` }}
              ></div>
              <span className={`text-[9px] font-bold uppercase transition-colors ${stat.isToday ? 'text-primary' : 'text-slate-500'}`}>
                {stat.label}
              </span>
            </div>
          ))}
          <div className="ml-6 text-right pb-1">
            <p className="text-3xl font-bold text-primary leading-none">{weeklyStats.overallSuccess}%</p>
            <p className="text-[10px] text-slate-500 dark:text-primary/60 font-bold uppercase tracking-widest mt-1">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};
