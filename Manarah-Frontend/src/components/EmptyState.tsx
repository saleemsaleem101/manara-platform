import React from 'react'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionTo?: string
  onAction?: () => void
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`p-10 sm:p-14 rounded-3xl glass-silk-card bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-[#E8DEC8] dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-4 shadow-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#E0F2FE]/70 dark:bg-sky-950/50 border border-[#BAE6FD] dark:border-sky-800 flex items-center justify-center text-[#0284C7] dark:text-[#38BDF8] text-2xl shadow-inner">
        {icon || '📋'}
      </div>
      <div className="max-w-md space-y-1.5">
        <h3 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-[#6C4F3D] dark:text-slate-300 leading-relaxed">{description}</p>
        )}
      </div>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-xs transition shadow-md hover:shadow-sky-500/20"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && !actionTo && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:from-[#0369A1] hover:to-[#0284C7] text-white font-black text-xs transition shadow-md hover:shadow-sky-500/20 cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
