import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'palettes.json');

/**
 * Converts HSL values to Hex string (#RRGGBB).
 * @param {number} h Hue (0 - 360)
 * @param {number} s Saturation (0 - 100)
 * @param {number} l Lightness (0 - 100)
 * @returns {string} Hex string with leading #
 */
export function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (val) => {
    const intVal = Math.round((val + m) * 255);
    const clamped = Math.max(0, Math.min(255, intVal));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Calculates perceived brightness (0-255) to determine contrast text color.
 * Returns 'dark' for dark text on light color, or 'light' for light text on dark color.
 */
export function getContrast(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  // ITU-R BT.709 perceived luminance
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b);
  return luminance > 145 ? 'dark' : 'light';
}

/**
 * Helper to determine a descriptive name for a color based on its HSL.
 */
export function getColorName(h, s, l) {
  if (s < 12) {
    if (l > 88) return 'Pure Mist';
    if (l > 70) return 'Soft Platinum';
    if (l > 45) return 'Steel Slate';
    if (l > 25) return 'Charcoal Ash';
    return 'Obsidian Shadow';
  }

  const normalizedH = ((h % 360) + 360) % 360;

  if (normalizedH < 15 || normalizedH >= 345) {
    if (l > 75) return 'Blush Rose';
    if (l > 45) return 'Crimson Pulse';
    return 'Velvet Ruby';
  }
  if (normalizedH < 45) {
    if (l > 75) return 'Warm Peach';
    if (l > 50) return 'Vibrant Coral';
    return 'Burnt Amber';
  }
  if (normalizedH < 70) {
    if (l > 80) return 'Sunlight Glow';
    if (l > 50) return 'Golden Honey';
    return 'Bronze Topaz';
  }
  if (normalizedH < 155) {
    if (l > 75) return 'Fresh Mint';
    if (l > 45) return 'Emerald Spire';
    return 'Deep Forest';
  }
  if (normalizedH < 190) {
    if (l > 75) return 'Aqua Vapor';
    if (l > 45) return 'Cyan Splash';
    return 'Teal Depth';
  }
  if (normalizedH < 255) {
    if (l > 75) return 'Sky Glaze';
    if (l > 45) return 'Cobalt Energy';
    return 'Midnight Navy';
  }
  if (normalizedH < 290) {
    if (l > 75) return 'Lilac Dream';
    if (l > 45) return 'Electric Violet';
    return 'Imperial Indigo';
  }
  if (l > 75) return 'Sakura Pink';
  if (l > 45) return 'Neon Magenta';
  return 'Plum Shadow';
}

/**
 * Palette name generator with evocative themes.
 */
const PALETTE_NAMES = [
  'Aurora Borealis', 'Cyberpunk Neon', 'Nordic Frost', 'Desert Mirage',
  'Solar Flare', 'Matcha Cream', 'Ocean Abyss', 'Electric Orchid',
  'Earthy Terracotta', 'Tokyo Sunset', 'Lilac Twilight', 'Retro Arcade',
  'Emerald Grove', 'Coral Lagoon', 'Vaporwave Dusk', 'Galactic Nebula',
  'Autumn Hearth', 'Alpine Blossom', 'Golden Hour', 'Deep Velocity',
  'Cerulean Bloom', 'Pistachio Glow', 'Citrus Splash', 'Moonlit Horizon',
  'Lavender Haze', 'Saffron Silk', 'Tropical Breeze', 'Onyx Solitude',
  'Hyperpop Energy', 'Zen Bamboo', 'Amber Horizon', 'Monochrome Elegance',
  'Starlight Glade', 'Prism Mirage', 'Volcanic Fire', 'Pacific Cascade'
];

const HARMONY_TYPES = ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'];

/**
 * Generates 4-color palette based on harmony rules.
 */
