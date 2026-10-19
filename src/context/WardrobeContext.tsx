import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  WardrobeItem, 
  Outfit, 
  WeeklySchedule, 
  UserSession, 
  Category, 
  DayOfWeek,
  FeedbackLog,
  AIPreference,
  ALL_CATEGORIES 
} from '../types/wardrobe';
import { 
  INITIAL_WARDROBE_ITEMS, 
  INITIAL_SAVED_OUTFITS, 
  INITIAL_SCHEDULE 
} from '../data/mockWardrobe';
import { 
  addBidirectionalPair, 
  removeBidirectionalPair, 
  selectRandomFromOutfitHub,
  generateAIRouletteOutfit,
  getPairKey 
} from '../utils/pairingRules';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  writeBatch 
} from 'firebase/firestore';

interface WardrobeContextType {
  // Data
  items: WardrobeItem[];
  outfits: Outfit[];
  schedule: WeeklySchedule;
  session: UserSession;
  aiPreferences: AIPreference;
  
  // Navigation
  activeTab: 'home' | 'categories' | 'outfits' | 'schedule' | 'ai-features';
  selectedCategory: Category;
  selectedItemId: string | null;
  selectedItem: WardrobeItem | null;
  
  // Modals & State
  isOfflineWarningOpen: boolean;
  isUploadModalOpen: boolean;
  isNewOutfitModalOpen: boolean;
  isAssignScheduleModalOpen: boolean;
  scheduleAssignTargetDay: DayOfWeek | null;
  
  // Home Randomizer (picks from Outfit Hub)
  isRandomHubModalOpen: boolean;
  activeRandomHubOutfit: Outfit | null;
  triggerRandomHubOutfit: () => void;
  closeRandomHubModal: () => void;
  
  // AI Wardrobe Roulette (in AI Features)
  activeAIRouletteOutfit: Outfit | null;
  isSpinningAIRoulette: boolean;
  spinAIRoulette: () => void;
  saveAIRouletteToHub: (outfit: Outfit) => void;
  rejectAIRouletteOutfit: (outfit: Outfit, reason: string) => void;
  clearRejectedMemory: () => void;
  
  // Auth Actions
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  openOfflineWarning: () => void;
  confirmOfflineMode: () => void;
  cancelOfflineWarning: () => void;
  logout: () => void;
  
  // Navigation Actions
  setActiveTab: (tab: 'home' | 'categories' | 'outfits' | 'schedule' | 'ai-features') => void;
  setSelectedCategory: (cat: Category) => void;
  selectItem: (itemId: string | null) => void;
  
  // Wardrobe Operations
  toggleFavoriteOutfit: (outfitId: string) => void;
  addItem: (item: Omit<WardrobeItem, 'id' | 'dateAdded' | 'pairedItemIds'> & { pairedItemIds?: string[] }) => void;
  pairItems: (sourceId: string, targetId: string) => void;
  unpairItems: (sourceId: string, targetId: string) => void;
  saveOutfit: (name: string, itemIds: string[], occasion: string, notes?: string) => void;
  deleteOutfit: (outfitId: string) => void;
  assignOutfitToSchedule: (day: DayOfWeek, outfitId: string | null) => void;
  
  // Modal controllers
  setIsUploadModalOpen: (open: boolean) => void;
  setIsNewOutfitModalOpen: (open: boolean) => void;
  openScheduleAssignModal: (day: DayOfWeek) => void;
  closeScheduleAssignModal: () => void;
}

const STORAGE_KEYS = {
  ITEMS: 'aura_wardrobe_items_v2',
  OUTFITS: 'aura_wardrobe_outfits_v2',
  SCHEDULE: 'aura_wardrobe_schedule_v2',
  SESSION: 'aura_wardrobe_session_v2',
  AI_PREFS: 'aura_wardrobe_ai_prefs_v2',
};

