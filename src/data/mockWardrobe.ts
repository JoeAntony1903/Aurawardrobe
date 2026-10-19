import { WardrobeItem, Outfit, WeeklySchedule } from '../types/wardrobe';

// Helper function to create clean SVG data URIs for offline garment visuals
export function createGarmentSvg(type: string, primaryColor: string, secondaryColor: string, detail: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e1e2f" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#0f0f1a" stop-opacity="0.95" />
      </linearGradient>
      <linearGradient id="fabricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}" />
        <stop offset="100%" stop-color="${secondaryColor}" />
      </linearGradient>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>
    <rect width="400" height="480" rx="20" fill="url(#bgGrad)"/>
    <circle cx="200" cy="240" r="140" fill="${primaryColor}" opacity="0.08" filter="blur(30px)"/>
    
    <!-- Garment Visual Silhouettes -->
    <g filter="url(#softGlow)" transform="translate(40, 40)">
      ${renderGarmentSilhouette(type, primaryColor, secondaryColor, detail)}
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function renderGarmentSilhouette(type: string, primary: string, secondary: string, detail: string): string {
  switch (type) {
    case 'top-sweater':
      return `
        <!-- Hanger & Collar -->
        <path d="M160 50 Q160 25 140 25 Q120 25 120 50 L80 90 L240 90 Z" fill="none" stroke="#64748b" stroke-width="3"/>
        <!-- Sweater Body & Sleeves -->
        <path d="M110 85 L60 140 L30 240 L70 255 L95 180 L95 320 L225 320 L225 180 L250 255 L290 240 L260 140 L210 85 Q160 110 110 85 Z" fill="url(#fabricGrad)"/>
        <!-- Ribbed Collar & Hem Details -->
        <path d="M115 86 Q160 110 205 86" stroke="#ffffff" stroke-opacity="0.3" stroke-width="4" fill="none"/>
        <line x1="95" y1="315" x2="225" y2="315" stroke="#ffffff" stroke-opacity="0.25" stroke-width="4"/>
        <text x="160" y="360" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="500">${detail}</text>
      `;
    case 'top-shirt':
      return `
        <path d="M160 50 Q160 25 140 25 Q120 25 120 50 L90 85 L230 85 Z" fill="none" stroke="#64748b" stroke-width="3"/>
        <path d="M115 80 L65 130 L45 230 L80 240 L100 170 L100 320 L220 320 L220 170 L240 240 L275 230 L255 130 L205 80 Z" fill="url(#fabricGrad)"/>
        <!-- Collar flaps -->
        <polygon points="120,80 160,125 145,85" fill="#ffffff" fill-opacity="0.2"/>
        <polygon points="200,80 160,125 175,85" fill="#ffffff" fill-opacity="0.2"/>
        <!-- Placket & Buttons -->
        <line x1="160" y1="80" x2="160" y2="320" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>
        <circle cx="160" cy="140" r="3" fill="#ffffff" fill-opacity="0.6"/>
        <circle cx="160" cy="190" r="3" fill="#ffffff" fill-opacity="0.6"/>
        <circle cx="160" cy="240" r="3" fill="#ffffff" fill-opacity="0.6"/>
        <text x="160" y="360" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="500">${detail}</text>
      `;
    case 'top-tee':
      return `
        <path d="M160 50 Q160 25 140 25 Q120 25 120 50 L95 85 L225 85 Z" fill="none" stroke="#64748b" stroke-width="3"/>
        <path d="M120 80 L65 110 L45 160 L80 175 L100 150 L100 310 L220 310 L220 150 L240 175 L275 160 L255 110 L200 80 Q160 100 120 80 Z" fill="url(#fabricGrad)"/>
        <!-- Crew neckline -->
        <path d="M125 82 Q160 102 195 82" stroke="#ffffff" stroke-opacity="0.3" stroke-width="3" fill="none"/>
        <text x="160" y="360" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="500">${detail}</text>
      `;
    case 'bottom-trousers':
      return `
        <!-- Hanger bar -->
        <line x1="80" y1="60" x2="240" y2="60" stroke="#64748b" stroke-width="3"/>
        <!-- Waistband & Legs -->
        <path d="M95 70 L225 70 L235 340 L185 340 L160 160 L135 340 L85 340 Z" fill="url(#fabricGrad)"/>
        <!-- Pleat lines -->
        <line x1="125" y1="75" x2="115" y2="330" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5"/>
        <line x1="195" y1="75" x2="205" y2="330" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5"/>
        <text x="160" y="375" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="500">${detail}</text>
      `;
    case 'bottom-jeans':
      return `
        <line x1="80" y1="60" x2="240" y2="60" stroke="#64748b" stroke-width="3"/>
        <path d="M100 70 L220 70 L230 340 L185 340 L160 170 L135 340 L90 340 Z" fill="url(#fabricGrad)"/>
        <!-- Rivets and denim stitch -->
        <path d="M100 95 Q120 115 140 95" stroke="#d97706" stroke-opacity="0.5" stroke-width="2" fill="none"/>
        <path d="M220 95 Q200 115 180 95" stroke="#d97706" stroke-opacity="0.5" stroke-width="2" fill="none"/>
        <circle cx="160" cy="80" r="3" fill="#cbd5e1"/>
        <text x="160" y="375" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="500">${detail}</text>
      `;
    case 'outerwear-coat':
      return `
        <path d="M160 50 Q160 25 140 25 Q120 25 120 50 L75 90 L245 90 Z" fill="none" stroke="#64748b" stroke-width="3"/>
        <path d="M105 85 L45 150 L25 260 L65 275 L90 190 L90 360 L230 360 L230 190 L255 275 L295 260 L275 150 L215 85 Z" fill="url(#fabricGrad)"/>
        <!-- Wide Lapels & Double Breasted Buttons -->
        <polygon points="110,85 160,170 120,130" fill="#ffffff" fill-opacity="0.15"/>
        <polygon points="210,85 160,170 200,130" fill="#ffffff" fill-opacity="0.15"/>
        <circle cx="145" cy="210" r="4" fill="#ffffff" fill-opacity="0.7"/>
        <circle cx="175" cy="210" r="4" fill="#ffffff" fill-opacity="0.7"/>
        <circle cx="145" cy="260" r="4" fill="#ffffff" fill-opacity="0.7"/>
        <circle cx="175" cy="260" r="4" fill="#ffffff" fill-opacity="0.7"/>
        <!-- Tie belt -->
        <rect x="85" y="225" width="150" height="12" rx="4" fill="#ffffff" fill-opacity="0.2"/>
        <text x="160" y="390" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="500">${detail}</text>
      `;
    case 'fullbody-dress':
      return `
        <!-- Thin Straps & Slip Dress -->
        <line x1="125" y1="50" x2="125" y2="90" stroke="#ffffff" stroke-opacity="0.4" stroke-width="2"/>
        <line x1="195" y1="50" x2="195" y2="90" stroke="#ffffff" stroke-opacity="0.4" stroke-width="2"/>
        <path d="M115 90 Q160 105 205 90 L220 180 L260 360 L60 360 L100 180 Z" fill="url(#fabricGrad)"/>
        <!-- Elegant fluid drape curves -->
        <path d="M120 180 Q160 220 170 360" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5" fill="none"/>
        <path d="M200 180 Q170 240 210 360" stroke="#ffffff" stroke-opacity="0.25" stroke-width="1.5" fill="none"/>
        <text x="160" y="390" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="500">${detail}</text>
      `;
    case 'shoes-loafers':
      return `
        <!-- Pair of Luxury Loafers / Derbies -->
        <path d="M50 220 C70 190 120 180 150 200 C170 215 180 250 170 270 L50 270 Z" fill="url(#fabricGrad)"/>
        <path d="M170 220 C190 190 240 180 270 200 C290 215 300 250 290 270 L170 270 Z" fill="url(#fabricGrad)"/>
        <!-- Soles & Horsebit/Buckle Accents -->
        <rect x="45" y="265" width="130" height="15" rx="3" fill="#0f172a"/>
        <rect x="165" y="265" width="130" height="15" rx="3" fill="#0f172a"/>
        <rect x="100" y="205" width="25" height="6" rx="2" fill="#fbbf24" fill-opacity="0.8"/>
        <rect x="220" y="205" width="25" height="6" rx="2" fill="#fbbf24" fill-opacity="0.8"/>
        <text x="160" y="325" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="500">${detail}</text>
      `;
    case 'accessories-bag':
      return `
        <!-- Luxury Crossbody or Minimalist Leather Bag -->
        <path d="M160 60 Q160 20 220 50 Q280 80 250 170" fill="none" stroke="#d97706" stroke-width="3"/>
        <rect x="80" y="160" width="160" height="130" rx="16" fill="url(#fabricGrad)"/>
        <!-- Flap and Gold Clasp -->
        <path d="M80 160 L240 160 L225 225 Q160 245 95 225 Z" fill="#ffffff" fill-opacity="0.15"/>
        <circle cx="160" cy="230" r="7" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/>
        <text x="160" y="335" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="500">${detail}</text>
      `;
    default:
      return `
        <rect x="80" y="120" width="160" height="180" rx="16" fill="url(#fabricGrad)"/>
        <text x="160" y="220" text-anchor="middle" fill="#ffffff" font-family="system-ui" font-size="16" font-weight="600">${type}</text>
        <text x="160" y="340" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="12" font-weight="500">${detail}</text>
      `;
  }
}

export const INITIAL_WARDROBE_ITEMS: WardrobeItem[] = [
  // --- TOPS ---
  {
    id: 'top-1',
    name: 'Merino Wool Ribbed Knit',
    category: 'Tops',
    color: 'Oatmeal Heather',
    brand: 'Studio Atelier',
    season: 'Winter',
    material: '100% Extrafine Merino',
    image: createGarmentSvg('top-sweater', '#475569', '#1e293b', 'Oatmeal 100% Merino'),
    pairedItemIds: ['bot-1', 'out-1'], // Initially paired with Tailored Trousers & Trench
    tags: ['minimalist', 'layering', 'workwear'],
    dateAdded: '2026-03-01',
    notes: 'Incredible hand-feel, soft texture that pairs with high-waisted wool bottoms.'
  },
  {
    id: 'top-2',
    name: 'Structured Poplin Button-Down',
    category: 'Tops',
    color: 'Crisp Optical White',
    brand: 'L’Archiviste',
    season: 'All-Season',
    material: 'Crisp Egyptian Cotton',
    image: createGarmentSvg('top-shirt', '#64748b', '#334155', 'Pure White Poplin'),
    pairedItemIds: ['bot-1', 'bot-2'],
    tags: ['tailored', 'executive', 'clean'],
    dateAdded: '2026-03-04',
    notes: 'Architectural collar cut, ideal under trench coats or over raw denim.'
  },
  {
    id: 'top-3',
    name: 'Heavyweight Boxy Supima Tee',
    category: 'Tops',
    color: 'Washed Charcoal',
    brand: 'Form & Function',
    season: 'Summer',
    material: '280gsm Supima Jersey',
    image: createGarmentSvg('top-tee', '#374151', '#111827', '280gsm Washed Charcoal'),
    pairedItemIds: ['bot-2'],
    tags: ['casual', 'relaxed', 'weekend'],
    dateAdded: '2026-03-08',
    notes: 'Drop shoulder boxy silhouette with reinforced ribbed collar.'
  },

  // --- BOTTOMS ---
  {
    id: 'bot-1',
    name: 'Pleated Wide-Leg Wool Trousers',
    category: 'Bottoms',
    color: 'Midnight Navy',
    brand: 'Sartorial Collective',
    season: 'Fall',
    material: 'Super 120s Virgin Wool',
    image: createGarmentSvg('bottom-trousers', '#1e3a5f', '#0f172a', 'Wide-Leg Navy Flannel'),
    pairedItemIds: ['top-1', 'top-2'], // Bi-directionally synced with top-1 and top-2
    tags: ['tailored', 'editorial', 'fluid'],
    dateAdded: '2026-03-02',
    notes: 'Double front reverse pleats with full break drape.'
  },
  {
    id: 'bot-2',
    name: 'Raw Selvedge Straight Jeans',
    category: 'Bottoms',
    color: 'Deep Indigo',
    brand: 'Kuroki Mills',
    season: 'All-Season',
    material: '14oz Kurabo Japanese Selvedge',
    image: createGarmentSvg('bottom-jeans', '#1d4ed8', '#172554', '14oz Japanese Selvedge'),
    pairedItemIds: ['top-2', 'top-3'], // Bi-directionally synced with top-2 and top-3
    tags: ['denim', 'heritage', 'timeless'],
    dateAdded: '2026-03-05',
    notes: 'Unwashed raw indigo with copper hardware and red-line selvedge ID.'
  },

  // --- FULL-BODY ---
  {
    id: 'fb-1',
    name: 'Bias-Cut Silk Slip Maxi',
    category: 'Full-Body',
    color: 'Champagne Taupe',
    brand: 'Maison Éthérée',
    season: 'Spring',
    material: '22 Momme Mulberry Silk',
    image: createGarmentSvg('fullbody-dress', '#78350f', '#451a03', '22 Momme Liquid Silk'),
    pairedItemIds: ['shoe-1', 'acc-1'], // Paired with Shoes and Accessories only!
    tags: ['evening', 'cocktail', 'luxe'],
    dateAdded: '2026-03-10',
    notes: 'Liquid silk drape with French seams and low scoop back.'
  },

  // --- OUTERWEAR ---
  {
    id: 'out-1',
    name: 'Storm-Flap Gabardine Trench',
    category: 'Outerwear',
    color: 'Warm Khaki Stone',
    brand: 'Heritage London',
    season: 'Fall',
    material: 'Waterproof Cotton Gabardine',
    image: createGarmentSvg('outerwear-coat', '#d97706', '#78350f', 'Waterproof Gabardine'),
    pairedItemIds: ['top-1'], // Outerwear can only pair with Tops!
    tags: ['classic', 'rainwear', 'statement'],
    dateAdded: '2026-03-03',
    notes: 'Raglan sleeve double-breasted trench with horn buttons and storm shield.'
  },

  // --- SHOES ---
  {
    id: 'shoe-1',
    name: 'Burnished Calfskin Horsebit Loafers',
    category: 'Shoes',
    color: 'Espresso Brown',
    brand: 'Calzature Artigiane',
    season: 'All-Season',
    material: 'Hand-burnished Italian Calfskin',
    image: createGarmentSvg('shoes-loafers', '#451a03', '#1c1917', 'Blake-Stitched Leather'),
    pairedItemIds: ['fb-1'],
    tags: ['formal', 'heritage', 'footwear'],
    dateAdded: '2026-03-06',
    notes: 'Channeled Goodyear welted leather soles with antique brass horsebit.'
  },

  // --- ACCESSORIES ---
  {
    id: 'acc-1',
    name: 'Saddle Leather Crossbody Flap',
    category: 'Accessories',
    color: 'Cognac Tan',
    brand: 'Cuir Minimaliste',
    season: 'All-Season',
    material: 'Full-Grain Vegetable Tanned Leather',
    image: createGarmentSvg('accessories-bag', '#b45309', '#78350f', 'Veg-Tanned Saddle Leather'),
    pairedItemIds: ['fb-1'],
    tags: ['leather', 'everyday', 'accent'],
    dateAdded: '2026-03-07',
    notes: 'Brass peg stud closure and burnished wax edges.'
  }
];

export const INITIAL_SAVED_OUTFITS: Outfit[] = [
  {
    id: 'outfit-1',
    name: 'Minimalist Parisian Chic',
    itemIds: ['top-1', 'bot-1', 'out-1', 'shoe-1', 'acc-1'],
    occasion: 'Work & Gallery Openings',
    isFavorite: true,
    createdAt: '2026-03-12',
    notes: 'Refined silhouette combining merino warmth and gabardine rain resistance.'
  },
  {
    id: 'outfit-2',
    name: 'Executive Studio Monochrome',
    itemIds: ['top-2', 'bot-1', 'shoe-1'],
    occasion: 'Client Presentations',
    isFavorite: true,
    createdAt: '2026-03-14',
    notes: 'High-contrast architectural tailoring with clean Egyptian cotton lines.'
  },
  {
    id: 'outfit-3',
    name: 'Weekend Casual Atelier',
    itemIds: ['top-3', 'bot-2', 'shoe-1', 'acc-1'],
    occasion: 'Weekend Brunch & Studio Work',
    isFavorite: true,
    createdAt: '2026-03-15',
    notes: 'Raw selvedge denim broken in with heavy supima cotton tee.'
  },
  {
    id: 'outfit-4',
    name: 'Nocturne Silk Gala',
    itemIds: ['fb-1', 'shoe-1', 'acc-1'],
    occasion: 'Cocktail & Evening Gala',
    isFavorite: false,
    createdAt: '2026-03-16',
    notes: 'Full-body bias cut silk slip paired with calfskin footwear and cognac saddle flap.'
  }
];

export const INITIAL_SCHEDULE: WeeklySchedule = {
  Monday: 'outfit-2',
  Tuesday: 'outfit-1',
  Wednesday: null,
  Thursday: 'outfit-3',
  Friday: 'outfit-1',
  Saturday: 'outfit-4',
  Sunday: null,
};
