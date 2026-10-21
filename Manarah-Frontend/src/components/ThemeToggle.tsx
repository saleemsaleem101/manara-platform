import React from 'react'
import { useTheme } from '../context/ThemeContext'

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'التحويل للوضع النهاري الفاتح' : 'التحويل للوضع الليلي المظلم'}
      aria-label={isDark ? 'التحويل للوضع النهاري' : 'التحويل للوضع الليلي'}
      className={`relative inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 cursor-pointer shadow-2xs select-none ${
        isDark
          ? 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800 hover:border-slate-600'
          : 'bg-[#FBF9F5] border-[#EAE4D9] text-slate-700 hover:bg-[#F4EFE6] hover:text-[#0284C7]'
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          /* Glowing Moon */
          <svg
            className="w-4 h-4 text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.5)] transition-transform duration-300 rotate-0 scale-100"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M21.64 13a1 1 0 00-1.05-.14 8.05 8.05 0 01-3.37.73A8.15 8.15 0 019.08 5.49a8.59 8.59 0 01.25-2A1 1 0 008 2.36a10.14 10.14 0 1014 11.69 1 1 0 00-.36-1.05z" />
          </svg>
        ) : (
          /* Glowing Sun */
          <svg
            className="w-4 h-4 text-amber-500 transition-transform duration-300 rotate-0 scale-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-bold font-sans">
          {isDark ? 'الوضع الليلي' : 'الوضع النهاري'}
        </span>
      )}
    </button>
  )
}

export default ThemeToggle
