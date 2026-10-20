/**
 * Manara Platform - API Client Service
 * مهام سبرنت 1: MNRA-41, MNRA-48, MNRA-53, MNRA-67, MNRA-71
 * ربط الواجهة الأمامية (React) مع الواجهة الخلفية (Django REST Framework)
 */

import { ApiError } from '../types'
import type {
  AuthUser,
  BackendProfile,
  Skill,
  GraduateSkill,
  ProjectItem,
  VideoCVInfo,
  CompanyProfile,
  CompanyRegisterPayload,
  Job,
  JobApplication,
  CreateJobPayload,
  ApplicationStatusHistoryItem,
  AdminDashboardStats,
  AdminCompanyItem,
  AppNotification,
  CompanyJob,
  CandidateProfile,
  AdminUser,
  AdminJobItem,
} from '../types'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export interface AuthResponse {
  token?: string
  user: AuthUser
  message?: string
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : null
}

function getAuthHeader(): Record<string, string> {
  const token =
    (typeof localStorage !== 'undefined' ? localStorage.getItem('manarah_token') : null) ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('manarah_token') : null)
  if (!token) return {}
  const prefix = token.startsWith('Bearer ') || token.startsWith('Token ') ? '' : 'Token '
  return { Authorization: `${prefix}${token}` }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const authHeader = getAuthHeader()
  for (const [k, v] of Object.entries(authHeader)) {
    if (!headers.has(k)) {
      headers.set(k, v)
    }
  }

  const csrf = getCsrfToken()
  if (csrf && !headers.has('X-CSRFToken') && options.method && !['GET', 'HEAD', 'OPTIONS'].includes(options.method.toUpperCase())) {
    headers.set('X-CSRFToken', csrf)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      if (response.status === 401) {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('manarah_token')
          localStorage.removeItem('manarah_user_role')
        }
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('manarah_token')
          sessionStorage.removeItem('manarah_user_role')
        }
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    const errorData = await response.json().catch(() => ({}))
    let errorMsg = errorData.detail || errorData.error
    if (!errorMsg && typeof errorData === 'object') {
      const parts: string[] = []
      for (const [key, val] of Object.entries(errorData)) {
        const valText = Array.isArray(val) ? val.join(' ') : String(val)
        parts.push(`${key}: ${valText}`)
      }
      if (parts.length > 0) errorMsg = parts.join(' • ')
    }
    throw new ApiError(errorMsg || `خطأ في الخادم (${response.status})`, response.status, errorData)
  }

  if (response.status === 204) {
    return {} as T
  }

  const contentType = response.headers.get('content-type')
  if (contentType && (contentType.includes('text/csv') || contentType.includes('text/plain'))) {
    return (await response.text()) as unknown as T
  }

  return response.json()
}

