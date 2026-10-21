import React from 'react'

interface LoadingStateProps {
  message?: string
  className?: string
  minHeight?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'جاري تحميل البيانات...',
  className = '',
  minHeight = 'min-h-[280px]',
}) => {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center p-8 ${minHeight} ${className}`}
    >
      <div className="relative w-12 h-12 mb-4">
        <div className="w-12 h-12 rounded-full border-3 border-[#E8DEC8] dark:border-slate-800 border-t-[#0284C7] dark:border-t-[#38BDF8] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0284C7] dark:bg-[#38BDF8] animate-ping" />
        </div>
      </div>
      <p className="text-xs sm:text-sm font-bold text-[#6C4F3D] dark:text-slate-300">{message}</p>
    </div>
  )
}

export default LoadingState
