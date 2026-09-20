import React, { useState, useEffect, useMemo } from 'react';
import { PaletteCard, type Palette } from './PaletteCard';
import { Toast } from './Toast';
import rawPalettes from '../data/palettes.json';
import { ui, defaultLang, type SupportedLocale } from '../i18n/ui';

interface PaletteGridProps {
  currentLang?: SupportedLocale;
}

const LIKES_STORAGE_KEY = 'hexhunt_user_likes_v1';

export const PaletteGrid: React.FC<PaletteGridProps> = ({ currentLang = defaultLang }) => {
  const dict = ui[currentLang] || ui[defaultLang];

  const [palettes, setPalettes] = useState<Palette[]>(rawPalettes as Palette[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string | null; colorHex: string | null }>({
    message: null,
    colorHex: null,
  });

  const LIKES_COUNTS_KEY = 'hexhunt_likes_counts_v1';

  // Load liked palettes and persisted counts from localStorage on mount
  useEffect(() => {
    try {
      const storedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
      const userLikedSet = new Set<string>(storedLikes ? JSON.parse(storedLikes) : []);
      setLikedIds(userLikedSet);

      const storedCounts = localStorage.getItem(LIKES_COUNTS_KEY);
      const customCounts: Record<string, number> = storedCounts ? JSON.parse(storedCounts) : {};

      // Ensure counts reflect liked palettes across browser refreshes
      setPalettes((prev) =>
        prev.map((p) => {
          let currentCount = customCounts[p.id] ?? p.likes;
          if (userLikedSet.has(p.id) && customCounts[p.id] === undefined) {
            currentCount = p.likes + 1;
          }
          return {
            ...p,
            likes: currentCount,
          };
        })
      );
    } catch (e) {
      console.warn('Could not read likes from localStorage', e);
    }
  }, []);

  // Handle like toggle with optimistic UI, localStorage persistence and serverless counter sync
  const handleToggleLike = (paletteId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      const isCurrentlyLiked = next.has(paletteId);

      if (isCurrentlyLiked) {
        next.delete(paletteId);
      } else {
        next.add(paletteId);
      }

      try {
        localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.warn('Could not save likes to localStorage', e);
      }

      // Optimistically update the count in local state and persist to localStorage
      setPalettes((currentPalettes) => {
        const updated = currentPalettes.map((p) => {
          if (p.id === paletteId) {
            const newCount = isCurrentlyLiked ? Math.max(0, p.likes - 1) : p.likes + 1;
            try {
              const storedCounts = localStorage.getItem(LIKES_COUNTS_KEY);
              const counts = storedCounts ? JSON.parse(storedCounts) : {};
              counts[p.id] = newCount;
              localStorage.setItem(LIKES_COUNTS_KEY, JSON.stringify(counts));
            } catch (_) {}
            return {
              ...p,
              likes: newCount,
            };
          }
          return p;
        });
        return updated;
      });

      // Fire asynchronous serverless counter sync (with silent offline/adblocker fallback)
      try {
        const action = isCurrentlyLiked ? 'down' : 'up';
        fetch(`https://api.counterapi.dev/v1/hexhunt/${encodeURIComponent(paletteId)}/${action}`, {
          method: 'GET',
          mode: 'cors',
        }).catch(() => {
          // Graceful fallback: local state and localStorage continue working seamlessly
        });
      } catch (_) {}

      return next;
    });
  };

  // Toast handler with auto-dismiss
  const handleCopy = (hex: string, customMessage?: string) => {
    const msg = customMessage || dict['toast.copied'].replace('{hex}', hex);
    setToast({ message: msg, colorHex: hex });

    window.clearTimeout((window as any)._hexToastTimer);
    (window as any)._hexToastTimer = window.setTimeout(() => {
      setToast({ message: null, colorHex: null });
    }, 2800);
  };

  // Filter and sort items
  const filteredPalettes = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();

    return palettes
      .filter((palette) => {
        // Harmony filter
        if (activeFilter !== 'all' && palette.category !== activeFilter) {
          return false;
        }

        // Search filter: matches name, tags, or hex codes
        if (cleanSearch) {
          const matchName = palette.name.toLowerCase().includes(cleanSearch);
          const matchCategory = palette.category.toLowerCase().includes(cleanSearch);
          const matchTags = palette.tags.some((t) => t.toLowerCase().includes(cleanSearch));
          const matchHex = palette.colors.some(
            (c) =>
              c.hex.toLowerCase().includes(cleanSearch) ||
              c.name.toLowerCase().includes(cleanSearch)
          );

          if (!matchName && !matchCategory && !matchTags && !matchHex) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          return b.likes - a.likes;
        }
        // Default latest: newest date first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [palettes, searchTerm, activeFilter, sortBy]);

  const filterOptions = [
    { id: 'all', label: dict['filter.all'] },
    { id: 'complementary', label: dict['filter.complementary'] },
    { id: 'analogous', label: dict['filter.analogous'] },
    { id: 'triadic', label: dict['filter.triadic'] },
    { id: 'tetradic', label: dict['filter.tetradic'] },
    { id: 'monochromatic', label: dict['filter.monochromatic'] },
  ];

  const handleResetFilters = () => {
    setSearchTerm('');
    setActiveFilter('all');
    setSortBy('latest');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Control Bar: Search, Category Filters, and Sort */}
      <div className="flex flex-col gap-5 mb-8">
        
        {/* Top Row: Search Input & Sort Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={dict['search.placeholder']}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#C4F7CA] dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#30AFFF] focus:border-transparent transition-all shadow-sm"
              aria-label="Search color schemes"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label={dict['search.clear']}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Sort Selector & Results Count */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="text-[#30AFFF] font-bold">{filteredPalettes.length}</span> {dict['stats.palettesCount']}
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[#C4F7CA]/60 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSortBy('latest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === 'latest'
                    ? 'bg-white dark:bg-slate-800 text-[#30AFFF] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {dict['sort.latest']}
              </button>
              <button
                type="button"
                onClick={() => setSortBy('popular')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === 'popular'
                    ? 'bg-white dark:bg-slate-800 text-[#30AFFF] shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {dict['sort.popular']}
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Row: Harmony Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {filterOptions.map((opt) => {
            const isActive = activeFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActiveFilter(opt.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#30AFFF] ${
                  isActive
                    ? 'bg-[#30AFFF] text-white shadow-md shadow-[#30AFFF]/25 ring-1 ring-[#30AFFF]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-[#C4F7CA] dark:border-slate-800 hover:border-[#30AFFF] dark:hover:border-[#30AFFF] hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Palettes Grid */}
      {filteredPalettes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPalettes.map((palette) => (
            <PaletteCard
              key={palette.id}
              palette={palette}
              isLiked={likedIds.has(palette.id)}
              onToggleLike={handleToggleLike}
              onCopy={handleCopy}
              labels={{
                copyHex: dict['card.copyHex'],
                copied: dict['card.copied'],
                like: dict['card.like'],
                liked: dict['card.liked'],
                export: dict['card.export'],
                exportCss: dict['card.exportCss'],
                exportTailwind: dict['card.exportTailwind'],
              }}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 px-4 text-center rounded-2xl bg-white/50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[#30AFFF]">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            {dict['empty.title']}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            {dict['empty.subtitle']}
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#30AFFF] text-white hover:bg-[#92EEFF] hover:text-slate-900 transition-colors shadow-sm"
          >
            {dict['empty.reset']}
          </button>
        </div>
      )}

      {/* Floating Clipboard Toast */}
      <Toast
        message={toast.message}
        colorHex={toast.colorHex}
        onClose={() => setToast({ message: null, colorHex: null })}
      />
    </div>
  );
};
