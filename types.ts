
export type TabType = 'schedule' | 'history' | 'list' | 'alerts';

export interface Dependent {
  id: string;
  name: string;
  relationship: string;
  avatar?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  dosageUnit: string;
  type: 'Tablet' | 'Capsule' | 'Softgel' | 'Liquid' | 'Syringe';
  category: string;
  frequency: number; // times per day
  interval: string;
  nextDose: string;
  scheduledTimes: string[]; // List of times like ["08:00 AM", "08:00 PM"]
  lastTaken?: string;
  status: 'active' | 'paused' | 'completed';
  color?: string;
  dependentId?: string; // If undefined, it belongs to the main user
}

export interface IntakeLog {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string;
  date: string; // ISO format
  status: 'Confirmed' | 'Missed' | 'Late';
  notes?: string;
  dependentId?: string;
}

export interface DayProgress {
  day: string;
  date: number;
  isActive: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  bloodType: string;
  allergies: string;
}
