
import { Medication, IntakeLog, DayProgress } from './types';

export const INITIAL_MEDICATIONS: Medication[] = [
  // Fixed missing dosageUnit and scheduledTimes properties
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10',
    dosageUnit: 'mg',
    type: 'Tablet',
    category: 'BLOOD PRESSURE',
    frequency: 2,
    interval: 'Every 12h',
    nextDose: '02:30 PM',
    scheduledTimes: ['08:00 AM', '08:00 PM'],
    lastTaken: '02:30 AM today',
    status: 'active',
  },
  // Fixed missing dosageUnit and scheduledTimes properties
  {
    id: '2',
    name: 'Metformin',
    dosage: '500',
    dosageUnit: 'mg',
    type: 'Capsule',
    category: 'DIABETES',
    frequency: 1,
    interval: 'Every 24h',
    nextDose: '06:00 PM',
    scheduledTimes: ['06:00 PM'],
    status: 'active',
  },
  // Fixed missing dosageUnit and scheduledTimes properties
  {
    id: '3',
    name: 'Atorvastatin',
    dosage: '20',
    dosageUnit: 'mg',
    type: 'Tablet',
    category: 'CHOLESTEROL',
    frequency: 1,
    interval: 'Evening only',
    nextDose: '09:00 PM',
    scheduledTimes: ['09:00 PM'],
    status: 'active',
  },
  // Fixed missing dosageUnit and scheduledTimes properties
  {
    id: '4',
    name: 'Vitamin D3',
    dosage: '1000',
    dosageUnit: 'IU',
    type: 'Softgel',
    category: 'SUPPLEMENT',
    frequency: 1,
    interval: 'Morning',
    nextDose: '08:00 AM',
    scheduledTimes: ['08:00 AM'],
    lastTaken: '07:15 AM today',
    status: 'active',
  },
];

export const INITIAL_LOGS: IntakeLog[] = [
  {
    id: 'l1',
    medicationId: '1',
    medicationName: 'Lisinopril 10mg',
    time: '08:30 AM',
    date: '2023-10-26',
    status: 'Confirmed'
  },
  {
    id: 'l2',
    medicationId: '4',
    medicationName: 'Multivitamin',
    time: '08:32 AM',
    date: '2023-10-26',
    status: 'Confirmed'
  },
  {
    id: 'l3',
    medicationId: '2',
    medicationName: 'Metformin',
    time: '12:15 PM',
    date: '2023-10-26',
    status: 'Confirmed'
  },
  {
    id: 'l4',
    medicationId: '4',
    medicationName: 'Magnesium Glycinate',
    time: '10:45 PM',
    date: '2023-10-25',
    status: 'Confirmed'
  },
  {
    id: 'l5',
    medicationId: '1',
    medicationName: 'Lisinopril 10mg',
    time: '08:28 AM',
    date: '2023-10-25',
    status: 'Confirmed'
  }
];

export const WEEK_DAYS: DayProgress[] = [
  { day: 'Mon', date: 12, isActive: false },
  { day: 'Tue', date: 13, isActive: false },
  { day: 'Wed', date: 14, isActive: true },
  { day: 'Thu', date: 15, isActive: false },
  { day: 'Fri', date: 16, isActive: false },
];