export function generateHarmoniousColors(type, baseH, baseS, baseL) {
  const colors = [];

  switch (type) {
    case 'complementary': {
      // Base, Tint of Base, Complement, Soft Tint of Complement
      const compH = (baseH + 180) % 360;
      colors.push({ h: baseH, s: baseS, l: baseL });
      colors.push({ h: baseH, s: Math.max(25, baseS - 20), l: Math.min(88, baseL + 25) });
      colors.push({ h: compH, s: Math.min(95, baseS + 10), l: Math.max(20, baseL - 10) });
      colors.push({ h: compH, s: Math.max(20, baseS - 35), l: Math.min(92, baseL + 30) });
      break;
    }
    case 'analogous': {
      // Base - 30, Base, Base + 30, Base + 60
      colors.push({ h: (baseH - 30 + 360) % 360, s: Math.max(30, baseS - 10), l: Math.min(85, baseL + 15) });
      colors.push({ h: baseH, s: baseS, l: baseL });
      colors.push({ h: (baseH + 30) % 360, s: Math.min(95, baseS + 5), l: Math.max(30, baseL - 10) });
      colors.push({ h: (baseH + 60) % 360, s: Math.max(40, baseS - 15), l: Math.max(20, baseL - 25) });
      break;
    }
    case 'triadic': {
      // 3 equidistant points: H, H + 120, H + 240, plus a harmonious neutral/bright highlight
      const h2 = (baseH + 120) % 360;
      const h3 = (baseH + 240) % 360;
      colors.push({ h: baseH, s: baseS, l: baseL });
      colors.push({ h: h2, s: Math.min(90, baseS + 5), l: Math.min(80, baseL + 10) });
      colors.push({ h: h3, s: Math.max(45, baseS - 10), l: Math.max(35, baseL - 15) });
      colors.push({ h: baseH, s: Math.max(20, baseS - 40), l: 92 });
      break;
    }
    case 'tetradic': {
      // 4 points forming rectangle or square: H, H + 60, H + 180, H + 240
      colors.push({ h: baseH, s: baseS, l: baseL });
      colors.push({ h: (baseH + 60) % 360, s: Math.max(40, baseS - 15), l: Math.min(82, baseL + 15) });
      colors.push({ h: (baseH + 180) % 360, s: Math.min(95, baseS + 10), l: Math.max(30, baseL - 10) });
      colors.push({ h: (baseH + 240) % 360, s: Math.max(35, baseS - 25), l: 90 });
      break;
    }
    case 'monochromatic':
    default: {
      // Single hue with staggered luminance and subtle saturation shift
      colors.push({ h: baseH, s: Math.min(95, baseS + 15), l: Math.max(18, baseL - 25) });
      colors.push({ h: baseH, s: baseS, l: baseL });
      colors.push({ h: baseH, s: Math.max(25, baseS - 15), l: Math.min(78, baseL + 18) });
      colors.push({ h: baseH, s: Math.max(15, baseS - 35), l: 93 });
      break;
    }
  }

  return colors.map((c) => {
    const hex = hslToHex(c.h, c.s, c.l);
    return {
      hex,
      hsl: [Math.round(c.h), Math.round(c.s), Math.round(c.l)],
      name: getColorName(c.h, c.s, c.l),
      contrast: getContrast(hex),
    };
  });
}

/**
 * Creates a complete palette object with tags and metadata.
 */
export function createPalette(id, name, type, colors, date = new Date().toISOString(), likes = null) {
  const tags = [type];

  // Derive contextual tags from colors
  const maxSat = Math.max(...colors.map((c) => c.hsl[1]));
  const avgLight = colors.reduce((acc, c) => acc + c.hsl[2], 0) / colors.length;

  if (maxSat > 75) tags.push('vibrant');
  if (maxSat < 40) tags.push('pastel');
  if (avgLight > 65) tags.push('light');
  if (avgLight < 40) tags.push('dark');
  if (tags.length < 3) tags.push('modern');

  const randomLikes = likes !== null ? likes : Math.floor(Math.random() * 85) + 18;

  return {
    id,
    name,
    category: type,
    createdAt: date,
    likes: randomLikes,
    tags: Array.from(new Set(tags)),
    colors,
  };
}

