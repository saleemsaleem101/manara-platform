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
      className={`p-10 sm:p-14 rounded-3xl bg-white border border-[#EAE4D9] text-center flex flex-col items-center justify-center space-y-4 shadow-2xs ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#E8F4FC] border border-[#BAE3F9] flex items-center justify-center text-[#0284C7] text-2xl">
        {icon || '📋'}
      </div>
      <div className="max-w-md space-y-1.5">
        <h3 className="text-base sm:text-lg font-black text-[#0F172A]">{title}</h3>
        {description && (
          <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">{description}</p>
        )}
      </div>

      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white font-black text-xs transition shadow-xs"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && !actionTo && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white font-black text-xs transition shadow-xs cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