export const api = {
  // 1. إنشاء حساب خريج (MNRA-46, MNRA-48)
  async register(data: { name: string; email: string; phone?: string; password: string }): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'GRADUATE' }),
    })
    if (result.token && result.user?.email_verified) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('manarah_token', result.token)
      }
    }
    return result
  },

  // 2. تسجيل الدخول (Screen 03)
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const result = await request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    if (result.token) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('manarah_token', result.token)
      }
    }
    return result
  },

  // 3. تسجيل الخروج (MNRA-57, MNRA-59, MNRA-61)
  async logout(): Promise<void> {
    try {
      await request('/auth/logout/', {
        method: 'POST',
      })
    } catch {
      // Ignored if offline
    } finally {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('manarah_token')
      }
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('manarah_token')
      }
    }
  },

  // 4. تأكيد البريد الإلكتروني (US-01 / FR-26)
  async verifyEmail(code: string, email?: string, rememberMe: boolean = true): Promise<{ success: boolean; token?: string; user?: AuthUser; message?: string }> {
    const data = await request<{ token?: string; user?: AuthUser; message?: string }>('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ code, email }),
    })
    if (data.token) {
      if (rememberMe) {
        if (typeof localStorage !== 'undefined') localStorage.setItem('manarah_token', data.token)
        if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('manarah_token')
      } else {
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('manarah_token', data.token)
        if (typeof localStorage !== 'undefined') localStorage.removeItem('manarah_token')
      }
    }
    return { success: true, token: data.token, user: data.user, message: data.message }
  },

  // 4.1 إعادة إرسال رمز التحقق الرقمي OTP (FR-26 / NFR-01)
  async resendOTP(email: string): Promise<{ message: string; email?: string }> {
    return request<{ message: string; email?: string }>('/auth/resend-otp/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  // 4.2 تفعيل البريد الإلكتروني برابط الحساب (Screen 04)
  async verifyEmailToken(token: string, email?: string): Promise<{ success: boolean; token?: string; user?: AuthUser; message?: string }> {
    const data = await request<{ token?: string; user?: AuthUser; message?: string }>('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ token, email, code: token }),
    })
    if (data.token) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('manarah_token', data.token)
      }
    }
    return { success: true, token: data.token, user: data.user, message: data.message }
  },

  // 5. استرجاع الملف المهني الأساسي (MNRA-64, MNRA-71)
  async getGraduateProfile(): Promise<BackendProfile> {
    return request<BackendProfile>('/profiles/graduate/me/')
  },

  // 6. تحديث البيانات الأساسية للخريج (MNRA-64, MNRA-67, MNRA-68)
  async updateGraduateProfile(data: Partial<BackendProfile>): Promise<BackendProfile> {
    const result = await request<BackendProfile | { profile: BackendProfile }>('/profiles/graduate/me/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return (result as { profile?: BackendProfile }).profile || (result as BackendProfile)
  },

  // 7. استرجاع دليل المهارات المعتمدة (Screen 07 / FR-06)
  async getSkills(category?: string): Promise<Skill[]> {
    const endpoint = category
      ? `/profiles/skills/?category=${category}`
      : '/profiles/skills/'
    const data = await request<Skill[] | { results: Skill[] }>(endpoint)
    return Array.isArray(data) ? data : data.results || []
  },

  // 8. مهارات الخريج المسجلة ومستويات الإتقان
  async getGraduateSkills(): Promise<GraduateSkill[]> {
    const data = await request<GraduateSkill[] | { results: GraduateSkill[] }>('/profiles/graduate/skills/')
    return Array.isArray(data) ? data : data.results || []
  },

  async addGraduateSkill(payload: { skill: number; proficiency_level: string }): Promise<GraduateSkill> {
    return request<GraduateSkill>('/profiles/graduate/skills/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async deleteGraduateSkill(id: number): Promise<void> {
    await request(`/profiles/graduate/skills/${id}/`, {
      method: 'DELETE',
    })
  },

  // 9. المشاريع البرمجية ومشاريع التخرج (Screen 07 / FR-07)
  async getGraduateProjects(): Promise<ProjectItem[]> {
    const data = await request<ProjectItem[] | { results: ProjectItem[] }>('/profiles/graduate/projects/')
    return Array.isArray(data) ? data : data.results || []
  },

  async createGraduateProject(project: Partial<ProjectItem>): Promise<ProjectItem> {
    return request<ProjectItem>('/profiles/graduate/projects/', {
      method: 'POST',
      body: JSON.stringify(project),
    })
  },

  async deleteGraduateProject(id: number): Promise<void> {
    await request(`/profiles/graduate/projects/${id}/`, {
      method: 'DELETE',
    })
  },

  async updateGraduateProject(id: number, project: Partial<ProjectItem>): Promise<ProjectItem> {
    return request<ProjectItem>(`/profiles/graduate/projects/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(project),
    })
  },

  // 10. الفيديو التعريفي المهني (Screen 07 / FR-08, FR-09)
  async getGraduateVideo(): Promise<VideoCVInfo> {
    return request<VideoCVInfo>('/profiles/graduate/video/')
  },

  async updateGraduateVideo(data: { video_cv_url?: string; video_duration_seconds?: number; video_visibility?: string }): Promise<VideoCVInfo> {
    return request<VideoCVInfo>('/profiles/graduate/video/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 11. تسجيل حساب منشأة وشركة جديدة (Screen 08 / FR-23)
  async registerCompany(payload: CompanyRegisterPayload): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // 12. بيانات ملف المنشأة والاعتماد التجاري (Screen 08 / FR-23)
  async getCompanyProfile(): Promise<CompanyProfile> {
    return request<CompanyProfile>('/profiles/company/me/')
  },

  async updateCompanyProfile(data: Partial<CompanyProfile>): Promise<{ message: string; company: CompanyProfile }> {
    return request<{ message: string; company: CompanyProfile }>('/profiles/company/me/', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  // 13. تقديم طلب توثيق السجل التجاري للاعتماد (Screen 08 / FR-23)
  async submitCompanyVerification(data: { commercial_reg?: string; cr_document_url?: string }): Promise<{ message: string; company?: CompanyProfile }> {
    return request<{ message: string; company?: CompanyProfile }>('/profiles/company/submit-verification/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // 14. رفع وتوثيق مستند السجل التجاري الرسمي (Screen 08 / FR-23)
  async uploadCRDocument(data: { cr_document_url?: string } | FormData): Promise<{ message: string; cr_document_url: string }> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    return request<{ message: string; cr_document_url: string }>('/profiles/company/upload-cr/', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    })
  },

  // 15. الشواغر والفرص الوظيفية وتتبع الطلبات (Screen 09 / FR-10, FR-12, FR-13, FR-14, FR-30)
  async getJobs(params?: { search?: string; specialization?: string; location?: string; job_type?: string; experience?: string; ordering?: string }): Promise<Job[]> {
    const query = new URLSearchParams()
    if (params?.search) query.append('search', params.search)
    if (params?.specialization && params.specialization !== 'الكل') query.append('specialization', params.specialization)
    if (params?.location && params.location !== 'الكل') query.append('location', params.location)
    if (params?.job_type && params.job_type !== 'الكل') query.append('job_type', params.job_type)
    if (params?.experience && params.experience !== 'الكل') query.append('experience', params.experience)
    if (params?.ordering) query.append('ordering', params.ordering)

    const endpoint = `/jobs/${query.toString() ? `?${query.toString()}` : ''}`
    const data = await request<Job[] | { results: Job[] }>(endpoint)
    return Array.isArray(data) ? data : data.results || []
  },

  async getJobDetails(id: number): Promise<Job> {
    return request<Job>(`/jobs/${id}/`)
  },

  async applyForJob(jobId: number): Promise<JobApplication> {
    return request<JobApplication>('/jobs/apply/', {
      method: 'POST',
      body: JSON.stringify({ job: jobId }),
    })
  },

  async getMyApplications(): Promise<JobApplication[]> {
    const data = await request<JobApplication[] | { results: JobApplication[] }>('/jobs/my-applications/')
    return Array.isArray(data) ? data : data.results || []
  },

  async withdrawApplication(applicationId: number): Promise<{ message: string }> {
    return request<{ message: string }>(`/jobs/applications/${applicationId}/withdraw/`, {
      method: 'POST',
    })
  },

  // 13. نشر وظيفة وضبط أوزان المطابقة الذكية (Screen 10 / FR-10, FR-18)
  async createJob(payload: CreateJobPayload): Promise<Job> {
    return request<Job>('/jobs/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // 14. استعراض طلبات وظيفة معينة وفرز نتائج المطابقة (Screen 11 / FR-14, FR-16)
  async getJobApplications(jobId: number, params?: { status?: string; min_score_only?: boolean }): Promise<JobApplication[]> {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'الكل') query.append('status', params.status)
    if (params?.min_score_only) query.append('min_score_only', 'true')

    const endpoint = `/jobs/${jobId}/applications/${query.toString() ? `?${query.toString()}` : ''}`
    const data = await request<JobApplication[] | { results: JobApplication[] }>(endpoint)
    return Array.isArray(data) ? data : data.results || []
  },

  // 15. تحديث حالة طلب التوظيف وحفظ سجل التغييرات (Screen 11 / FR-14, FR-29)
  async updateApplicationStatus(applicationId: number, status: 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED'): Promise<{ message: string; status: string }> {
    return request<{ message: string; status: string }>(`/jobs/applications/${applicationId}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  // 16. سجل التغييرات التاريخي للطلب (FR-29)
  async getApplicationHistory(applicationId: number): Promise<ApplicationStatusHistoryItem[]> {
    const data = await request<ApplicationStatusHistoryItem[] | { results: ApplicationStatusHistoryItem[] }>(`/jobs/applications/${applicationId}/history/`)
    return Array.isArray(data) ? data : data.results || []
  },

  // 17. إحصائيات لوحة تحكم مدير النظام (Screen 12 / FR-20, FR-23)
  async getAdminDashboardStats(): Promise<AdminDashboardStats> {
    return request<AdminDashboardStats>('/admin-panel/dashboard/')
  },

  // 18. قائمة الشركات للتحقق والاعتماد التجاري (Screen 12 / FR-23)
  async getAdminCompanies(status?: string): Promise<AdminCompanyItem[]> {
    const query = status && status !== 'الكل' ? `?status=${status}` : ''
    const data = await request<AdminCompanyItem[] | { results: AdminCompanyItem[] }>(`/admin-panel/companies/${query}`)
    return Array.isArray(data) ? data : data.results || []
  },

  // 19. اعتماد أو رفض السجل التجاري للشركة (Screen 12 / FR-23)
  async verifyCompanyByAdmin(
    companyId: number,
    status: 'APPROVED' | 'REJECTED',
    rejection_reason?: string
  ): Promise<{ message: string; verification_status: string; rejection_reason?: string }> {
    return request<{ message: string; verification_status: string; rejection_reason?: string }>(`/admin-panel/companies/${companyId}/verify/`, {
      method: 'POST',
      body: JSON.stringify({ status, rejection_reason }),
    })
  },

  // 20. استخراج وتصدير تقارير الأداء (Screen 12 / FR-21)
  async getAdminReport(type: 'jobs' | 'skills' | 'match_scores' | 'companies', format: 'csv' | 'json' = 'json'): Promise<Record<string, unknown> | string> {
    return request<Record<string, unknown> | string>(`/admin-panel/reports/?type=${type}&format=${format}`)
  },

  async downloadAdminReport(type: 'jobs' | 'skills' | 'match_scores' | 'companies', format: 'pdf' | 'excel' | 'csv'): Promise<Blob> {
    const authHeader = getAuthHeader()
    const url = `${API_BASE_URL}/admin-panel/reports/?type=${type}&format=${format}`
    const res = await fetch(url, {
      headers: {
        ...authHeader,
      },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || err.error || `فشل تصدير التقرير (${res.status})`)
    }
    return await res.blob()
  },

  // 21. استعادة كلمة المرور وإعادة تعيين الحساب (Screen 13 / FR-25)
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/password-reset-request/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async confirmPasswordReset(payload: { token: string; new_password: string }): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/password-reset-confirm/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // 22. مركز الإشعارات والتنبيهات المباشرة (Screen 14 / FR-22)
  async getNotifications(unreadOnly?: boolean): Promise<AppNotification[]> {
    const query = unreadOnly ? '?unread=true' : ''
    const data = await request<AppNotification[] | { results: AppNotification[] }>(`/notifications/${query}`)
    return Array.isArray(data) ? data : data.results || []
  },

  async getUnreadNotificationCount(): Promise<{ count: number }> {
    try {
      return await request<{ count: number }>('/notifications/unread-count/')
    } catch {
      return { count: 0 }
    }
  },

  async markNotificationAsRead(id: number): Promise<void> {
    await request(`/notifications/${id}/read/`, {
      method: 'PATCH',
    })
  },

  async markAllNotificationsAsRead(): Promise<{ message: string; updated_count: number }> {
    return request<{ message: string; updated_count: number }>('/notifications/mark-all-read/', {
      method: 'POST',
    })
  },

  // 23. حساب المطابقة الذكية لخريج مع شاغر وظيفي (FR-15, FR-16)
  async getJobMatchCalculation(jobId: number): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>(`/matching/job/${jobId}/`)
  },

  // 24. ترتيب المرشحين المتقدمين للوظيفة وفق التوافق الذكي (FR-17)
  async getJobRankedCandidates(jobId: number): Promise<JobApplication[]> {
    const data = await request<JobApplication[] | { results: JobApplication[] }>(`/matching/job/${jobId}/candidates/`)
    return Array.isArray(data) ? data : data.results || []
  },

  // 25. استرجاع تفاصيل المطابقة لطلب توظيف محدد (FR-16, FR-17)
  async getApplicationMatchResult(applicationId: number): Promise<Record<string, unknown>> {
    return request<Record<string, unknown>>(`/matching/application/${applicationId}/`)
  },

  // 26. وظائف المنشأة الحالية مع عدد المتقدمين (Screen 19)
  async getCompanyJobs(status?: string): Promise<CompanyJob[]> {
    const query = status && status !== 'الكل' ? `?status=${status}` : ''
    const data = await request<CompanyJob[] | { results: CompanyJob[] }>(`/jobs/mine/${query}`)
    return Array.isArray(data) ? data : data.results || []
  },

  // 27. تعديل وظيفة قائمة (Screen 18 - وضع التعديل)
  async updateJob(jobId: number, payload: Partial<CreateJobPayload>): Promise<Job> {
    return request<Job>(`/jobs/${jobId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },

  // 28. إغلاق وظيفة (Screen 19)
  async closeCompanyJob(jobId: number): Promise<Job> {
    return this.updateJob(jobId, { status: 'CLOSED' })
  },

  // 29. استرجاع ملف المرشح الكامل للشركة (Screen 21)
  async getCandidateApplicationProfile(applicationId: number): Promise<CandidateProfile> {
    return request<CandidateProfile>(`/jobs/applications/${applicationId}/`)
  },

  // 30. إدارة المستخدمين للأدمن (Screen 23)
  async getAdminUsers(params?: { role?: string; search?: string; page?: number }): Promise<{ results: AdminUser[]; count: number }> {
    const query = new URLSearchParams()
    if (params?.role && params.role !== 'ALL' && params.role !== 'الكل') query.append('role', params.role)
    if (params?.search) query.append('search', params.search)
    if (params?.page) query.append('page', String(params.page))

    const data = await request<AdminUser[] | { results: AdminUser[]; count: number }>(`/admin-panel/users/?${query.toString()}`)
    if (Array.isArray(data)) return { results: data, count: data.length }
    return { results: data.results || [], count: data.count || (data.results ? data.results.length : 0) }
  },

  async updateAdminUserStatus(userId: number, is_active: boolean): Promise<AdminUser> {
    return request<AdminUser>(`/admin-panel/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active }),
    })
  },

  async deleteAdminUser(userId: number): Promise<void> {
    await request(`/admin-panel/users/${userId}/`, {
      method: 'DELETE',
    })
  },

  // 31. إدارة الوظائف للأدمن (Screen 24)
  async getAdminJobs(params?: { status?: string; search?: string; page?: number }): Promise<{ results: AdminJobItem[]; count: number }> {
    const query = new URLSearchParams()
    if (params?.status && params.status !== 'ALL' && params.status !== 'الكل') query.append('status', params.status)
    if (params?.search) query.append('search', params.search)
    if (params?.page) query.append('page', String(params.page))

    const data = await request<AdminJobItem[] | { results: AdminJobItem[]; count: number }>(`/admin-panel/jobs/?${query.toString()}`)
    if (Array.isArray(data)) return { results: data, count: data.length }
    return { results: data.results || [], count: data.count || (data.results ? data.results.length : 0) }
  },

  async updateAdminJobStatus(jobId: number, status: 'OPEN' | 'CLOSED' | 'HIDDEN'): Promise<AdminJobItem> {
    return request<AdminJobItem>(`/admin-panel/jobs/${jobId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  async deleteAdminJob(jobId: number): Promise<void> {
    await request(`/admin-panel/jobs/${jobId}/`, {
      method: 'DELETE',
    })
  },
}
