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
      className={`p-8 sm:p-10 rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 backdrop-blur-md text-center flex flex-col items-center justify-center space-y-3.5 shadow-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center text-xl shadow-inner">
        ⚠️
      </div>
      <div className="max-w-md">
        <h4 className="text-sm sm:text-base font-black text-rose-900 dark:text-rose-200">تعذر إكمال الطلب</h4>
        <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300/80 mt-1 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md cursor-pointer"
        >
          <span>إعادة المحاولة ↻</span>
        </button>
      )}
    </div>
  )
}

export default ErrorState
