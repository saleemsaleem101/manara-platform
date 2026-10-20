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
        <div className="w-12 h-12 rounded-full border-3 border-slate-200 border-t-[#0F1E36] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
        </div>
      </div>
      <p className="text-xs sm:text-sm font-bold text-[#64748B]">{message}</p>
    </div>
  )
}

export default LoadingState
