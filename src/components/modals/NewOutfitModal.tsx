import React, { useState } from 'react';
import { X, Sparkles, Check, Plus, Tag } from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { ALL_CATEGORIES, Category, WardrobeItem } from '../../types/wardrobe';

export const NewOutfitModal: React.FC = () => {
  const { isNewOutfitModalOpen, setIsNewOutfitModalOpen, items, saveOutfit } = useWardrobe();

  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('Casual Day');
  const [notes, setNotes] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  if (!isNewOutfitModalOpen) return null;

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this outfit.');
      return;
    }
    if (selectedItemIds.length === 0) {
      setError('Please select at least one garment for this outfit.');
      return;
    }

    saveOutfit(name.trim(), selectedItemIds, occasion.trim(), notes.trim());
    reset();
  };

  const reset = () => {
    setName('');
    setOccasion('Casual Day');
    setNotes('');
    setSelectedItemIds([]);
    setError('');
  };

  // Group items by category
  const itemsByCategory: Record<Category, WardrobeItem[]> = {
    'Tops': items.filter((i) => i.category === 'Tops'),
    'Bottoms': items.filter((i) => i.category === 'Bottoms'),
    'Full-Body': items.filter((i) => i.category === 'Full-Body'),
    'Outerwear': items.filter((i) => i.category === 'Outerwear'),
    'Shoes': items.filter((i) => i.category === 'Shoes'),
    'Accessories': items.filter((i) => i.category === 'Accessories'),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-outfit-title"
        className="w-full max-w-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6"
      >
        <button
          type="button"
          onClick={() => {
            reset();
            setIsNewOutfitModalOpen(false);
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400">
              Outfit Assembly Studio
            </div>
            <h3 id="new-outfit-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Create New Outfit
            </h3>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Outfit Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Gallery Soirée Ensemble"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              Occasion / Vibe
            </label>
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g. Client Dinner, Sunday Stroll"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
            />
          </div>
        </div>

        {/* Horizontal Scrolling Lists of Clothes by Category (Explicit prompt requirement) */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Select Garments by Category
            </span>
            <span className="text-xs font-mono text-indigo-400">
              {selectedItemIds.length} items chosen
            </span>
          </div>

          {ALL_CATEGORIES.map((category) => {
            const catItems = itemsByCategory[category];
            if (catItems.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                  <span>{category}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {catItems.length} available
                  </span>
                </div>

                {/* Horizontal Scroll Rail */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-white/10">
                  {catItems.map((item) => {
                    const isSelected = selectedItemIds.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItemSelection(item.id)}
                        className={`shrink-0 w-36 p-2.5 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg shadow-indigo-600/20 scale-[1.02]'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] shadow">
                            <Check size={12} />
                          </div>
                        )}
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-black/40 p-1 mb-2">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="text-xs font-semibold truncate text-white">{item.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{item.color}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              reset();
              setIsNewOutfitModalOpen(false);
            }}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus size={15} />
            <span>Save Outfit to Hub</span>
          </button>
        </div>
      </div>
    </div>
  );
};
