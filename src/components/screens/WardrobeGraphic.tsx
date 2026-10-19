import React from 'react';
import { Shirt, Sparkles, Layers, ShieldCheck, Tag } from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';

export const WardrobeGraphic: React.FC = () => {
  const { items, outfits, setActiveTab, setSelectedCategory } = useWardrobe();

  // Category item counts
  const topsCount = items.filter((i) => i.category === 'Tops').length;
  const bottomsCount = items.filter((i) => i.category === 'Bottoms').length;
  const fullBodyCount = items.filter((i) => i.category === 'Full-Body').length;
  const outerwearCount = items.filter((i) => i.category === 'Outerwear').length;
  const shoesCount = items.filter((i) => i.category === 'Shoes').length;
  const accessoriesCount = items.filter((i) => i.category === 'Accessories').length;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/[0.05] backdrop-blur-2xl border border-white/20 p-6 sm:p-8 shadow-2xl">
      {/* Top ambient lighting bar inside closet */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-500 opacity-80" />
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-indigo-500/15 blur-2xl pointer-events-none" />

      {/* Header & Meta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
              The Digital Sanctuary
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-400 font-mono">Offline Encrypted</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Curated Wardrobe Capsule
          </h2>
        </div>

        {/* Quick Capsule Metrics */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.07] border border-white/10 text-center">
            <div className="text-base font-bold text-white font-mono">{items.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Garments</div>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.07] border border-white/10 text-center">
            <div className="text-base font-bold text-indigo-400 font-mono">{outfits.length}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">Outfits</div>
          </div>
        </div>
      </div>

      {/* Stylized Interactive Closet Showcase */}
      <div className="relative p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
        {/* Wardrobe Clothes Hanging Rail Graphic */}
        <div className="relative h-2 rounded-full bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 shadow-md mb-8">
          {/* Support Brackets */}
          <div className="absolute -top-2 left-6 w-3 h-6 bg-slate-500 rounded-sm" />
          <div className="absolute -top-2 right-6 w-3 h-6 bg-slate-500 rounded-sm" />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-6 bg-slate-500 rounded-sm" />
          
          {/* Subtle LED glow beneath rail */}
          <div className="absolute top-2 left-0 right-0 h-4 bg-indigo-500/10 blur-sm pointer-events-none" />
        </div>

        {/* Interactive Hanger Slots / Category Bays */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { cat: 'Tops', count: topsCount, color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30' },
            { cat: 'Bottoms', count: bottomsCount, color: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/30' },
            { cat: 'Full-Body', count: fullBodyCount, color: 'from-amber-500/20 to-rose-500/20', border: 'border-amber-500/30' },
            { cat: 'Outerwear', count: outerwearCount, color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30' },
            { cat: 'Shoes', count: shoesCount, color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30' },
            { cat: 'Accessories', count: accessoriesCount, color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-500/30' },
          ].map((bay) => (
            <button
              key={bay.cat}
              type="button"
              onClick={() => {
                setSelectedCategory(bay.cat as any);
                setActiveTab('categories');
              }}
              className={`relative flex flex-col items-center justify-between p-3.5 rounded-xl bg-gradient-to-b ${bay.color} border ${bay.border} hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-center group`}
            >
              {/* Triangular Hanger Icon */}
              <div className="w-8 h-6 relative mb-2 flex items-center justify-center">
                <svg viewBox="0 0 40 28" className="w-full h-full stroke-slate-400 group-hover:stroke-white transition-colors" fill="none" strokeWidth="2">
                  <path d="M20 4 Q20 1 18 1 Q16 1 16 3 Q16 7 20 9 L34 22 L6 22 Z" />
                </svg>
              </div>

              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white group-hover:text-indigo-200 transition-colors">
                  {bay.cat}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  {bay.count} {bay.count === 1 ? 'piece' : 'pieces'}
                </div>
              </div>

              {/* Bottom indicator strip */}
              <div className="mt-2.5 w-6 h-1 rounded-full bg-white/20 group-hover:w-10 group-hover:bg-indigo-400 transition-all" />
            </button>
          ))}
        </div>

        {/* Capsule Floor & Shoe Shelf Area */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-indigo-400" />
            <span>Bi-directional rule validation active across all compartments</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className="text-xs font-medium text-indigo-300 hover:text-indigo-200 underline decoration-indigo-400/40 hover:decoration-indigo-400 transition-colors"
          >
            Browse Full Taxonomy &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
