import { Category, WardrobeItem, Outfit, AIPreference } from '../types/wardrobe';

/**
 * Returns allowed categories that an item of the given category can be paired with.
 */
export function getAllowedPairingCategories(category: Category): Category[] {
  switch (category) {
    case 'Tops':
      return ['Bottoms', 'Outerwear'];
    case 'Bottoms':
      return ['Tops'];
    case 'Full-Body':
      return ['Shoes', 'Accessories'];
    case 'Outerwear':
      return ['Tops'];
    case 'Shoes':
      return ['Full-Body', 'Bottoms'];
    case 'Accessories':
      return []; // Simple gallery view, no downward pairing needed
    default:
      return [];
  }
}

/**
 * Checks if two categories are allowed to be paired according to the wardrobe rules.
 */
export function canPairCategories(sourceCategory: Category, targetCategory: Category): boolean {
  if (sourceCategory === 'Accessories') {
    return false;
  }

  if (sourceCategory === 'Tops') {
    return targetCategory === 'Bottoms' || targetCategory === 'Outerwear';
  }

  if (sourceCategory === 'Bottoms') {
    return targetCategory === 'Tops';
  }

  if (sourceCategory === 'Full-Body') {
    return targetCategory === 'Shoes' || targetCategory === 'Accessories';
  }

  if (sourceCategory === 'Outerwear') {
    return targetCategory === 'Tops';
  }

  if (sourceCategory === 'Shoes') {
    return targetCategory === 'Full-Body' || targetCategory === 'Bottoms';
  }

  return false;
}

/**
 * Adds a bidirectional pairing between two items.
 */
export function addBidirectionalPair(
  items: WardrobeItem[],
  sourceId: string,
  targetId: string
): WardrobeItem[] {
  if (sourceId === targetId) return items;

  const sourceItem = items.find((i) => i.id === sourceId);
  const targetItem = items.find((i) => i.id === targetId);

  if (!sourceItem || !targetItem) return items;
  if (!canPairCategories(sourceItem.category, targetItem.category)) return items;

  return items.map((item) => {
    if (item.id === sourceId) {
      if (!item.pairedItemIds.includes(targetId)) {
        return {
          ...item,
          pairedItemIds: [...item.pairedItemIds, targetId],
        };
      }
    } else if (item.id === targetId) {
      if (!item.pairedItemIds.includes(sourceId)) {
        return {
          ...item,
          pairedItemIds: [...item.pairedItemIds, sourceId],
        };
      }
    }
    return item;
  });
}

/**
 * Removes a bidirectional pairing between two items.
 */
export function removeBidirectionalPair(
  items: WardrobeItem[],
  sourceId: string,
  targetId: string
): WardrobeItem[] {
  return items.map((item) => {
    if (item.id === sourceId) {
      return {
        ...item,
        pairedItemIds: item.pairedItemIds.filter((id) => id !== targetId),
      };
    } else if (item.id === targetId) {
      return {
        ...item,
        pairedItemIds: item.pairedItemIds.filter((id) => id !== sourceId),
      };
    }
    return item;
  });
}

/**
 * Generates a unique sorted pair key for negative learning constraints (e.g. "itemA:itemB").
 */
export function getPairKey(id1: string, id2: string): string {
  return [id1, id2].sort().join(':');
}

/**
 * Checks if an outfit's item set contains any rejected pair.
 */
