import React from 'react';

export interface ToastProps {
  message: string | null;
  colorHex?: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, colorHex, onClose }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 dark:bg-slate-900/95 text-white border border-[#C4F7CA]/40 shadow-2xl backdrop-blur-md animate-slide-up transition-all"
    >
      {colorHex && (
        <span
          className="w-5 h-5 rounded-full border-2 border-white/80 shadow-sm shrink-0"
          style={{ backgroundColor: colorHex }}
        />
      )}
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-[#D8FFC5] shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium tracking-wide">{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-slate-400 hover:text-white p-1 rounded-md transition-colors focus:outline-none"
          aria-label="Dismiss notification"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};
