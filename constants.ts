import { EntryType } from "./types";

export const APP_STORAGE_KEY = 'agency-log-v1';

export const MOOD_OPTIONS = ['😊', '😐', '😭', '😡', '😴', '✨', '🌸', '💀'];

export const TYPE_CONFIG = {
  [EntryType.SLEEP]: { label: 'Sleep', icon: '🛌', color: 'bg-agency-blue' },
  [EntryType.FOOD]: { label: 'Food', icon: '🍱', color: 'bg-agency-pink' },
  [EntryType.DIGITAL]: { label: 'Digital', icon: '📱', color: 'bg-agency-purple' },
  [EntryType.OUTPUT]: { label: 'Output', icon: '⭐', color: 'bg-yellow-200' },
};

export const MAX_DAYS = 21;
