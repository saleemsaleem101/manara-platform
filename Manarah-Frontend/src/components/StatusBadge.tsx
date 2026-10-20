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
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses} ${className}`}
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
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span>{status === 'PENDING' ? 'بانتظار المراجعة' : 'قيد المراجعة'}</span>
        </span>
      )

    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>مرفوض</span>
        </span>
      )

    case 'OPEN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>مفتوحة</span>
        </span>
      )

    case 'CLOSED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>مغلقة</span>
        </span>
      )

    case 'HIDDEN':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses} ${className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          <span>مخفية</span>
        </span>
      )

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses} ${className}`}
        >
          <span>{status}</span>
        </span>
      )
  }
}

export default StatusBadge
