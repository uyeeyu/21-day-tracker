export enum EntryType {
  SLEEP = 'SLEEP',
  FOOD = 'FOOD',
  DIGITAL = 'DIGITAL',
  OUTPUT = 'OUTPUT'
}

export interface SleepData {
  bedTime: string;
  wakeTime: string;
  comment: string;
}

export interface FoodData {
  description: string;
  image?: string; // Base64
}

export interface DigitalData {
  durationMinutes: number;
  mood: string;
}

export interface OutputData {
  description: string;
}

export interface Entry {
  id: string;
  date: string; // ISO Date String (YYYY-MM-DD)
  timestamp: number;
  type: EntryType;
  data: SleepData | FoodData | DigitalData | OutputData;
  aiFeedback?: string;
}

export interface DayStats {
  date: string;
  mood: string; // Emoji
  entries: Entry[];
}

export interface AppState {
  startDate: string; // ISO Date String
  entries: Entry[];
  dailyMoods: Record<string, string>; // date -> emoji
}