const DEFAULT_AI_PREFERENCES: AIPreference = {
  rejectedPairKeys: [],
  feedbackLogs: []
};

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const checkAutostart = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('autostart') === '1';
    }
    return false;
  };

  // Local state with localStorage fallback
  const [items, setItems] = useState<WardrobeItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
      return stored ? JSON.parse(stored) : INITIAL_WARDROBE_ITEMS;
    } catch {
      return INITIAL_WARDROBE_ITEMS;
    }
  });

  const [outfits, setOutfits] = useState<Outfit[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.OUTFITS);
      return stored ? JSON.parse(stored) : INITIAL_SAVED_OUTFITS;
    } catch {
      return INITIAL_SAVED_OUTFITS;
    }
  });

  const [schedule, setSchedule] = useState<WeeklySchedule>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
      return stored ? JSON.parse(stored) : INITIAL_SCHEDULE;
    } catch {
      return INITIAL_SCHEDULE;
    }
  });

  const [aiPreferences, setAiPreferences] = useState<AIPreference>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AI_PREFS);
      return stored ? JSON.parse(stored) : DEFAULT_AI_PREFERENCES;
    } catch {
      return DEFAULT_AI_PREFERENCES;
    }
  });

  const [session, setSession] = useState<UserSession>(() => {
    if (checkAutostart()) {
      return { 
        isLoggedIn: true, 
        isOfflineMode: true, 
        email: 'offline.curator@local.vault',
        uid: 'offline-local-user',
        cloudSynced: false
      };
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
      return stored ? JSON.parse(stored) : { 
        isLoggedIn: false, 
        isOfflineMode: false, 
        email: null, 
        uid: null,
        cloudSynced: false
      };
    } catch {
      return { isLoggedIn: false, isOfflineMode: false, email: null, uid: null, cloudSynced: false };
    }
  });

  // Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'categories' | 'outfits' | 'schedule' | 'ai-features'>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Tops');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Modals
  const [isOfflineWarningOpen, setIsOfflineWarningOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNewOutfitModalOpen, setIsNewOutfitModalOpen] = useState(false);
  const [isAssignScheduleModalOpen, setIsAssignScheduleModalOpen] = useState(false);
  const [scheduleAssignTargetDay, setScheduleAssignTargetDay] = useState<DayOfWeek | null>(null);

  // Home Screen Randomizer (picks from Outfit Hub)
  const [isRandomHubModalOpen, setIsRandomHubModalOpen] = useState(false);
  const [activeRandomHubOutfit, setActiveRandomHubOutfit] = useState<Outfit | null>(null);

  // AI Wardrobe Roulette
  const [activeAIRouletteOutfit, setActiveAIRouletteOutfit] = useState<Outfit | null>(null);
  const [isSpinningAIRoulette, setIsSpinningAIRoulette] = useState(false);

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed saving items to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OUTFITS, JSON.stringify(outfits));
    } catch (e) {
      console.warn('Failed saving outfits to localStorage', e);
    }
  }, [outfits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    } catch (e) {
      console.warn('Failed saving schedule to localStorage', e);
    }
  }, [schedule]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_PREFS, JSON.stringify(aiPreferences));
    } catch (e) {
      console.warn('Failed saving AI prefs to localStorage', e);
    }
  }, [aiPreferences]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed saving session to localStorage', e);
    }
  }, [session]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user && !session.isOfflineMode) {
        setSession({
          isLoggedIn: true,
          isOfflineMode: false,
          email: user.email,
          uid: user.uid,
          cloudSynced: true
        });

        // Load data from Firestore
        await syncFromCloud(user.uid);
      }
    });

    return () => unsubscribe();
  }, [session.isOfflineMode]);

  // Sync from Cloud Firestore
  const syncFromCloud = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Fetch wardrobe items
        const itemsSnap = await getDocs(collection(db, 'users', userId, 'wardrobeItems'));
        if (!itemsSnap.empty) {
          const cloudItems: WardrobeItem[] = [];
          itemsSnap.forEach((d) => cloudItems.push(d.data() as WardrobeItem));
          setItems(cloudItems);
        }

        // Fetch outfits
        const outfitsSnap = await getDocs(collection(db, 'users', userId, 'outfits'));
        if (!outfitsSnap.empty) {
          const cloudOutfits: Outfit[] = [];
          outfitsSnap.forEach((d) => cloudOutfits.push(d.data() as Outfit));
          setOutfits(cloudOutfits);
        }

        // Fetch schedule
        const scheduleSnap = await getDoc(doc(db, 'users', userId, 'schedule', 'currentWeek'));
        if (scheduleSnap.exists()) {
          setSchedule(scheduleSnap.data() as WeeklySchedule);
        }

        // Fetch AI preferences
        const aiSnap = await getDoc(doc(db, 'users', userId, 'aiPreferences', 'prefs'));
        if (aiSnap.exists()) {
          setAiPreferences(aiSnap.data() as AIPreference);
        }
      } else {
        // Initialize Firestore with default seed data for this user
        await setDoc(userRef, {
          email: auth.currentUser?.email || 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Seed initial items
        for (const item of items) {
          await setDoc(doc(db, 'users', userId, 'wardrobeItems', item.id), {
            ...item,
            userId
          });
        }

        // Seed initial outfits
        for (const outfit of outfits) {
          await setDoc(doc(db, 'users', userId, 'outfits', outfit.id), {
            ...outfit,
            userId
          });
        }

        // Seed schedule
        await setDoc(doc(db, 'users', userId, 'schedule', 'currentWeek'), {
          ...schedule,
          userId
        });
      }
    } catch (err) {
      console.warn('Cloud sync error, falling back to local database:', err);
    }
  };

  // Sync to Cloud helper
  const syncItemToCloud = async (item: WardrobeItem) => {
    if (session.cloudSynced && session.uid) {
      try {
        await setDoc(doc(db, 'users', session.uid, 'wardrobeItems', item.id), {
          ...item,
          userId: session.uid
        });
      } catch (err) {
        console.warn('Failed saving item to cloud:', err);
      }
    }
  };

  const syncOutfitToCloud = async (outfit: Outfit) => {
    if (session.cloudSynced && session.uid) {
      try {
        await setDoc(doc(db, 'users', session.uid, 'outfits', outfit.id), {
          ...outfit,
          userId: session.uid
        });
      } catch (err) {
        console.warn('Failed saving outfit to cloud:', err);
      }
    }
  };

  const syncScheduleToCloud = async (newSchedule: WeeklySchedule) => {
    if (session.cloudSynced && session.uid) {
      try {
        await setDoc(doc(db, 'users', session.uid, 'schedule', 'currentWeek'), {
          ...newSchedule,
          userId: session.uid,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Failed saving schedule to cloud:', err);
      }
    }
  };

  const syncAiPreferencesToCloud = async (prefs: AIPreference) => {
    if (session.cloudSynced && session.uid) {
      try {
        await setDoc(doc(db, 'users', session.uid, 'aiPreferences', 'prefs'), {
          ...prefs,
          userId: session.uid,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Failed saving AI preferences to cloud:', err);
      }
    }
  };

  // Helper to hash password for cloud account
  const hashPassword = async (pass: string): Promise<string> => {
    const msgUint8 = new TextEncoder().encode(pass);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const getCloudUserId = (emailStr: string): string => {
    try {
      return 'user_' + btoa(emailStr.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, '_');
    } catch {
      return 'user_' + encodeURIComponent(emailStr.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, '_');
    }
  };

  // Auth Operations
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      let uid = '';
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        uid = cred.user.uid;
      } catch (authErr: any) {
        console.warn('Firebase Auth direct signin notice (checking Cloud Firestore account):', authErr.code || authErr.message);
        uid = getCloudUserId(cleanEmail);
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          return { success: false, error: 'Account not found. Please click "Sign Up (Cloud)" to register your cloud wardrobe.' };
        }
        const data = userSnap.data();
        const expectedHash = await hashPassword(pass);
        if (data.passwordHash && data.passwordHash !== expectedHash) {
          return { success: false, error: 'Invalid password. Please check your credentials.' };
        }
      }

      setSession({
        isLoggedIn: true,
        isOfflineMode: false,
        email: cleanEmail,
        uid,
        cloudSynced: true
      });
      await syncFromCloud(uid);
      setActiveTab('home');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed. Please check credentials.' };
    }
  };

  const signupWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      let uid = '';
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        uid = cred.user.uid;
      } catch (authErr: any) {
        console.warn('Firebase Auth direct signup notice (creating Cloud Firestore account):', authErr.code || authErr.message);
        uid = getCloudUserId(cleanEmail);
        const userRef = doc(db, 'users', uid);
        const existingSnap = await getDoc(userRef);
        if (existingSnap.exists() && existingSnap.data()?.passwordHash) {
          return { success: false, error: 'An account with this email already exists. Please switch to Sign In.' };
        }
        const passwordHash = await hashPassword(pass);
        await setDoc(userRef, {
          email: cleanEmail,
          passwordHash,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      setSession({
        isLoggedIn: true,
        isOfflineMode: false,
        email: cleanEmail,
        uid,
        cloudSynced: true
      });
      await syncFromCloud(uid);
      setActiveTab('home');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Signup failed. Please try again.' };
    }
  };

  const openOfflineWarning = () => {
    setIsOfflineWarningOpen(true);
  };

  const confirmOfflineMode = () => {
    setIsOfflineWarningOpen(false);
    setSession({
      isLoggedIn: true,
      isOfflineMode: true,
      email: 'local.user@offline.vault',
      uid: 'offline-local-user',
      cloudSynced: false
    });
    setActiveTab('home');
  };

  const cancelOfflineWarning = () => {
    setIsOfflineWarningOpen(false);
  };

  const logout = async () => {
    try {
      if (!session.isOfflineMode) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('Signout warning', e);
    }
    setSession({
      isLoggedIn: false,
      isOfflineMode: false,
      email: null,
      uid: null,
      cloudSynced: false
    });
    setSelectedItemId(null);
  };

  // Home Screen Randomizer (Picks existing outfit from Outfit Hub)
  const triggerRandomHubOutfit = () => {
    if (outfits.length === 0) return;
    const picked = selectRandomFromOutfitHub(outfits, activeRandomHubOutfit?.id);
    setActiveRandomHubOutfit(picked || outfits[0]);
    setIsRandomHubModalOpen(true);
  };

  const closeRandomHubModal = () => {
    setIsRandomHubModalOpen(false);
  };

  // AI Wardrobe Roulette (In "AI Features" menu)
  const spinAIRoulette = () => {
    if (items.length < 2) return;
    setIsSpinningAIRoulette(true);
    
    let cycles = 0;
    const interval = setInterval(() => {
      cycles++;
      const candidate = generateAIRouletteOutfit(items, aiPreferences.rejectedPairKeys);
      setActiveAIRouletteOutfit(candidate);

      if (cycles >= 12) {
        clearInterval(interval);
        const finalOutfit = generateAIRouletteOutfit(items, aiPreferences.rejectedPairKeys);
        setActiveAIRouletteOutfit(finalOutfit);
        setIsSpinningAIRoulette(false);
      }
    }, 85);
  };

  // 1) Save AI generated outfit to Outfit Hub
  const saveAIRouletteToHub = (outfit: Outfit) => {
    const saved = {
      ...outfit,
      id: `outfit-${Date.now()}`,
      isFavorite: false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setOutfits((prev) => [saved, ...prev]);
    syncOutfitToCloud(saved);
  };

  // 2) Reject AI outfit and learn from user feedback
  const rejectAIRouletteOutfit = (outfit: Outfit, reason: string) => {
    const itemNames = items
      .filter((i) => outfit.itemIds.includes(i.id))
      .map((i) => `${i.name} (${i.category})`);

    // Extract all pair keys to add to negative constraints
    const newRejectedKeys: string[] = [];
    for (let i = 0; i < outfit.itemIds.length; i++) {
      for (let j = i + 1; j < outfit.itemIds.length; j++) {
        newRejectedKeys.push(getPairKey(outfit.itemIds[i], outfit.itemIds[j]));
      }
    }

    const newLog: FeedbackLog = {
      id: `log-${Date.now()}`,
      outfitName: outfit.name,
      reason,
      itemNames,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedPrefs: AIPreference = {
      rejectedPairKeys: Array.from(new Set([...aiPreferences.rejectedPairKeys, ...newRejectedKeys])),
      feedbackLogs: [newLog, ...aiPreferences.feedbackLogs.slice(0, 20)]
    };

    setAiPreferences(updatedPrefs);
    syncAiPreferencesToCloud(updatedPrefs);

    // Re-roll fresh outfit immediately using updated negative constraints
    setActiveAIRouletteOutfit(generateAIRouletteOutfit(items, updatedPrefs.rejectedPairKeys));
  };

  const clearRejectedMemory = () => {
    const resetPrefs: AIPreference = {
      rejectedPairKeys: [],
      feedbackLogs: []
    };
    setAiPreferences(resetPrefs);
    syncAiPreferencesToCloud(resetPrefs);
  };

  // Item Operations
  const addItem = (
    newItemData: Omit<WardrobeItem, 'id' | 'dateAdded' | 'pairedItemIds'> & { pairedItemIds?: string[] }
  ) => {
    const newItemId = `item-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newItem: WardrobeItem = {
      ...newItemData,
      id: newItemId,
      dateAdded: today,
      pairedItemIds: newItemData.pairedItemIds || [],
    };

    setItems((prev) => [newItem, ...prev]);
    syncItemToCloud(newItem);

    if (newItemData.pairedItemIds && newItemData.pairedItemIds.length > 0) {
      setItems((prev) => {
        let currentList = prev;
        for (const targetId of newItemData.pairedItemIds!) {
          currentList = addBidirectionalPair(currentList, newItemId, targetId);
        }
        return currentList;
      });
    }
  };

  const pairItems = (sourceId: string, targetId: string) => {
    setItems((prev) => {
      const updated = addBidirectionalPair(prev, sourceId, targetId);
      const source = updated.find((i) => i.id === sourceId);
      const target = updated.find((i) => i.id === targetId);
      if (source) syncItemToCloud(source);
      if (target) syncItemToCloud(target);
      return updated;
    });
  };

  const unpairItems = (sourceId: string, targetId: string) => {
    setItems((prev) => {
      const updated = removeBidirectionalPair(prev, sourceId, targetId);
      const source = updated.find((i) => i.id === sourceId);
      const target = updated.find((i) => i.id === targetId);
      if (source) syncItemToCloud(source);
      if (target) syncItemToCloud(target);
      return updated;
    });
  };

  const saveOutfit = (name: string, itemIds: string[], occasion: string, notes?: string) => {
    const newOutfit: Outfit = {
      id: `outfit-${Date.now()}`,
      name,
      itemIds,
      occasion,
      isFavorite: false,
      createdAt: new Date().toISOString().split('T')[0],
      notes,
    };
    setOutfits((prev) => [newOutfit, ...prev]);
    syncOutfitToCloud(newOutfit);
    setIsNewOutfitModalOpen(false);
  };

  const deleteOutfit = (outfitId: string) => {
    setOutfits((prev) => prev.filter((o) => o.id !== outfitId));
    setSchedule((prev) => {
      const next = { ...prev };
      for (const day of Object.keys(next) as DayOfWeek[]) {
        if (next[day] === outfitId) {
          next[day] = null;
        }
      }
      syncScheduleToCloud(next);
      return next;
    });
  };

  const assignOutfitToSchedule = (day: DayOfWeek, outfitId: string | null) => {
    setSchedule((prev) => {
      const next = {
        ...prev,
        [day]: outfitId,
      };
      syncScheduleToCloud(next);
      return next;
    });
  };

  const toggleFavoriteOutfit = (outfitId: string) => {
    setOutfits((prev) => {
      const updated = prev.map((o) => (o.id === outfitId ? { ...o, isFavorite: !o.isFavorite } : o));
      const target = updated.find((o) => o.id === outfitId);
      if (target) syncOutfitToCloud(target);
      return updated;
    });
  };

  const selectItem = (itemId: string | null) => {
    setSelectedItemId(itemId);
  };

  const openScheduleAssignModal = (day: DayOfWeek) => {
    setScheduleAssignTargetDay(day);
    setIsAssignScheduleModalOpen(true);
  };

  const closeScheduleAssignModal = () => {
    setIsAssignScheduleModalOpen(false);
    setScheduleAssignTargetDay(null);
  };

  const selectedItem = items.find((i) => i.id === selectedItemId) || null;

  return (
    <WardrobeContext.Provider
      value={{
        items,
        outfits,
        schedule,
        session,
        aiPreferences,
        activeTab,
        selectedCategory,
        selectedItemId,
        selectedItem,
        isOfflineWarningOpen,
        isUploadModalOpen,
        isNewOutfitModalOpen,
        isAssignScheduleModalOpen,
        scheduleAssignTargetDay,
        isRandomHubModalOpen,
        activeRandomHubOutfit,
        triggerRandomHubOutfit,
        closeRandomHubModal,
        activeAIRouletteOutfit,
        isSpinningAIRoulette,
        spinAIRoulette,
        saveAIRouletteToHub,
        rejectAIRouletteOutfit,
        clearRejectedMemory,
        loginWithEmail,
        signupWithEmail,
        openOfflineWarning,
        confirmOfflineMode,
        cancelOfflineWarning,
        logout,
        setActiveTab,
        setSelectedCategory,
        selectItem,
        toggleFavoriteOutfit,
        addItem,
        pairItems,
        unpairItems,
        saveOutfit,
        deleteOutfit,
        assignOutfitToSchedule,
        setIsUploadModalOpen,
        setIsNewOutfitModalOpen,
        openScheduleAssignModal,
        closeScheduleAssignModal,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = (): WardrobeContextType => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