/**
 * Generates the curated seed dataset containing 36+ diverse schemes,
 * including HexHunt's iconic signature brand palette as #1.
 */
export function generateSeedDataset() {
  const palettes = [];

  // 1. Signature Brand Palette: #30AFFF, #92EEFF, #D8FFC5, #C4F7CA
  palettes.push({
    id: 'pal-hexhunt-signature',
    name: 'HexHunt Cyan & Mint',
    category: 'analogous',
    createdAt: '2026-09-20T00:00:00.000Z',
    likes: 194,
    tags: ['analogous', 'signature', 'vibrant', 'brand', 'modern'],
    colors: [
      { hex: '#30AFFF', hsl: [203, 100, 59], name: 'Brand Primary Blue', contrast: 'dark' },
      { hex: '#92EEFF', hsl: [190, 100, 79], name: 'Brand Cyan Glow', contrast: 'dark' },
      { hex: '#D8FFC5', hsl: [100, 100, 88], name: 'Mint Sparkle', contrast: 'dark' },
      { hex: '#C4F7CA', hsl: [127, 81, 87], name: 'Pastel Border Mint', contrast: 'dark' },
    ],
  });

  // Generate 36 distinct palettes cycling through harmony types and diverse base hues
  for (let i = 0; i < PALETTE_NAMES.length; i++) {
    const name = PALETTE_NAMES[i];
    const type = HARMONY_TYPES[i % HARMONY_TYPES.length];
    const baseH = (i * 47 + 13) % 360;
    const baseS = 65 + ((i * 7) % 30); // 65-95%
    const baseL = 42 + ((i * 5) % 25); // 42-67%

    const colors = generateHarmoniousColors(type, baseH, baseS, baseL);
    // Stagger dates backwards so they appear as realistic daily releases
    const d = new Date('2026-09-19T00:00:00.000Z');
    d.setDate(d.getDate() - i);

    palettes.push(
      createPalette(
        `pal-${name.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
        name,
        type,
        colors,
        d.toISOString(),
        Math.floor(Math.random() * 120) + 15
      )
    );
  }

  return palettes;
}

/**
 * Main execution function.
 */
export function runGenerator() {
  const args = process.argv.slice(2);
  const isSeed = args.includes('--seed') || !fs.existsSync(DATA_FILE);

  let existing = [];
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      existing = JSON.parse(content);
    } catch (e) {
      console.warn('Could not read existing palettes.json, starting fresh.', e);
      existing = [];
    }
  }

  if (isSeed || existing.length < 36) {
    console.log(`Generating seed dataset with 37 diverse color schemes...`);
    const seed = generateSeedDataset();
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    console.log(`Successfully wrote ${seed.length} palettes to ${DATA_FILE}`);
    return seed;
  }

  // Daily Mode: Generate 1 new fresh palette and prepend
  const today = new Date().toISOString();
  const dayIndex = Math.floor(Date.now() / 86400000);
  const type = HARMONY_TYPES[dayIndex % HARMONY_TYPES.length];
  const baseH = Math.floor(Math.random() * 360);
  const baseS = Math.floor(Math.random() * 30) + 65;
  const baseL = Math.floor(Math.random() * 25) + 42;

  const colors = generateHarmoniousColors(type, baseH, baseS, baseL);
  const newId = `pal-${Date.now().toString(36)}`;
  const randomName = `${PALETTE_NAMES[Math.floor(Math.random() * PALETTE_NAMES.length)]} ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  
  const newPalette = createPalette(newId, randomName, type, colors, today, 0);

  const updated = [newPalette, ...existing];
  fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  console.log(`Daily palette '${randomName}' (${type}) successfully added. Total palettes: ${updated.length}`);
  return updated;
}

// Execute if called directly from CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runGenerator();
}
