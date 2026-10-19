import React from 'react';
import { WardrobeProvider, useWardrobe } from './context/WardrobeContext';
import { BackgroundBlobs } from './components/common/BackgroundBlobs';
import { Navigation } from './components/common/Navigation';
import { LoginScreen } from './components/screens/LoginScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { CategoryScreen } from './components/screens/CategoryScreen';
import { OutfitHubScreen } from './components/screens/OutfitHubScreen';
import { SchedulePlannerScreen } from './components/screens/SchedulePlannerScreen';
import { AIFeaturesScreen } from './components/screens/AIFeaturesScreen';
import { ItemDetailModal } from './components/modals/ItemDetailModal';
import { UploadItemModal } from './components/modals/UploadItemModal';
import { NewOutfitModal } from './components/modals/NewOutfitModal';
import { AssignScheduleModal } from './components/modals/AssignScheduleModal';
import { RandomHubModal } from './components/modals/RandomHubModal';

const WardrobeApp: React.FC = () => {
  const { session, activeTab } = useWardrobe();

  return (
    <div className="relative min-h-screen text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-white">
      {/* Ambient Glassmorphic Background */}
      <BackgroundBlobs />

      {!session.isLoggedIn ? (
        <LoginScreen />
      ) : (
        <div className="relative z-10 min-h-screen flex flex-col">
          <Navigation />

          {/* Main content body with desktop sidebar offset */}
          <div className="flex-1 md:pl-64 flex flex-col">
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {activeTab === 'home' && <HomeScreen />}
              {activeTab === 'categories' && <CategoryScreen />}
              {activeTab === 'outfits' && <OutfitHubScreen />}
              {activeTab === 'schedule' && <SchedulePlannerScreen />}
              {activeTab === 'ai-features' && <AIFeaturesScreen />}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <ItemDetailModal />
      <UploadItemModal />
      <NewOutfitModal />
      <AssignScheduleModal />
      <RandomHubModal />
    </div>
  );
};

export default function App() {
  return (
    <WardrobeProvider>
      <WardrobeApp />
    </WardrobeProvider>
  );
}
