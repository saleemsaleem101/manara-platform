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
      className={`p-10 sm:p-14 rounded-3xl bg-white border border-[#E2E8F0] text-center flex flex-col items-center justify-center space-y-4 shadow-xs ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#64748B] text-2xl">
        {icon || '📋'}
      </div>
      <div className="max-w-md space-y-1.5">
        <h3 className="text-base sm:text-lg font-black text-[#0F1E36]">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{description}</p>
        )}
      </div>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-slate-900 text-white font-bold text-xs transition shadow-xs"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && !actionTo && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-slate-900 text-white font-bold text-xs transition shadow-xs cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
