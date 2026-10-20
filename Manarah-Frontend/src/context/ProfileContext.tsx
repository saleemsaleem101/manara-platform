import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { GraduateProfile, AuthUser, CompanyProfile } from '../types'
import { api } from '../services/api'

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
}

interface ProfileContextType {
  profile: GraduateProfile
  role: 'GRADUATE' | 'COMPANY' | 'ADMIN' | null
  companyStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  updateProfile: (updated: Partial<GraduateProfile>) => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  verifyEmail: (userData?: AuthUser) => Promise<void>
  refreshProfile: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<GraduateProfile>(() => {
    try {
      const saved = localStorage.getItem('manarah_profile')
      return saved ? JSON.parse(saved) : defaultProfile
    } catch {
      return defaultProfile
    }
  })

  const [role, setRole] = useState<'GRADUATE' | 'COMPANY' | 'ADMIN' | null>(() => {
    return (
      (localStorage.getItem('manarah_user_role') as AuthUser['role'] | null) ||
      (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('manarah_user_role') as AuthUser['role'] | null) : null) ||
      null
    )
  })

  const [companyStatus, setCompanyStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | null>(() => {
    return (localStorage.getItem('manarah_company_status') as CompanyProfile['verification_status'] | null) || null
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem('manarah_token') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('manarah_token') : null)
    return Boolean(token)
  })

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const token = localStorage.getItem('manarah_token') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('manarah_token') : null)
    return Boolean(token)
  })

  useEffect(() => {
    localStorage.setItem('manarah_profile', JSON.stringify(profile))
  }, [profile])

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem('manarah_token') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('manarah_token') : null)
    if (!token) {
      setIsLoading(false)
      return
    }

    const currentRole = role || (localStorage.getItem('manarah_user_role') as AuthUser['role'] | null) || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('manarah_user_role') as AuthUser['role'] | null) : null)

    try {
      if (currentRole === 'COMPANY') {
        const comp = await api.getCompanyProfile()
        setCompanyStatus(comp.verification_status || 'PENDING')
        localStorage.setItem('manarah_company_status', comp.verification_status || 'PENDING')
        setProfile((prev) => ({
          ...prev,
          name: comp.company_name || prev.name,
          city: comp.location || prev.city,
          bio: comp.description || prev.bio,
          isVerified: comp.verification_status === 'APPROVED',
        }))
        setIsAuthenticated(true)
      } else if (currentRole === 'ADMIN') {
        setIsAuthenticated(true)
      } else {
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
            isVerified: Boolean(be.email_verified),
          }
          return updated
        })
        setIsAuthenticated(true)
      }
    } catch (err: unknown) {
      console.warn('Could not fetch backend profile:', err)
      const errorObj = err as { status?: number; message?: string } | undefined
      if (errorObj?.status === 401 || errorObj?.status === 403 || errorObj?.message?.includes('401') || errorObj?.message?.includes('403')) {
        localStorage.removeItem('manarah_token')
        sessionStorage.removeItem('manarah_token')
        localStorage.removeItem('manarah_user_role')
        sessionStorage.removeItem('manarah_user_role')
        localStorage.removeItem('manarah_company_status')
        sessionStorage.removeItem('manarah_company_status')
        setIsAuthenticated(false)
        setRole(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [role])

  useEffect(() => {
    const token = localStorage.getItem('manarah_token') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('manarah_token') : null)
    if (token) {
      refreshProfile()
    }
  }, [refreshProfile])

  const updateProfile = async (updated: Partial<GraduateProfile>) => {
    const nextProfile = { ...profile, ...updated }
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
          return fresh
        })
      }
    }
  }

  const verifyEmail = async (userData?: AuthUser) => {
    setIsAuthenticated(true)
    if (userData?.role) {
      setRole(userData.role)
      localStorage.setItem('manarah_user_role', userData.role)
    }
    let syncedUniversity = profile.university
    let syncedMajor = profile.major

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
      syncedUniversity = next.university
      syncedMajor = next.major
      return next
    })

    if (syncedUniversity || syncedMajor) {
      try {
        await api.updateGraduateProfile({
          university: syncedUniversity,
          specialization: syncedMajor,
        })
      } catch (err) {
        console.warn('Could not sync initial university/major to backend:', err)
      }
    }
  }

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('يرجى إدخال البريد الإلكتروني وكلمة المرور.')
    }
    const res = await api.login({ email, password })
    setIsAuthenticated(true)
    if (res.user?.role) {
      const uRole = res.user.role as 'GRADUATE' | 'COMPANY' | 'ADMIN'
      setRole(uRole)
      localStorage.setItem('manarah_user_role', uRole)
    }
    if (res.user) {
      setProfile((prev) => {
        const updated = {
          ...prev,
          name: res.user.name || prev.name,
          email: res.user.email || prev.email,
          phone: res.user.phone || prev.phone,
          isVerified: Boolean(res.user.email_verified),
        }
        return updated
      })
    }
    await refreshProfile()
  }

  const logout = async () => {
    await api.logout()
    localStorage.removeItem('manarah_token')
    sessionStorage.removeItem('manarah_token')
    localStorage.removeItem('manarah_profile')
    sessionStorage.removeItem('manarah_profile')
    localStorage.removeItem('manarah_user_role')
    sessionStorage.removeItem('manarah_user_role')
    localStorage.removeItem('manarah_company_status')
    setIsAuthenticated(false)
    setRole(null)
    setCompanyStatus(null)
    setProfile(defaultProfile)
  }

  return (
    <ProfileContext.Provider value={{ profile, role, companyStatus, updateProfile, isAuthenticated, isLoading, login, logout, verifyEmail, refreshProfile }}>
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
