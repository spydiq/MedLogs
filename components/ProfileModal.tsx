
import React, { useState } from 'react';
import { UserProfile, Dependent } from '../types';

interface ProfileModalProps {
  profile: UserProfile;
  dependents: Dependent[];
  onClose: () => void;
  onSave: (profile: UserProfile, dependents: Dependent[]) => void;
  onReset: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ profile, dependents: initialDependents, onClose, onSave, onReset }) => {
  const isSetupNeeded = !profile.name || profile.name.trim() === '';
  const [isEditing, setIsEditing] = useState(isSetupNeeded);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone || '');
  const [bloodType, setBloodType] = useState(profile.bloodType || 'Unknown');
  const [allergies, setAllergies] = useState(profile.allergies || 'None');
  const [dependents, setDependents] = useState<Dependent[]>(initialDependents);
  const [newDepName, setNewDepName] = useState('');
  
  // State for the double-confirmation reset button
  const [resetConfirmState, setResetConfirmState] = useState<'idle' | 'confirming'>('idle');

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter your name to continue.");
      return;
    }
    onSave({ name, email, phone, bloodType, allergies }, dependents);
    setIsEditing(false);
  };

  const addDependent = () => {
    if (!newDepName) return;
    const newDep: Dependent = {
      id: Math.random().toString(36).substr(2, 9),
      name: newDepName,
      relationship: 'Family'
    };
    setDependents([...dependents, newDep]);
    setNewDepName('');
  };

  const removeDependent = (id: string) => {
    setDependents(dependents.filter(d => d.id !== id));
  };

  const handleResetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (resetConfirmState === 'idle') {
      setResetConfirmState('confirming');
      // Auto-cancel confirmation after 5 seconds if not clicked again
      setTimeout(() => setResetConfirmState('idle'), 5000);
    } else {
      onReset();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={isSetupNeeded ? undefined : onClose}></div>
      <div className="bg-white dark:bg-card-dark w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/5">
        <header className="px-6 py-4 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-800/20">
          <h2 className="font-bold text-lg">{isEditing ? (isSetupNeeded ? 'Welcome to MedLog' : 'Edit Profile') : 'User Profile'}</h2>
          {!isSetupNeeded && (
            <button onClick={onClose} className="text-slate-400 hover:text-primary transition-colors">
              <span className="material-icons-round">close</span>
            </button>
          )}
        </header>

        <main className="p-6 space-y-6 overflow-y-auto max-h-[70vh] hide-scrollbar">
          {isSetupNeeded && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl text-center mb-2">
              <p className="text-xs font-bold text-primary uppercase">Identity Verification</p>
              <p className="text-[11px] text-slate-500 mt-1">Please enter your name to personalize your medication schedule.</p>
            </div>
          )}

          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30 shadow-inner">
                <span className="material-icons-round text-primary text-5xl">person</span>
              </div>
            </div>
            {!isEditing && (
              <div className="mt-3 text-center">
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="text-sm text-slate-500">{email || 'No email set'}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Full Name *</label>
                  <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-display"
                    type="text"
                    autoFocus
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Email Address</label>
                  <input 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-display"
                    type="email"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Phone Number</label>
                    <input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm font-display"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Blood Type</label>
                    <select 
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full bg-white dark:bg-card-dark text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-primary/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none font-display"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {!isSetupNeeded && (
                  <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1 mb-2 block">Family Members</label>
                    <div className="space-y-2 mb-4">
                      {dependents.map(dep => (
                        <div key={dep.id} className="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-2 px-3 rounded-lg border border-slate-100 dark:border-white/5">
                          <span className="text-sm">{dep.name}</span>
                          <button onClick={() => removeDependent(dep.id)} className="text-red-400 hover:text-red-500">
                            <span className="material-icons-round text-sm">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        value={newDepName}
                        onChange={(e) => setNewDepName(e.target.value)}
                        placeholder="Family member name"
                        className="flex-1 bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl px-4 py-2 text-sm font-display"
                      />
                      <button onClick={addDependent} className="bg-primary text-background-dark p-2 rounded-xl">
                        <span className="material-icons-round">add</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-slate-50 dark:bg-primary/5 rounded-2xl p-4 border border-slate-100 dark:border-primary/10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 font-display">{phone || 'Not set'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Type</span>
                      <span className="font-bold text-red-500 flex items-center gap-1 font-display">
                        <span className="material-icons-round text-sm">water_drop</span>
                        {bloodType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1 border-t border-slate-200 dark:border-primary/10 pt-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Family Members</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {dependents.length === 0 && <span className="text-xs text-slate-500 italic font-display">None added</span>}
                      {dependents.map(d => (
                        <span key={d.id} className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-primary/20 font-display">
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-6 border-t border-red-500/10">
                  <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 ml-1">Danger Zone</h4>
                  <button 
                    type="button"
                    onClick={handleResetClick}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 ${
                      resetConfirmState === 'idle' 
                      ? 'bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500/10' 
                      : 'bg-red-500 border border-red-600 text-white shadow-lg shadow-red-500/40 animate-pulse'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-bold">
                        {resetConfirmState === 'idle' ? 'Reset All Data' : 'Are you sure?'}
                      </p>
                      <p className={`text-[10px] ${resetConfirmState === 'idle' ? 'opacity-70' : 'opacity-90'}`}>
                        {resetConfirmState === 'idle' ? 'Clear all medications and logs' : 'Click again to permanently delete'}
                      </p>
                    </div>
                    <span className="material-icons-round">
                      {resetConfirmState === 'idle' ? 'delete_forever' : 'warning'}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </main>

        <footer className="p-6 pt-0 bg-slate-50/50 dark:bg-slate-800/10">
          {isEditing ? (
            <div className="flex gap-3">
              {!isSetupNeeded && (
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl transition-all font-display"
                >
                  Cancel
                </button>
              )}
              <button 
                type="button"
                onClick={handleSave}
                className="flex-1 bg-primary hover:brightness-105 text-background-dark font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/10 font-display"
              >
                {isSetupNeeded ? 'Complete Setup' : 'Save'}
              </button>
            </div>
          ) : (
            <button 
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full bg-primary hover:brightness-105 text-background-dark font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/10 flex items-center justify-center gap-2 font-display"
            >
              <span className="material-icons-round text-lg">edit</span>
              Edit Profile & Family
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
