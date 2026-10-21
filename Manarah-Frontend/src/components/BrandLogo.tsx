import React from 'react'
import { Link } from 'react-router-dom'
import logoFallback from '../assets/logo_transparent.png'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showSubline?: boolean
  to?: string
  className?: string
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubline = true,
  to = '/',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11 sm:w-12 sm:h-12',
    lg: 'w-14 h-14',
  }

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  const content = (
    <div className={`flex items-center gap-3.5 group cursor-pointer ${className}`}>
      {/* Glowing Icon Frame */}
      <div className="relative shrink-0">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#38BDF8] via-[#BAE6FD] to-[#D4C3A3] rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300" />
        <div className={`relative ${iconSizes[size]} bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center p-1.5 shadow-xs border border-[#E8DEC8] dark:border-slate-700 transition duration-300 group-hover:scale-[1.02]`}>
          <img
            src="/logo_trimmed.png"
            alt="شعار منصة منارة"
            className="w-full h-full object-contain"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).src = logoFallback
            }}
          />
        </div>
      </div>

      {/* Brand Typography */}
      <div className="text-start leading-none">
        <span className={`${titleSizes[size]} font-black text-[#0F172A] dark:text-white tracking-tight block transition-colors`}>
          مَنَارَة
        </span>
        {showSubline && (
          <span className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 tracking-wide block mt-1 transition-colors">
            المنصة الوطنية لربط الكفاءات بسوق العمل
          </span>
        )}
      </div>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="inline-block text-inherit no-underline">
        {content}
      </Link>
    )
  }

  return content
}

export default BrandLogo
