
import React, { useState, useRef, useEffect } from 'react';
import { Medication, Dependent } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface AddMedicationModalProps {
  onClose: () => void;
  onSave: (data: Partial<Medication>) => void;
  dependents: Dependent[];
  initialData?: Medication;
  userName: string;
}

/**
 * Generates sensible default times based on frequency
 */
const getSuggestedTimes = (freq: number): string[] => {
  switch (freq) {
    case 1: return ["09:00 AM"];
    case 2: return ["08:00 AM", "08:00 PM"];
    case 3: return ["08:00 AM", "02:00 PM", "08:00 PM"];
    case 4: return ["08:00 AM", "12:00 PM", "04:00 PM", "08:00 PM"];
    case 5: return ["07:00 AM", "11:00 AM", "03:00 PM", "07:00 PM", "11:00 PM"];
    case 6: return ["06:00 AM", "10:00 AM", "02:00 PM", "06:00 PM", "10:00 PM", "02:00 AM"];
    default: return ["09:00 AM"];
  }
};

export const AddMedicationModal: React.FC<AddMedicationModalProps> = ({ onClose, onSave, dependents, initialData, userName }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [dosage, setDosage] = useState(initialData?.dosage || '');
  const [dosageUnit, setDosageUnit] = useState(initialData?.dosageUnit || 'mg');
  const [category, setCategory] = useState(initialData?.category || 'GENERAL');
  const [frequency, setFrequency] = useState(initialData?.frequency || 1);
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(initialData?.scheduledTimes || ["09:00 AM"]);
  const [dependentId, setDependentId] = useState<string>(initialData?.dependentId || 'self');
  const [medType, setMedType] = useState<Medication['type']>(initialData?.type || 'Tablet');
  const [isScanning, setIsScanning] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-update times when frequency changes, but only if not in edit mode or if manually adjusted
  useEffect(() => {
    if (!initialData || frequency !== initialData.frequency) {
        setScheduledTimes(getSuggestedTimes(frequency));
    }
  }, [frequency, initialData]);

  // Ensure 'ml' is used for liquid/syringe types by default
  const handleMedTypeChange = (type: Medication['type']) => {
    setMedType(type);
    if (type === 'Liquid' || type === 'Syringe') {
      setDosageUnit('ml');
    } else if (dosageUnit === 'ml') {
      setDosageUnit('mg');
    }
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
            {
              text: "Analyze this medication label. Extract the name, dosage value (number only), dosage unit (mg, ml, mcg, g, drops), category, medication form (Tablet, Capsule, Liquid, Syringe, Softgel), and recommended frequency. If it is a liquid or syringe, prefer 'ml' as the unit. Return as JSON.",
            },
          ],
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              dosageValue: { type: Type.STRING },
              dosageUnit: { type: Type.STRING },
              form: { type: Type.STRING },
              category: { type: Type.STRING },
              frequency: { type: Type.INTEGER },
            },
            required: ["name", "dosageValue", "dosageUnit", "form", "category", "frequency"],
          },
        },
      });

      const result = JSON.parse(response.text || '{}');
      if (result.name) setName(result.name);
      if (result.dosageValue) setDosage(result.dosageValue);
      if (result.dosageUnit) setDosageUnit(result.dosageUnit.toLowerCase());
      if (result.category) setCategory(result.category.toUpperCase());
      if (result.frequency) setFrequency(result.frequency);
      if (result.form) setMedType(result.form as any);
      
    } catch (error) {
      console.error("Scanning failed:", error);
      alert("Failed to scan label. Please enter details manually.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      name,
      dosage,
      dosageUnit,
      type: medType,
      category,
      frequency,
      scheduledTimes,
      dependentId
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white dark:bg-card-dark w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200 border border-white/5">
        <header className="px-6 py-4 border-b border-slate-100 dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-800/20">
          <h2 className="font-bold text-lg">{initialData ? 'Edit Medication' : 'Add Medication'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-icons-round">close</span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh] hide-scrollbar">
          {/* AI Scanner */}
          {!initialData && (
            <div className="flex flex-col items-center justify-center py-4 px-2 mb-2 bg-primary/5 rounded-2xl border border-primary/20 border-dashed">
               <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all ${isScanning ? 'bg-primary/40 animate-pulse' : 'bg-primary/20'}`}>
                  <span className="material-icons-round text-primary text-2xl">
                    {isScanning ? 'sync' : 'photo_camera'}
                  </span>
               </div>
               <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Smart Label Scanner</p>
               <button 
                type="button"
                disabled={isScanning}
                onClick={handleScanClick}
                className="px-6 py-2 bg-primary text-background-dark rounded-full text-xs font-bold shadow-lg shadow-primary/20 hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
               >
                 {isScanning ? 'Analyzing Label...' : 'Scan Medication Bottle'}
               </button>
               <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" capture="environment" className="hidden" />
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Who is this for?</label>
            <select 
              value={dependentId}
              onChange={(e) => setDependentId(e.target.value)}
              className="w-full bg-white text-black border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none font-medium"
            >
              <option value="self">Me ({userName || 'My Profile'})</option>
              {dependents.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Medication Name</label>
            <input 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lisinopril or Cough Syrup"
              className="w-full bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              type="text"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Dosage Amount</label>
              <div className="flex gap-2">
                <input 
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 10"
                  className="flex-1 bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  type="text"
                />
                <select 
                  value={dosageUnit}
                  onChange={(e) => setDosageUnit(e.target.value)}
                  className="w-20 bg-white text-black border border-slate-200 rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-xs font-bold"
                >
                  <option value="mg">mg</option>
                  <option value="ml">ml</option>
                  <option value="mcg">mcg</option>
                  <option value="g">g</option>
                  <option value="pills">pills</option>
                  <option value="drop">drop</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Medication Form</label>
              <select 
                value={medType}
                onChange={(e) => handleMedTypeChange(e.target.value as any)}
                className="w-full bg-white text-black border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none font-medium"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Liquid">Liquid (Cup)</option>
                <option value="Syringe">Liquid (Syringe)</option>
                <option value="Softgel">Softgel</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Frequency & Schedule</label>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Auto-calculated</span>
            </div>
            
            <select 
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full bg-white text-black border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none font-bold"
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} Dose{n > 1 ? 's' : ''} per Day</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2 mt-2">
              {scheduledTimes.map((time, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-white/10 p-2 rounded-lg">
                  <span className="material-icons-round text-xs text-primary">schedule</span>
                  <input 
                    type="text" 
                    value={time} 
                    onChange={(e) => {
                      const newTimes = [...scheduledTimes];
                      newTimes[idx] = e.target.value;
                      setScheduledTimes(newTimes);
                    }}
                    className="bg-transparent border-none p-0 text-[11px] font-bold w-full focus:ring-0"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Category</label>
            <input 
              value={category}
              onChange={(e) => setCategory(e.target.value.toUpperCase())}
              placeholder="e.g. SUPPLEMENT or ANTIBIOTIC"
              className="w-full bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              type="text"
            />
          </div>

          <button 
            type="submit"
            disabled={isScanning}
            className="w-full bg-primary hover:brightness-105 text-background-dark font-bold py-4 rounded-xl mt-4 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isScanning ? 'Processing...' : (
              <>
                <span className="material-icons-round text-xl">{initialData ? 'save' : 'add_task'}</span>
                {initialData ? 'Save Changes' : 'Add to Schedule'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
