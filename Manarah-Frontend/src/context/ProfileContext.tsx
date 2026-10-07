import React, { createContext, useContext, useState, useEffect } from 'react'
import type { GraduateProfile } from '../types'
import { api } from '../services/api'

export function calculateCompletion(p: Partial<GraduateProfile>): number {
  const fields = [
    p.name,
    p.email,
    p.phone,
    p.city,
    p.university,
    p.major,
    p.graduationYear,
    p.gpa,
    p.experienceYears,
    p.bio,
  ]
  const filled = fields.filter((f) => Boolean(f && String(f).trim().length > 0)).length
  return Math.round((filled / fields.length) * 100)
}

const defaultProfile: GraduateProfile = {
  name: '',
  email: '',
  phone: '',
  city: 'اليمن - صنعاء',
  university: 'جامعة العلوم والتكنولوجيا',
  major: 'هندسة البرمجيات',
  graduationYear: 2026,
  gpa: '',
  experienceYears: 'حديث التخرج (0 - 1 سنة)',
  bio: '',
  isVerified: false,
  completionPercentage: 0,
}

interface ProfileContextType {
  profile: GraduateProfile
  updateProfile: (updated: Partial<GraduateProfile>) => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  verifyEmail: (userData?: any) => void
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<GraduateProfile>(() => {
    const saved = localStorage.getItem('manarah_profile')
    return saved ? JSON.parse(saved) : defaultProfile
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('manarah_token')
    return Boolean(token)
  })

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('manarah_token'))
  })

  useEffect(() => {
    localStorage.setItem('manarah_profile', JSON.stringify(profile))
  }, [profile])

  const refreshProfile = async () => {
    const token = localStorage.getItem('manarah_token')
    if (!token) {
      setIsLoading(false)
      return
    }
    try {
      const be = await api.getGraduateProfile()
      setProfile((prev) => {
        const updated: GraduateProfile = {
          ...prev,
          name: be.full_name || (be.first_name || be.last_name ? `${be.first_name} ${be.last_name}`.trim() : be.user_name || prev.name),
          email: be.email || prev.email,
          phone: be.phone || prev.phone,
          city: be.city || prev.city,
          university: be.university || prev.university,
          major: be.specialization || prev.major,
          graduationYear: be.graduation_year || prev.graduationYear,
          gpa: be.gpa || prev.gpa,
          experienceYears: be.years_of_experience || prev.experienceYears,
          bio: be.bio || prev.bio,
          isVerified: be.email_verified,
        }
        updated.completionPercentage = calculateCompletion(updated)
        return updated
      })
      setIsAuthenticated(true)
    } catch (err) {
      console.warn('Could not fetch backend profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (localStorage.getItem('manarah_token')) {
      refreshProfile()
    } else {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = async (updated: Partial<GraduateProfile>) => {
    const nextProfile = { ...profile, ...updated }
    nextProfile.completionPercentage = calculateCompletion(nextProfile)
    setProfile(nextProfile)

    if (localStorage.getItem('manarah_token')) {
      const res = await api.updateGraduateProfile({
        full_name: updated.name !== undefined ? updated.name : profile.name,
        phone: updated.phone !== undefined ? updated.phone : profile.phone,
        city: updated.city !== undefined ? updated.city : profile.city,
        university: updated.university !== undefined ? updated.university : profile.university,
        specialization: updated.major !== undefined ? updated.major : profile.major,
        graduation_year: updated.graduationYear !== undefined ? updated.graduationYear : profile.graduationYear,
        gpa: updated.gpa !== undefined ? updated.gpa : profile.gpa,
        years_of_experience: updated.experienceYears !== undefined ? updated.experienceYears : profile.experienceYears,
        bio: updated.bio !== undefined ? updated.bio : profile.bio,
      })
      if (res) {
        setProfile((prev) => {
          const fresh: GraduateProfile = {
            ...prev,
            name: res.full_name || prev.name,
            phone: res.phone || prev.phone,
            city: res.city || prev.city,
            university: res.university || prev.university,
            major: res.specialization || prev.major,
            graduationYear: res.graduation_year || prev.graduationYear,
            gpa: res.gpa || prev.gpa,
            experienceYears: res.years_of_experience || prev.experienceYears,
            bio: res.bio || prev.bio,
          }
          fresh.completionPercentage = calculateCompletion(fresh)
          return fresh
        })
      }
    }
  }

  const verifyEmail = (userData?: any) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        isVerified: true,
        ...(userData ? {
          name: userData.name || prev.name,
          email: userData.email || prev.email,
          phone: userData.phone || prev.phone,
        } : {}),
      }
      next.completionPercentage = calculateCompletion(next)
      return next
    })
    setIsAuthenticated(true)
  }

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور.')
    }
    const res = await api.login({ email, password })
    setIsAuthenticated(true)
    if (res.user) {
      setProfile((prev) => {
        const updated = {
          ...prev,
          name: res.user.name || prev.name,
          email: res.user.email || prev.email,
          phone: res.user.phone || prev.phone,
          isVerified: res.user.email_verified,
        }
        updated.completionPercentage = calculateCompletion(updated)
        return updated
      })
    }
    await refreshProfile()
  }

  const logout = async () => {
    await api.logout()
    localStorage.removeItem('manarah_token')
    localStorage.removeItem('manarah_profile')
    setIsAuthenticated(false)
    setProfile(defaultProfile)
  }

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, isAuthenticated, isLoading, login, logout, verifyEmail, refreshProfile }}>
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
