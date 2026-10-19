import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllowedPairingCategories,
  canPairCategories,
  addBidirectionalPair,
  removeBidirectionalPair,
  getPairKey,
  containsRejectedPair,
  generateAIRouletteOutfit,
  selectRandomFromOutfitHub,
} from './pairingRules.ts';
import type { WardrobeItem, Outfit } from '../types/wardrobe.ts';

test('Taxonomy pairing rules check', () => {
  assert.deepEqual(getAllowedPairingCategories('Tops'), ['Bottoms', 'Outerwear']);
  assert.equal(canPairCategories('Tops', 'Bottoms'), true);
  assert.equal(canPairCategories('Tops', 'Outerwear'), true);
  assert.equal(canPairCategories('Tops', 'Full-Body'), false);

  assert.deepEqual(getAllowedPairingCategories('Bottoms'), ['Tops']);
  assert.equal(canPairCategories('Bottoms', 'Tops'), true);

  assert.deepEqual(getAllowedPairingCategories('Full-Body'), ['Shoes', 'Accessories']);
  assert.equal(canPairCategories('Full-Body', 'Shoes'), true);
  assert.equal(canPairCategories('Full-Body', 'Accessories'), true);

  assert.deepEqual(getAllowedPairingCategories('Outerwear'), ['Tops']);
  assert.equal(canPairCategories('Outerwear', 'Tops'), true);

  assert.deepEqual(getAllowedPairingCategories('Accessories'), []);
  assert.equal(canPairCategories('Accessories', 'Tops'), false);
});

test('addBidirectionalPair links both items symmetrically', () => {
  const items: WardrobeItem[] = [
    {
      id: 'top-1',
      name: 'Cashmere Knit',
      category: 'Tops',
      color: 'Charcoal',
      brand: 'Aura',
      season: 'Winter',
      image: '',
      pairedItemIds: [],
      tags: ['casual'],
      dateAdded: '2026-01-01',
    },
    {
      id: 'bot-1',
      name: 'Tailored Wool Trousers',
      category: 'Bottoms',
      color: 'Navy',
      brand: 'Aura',
      season: 'Winter',
      image: '',
      pairedItemIds: [],
      tags: ['formal'],
      dateAdded: '2026-01-02',
    },
  ];

  const updated = addBidirectionalPair(items, 'top-1', 'bot-1');
  const top = updated.find((i) => i.id === 'top-1')!;
  const bottom = updated.find((i) => i.id === 'bot-1')!;

  assert.ok(top.pairedItemIds.includes('bot-1'));
  assert.ok(bottom.pairedItemIds.includes('top-1'));
});

test('AI Roulette respects negative learning constraints', () => {
  const items: WardrobeItem[] = [
    {
      id: 'top-1',
      name: 'Merino Wool',
      category: 'Tops',
      color: 'Black',
      brand: 'Aura',
      season: 'Winter',
      image: '',
      pairedItemIds: [],
      tags: [],
      dateAdded: '2026-01-01',
    },
    {
      id: 'bot-1',
      name: 'Sweatpants',
      category: 'Bottoms',
      color: 'Grey',
      brand: 'Aura',
      season: 'Winter',
      image: '',
      pairedItemIds: [],
      tags: [],
      dateAdded: '2026-01-01',
    },
    {
      id: 'bot-2',
      name: 'Tailored Slacks',
      category: 'Bottoms',
      color: 'Navy',
      brand: 'Aura',
      season: 'Winter',
      image: '',
      pairedItemIds: [],
      tags: [],
      dateAdded: '2026-01-01',
    },
    {
      id: 'shoe-1',
      name: 'Leather Loafers',
      category: 'Shoes',
      color: 'Black',
      brand: 'Aura',
      season: 'All-Season',
      image: '',
      pairedItemIds: [],
      tags: [],
      dateAdded: '2026-01-01',
    },
  ];

  // Reject top-1 and bot-1 pair
  const rejectedKey = getPairKey('top-1', 'bot-1');
  assert.equal(containsRejectedPair(['top-1', 'bot-1', 'shoe-1'], [rejectedKey]), true);
  assert.equal(containsRejectedPair(['top-1', 'bot-2', 'shoe-1'], [rejectedKey]), false);

  // Generate outfit with rejected constraint
  const outfit = generateAIRouletteOutfit(items, [rejectedKey]);
  assert.ok(outfit !== null);
  // Ensure the rejected combo top-1 + bot-1 was avoided!
  const hasBothRejected = outfit.itemIds.includes('top-1') && outfit.itemIds.includes('bot-1');
  assert.equal(hasBothRejected, false);
});

test('selectRandomFromOutfitHub selects from saved outfits', () => {
  const outfits: Outfit[] = [
    { id: 'out-1', name: 'Look 1', itemIds: [], occasion: 'Work', isFavorite: false, createdAt: '2026-01-01' },
    { id: 'out-2', name: 'Look 2', itemIds: [], occasion: 'Casual', isFavorite: true, createdAt: '2026-01-02' },
  ];

  const picked = selectRandomFromOutfitHub(outfits);
  assert.ok(picked !== null);
  assert.ok(outfits.some((o) => o.id === picked?.id));
});
