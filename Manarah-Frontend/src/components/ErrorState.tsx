import React from 'react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`p-8 sm:p-10 rounded-3xl bg-rose-50/60 border border-rose-200 text-center flex flex-col items-center justify-center space-y-3.5 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl">
        ⚠️
      </div>
      <div className="max-w-md">
        <h4 className="text-sm sm:text-base font-black text-rose-900">تعذر إكمال الطلب</h4>
        <p className="text-xs sm:text-sm text-rose-700 mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
        >
          <span>إعادة المحاولة ↻</span>
        </button>
      )}
    </div>
  )
}

export default ErrorState
