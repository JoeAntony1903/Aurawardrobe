import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Link2, 
  Unlink, 
  Sparkles, 
  Layers, 
  AlertCircle, 
  Check, 
  ArrowRight,
  Info
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';
import { WardrobeItem } from '../../types/wardrobe';
import { getAllowedPairingCategories } from '../../utils/pairingRules';

export const ItemDetailModal: React.FC = () => {
  const { 
    selectedItemId, 
    selectedItem, 
    selectItem, 
    items, 
    pairItems, 
    unpairItems 
  } = useWardrobe();

  const [isMatchingOpen, setIsMatchingOpen] = useState(false);
  const [matchCandidateId, setMatchCandidateId] = useState<string | null>(null);

  if (!selectedItem) return null;

  // Allowed categories based on Taxonomy pairing engine rules
  const allowedCategories = getAllowedPairingCategories(selectedItem.category);
  const isAccessories = selectedItem.category === 'Accessories';

  // Currently paired items
  const pairedItems = items.filter((i) =>
    selectedItem.pairedItemIds.includes(i.id)
  );

  // Candidates for pairing: items in allowed categories, not already paired, and not the current item
  const eligibleCandidates = items.filter((i) => 
    i.id !== selectedItem.id &&
    allowedCategories.includes(i.category) &&
    !selectedItem.pairedItemIds.includes(i.id)
  );

  const handleConfirmPair = () => {
    if (!matchCandidateId) return;
    pairItems(selectedItem.id, matchCandidateId);
    setMatchCandidateId(null);
    setIsMatchingOpen(false);
  };

  const handleRemovePair = (targetId: string) => {
    unpairItems(selectedItem.id, targetId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-detail-title"
        className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-6"
      >
        {/* Close Modal */}
        <button
          type="button"
          onClick={() => {
            selectItem(null);
            setIsMatchingOpen(false);
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          aria-label="Close detail modal"
        >
          <X size={20} />
        </button>

        {/* Top Garment Overview */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-full sm:w-48 h-56 rounded-2xl overflow-hidden bg-black/50 border border-white/10 p-2 shrink-0 flex items-center justify-center shadow-inner">
            <img 
              src={selectedItem.image} 
              alt={selectedItem.name} 
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-3 flex-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-medium">
                  {selectedItem.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedItem.season}
                </span>
              </div>
              <h3 id="item-detail-title" className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {selectedItem.name}
              </h3>
              <p className="text-xs text-slate-400">
                {selectedItem.brand} · {selectedItem.color}
              </p>
            </div>

            {selectedItem.material && (
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-slate-400">Material: </span>
                {selectedItem.material}
              </div>
            )}

            {selectedItem.notes && (
              <p className="text-xs text-slate-400 leading-relaxed italic bg-white/[0.03] p-3 rounded-xl border border-white/5">
                "{selectedItem.notes}"
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedItem.tags.map((tag) => (
                <span key={tag} className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* CRITICAL LOGIC: Bi-Directional Pairing Engine Section */}
        <div className="p-5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Paired With ({pairedItems.length})
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Bi-directionally linked companions. Changes sync across both pieces.
              </p>
            </div>

            {/* Add Match Button (Controlled by Taxonomy Pairing Rules) */}
            {!isAccessories ? (
              <button
                type="button"
                onClick={() => setIsMatchingOpen(!isMatchingOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition-all"
              >
                <Plus size={14} />
                <span>{isMatchingOpen ? 'Cancel Match' : 'Add Match'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                <Info size={12} />
                <span>Accessories: Universal Accent (No downward pairing needed)</span>
              </div>
            )}
          </div>

          {/* Pairing Engine Rules Guidance Callout */}
          <div className="text-[11px] text-slate-400 flex items-center gap-2 bg-black/30 p-2.5 rounded-xl border border-white/5">
            <Layers size={13} className="text-indigo-400 shrink-0" />
            <span>
              {selectedItem.category === 'Tops' && 'Rule: Tops link bi-directionally with Bottoms and can pair with Outerwear.'}
              {selectedItem.category === 'Bottoms' && 'Rule: Bottoms link bi-directionally with Tops.'}
              {selectedItem.category === 'Full-Body' && 'Rule: Full-Body can only be paired with Shoes and Accessories.'}
              {selectedItem.category === 'Outerwear' && 'Rule: Outerwear can only be paired with Tops.'}
              {selectedItem.category === 'Shoes' && 'Rule: Shoes can pair with Full-Body or Bottoms.'}
              {selectedItem.category === 'Accessories' && 'Rule: Simple gallery view, no downward pairing needed.'}
            </span>
          </div>

          {/* Add Match Drawer / Selector */}
          {isMatchingOpen && !isAccessories && (
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs text-indigo-200 font-medium">
                <span>Select a matching piece from allowed categories: [{allowedCategories.join(', ')}]</span>
                <span className="font-mono">{eligibleCandidates.length} eligible</span>
              </div>

              {eligibleCandidates.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No unlinked garments found in categories [{allowedCategories.join(', ')}]. Upload more items or all matches are already linked!
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {eligibleCandidates.map((cand) => (
                    <button
                      key={cand.id}
                      type="button"
                      onClick={() => setMatchCandidateId(cand.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        matchCandidateId === cand.id
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-200'
                      }`}
                    >
                      <div className="w-10 h-12 rounded bg-black/40 p-0.5 shrink-0 flex items-center justify-center">
                        <img src={cand.image} alt={cand.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate">{cand.name}</div>
                        <div className="text-[10px] text-slate-400">{cand.category} · {cand.color}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {eligibleCandidates.length > 0 && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMatchingOpen(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPair}
                    disabled={!matchCandidateId}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all"
                  >
                    <Check size={14} />
                    <span>Link Bi-Directionally</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Currently Paired List */}
          {pairedItems.length === 0 ? (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-slate-400">
              No linked garments yet. Click "Add Match" to form a bi-directional pairing.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pairedItems.map((paired) => (
                <div
                  key={paired.id}
                  className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-between gap-3 group hover:border-white/20 transition-all"
                >
                  <button
                    type="button"
                    onClick={() => selectItem(paired.id)}
                    className="flex items-center gap-3 text-left flex-1 truncate"
                    title={`View ${paired.name}`}
                  >
                    <div className="w-12 h-14 rounded-xl bg-black/40 border border-white/10 p-1 shrink-0 flex items-center justify-center">
                      <img src={paired.image} alt={paired.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {paired.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {paired.category} · {paired.color}
                      </div>
                      <span className="text-[10px] text-indigo-400 flex items-center gap-0.5 mt-0.5">
                        <span>Inspect piece</span> &rarr;
                      </span>
                    </div>
                  </button>

                  {/* Unlink button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePair(paired.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove Bi-directional Pairing"
                    aria-label={`Unpair ${paired.name}`}
                  >
                    <Unlink size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Done Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={() => {
              selectItem(null);
              setIsMatchingOpen(false);
            }}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};
