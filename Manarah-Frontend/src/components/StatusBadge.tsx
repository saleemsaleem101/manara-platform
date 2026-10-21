import React from 'react'

export type StatusType =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'PENDING'
  | 'APPROVED'
  | 'OPEN'
  | 'CLOSED'
  | 'HIDDEN'
  | string

interface StatusBadgeProps {
  status: StatusType
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-[11px]',
    lg: 'px-3.5 py-1.5 text-xs',
  }[size]

  switch (status) {
    case 'ACCEPTED':
    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{status === 'APPROVED' ? 'معتمد رسمياً' : 'مقبول'}</span>
        </span>
      )

    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 shadow-xs ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{status === 'PENDING' ? 'بانتظار المراجعة' : 'قيد المراجعة'}</span>
        </span>
      )

    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 shadow-xs ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>مرفوض</span>
        </span>
      )

    case 'OPEN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>مفتوحة</span>
        </span>
      )

    case 'CLOSED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>مغلقة</span>
        </span>
      )

    case 'HIDDEN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-[#FAF7F2] dark:bg-slate-800 text-[#6C4F3D] dark:text-slate-300 border border-[#E8DEC8] dark:border-slate-700 shadow-xs ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>مخفية</span>
        </span>
      )

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs ${sizeClasses} ${className}`}
        >
          <span>{status}</span>
        </span>
      )
  }
}

export default StatusBadge
