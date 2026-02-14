
import React, { useState } from 'react';

interface AlertsViewProps {
  onProfileClick: () => void;
  onShowToast: (msg: string, sub: string) => void;
  onTriggerPush: (title: string, body: string) => void;
}

const NOTIFICATION_SOUNDS = [
  { id: 'chime', name: 'Modern Chime', icon: 'notifications_active' },
  { id: 'pulsar', name: 'Digital Pulsar', icon: 'sensors' },
  { id: 'nature', name: 'Nature Echo', icon: 'eco' },
  { id: 'staccato', name: 'Fast Staccato', icon: 'bolt' },
  { id: 'gentle', name: 'Gentle Rise', icon: 'wb_sunny' },
];

const SNOOZE_OPTIONS = ['5 mins', '10 mins', '15 mins', '30 mins', '1 hour'];

export const AlertsView: React.FC<AlertsViewProps> = ({ onProfileClick, onShowToast, onTriggerPush }) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [criticalEnabled, setCriticalEnabled] = useState(true);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState('chime');
  const [selectedSnooze, setSelectedSnooze] = useState('10 mins');

  const handleTestNotification = (medName: string) => {
    onTriggerPush(`Time for ${medName}`, `It's time for your scheduled dose of ${medName}. Please take 1 tablet with water.`);
  };

  return (
    <div className="pt-12 px-6">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Settings & Alerts</h1>
        <button 
          onClick={onProfileClick}
          className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:ring-2 hover:ring-primary/40 transition-all active:scale-95"
        >
          <span className="material-icons-round text-primary">person</span>
        </button>
      </header>

      <section className="mb-8">
        <h2 className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3 ml-1">General Notifications</h2>
        <div className="bg-white dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-200 dark:border-primary/10">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="material-icons-round text-blue-500 text-lg">notifications_active</span>
              </div>
              <span className="text-sm font-medium">Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                checked={pushEnabled} 
                onChange={() => setPushEnabled(!pushEnabled)}
                className="sr-only" 
                type="checkbox"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${pushEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'}`}></div>
              <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${pushEnabled ? 'translate-x-5' : 'translate-x-0'} shadow-sm`}></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <span className="material-icons-round text-red-500 text-lg">priority_high</span>
              </div>
              <span className="text-sm font-medium">Critical Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                checked={criticalEnabled} 
                onChange={() => setCriticalEnabled(!criticalEnabled)}
                className="sr-only" 
                type="checkbox"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${criticalEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-800'}`}></div>
              <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${criticalEnabled ? 'translate-x-5' : 'translate-x-0'} shadow-sm`}></div>
            </label>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="flex justify-between items-end mb-4 ml-1">
          <h2 className="text-[11px] font-bold text-primary uppercase tracking-widest">Active Reminders</h2>
          <span className="text-[10px] text-slate-500">Auto-syncing enabled</span>
        </div>
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-primary/10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <span className="material-icons-round text-amber-500 text-2xl">wb_sunny</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">Vitamin D3</h3>
                  <p className="text-xs text-slate-500">1000 IU Softgel</p>
                </div>
              </div>
              <button 
                onClick={() => handleTestNotification('Vitamin D3')}
                className="px-3 py-1.5 bg-primary/20 text-primary text-[10px] font-bold rounded-full hover:bg-primary/30 transition-colors"
              >
                TEST
              </button>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center gap-2">
                <span className="material-icons-round text-primary text-xs">schedule</span>
                <span className="text-[10px] font-bold uppercase tracking-wide">Next: 8:00 PM Tonight</span>
              </div>
              <span className="text-[9px] text-slate-400">Workflow Active</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-primary/10 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-icons-round text-primary text-2xl">water_drop</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">Lisinopril</h3>
                  <p className="text-xs text-slate-500">10mg Oral Tablet</p>
                </div>
              </div>
              <button 
                onClick={() => handleTestNotification('Lisinopril')}
                className="px-3 py-1.5 bg-primary text-background-dark text-[10px] font-bold rounded-full hover:opacity-90 transition-opacity"
              >
                TEST
              </button>
            </div>
          </div>
        </div>
      </section>

      <button 
        onClick={() => setIsSoundModalOpen(true)}
        className="w-full py-4 flex items-center justify-between text-slate-500 hover:text-primary transition-colors border-t border-slate-200 dark:border-primary/10 pt-6 mt-8"
      >
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">Notification Sounds & Snooze</span>
          <span className="text-[10px] opacity-60 mt-0.5">{NOTIFICATION_SOUNDS.find(s => s.id === selectedSound)?.name} • {selectedSnooze}</span>
        </div>
        <span className="material-icons-round text-sm">chevron_right</span>
      </button>

      {/* Sound & Snooze Modal */}
      {isSoundModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSoundModalOpen(false)}></div>
          <div className="bg-white dark:bg-card-dark w-full max-w-[360px] rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/5">
            <header className="px-6 py-4 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-800/20">
              <h2 className="font-bold text-lg">Sound & Snooze</h2>
              <button onClick={() => setIsSoundModalOpen(false)} className="text-slate-400 hover:text-primary transition-colors">
                <span className="material-icons-round">close</span>
              </button>
            </header>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] hide-scrollbar">
              <section>
                <label className="text-xs font-bold text-primary uppercase tracking-widest block mb-4">Notification Tone</label>
                <div className="space-y-2">
                  {NOTIFICATION_SOUNDS.map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => {
                        setSelectedSound(sound.id);
                        onShowToast('Sound Selected', `Tone changed to ${sound.name}`);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        selectedSound === sound.id 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="material-icons-round text-lg">{sound.icon}</span>
                      <span className="text-sm font-medium flex-1 text-left">{sound.name}</span>
                      {selectedSound === sound.id && <span className="material-icons-round text-sm">check_circle</span>}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="text-xs font-bold text-primary uppercase tracking-widest block mb-4">Default Snooze Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  {SNOOZE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setSelectedSnooze(opt)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                        selectedSnooze === opt 
                        ? 'bg-primary text-background-dark border-primary' 
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <footer className="p-6 pt-0">
              <button 
                onClick={() => setIsSoundModalOpen(false)}
                className="w-full bg-primary hover:brightness-105 text-background-dark font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20"
              >
                Apply Changes
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