export function containsRejectedPair(itemIds: string[], rejectedPairKeys: string[]): boolean {
  if (!rejectedPairKeys || rejectedPairKeys.length === 0) return false;
  for (let i = 0; i < itemIds.length; i++) {
    for (let j = i + 1; j < itemIds.length; j++) {
      const key = getPairKey(itemIds[i], itemIds[j]);
      if (rejectedPairKeys.includes(key)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * AI Wardrobe Roulette Engine:
 * Generates an outfit by pairing harmonized pieces, respecting taxonomy rules
 * and strictly avoiding any combinations containing rejected pairing keys.
 */
export function generateAIRouletteOutfit(
  items: WardrobeItem[],
  rejectedPairKeys: string[] = []
): Outfit | null {
  if (items.length < 2) return null;

  const tops = items.filter((i) => i.category === 'Tops');
  const bottoms = items.filter((i) => i.category === 'Bottoms');
  const fullBodies = items.filter((i) => i.category === 'Full-Body');
  const outerwears = items.filter((i) => i.category === 'Outerwear');
  const shoes = items.filter((i) => i.category === 'Shoes');
  const accessories = items.filter((i) => i.category === 'Accessories');

  const generatedCombos: string[][] = [];

  // Formula 1: Full-Body + Shoes + Optional Accessories
  if (fullBodies.length > 0 && shoes.length > 0) {
    for (const fb of fullBodies) {
      for (const sh of shoes) {
        const combo = [fb.id, sh.id];
        if (accessories.length > 0 && Math.random() > 0.4) {
          combo.push(accessories[Math.floor(Math.random() * accessories.length)].id);
        }
        if (!containsRejectedPair(combo, rejectedPairKeys)) {
          generatedCombos.push(combo);
        }
      }
    }
  }

  // Formula 2: Top + Bottom + Shoes + Optional Outerwear/Accessories
  if (tops.length > 0 && bottoms.length > 0) {
    for (const top of tops) {
      for (const bot of bottoms) {
        // Prefer known paired items if available
        const baseCombo = [top.id, bot.id];
        if (shoes.length > 0) {
          baseCombo.push(shoes[Math.floor(Math.random() * shoes.length)].id);
        }
        if (outerwears.length > 0 && Math.random() > 0.5) {
          baseCombo.push(outerwears[Math.floor(Math.random() * outerwears.length)].id);
        }
        if (accessories.length > 0 && Math.random() > 0.5) {
          baseCombo.push(accessories[Math.floor(Math.random() * accessories.length)].id);
        }

        if (!containsRejectedPair(baseCombo, rejectedPairKeys)) {
          generatedCombos.push(baseCombo);
        }
      }
    }
  }

  if (generatedCombos.length === 0) {
    // Fallback if all combos were rejected: fallback to first valid top+bottom or fullbody
    if (tops.length > 0 && bottoms.length > 0) {
      return {
        id: `ai-outfit-${Date.now()}`,
        name: 'AI Curated Essential Look',
        itemIds: [tops[0].id, bottoms[0].id],
        occasion: 'Everyday Minimalist',
        isFavorite: false,
        createdAt: new Date().toISOString().split('T')[0],
        aiGenerated: true,
        notes: 'AI algorithmic balance generated from your core pieces.'
      };
    }
    return null;
  }

  // Pick random candidate from non-rejected combos
  const pickedCombo = generatedCombos[Math.floor(Math.random() * generatedCombos.length)];
  
  // Style naming generator based on picked pieces
  const pickedItems = items.filter((i) => pickedCombo.includes(i.id));
  const colors = pickedItems.map((i) => i.color);
  const occasions = ['Studio Work & Meetings', 'Gallery Opening', 'Weekend Social', 'Evening Dinner', 'Creative Session'];
  const vibeAdjectives = ['Architectural', 'Monochrome', 'Minimalist', 'Fluid', 'Editorial', 'Sartorial', 'Avant-Garde'];

  const adjective = vibeAdjectives[Math.floor(Math.random() * vibeAdjectives.length)];
  const occasion = occasions[Math.floor(Math.random() * occasions.length)];

  return {
    id: `ai-outfit-${Date.now()}`,
    name: `AI ${adjective} Silhouette`,
    itemIds: pickedCombo,
    occasion,
    isFavorite: false,
    createdAt: new Date().toISOString().split('T')[0],
    aiGenerated: true,
    notes: `Engineered by AI Roulette. Harmonizes ${colors.slice(0, 2).join(' & ')} textures.`
  };
}

/**
 * Selects a random outfit strictly from user's saved Outfit Hub (for Home screen).
 */
export function selectRandomFromOutfitHub(outfits: Outfit[], excludeId?: string): Outfit | null {
  if (!outfits || outfits.length === 0) return null;
  if (outfits.length === 1) return outfits[0];

  const pool = excludeId ? outfits.filter((o) => o.id !== excludeId) : outfits;
  const candidates = pool.length > 0 ? pool : outfits;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}
