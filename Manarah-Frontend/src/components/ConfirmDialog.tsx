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
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
    warning: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
    primary: 'bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white',
  }[variant]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-xs font-['Cairo'] text-start"
      dir="rtl"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EAE4D9] space-y-4 transition-all duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl ${
              variant === 'danger'
                ? 'bg-rose-100 text-rose-600'
                : variant === 'warning'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {variant === 'danger' ? '🗑️' : variant === 'warning' ? '⚠️' : 'ℹ️'}
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-base sm:text-lg font-black text-[#0F172A]">{title}</h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs cursor-pointer ${confirmColor}`}
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
