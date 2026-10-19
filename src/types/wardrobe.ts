export type Category = 
  | 'Tops'
  | 'Bottoms'
  | 'Full-Body'
  | 'Outerwear'
  | 'Shoes'
  | 'Accessories';

export const ALL_CATEGORIES: Category[] = [
  'Tops',
  'Bottoms',
  'Full-Body',
  'Outerwear',
  'Shoes',
  'Accessories'
];

export interface WardrobeItem {
  id: string;
  name: string;
  category: Category;
  color: string;
  brand: string;
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season';
  material?: string;
  image: string;
  pairedItemIds: string[]; // Bi-directionally synced with paired items
  tags: string[];
  dateAdded: string;
  notes?: string;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  occasion: string;
  isFavorite: boolean;
  createdAt: string;
  notes?: string;
  aiGenerated?: boolean;
}

export type DayOfWeek = 
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export type WeeklySchedule = Record<DayOfWeek, string | null>;

export interface UserSession {
  isLoggedIn: boolean;
  isOfflineMode: boolean;
  email: string | null;
  uid?: string | null;
  cloudSynced?: boolean;
}

export interface FeedbackLog {
  id: string;
  outfitName: string;
  reason: string;
  itemNames: string[];
  timestamp: string;
}

export interface AIPreference {
  rejectedPairKeys: string[]; // Format: "itemIdA:itemIdB" sorted
  feedbackLogs: FeedbackLog[];
}
