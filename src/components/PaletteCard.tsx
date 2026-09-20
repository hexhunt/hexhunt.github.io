import React, { useState } from 'react';

export interface ColorItem {
  hex: string;
  hsl: number[];
  name: string;
  contrast: 'light' | 'dark';
}

export interface Palette {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  likes: number;
  tags: string[];
  colors: ColorItem[];
}

interface PaletteCardProps {
  palette: Palette;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  onCopy: (hex: string, customMessage?: string) => void;
  labels: {
    copyHex: string;
    copied: string;
    like: string;
    liked: string;
    export: string;
    exportCss: string;
    exportTailwind: string;
  };
}

export const PaletteCard: React.FC<PaletteCardProps> = ({
  palette,
  isLiked,
  onToggleLike,
  onCopy,
  labels,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    onCopy(hex);
    setTimeout(() => {
      setCopiedHex(null);
    }, 1500);
  };

  const handleCopyCssVars = () => {
    const css = palette.colors
      .map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} */`)
      .join('\n');
    const fullSnippet = `:root {\n${css}\n}`;
    navigator.clipboard.writeText(fullSnippet);
    onCopy(palette.colors[0].hex, labels.exportCss);
    setShowExportMenu(false);
  };

  const handleCopyTailwind = () => {
    const slug = palette.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const tailwindSnippet = `'${slug}': {\n${palette.colors
      .map((c, i) => `  '${(i + 1) * 100}': '${c.hex}',`)
      .join('\n')}\n}`;
    navigator.clipboard.writeText(tailwindSnippet);
    onCopy(palette.colors[0].hex, labels.exportTailwind);
    setShowExportMenu(false);
  };

  const formattedDate = new Date(palette.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group relative flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-[#C4F7CA] dark:border-slate-800 shadow-sm hover:shadow-[0_12px_30px_-4px_rgba(48,175,255,0.18)] dark:hover:shadow-[0_12px_30px_-4px_rgba(48,175,255,0.25)] hover:border-[#30AFFF]/50 dark:hover:border-[#92EEFF]/40 transition-all duration-300 overflow-hidden">
      
      {/* 4-Color Swatch Display */}
      <div className="relative h-44 w-full flex flex-row overflow-hidden bg-slate-100 dark:bg-slate-800">
        {palette.colors.map((color, index) => {
          const isCurrentCopied = copiedHex === color.hex;
          const isLightText = color.contrast === 'light';

          return (
            <button
              key={`${palette.id}-${color.hex}-${index}`}
              type="button"
              onClick={() => handleCopyColor(color.hex)}
              className="group/swatch relative flex-1 h-full flex flex-col justify-end p-2 transition-all duration-300 hover:flex-[1.4] hover:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#30AFFF]"
              style={{ backgroundColor: color.hex }}
              title={`${color.name} (${color.hex}) - Click to copy`}
              aria-label={`Copy ${color.name} ${color.hex}`}
            >
              {/* Copy Tooltip on Hover */}
              <div
                className={`absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-200 pointer-events-none px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase whitespace-nowrap shadow-md ${
                  isLightText
                    ? 'bg-white/90 text-slate-900 backdrop-blur-sm'
                    : 'bg-slate-900/90 text-white backdrop-blur-sm'
                }`}
              >
                {isCurrentCopied ? labels.copied : labels.copyHex}
              </div>

              {/* Hex label on swatch bottom */}
              <span
                className={`text-[11px] font-mono font-bold tracking-tight text-center truncate drop-shadow-sm transition-transform duration-200 group-hover/swatch:scale-105 ${
                  isLightText ? 'text-white' : 'text-slate-900'
                }`}
              >
                {color.hex}
              </span>
            </button>
          );
        })}
      </div>

      {/* Card Metadata & Actions */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        
        {/* Title & Harmony Badge */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={palette.name}>
              {palette.name}
            </h3>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D8FFC5]/70 text-slate-800 dark:bg-[#D8FFC5]/15 dark:text-[#D8FFC5] border border-[#C4F7CA] dark:border-transparent">
              {palette.category}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="capitalize truncate">{palette.tags.slice(0, 2).join(', ')}</span>
          </div>
        </div>

        {/* Footer Actions: Likes & Export */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          
          {/* Like Button */}
          <button
            type="button"
            onClick={() => onToggleLike(palette.id)}
            className={`group/like flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#30AFFF] ${
              isLiked
                ? 'text-red-500 bg-red-50 dark:bg-red-950/40'
                : 'text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            aria-label={isLiked ? labels.liked : labels.like}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 group-hover/like:scale-125 ${
                isLiked ? 'fill-red-500 text-red-500 animate-bounce-short' : 'fill-transparent stroke-current'
              }`}
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            <span className="tabular-nums font-medium">{palette.likes}</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              aria-label="Export options"
              title="Export color codes"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{labels.export}</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 bottom-full mb-1.5 w-44 rounded-xl bg-white dark:bg-slate-900 border border-[#C4F7CA] dark:border-slate-800 shadow-xl p-1 z-20 animate-fade-in text-xs">
                <button
                  type="button"
                  onClick={handleCopyCssVars}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {labels.exportCss}
                </button>
                <button
                  type="button"
                  onClick={handleCopyTailwind}
                  className="w-full text-left px-2.5 py-1.5 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {labels.exportTailwind}
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
