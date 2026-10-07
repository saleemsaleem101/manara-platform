import React, { createContext, useContext, useState, useEffect } from 'react'
import type { GraduateProfile } from '../types'
import { api } from '../services/api'

const defaultProfile: GraduateProfile = {
  name: 'جلال عبد الملك الصوفي',
  email: 'jalal.matluq@gmail.com',
  phone: '+967 770 000 000',
  city: 'اليمن - صنعاء',
  university: 'جامعة العلوم والتكنولوجيا',
  major: 'هندسة البرمجيات',
  graduationYear: 2026,
  gpa: '92% (ممتاز)',
  experienceYears: 'حديث التخرج (0 - 1 سنة)',
  bio: 'مهندس برمجيات شغوف ومطور واجهات أمامية متخصص في بناء تطبيقات ويب عصرية وسلسة باستخدام React و TypeScript و Tailwind CSS. أمتلك خبرة عملية في تطبيق معايير هندسة البرمجيات ومنهجيات Agile/Scrum وتصميم أنظمة التصميم (Design Systems). أهدف للانضمام إلى فريق تطوير متميز يتيح لي استثمار مهاراتي والمساهمة في بناء حلول رقمية مبتكرة تلبي متطلبات سوق العمل اليمني والإقليمي.',
  isVerified: false,
  completionPercentage: 85,
  skills: [
    'React.js',
    'TypeScript',
    'Tailwind CSS',
    'Figma UI/UX',
    'REST APIs',
    'Git & GitHub',
    'Agile / Scrum',
  ],
  cvFile: {
    name: 'السيرة_الذاتية_جلال_الصوفي_2026.pdf',
    size: '1.8 MB',
    uploadedAt: '2026-10-07',
    type: 'application/pdf',
  },
}

interface ProfileContextType {
  profile: GraduateProfile
  updateProfile: (updated: Partial<GraduateProfile>) => Promise<void>
  isAuthenticated: boolean
  login: (email: string, password?: string) => Promise<void>
  logout: () => Promise<void>
  verifyEmail: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<GraduateProfile>(() => {
    const saved = localStorage.getItem('manarah_profile')
    return saved ? JSON.parse(saved) : defaultProfile
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('manarah_auth')
    return saved ? JSON.parse(saved) : true
  })

  useEffect(() => {
    localStorage.setItem('manarah_profile', JSON.stringify(profile))
  }, [profile])

  useEffect(() => {
    localStorage.setItem('manarah_auth', JSON.stringify(isAuthenticated))
  }, [isAuthenticated])

  const updateProfile = async (updated: Partial<GraduateProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }))
    // Try to sync with backend if token exists
    try {
      if (localStorage.getItem('manarah_token')) {
        await api.updateGraduateProfile({
          full_name: updated.name || profile.name,
          phone: updated.phone || profile.phone,
          city: updated.city || profile.city,
          university: updated.university || profile.university,
          specialization: updated.major || profile.major,
          graduation_year: updated.graduationYear || profile.graduationYear,
          gpa: updated.gpa || profile.gpa,
          years_of_experience: updated.experienceYears || profile.experienceYears,
          bio: updated.bio || profile.bio,
        })
      }
    } catch {
      // Local state is preserved
    }
  }

  const verifyEmail = () => {
    setProfile((prev) => ({ ...prev, isVerified: true }))
    setIsAuthenticated(true)
  }

  const login = async (email: string, password?: string) => {
    setIsAuthenticated(true)
    setProfile((prev) => ({ ...prev, email: email || prev.email }))
    if (email && password) {
      try {
        const res = await api.login({ email, password })
        if (res.user) {
          setProfile((prev) => ({
            ...prev,
            name: res.user.name || prev.name,
            email: res.user.email || prev.email,
            phone: res.user.phone || prev.phone,
            isVerified: res.user.email_verified,
          }))
        }
      } catch {
        // Fallback to local authentication
      }
    }
  }

  const logout = async () => {
    await api.logout()
    setIsAuthenticated(false)
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, isAuthenticated, login, logout, verifyEmail }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}
