# HexHunt 🎨 | Automated Daily Color Palettes for Designers

[![Deploy to GitHub Pages](https://github.com/hexhunt/hexhunt.github.io/actions/workflows/daily-palettes.yml/badge.svg)](https://github.com/hexhunt/hexhunt.github.io/actions/workflows/daily-palettes.yml)
[![Astro 5](https://img.shields.io/badge/Astro-5.0-FF5D01.svg?style=flat&logo=astro)](https://astro.build)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-30AFFF.svg)](LICENSE)
[![Buy Me A Coffee](https://img.shields.io/badge/Support-Buy%20Me%20A%20Coffee-FFDD00.svg?logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/kisharadilz)

> **Live Website:** [https://hexhunt.github.io](https://hexhunt.github.io)  
> **A 100% serverless, zero-maintenance color discovery platform for visionary UI/UX designers and developers.**

HexHunt uses an algorithmic Node.js color theory generator running on **GitHub Actions (Cron)** to auto-generate mathematically harmonious **Complementary**, **Analogous**, **Triadic**, **Tetradic**, and **Monochromatic** color schemes every day, committing them directly to a local JSON database and publishing instantly to GitHub Pages.

---

## 🌟 Key Features

- ⚡ **Zero Serverless Maintenance:** 100% static site generation via Astro 5. No monthly cloud costs, no database servers to maintain.
- 🎨 **Mathematical HSL Color Theory:** Palettes are calculated using precise angular color wheel formulas (\(\Delta H = 180^\circ, \pm 30^\circ, 120^\circ, 90^\circ\)) and WCAG perceived luminance contrast thresholds.
- 🔄 **Automated Daily Releases:** GitHub Actions cron schedule (`0 0 * * *`) calculates fresh palettes at midnight UTC, commits `src/data/palettes.json`, and triggers the deployment pipeline.
- 📋 **One-Click Clipboard Copying:** Click any color swatch to copy its `#HEX` code with instant tooltip feedback and bottom glassmorphic toast notifications.
- 📦 **Developer Export Tools:** One-click export for CSS Custom Properties (`:root { --color-1: ...; }`) and Tailwind CSS color config snippets.
- 💖 **Optimistic Likes Tracker:** Instant UI feedback with heart animations, local persistence in `localStorage`, and silent serverless counter synchronization.
- 🌓 **Anti-FOUC Persistent Theme:** Synchronous `<script is:inline>` evaluates `localStorage.theme` and OS preference to prevent theme flashing during page load.
- 🌐 **Full 6-Locale Internationalization (i18n):** Subpath routing across **English (`en`)**, **Spanish (`es`)**, **Portuguese (`pt`)**, **German (`de`)**, **French (`fr`)**, and **Japanese (`ja`)**.
- 🚀 **100% World-Class SEO Score:** Comprehensive JSON-LD structured data (`WebApplication`, `CollectionPage`, `BreadcrumbList`, `Organization`, `WebSite`), 7 bidirectional `hreflang` tags + `x-default`, dynamic XML sitemap, and high-resolution Cloudinary social Open Graph cards.
- 📊 **Integrated Google Analytics 4:** Pre-configured with Google tag (`gtag.js`).

---

## 🎨 Brand Design System

HexHunt's user interface strictly integrates a signature high-contrast pastel brand palette:

| Token | Hex Value | Role |
|---|---|---|
| `brand_primary` | `#30AFFF` | Primary CTA, active tab highlights, link accents |
| `brand_accent_light` | `#92EEFF` | Hover glow states, gradients, secondary highlights |
| `surface_highlight` | `#D8FFC5` | Badges, success indicators, tag pills |
| `border_accent` | `#C4F7CA` | Subtle borders, dividers, card boundaries |

---

## 🔬 Mathematical Color Harmony Theory

The engine in [`scripts/generate-palettes.js`](scripts/generate-palettes.js) constructs palettes based on color physics:

1. **Complementary (\(\Delta H = 180^\circ\)):** High-contrast opposites on the color wheel paired with luminance-calibrated tints for call-to-actions.
2. **Analogous (\(\Delta H = \pm 30^\circ\)):** Adjacent neighbors on the color circle creating organic, serene, and calming UI themes.
3. **Triadic (\(\Delta H = 120^\circ\)):** Equidistant triangle points providing vibrant diversity while maintaining visual balance.
4. **Tetradic (\(\Delta H = 90^\circ / 60^\circ\)):** Two complementary pairs delivering maximum depth and versatility across complex UI components.
5. **Monochromatic (\(\Delta H = 0^\circ\)):** A single base hue with calibrated steps in saturation and lightness for sleek, modern interfaces.

---

## 🛠️ Technology Stack

- **Framework:** [Astro 5](https://astro.build/) (Static Site Generation mode)
- **UI Engine:** [React 19](https://react.dev/) (Hydrated Astro Islands with `client:load`)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Class-based dark mode)
- **Typography & Icons:** [Lucide React](https://lucide.dev/)
- **Data Layer:** Local `src/data/palettes.json` updated via Git
- **Hosting:** [GitHub Pages](https://pages.github.com/) with GitHub Actions CI/CD
- **Analytics:** Google Analytics 4 (`gtag.js`)

---

## 📁 Project Structure

```text
hexhunt.github.io/
├── .github/
│   └── workflows/
│       └── daily-palettes.yml    # Daily cron workflow & Pages deploy
├── public/
│   ├── favicon.svg               # Vector brand favicon
│   ├── robots.txt                # Search engine crawler directives
│   └── sitemap.xml               # Complete multi-lingual XML sitemap
├── scripts/
│   └── generate-palettes.js      # HSL color harmony calculation engine
├── src/
│   ├── components/
│   │   ├── Footer.astro          # Semantic footer & Color theory guide
│   │   ├── Header.astro          # Sticky top bar with brand & CTAs
│   │   ├── Hero.astro            # Hero title, subtitle, and badges
│   │   ├── LanguagePicker.astro  # Interactive 6-locale dropdown
│   │   ├── PaletteCard.tsx       # 4-color swatch card, copy & like triggers
│   │   ├── PaletteGrid.tsx       # Search, harmony filters, and sort island
│   │   ├── ThemeToggle.astro     # Light/Dark switcher
│   │   └── Toast.tsx             # Floating copy notification pill
│   ├── data/
│   │   └── palettes.json         # Automated local palette store
│   ├── i18n/
│   │   ├── ui.ts                 # Dictionaries for en, es, pt, de, fr, ja
│   │   └── utils.ts              # Route extraction & hreflang helpers
│   ├── layouts/
│   │   └── Layout.astro          # Master HTML, anti-FOUC, SEO & Analytics
│   └── pages/
│       ├── index.astro           # English root (/)
│       └── [lang]/
│           └── index.astro       # Regional subpaths (/es/, /pt/, /de/, /fr/, /ja/)
├── astro.config.mjs              # Astro 5 configuration & i18n routing
├── tailwind.config.mjs           # Tailwind theme & custom palette tokens
├── tsconfig.json                 # Strict TypeScript configuration
└── package.json                  # Dependencies & scripts
```

---

## 🚀 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/hexhunt/hexhunt.github.io.git
cd hexhunt.github.io
```

### 2. Install dependencies
```bash
npm install
```

### 3. Generate seed palettes
```bash
node scripts/generate-palettes.js --seed
```

### 4. Start development server
```bash
npm run dev
```
Visit `http://localhost:4321` in your browser.

### 5. Build for production
```bash
npm run build
```
Build output will be generated in the `dist/` directory.

---

## 🤖 GitHub Actions Automation

HexHunt is completely autonomous. The workflow file [`.github/workflows/daily-palettes.yml`](.github/workflows/daily-palettes.yml) runs every night at **00:00 UTC**:

1. Checks out the repository.
2. Runs `node scripts/generate-palettes.js` to compute a new harmonious palette.
3. Automatically commits the new palette to `src/data/palettes.json` using the GitHub Actions Bot.
4. Builds the static Astro site.
5. Deploys the artifacts to GitHub Pages with zero downtime.

You can also manually trigger a new release anytime via the **Actions** tab in GitHub (`workflow_dispatch`).

---

## ☕ Support the Developer

HexHunt is free and open source. If you love using it in your design and development workflow, please consider buying me a coffee:

👉 **[Support Kishara Dilz on Buy Me a Coffee](https://buymeacoffee.com/kisharadilz)**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
