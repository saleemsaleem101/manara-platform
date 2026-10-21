import React from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'primary'
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'تأكيد الإجراء',
  cancelLabel = 'إلغاء',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  const confirmColor = {
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
    warning: 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs',
    primary: 'bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] hover:brightness-105 text-white shadow-xs',
  }[variant]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md font-['Cairo'] text-start animate-fadeIn"
      dir="rtl"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#E8DEC8] dark:border-slate-800 space-y-4 transition-all duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl border ${
              variant === 'danger'
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 border-rose-200 dark:border-rose-900/40'
                : variant === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 border-amber-200 dark:border-amber-900/40'
                : 'bg-[#E0F2FE] dark:bg-sky-950/50 text-[#0284C7] dark:text-[#38BDF8] border-[#BAE6FD] dark:border-sky-500/40'
            }`}
          >
            {variant === 'danger' ? '🗑️' : variant === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white">{title}</h3>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E8DEC8] dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-[#E8DEC8] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#475569] dark:text-slate-300 font-bold text-xs hover:bg-[#FAF7F2] dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${confirmColor}`}
          >
            {isLoading && (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
