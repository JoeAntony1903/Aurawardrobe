import React, { useState } from 'react';
import { 
  Home, 
  Layers, 
  Sparkles, 
  Calendar, 
  Plus, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut,
  Shirt,
  Cloud,
  Wand2
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';

export const Navigation: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    session, 
    logout, 
    setIsUploadModalOpen,
    items,
    outfits
  } = useWardrobe();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, count: null },
    { id: 'categories', label: 'Wardrobe Taxonomy', icon: Layers, count: items.length },
    { id: 'outfits', label: 'Outfit Hub', icon: Sparkles, count: outfits.length },
    { id: 'schedule', label: 'Schedule Planner', icon: Calendar, count: 7 },
    { id: 'ai-features', label: 'AI Features', icon: Wand2, count: 'New' },
  ] as const;

  const handleNavClick = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 w-full bg-slate-900/60 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Shirt className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-white text-base sm:text-lg block leading-none">
                AuraWardrobe
              </span>
              <span className="text-[11px] text-slate-400 font-mono tracking-wider uppercase">
                {session.cloudSynced ? 'Cloud Synced Wardrobe' : 'Offline Digital Closet'}
              </span>
            </div>
          </button>
        </div>

        {/* Center / Right status & action */}
        <div className="flex items-center gap-3">
          {session.cloudSynced ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium">
              <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cloud Synced · Firestore Active</span>
            </div>
          ) : session.isOfflineMode ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline Mode · Local Vault</span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs sm:text-sm font-medium shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Upload Item"
          >
            <Plus size={16} />
            <span className="whitespace-nowrap">Upload Item</span>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex fixed top-[61px] left-0 bottom-0 w-64 bg-slate-950/40 backdrop-blur-2xl border-r border-white/10 flex-col justify-between p-4 z-20">
        <div className="space-y-6">
          <div className="px-2 pt-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Wardrobe Manager
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-white/15 text-white shadow-lg shadow-black/20 border border-white/20'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== null && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                        item.count === 'New' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold'
                          : 'bg-white/10 text-slate-300'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Database info card */}
          <div className="mx-2 p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-medium">
                {session.cloudSynced ? 'Cloud Database' : 'Local Storage Status'}
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">
                {session.cloudSynced ? 'Firestore' : 'Isolated'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {session.cloudSynced 
                ? 'Your wardrobe, outfits, schedule, and learned AI weights are persisted in Google Cloud Firestore.'
                : 'Garments and outfits are stored securely inside your local browser vault.'}
            </p>
          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="pt-4 border-t border-white/10 px-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="truncate max-w-[140px]">
              <span className="font-mono text-[11px] block truncate">
                {session.email || 'offline.curator'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {session.cloudSynced ? 'Cloud Account' : 'Offline Vault'}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out / Exit"
              aria-label="Sign Out / Exit"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-md">
          <div className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-slate-900/90 backdrop-blur-2xl border-r border-white/20 p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-indigo-400" />
                  <span className="font-semibold text-white">AuraWardrobe</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== null && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">{session.email || 'offline.mode'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                  aria-label="Log Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
