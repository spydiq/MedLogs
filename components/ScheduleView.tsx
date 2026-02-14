
import React, { useState, useMemo } from 'react';
import { Medication, DayProgress, IntakeLog, Dependent } from '../types';

interface ScheduleViewProps {
  medications: Medication[];
  onMarkAsTaken: (id: string, date: string) => void;
  onAddClick: () => void;
  onProfileClick: () => void;
  logs: IntakeLog[];
  dependents: Dependent[];
  selectedDependentId: string;
  onDependentChange: (id: string) => void;
  userName: string;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ 
  medications, onMarkAsTaken, onAddClick, onProfileClick, logs, 
  dependents, selectedDependentId, onDependentChange, userName 
}) => {
  const weekDays = useMemo(() => {
    const days: DayProgress[] = [];
    // Changed range from -2..2 to -3..3 to show a full 7-day week
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
        isActive: i === 0,
        fullDate: d.toISOString().split('T')[0] 
      } as any);
    }
    return days;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const medicationStatuses = useMemo(() => {
    return medications.map(med => {
      const logsForDay = logs.filter(l => l.medicationId === med.id && l.date === selectedDate);
      const doseIndex = logsForDay.length;
      const nextDoseTime = med.scheduledTimes && med.scheduledTimes[doseIndex] 
        ? med.scheduledTimes[doseIndex] 
        : (med.scheduledTimes?.[0] || med.nextDose);

      return {
        ...med,
        logsForDay,
        isFullyTaken: logsForDay.length >= med.frequency,
        dosesRemaining: Math.max(0, med.frequency - logsForDay.length),
        calculatedNextDose: nextDoseTime
      };
    });
  }, [medications, logs, selectedDate]);

  const remainingCount = medicationStatuses.reduce((acc, curr) => acc + curr.dosesRemaining, 0);
  const totalDosesScheduled = medications.reduce((a, b) => a + b.frequency, 0);
  const progressPercent = totalDosesScheduled > 0 
    ? Math.round(((totalDosesScheduled - remainingCount) / totalDosesScheduled) * 100)
    : 0;

  const isProfileEmpty = !userName || userName === 'Me' || userName === '';

  return (
    <div className="pt-12">
      <header className="px-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Schedule</h1>
            <p className="text-primary/60 text-sm">
              {isToday ? (remainingCount > 0 ? `${remainingCount} doses remaining` : medications.length > 0 ? `All caught up!` : `Get started today`) : `Schedule for ${selectedDate}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onAddClick}
              className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
              title="Add Medication"
            >
              <span className="material-icons-round">add</span>
            </button>
            <button 
              onClick={onProfileClick}
              className="h-10 w-10 rounded-full bg-primary flex items-center justify-center border border-primary/30 hover:brightness-110 transition-all active:scale-95 shadow-md shadow-primary/20"
              title="View Profile"
            >
              <span className="material-icons-round text-background-dark">person</span>
            </button>
          </div>
        </div>

        {/* Dependents Selector - Only show if there are actual dependents added */}
        {dependents.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2 mb-2">
            <button 
              onClick={() => onDependentChange('self')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap text-xs font-bold ${
                selectedDependentId === 'self' 
                ? 'bg-primary text-background-dark border-primary shadow-lg shadow-primary/20' 
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
              }`}
            >
              <span className="material-icons-round text-sm">person</span>
              {userName || 'Me'}
            </button>
            {dependents.map(dep => (
              <button 
                key={dep.id}
                onClick={() => onDependentChange(dep.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap text-xs font-bold ${
                  selectedDependentId === dep.id 
                  ? 'bg-primary text-background-dark border-primary shadow-lg shadow-primary/20' 
                  : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                }`}
              >
                <span className="material-icons-round text-sm">group</span>
                {dep.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
          {weekDays.map((day: any) => (
            <button 
              key={day.fullDate}
              onClick={() => setSelectedDate(day.fullDate)}
              className={`flex flex-col items-center min-w-[3.5rem] py-3 rounded-xl transition-all ${
                selectedDate === day.fullDate 
                  ? 'bg-primary text-background-dark ring-4 ring-primary/20 scale-105' 
                  : 'bg-slate-200 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className={`text-[10px] mb-1 uppercase font-bold ${selectedDate === day.fullDate ? 'text-background-dark' : 'text-slate-500'}`}>
                {day.day}
              </span>
              <span className={`font-semibold ${selectedDate === day.fullDate ? 'text-lg leading-none' : ''}`}>{day.date}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 space-y-4">
        {medicationStatuses.length === 0 ? (
          <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons-round text-primary text-4xl">
                {isProfileEmpty ? 'person_pin' : 'waving_hand'}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {isProfileEmpty ? 'Complete Your Profile' : 'Welcome to MedLog!'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 px-4 leading-relaxed">
              {isProfileEmpty 
                ? 'To get started with medication tracking, please set up your profile name first.'
                : 'Track your medications, get reminders, and stay consistent. Start by adding your first medication.'}
            </p>
            <button 
              onClick={isProfileEmpty ? onProfileClick : onAddClick}
              className="bg-primary text-background-dark font-bold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 mx-auto"
            >
              <span className="material-icons-round">
                {isProfileEmpty ? 'account_circle' : 'add'}
              </span>
              {isProfileEmpty ? 'Setup My Profile' : 'Add First Medication'}
            </button>
          </div>
        ) : (
          medicationStatuses.map(med => {
            const isFullyTaken = med.isFullyTaken;
            const remainingDoses = med.dosesRemaining;
            
            return (
              <div key={med.id} className={`bg-white dark:bg-card-dark border border-slate-200 dark:border-primary/10 rounded-xl p-5 shadow-sm transition-opacity ${isFullyTaken ? 'opacity-60 grayscale-[0.2]' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${isFullyTaken ? 'bg-slate-200 dark:bg-slate-800' : 'bg-primary/10'}`}>
                      <span className={`material-symbols-outlined text-3xl ${isFullyTaken ? 'text-slate-400' : 'text-primary'}`}>
                        {med.type === 'Syringe' ? 'colorize' : 'medication'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg leading-tight">{med.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-bold">
                        {med.dosage}{med.dosageUnit || 'mg'} • {med.frequency}x Daily
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isFullyTaken ? (
                      <div className="flex flex-col items-end">
                        <span className="material-icons-round text-primary">check_circle</span>
                        <span className="text-[10px] uppercase font-bold text-primary mt-1">Complete</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Upcoming</span>
                        <p className="text-lg font-bold">{med.calculatedNextDose}</p>
                      </>
                    )}
                  </div>
                </div>

                {med.frequency > 1 && (
                  <div className="flex gap-2 mb-4">
                    {Array.from({ length: med.frequency }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1.5 flex-1 rounded-full ${i < med.logsForDay.length ? 'bg-primary' : 'bg-slate-200 dark:bg-white/5'}`}
                      />
                    ))}
                  </div>
                )}

                {remainingDoses > 0 && (
                  <button 
                    onClick={() => onMarkAsTaken(med.id, selectedDate)}
                    className="w-full bg-primary hover:brightness-105 active:scale-[0.98] text-background-dark font-bold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                  >
                    <span className="material-icons-round text-xl">check_circle</span>
                    {med.frequency > 1 ? `Dose ${med.logsForDay.length + 1} Taken` : 'Dose Taken'}
                  </button>
                )}
              </div>
            );
          })
        )}
      </main>

      {medications.length > 0 && (
        <section className="px-6 mt-8">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                <h4 className="font-bold text-lg leading-none">Overall Progress</h4>
                <span className="text-xs font-bold text-primary uppercase">{progressPercent}%</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2.5 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(19,236,128,0.5)] transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">
                  {totalDosesScheduled - remainingCount}/{totalDosesScheduled}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
