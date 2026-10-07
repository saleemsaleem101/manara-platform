/**
 * Manara Platform - API Client Service
 * مهام سبرنت 1: MNRA-41, MNRA-48, MNRA-53, MNRA-67, MNRA-71 (عبدالرحمن)
 * ربط الواجهة الأمامية (React) مع الواجهة الخلفية (Django REST Framework)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export interface AuthResponse {
  token: string
  user: {
    id: number
    name: string
    email: string
    phone: string
    role: string
    email_verified: boolean
  }
  message?: string
}

export interface BackendProfile {
  id: number
  email: string
  email_verified: boolean
  user_name: string
  full_name?: string
  first_name: string
  last_name: string
  phone: string
  city: string
  university: string
  specialization: string
  graduation_year: number
  gpa: string
  years_of_experience: string
  bio: string
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('manarah_token')
  return token ? { Authorization: `Token ${token}` } : {}
}

export const api = {
  // 1. إنشاء حساب خريج (MNRA-46, MNRA-48)
  async register(data: { name: string; email: string; phone?: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, role: 'GRADUATE' }),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || errorData.error || Object.values(errorData).flat().join(', ') || 'فشل إنشاء الحساب')
    }
    const result: AuthResponse = await res.json()
    if (result.token) {
      localStorage.setItem('manarah_token', result.token)
    }
    return result
  },

  // 2. تسجيل الدخول (MNRA-51, MNRA-53)
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.detail || 'بيانات الدخول غير صحيحة')
    }
    const result: AuthResponse = await res.json()
    if (result.token) {
      localStorage.setItem('manarah_token', result.token)
    }
    return result
  },

  // 3. تسجيل الخروج (MNRA-57, MNRA-59, MNRA-61)
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
      })
    } catch {
      // Ignored if offline
    } finally {
      localStorage.removeItem('manarah_token')
    }
  },

  // 4. تأكيد البريد الإلكتروني (US-01)
  async verifyEmail(code: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-email/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ code }),
      })
      return res.ok
    } catch {
      return true
    }
  },

  // 5. استرجاع الملف المهني الأساسي (MNRA-64, MNRA-71)
  async getGraduateProfile(): Promise<BackendProfile> {
    const res = await fetch(`${API_BASE_URL}/profiles/graduate/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    })
    if (!res.ok) {
      throw new Error('فشل استرجاع الملف المهني')
    }
    return res.json()
  },

  // 6. تحديث البيانات الأساسية للخريج (MNRA-64, MNRA-67, MNRA-68)
  async updateGraduateProfile(data: Partial<BackendProfile>): Promise<BackendProfile> {
    const res = await fetch(`${API_BASE_URL}/profiles/graduate/me/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.detail || 'فشل تحديث البيانات الأساسية')
    }
    const result = await res.json()
    return result.profile || result
  },
}
