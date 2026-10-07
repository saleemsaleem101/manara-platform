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
      let errorMsg = errorData.detail || errorData.error
      if (!errorMsg && typeof errorData === 'object') {
        const parts: string[] = []
        for (const [key, val] of Object.entries(errorData)) {
          const fieldLabel = key === 'email' ? 'البريد الإلكتروني' : key === 'password' ? 'كلمة المرور' : key === 'name' ? 'الاسم' : key
          if (Array.isArray(val)) {
            parts.push(`${fieldLabel}: ${val.join(' ')}`)
          } else if (typeof val === 'string') {
            parts.push(`${fieldLabel}: ${val}`)
          }
        }
        if (parts.length > 0) errorMsg = parts.join(' • ')
      }
      throw new Error(errorMsg || 'فشل إنشاء الحساب. يرجى مراجعة البيانات المدخلة.')
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
      const err = new Error(errorData.error || errorData.detail || 'بيانات الدخول غير صحيحة')
      ;(err as any).status = res.status
      ;(err as any).data = errorData
      throw err
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

  // 4. تأكيد البريد الإلكتروني (US-01 / FR-26)
  async verifyEmail(code: string, email?: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ code, email }),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.detail || 'رمز التحقق غير صحيح أو منتهي الصلاحية')
    }
    const data = await res.json()
    if (data.token) {
      localStorage.setItem('manarah_token', data.token)
    }
    return { success: true, token: data.token, user: data.user, message: data.message }
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
