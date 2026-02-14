
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ScheduleView } from './components/ScheduleView';
import { HistoryView } from './components/HistoryView';
import { MedicationListView } from './components/MedicationListView';
import { AlertsView } from './components/AlertsView';
import { AddMedicationModal } from './components/AddMedicationModal';
import { ProfileModal } from './components/ProfileModal';
import { TabType, Medication, IntakeLog, UserProfile, Dependent } from './types';

const STORAGE_KEY = 'medlog_pro_data_v1';

const App: React.FC = () => {
  // Initialization from LocalStorage - Start with empty arrays for true first-time experience
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_meds`);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [logs, setLogs] = useState<IntakeLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
    return saved ? JSON.parse(saved) : [];
  });

  const [dependents, setDependents] = useState<Dependent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_dependents`);
    return saved ? JSON.parse(saved) : [];
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
    return saved ? JSON.parse(saved) : { 
      name: '', 
      email: '',
      phone: '',
      bloodType: 'Unknown',
      allergies: 'None'
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [selectedDependentId, setSelectedDependentId] = useState<string | 'self'>('self');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; sub: string } | null>(null);
  const [pushNotification, setPushNotification] = useState<{ title: string; body: string } | null>(null);

  // Helper to check if profile is set up
  const isProfileSetup = useMemo(() => userProfile.name.trim().length > 0, [userProfile.name]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_meds`, JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_dependents`, JSON.stringify(dependents));
  }, [dependents]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(userProfile));
  }, [userProfile]);

  const showToast = (message: string, sub: string) => {
    setToast({ message, sub });
    setTimeout(() => setToast(null), 3000);
  };

  const triggerPushNotification = (title: string, body: string) => {
    setPushNotification({ title, body });
    setTimeout(() => {
      setPushNotification(prev => prev?.title === title ? null : prev);
    }, 10000);
  };

  const handleOpenAddMedication = () => {
    if (!isProfileSetup) {
      showToast('Profile Required', 'Please set up your name first');
      setIsProfileModalOpen(true);
      return;
    }
    setEditingMedication(null);
    setIsAddModalOpen(true);
  };

  const handleMarkAsTaken = useCallback((medId: string, dateStr: string) => {
    const med = medications.find(m => m.id === medId);
    if (!med) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newLog: IntakeLog = {
      id: Math.random().toString(36).substr(2, 9),
      medicationId: medId,
      medicationName: med.name,
      time: timeStr,
      date: dateStr,
      status: 'Confirmed',
      dependentId: med.dependentId
    };
    
    setLogs(prev => [newLog, ...prev]);

    if (dateStr === new Date().toISOString().split('T')[0]) {
      setMedications(prev => prev.map(m => 
        m.id === medId 
          ? { ...m, lastTaken: `${timeStr} today` } 
          : m
      ));
    }

    showToast('Dose Logged', `Recorded ${med.name} at ${timeStr}`);
  }, [medications]);

  const handleSaveMedication = (data: Partial<Medication>) => {
    if (!data.name) {
      showToast('Error', 'Medication name is required');
      return;
    }

    if (data.id) {
        setMedications(prev => prev.map(m => m.id === data.id ? {
            ...m,
            name: data.name!,
            dosage: data.dosage || m.dosage,
            dosageUnit: data.dosageUnit || m.dosageUnit,
            type: data.type || m.type,
            category: data.category || m.category,
            frequency: data.frequency || m.frequency,
            scheduledTimes: data.scheduledTimes || m.scheduledTimes,
            dependentId: data.dependentId === 'self' ? undefined : data.dependentId
        } : m));
        showToast('Updated', `${data.name} changes saved`);
    } else {
        const newMed: Medication = {
          id: Math.random().toString(36).substr(2, 9),
          name: data.name,
          dosage: data.dosage || '10',
          dosageUnit: data.dosageUnit || 'mg',
          type: data.type || 'Tablet',
          category: data.category || 'GENERAL',
          frequency: data.frequency || 1,
          interval: data.frequency && data.frequency > 1 ? `Every ${Math.floor(24/data.frequency)}h` : 'Once Daily',
          scheduledTimes: data.scheduledTimes || ["09:00 AM"],
          nextDose: data.scheduledTimes ? data.scheduledTimes[0] : '09:00 AM',
          status: 'active',
          dependentId: data.dependentId === 'self' ? undefined : data.dependentId
        };
        setMedications(prev => [newMed, ...prev]);
        showToast('Success', `${data.name} added to schedule`);
    }

    setIsAddModalOpen(false);
    setEditingMedication(null);
  };

  const handleEditClick = (med: Medication) => {
    setEditingMedication(med);
    setIsAddModalOpen(true);
  };

  const handleDeleteMedication = (id: string) => {
    const med = medications.find(m => m.id === id);
    setMedications(prev => prev.filter(m => m.id !== id));
    showToast('Deleted', `${med?.name || 'Medication'} removed`);
  };

  const handleSaveProfile = (profile: UserProfile, newDependents?: Dependent[]) => {
    setUserProfile(profile);
    if (newDependents) setDependents(newDependents);
    setIsProfileModalOpen(false);
    showToast('Profile Updated', 'Information saved successfully');
  };

  const handleResetApp = () => {
    setMedications([]);
    setLogs([]);
    setDependents([]);
    setUserProfile({
      name: '',
      email: '',
      phone: '',
      bloodType: 'Unknown',
      allergies: 'None'
    });
    
    localStorage.removeItem(`${STORAGE_KEY}_meds`);
    localStorage.removeItem(`${STORAGE_KEY}_logs`);
    localStorage.removeItem(`${STORAGE_KEY}_dependents`);
    localStorage.removeItem(`${STORAGE_KEY}_profile`);
    
    setIsProfileModalOpen(false);
    showToast('App Reset', 'All your data has been permanently cleared.');
  };

  const filteredMedications = useMemo(() => {
    if (selectedDependentId === 'self') return medications.filter(m => !m.dependentId);
    return medications.filter(m => m.dependentId === selectedDependentId);
  }, [medications, selectedDependentId]);

  const filteredLogs = useMemo(() => {
    if (selectedDependentId === 'self') return logs.filter(l => !l.dependentId);
    return logs.filter(l => l.dependentId === selectedDependentId);
  }, [logs, selectedDependentId]);

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return (
          <ScheduleView 
            medications={filteredMedications} 
            onMarkAsTaken={handleMarkAsTaken} 
            onAddClick={handleOpenAddMedication}
            onProfileClick={() => setIsProfileModalOpen(true)}
            logs={filteredLogs}
            dependents={dependents}
            selectedDependentId={selectedDependentId}
            onDependentChange={setSelectedDependentId}
            userName={userProfile.name || 'Me'}
          />
        );
      case 'history':
        return <HistoryView logs={filteredLogs} />;
      case 'list':
        return (
          <MedicationListView 
            medications={filteredMedications} 
            logs={logs}
            onAddClick={handleOpenAddMedication}
            onEditClick={handleEditClick}
            onDeleteMed={handleDeleteMedication}
          />
        );
      case 'alerts':
        return (
          <AlertsView 
            onProfileClick={() => setIsProfileModalOpen(true)} 
            onShowToast={showToast}
            onTriggerPush={triggerPushNotification}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="dark">
      {pushNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[100] animate-in slide-in-from-top duration-500">
          <div className="bg-white/95 dark:bg-card-dark/95 ios-blur border border-primary/20 rounded-2xl p-4 shadow-2xl flex items-start gap-4 ring-1 ring-black/5">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-background-dark shadow-lg">
              <span className="material-icons-round">medical_services</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{pushNotification.title}</h4>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] text-slate-400 font-bold uppercase">Now</span>
                   <button onClick={() => setPushNotification(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                      <span className="material-icons-round text-sm">close</span>
                   </button>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{pushNotification.body}</p>
              <div className="flex gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
                <button 
                  onClick={() => setPushNotification(null)}
                  className="text-[11px] font-bold text-primary uppercase"
                >
                  Mark Taken
                </button>
                <button 
                  onClick={() => setPushNotification(null)}
                  className="text-[11px] font-bold text-slate-400 uppercase"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>

      {isAddModalOpen && (
        <AddMedicationModal 
          onClose={() => {
              setIsAddModalOpen(false);
              setEditingMedication(null);
          }} 
          onSave={handleSaveMedication}
          dependents={dependents}
          initialData={editingMedication || undefined}
          userName={userProfile.name}
        />
      )}

      {isProfileModalOpen && (
        <ProfileModal 
          profile={userProfile}
          dependents={dependents}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={handleSaveProfile}
          onReset={handleResetApp}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[60] animate-in slide-in-from-bottom duration-300 pointer-events-none">
          <div className="bg-slate-900/95 dark:bg-card-dark/95 backdrop-blur-xl border border-primary/20 text-white p-4 rounded-2xl flex items-center gap-4 shadow-2xl pointer-events-auto">
            <div className="bg-primary text-slate-900 rounded-full h-8 w-8 flex items-center justify-center shrink-0">
              <span className="material-icons-round text-xl">check</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{toast.message}</p>
              <p className="text-[10px] opacity-80 truncate">{toast.sub}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-xs font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity px-2">
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
