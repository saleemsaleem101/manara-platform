/**
 * Manara Platform - Types Definition (Sprint 1)
 * الحقول المعتمدة لسبرنت 1 (US-01 / FR-01, FR-03, FR-24, FR-26)
 */

export class ApiError extends Error {
  status?: number
  data?: unknown

  constructor(message: string, status?: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export function getErrorMessage(err: unknown, fallback = 'حدث خطأ غير متوقع'): string {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const msg = (err as { message: unknown }).message
    if (typeof msg === 'string' && msg.trim()) return msg
  }
  return fallback
}

export interface AuthUser {
  id: number
  name: string
  email: string
  phone?: string
  role: 'GRADUATE' | 'COMPANY' | 'ADMIN'
  is_active?: boolean
  email_verified: boolean
  created_at?: string
}

export interface GraduateProfile {
  name: string
  email: string
  phone: string
  city: string
  university: string
  major: string
  graduationYear: number
  gpa: string
  experienceYears: string
  bio: string
  isVerified: boolean
}

export interface BackendProfile {
  id?: number
  user?: number
  full_name?: string
  first_name?: string
  last_name?: string
  user_name?: string
  email?: string
  phone?: string
  city?: string
  university?: string
  specialization?: string
  graduation_year?: number
  gpa?: string
  years_of_experience?: string
  bio?: string
  email_verified?: boolean
  video_cv_url?: string
  video_duration_seconds?: number
  video_visibility?: string
  video_verified?: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  user: GraduateProfile | null
}

export interface Skill {
  id: number
  name: string
  category: 'TECHNICAL' | 'SOFT'
  category_display?: string
}

export interface GraduateSkill {
  id: number
  skill: number
  skill_name: string
  skill_category: 'TECHNICAL' | 'SOFT'
  skill_category_display?: string
  proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  proficiency_level_display?: string
  created_at?: string
}

export interface ProjectItem {
  id?: number
  title: string
  description: string
  technologies: string
  project_url?: string
  github_url?: string
  is_graduation_project: boolean
  created_at?: string
}

export interface VideoCVInfo {
  video_cv_url?: string | null
  video_duration_seconds: number
  video_visibility: 'PUBLIC' | 'COMPANIES_ONLY' | 'PRIVATE'
  video_verified: boolean
}

export interface CompanyProfile {
  id: number
  user_email: string
  user_name: string
  user_phone: string
  company_name: string
  commercial_reg: string
  registration_number?: string
  industry: string
  sector?: string
  location: string
  address?: string
  website?: string
  logo_url?: string
  logo?: string
  description: string
  company_size: string
  cr_document_url?: string
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED'
  verified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface CompanyRegisterPayload {
  name: string
  email: string
  phone: string
  password: string
  role: 'COMPANY'
  company_name: string
  commercial_reg: string
  industry: string
  location: string
  website?: string
  description?: string
  cr_document_url?: string
}

export interface JobSkillRequirement {
  id: number
  skill: number
  skill_name: string
  skill_category: string
  is_required: boolean
  required_level: string
  weight: number
}

export interface Job {
  id: number
  title: string
  description: string
  requirements?: string
  company: number
  company_name: string
  location: string
  job_type: 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'HYBRID'
  required_major: string
  required_qualification: 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'
  required_exp: number
  status: 'OPEN' | 'CLOSED' | 'DRAFT'
  deadline?: string
  skills_weight?: number
  specialization_weight?: number
  experience_weight?: number
  qualification_weight?: number
  minimum_match_score?: number
  required_skills?: JobSkillRequirement[]
  match_score?: number
  created_at: string
}

export interface ApplicationStatusHistoryItem {
  history_id: number
  application: number
  previous_status: string
  new_status: string
  changed_at: string
  changed_by?: number
  changed_by_name?: string
}

export interface JobApplication {
  id: number
  job: number
  job_title: string
  company_name: string
  profile: number
  applicant_name: string
  applicant_email: string
  applicant_specialization: string
  applicant_university: string
  applicant_qualification: string
  applicant_experience: string
  applicant_city?: string
  applicant_gpa?: string
  applicant_graduation_year?: string
  has_video_cv?: boolean
  projects_count?: number
  has_graduation_project?: boolean
  graduation_project_title?: string | null
  has_github?: boolean
  github_url?: string | null
  applicant_phone?: string
  contact_unlocked?: boolean
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  match_score?: number
  matching_score?: number
  score_breakdown?: {
    skills_score: number
    specialization_score: number
    experience_score: number
    qualification_score: number
    final_score: number
  }
  status_history?: ApplicationStatusHistoryItem[]
  applied_at: string
  updated_at?: string
}

export interface CreateJobPayload {
  title: string
  description: string
  requirements?: string
  required_major: string
  required_qualification?: 'DIPLOMA' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'
  required_exp: number
  location?: string
  job_type?: 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'HYBRID'
  skills_weight: number
  specialization_weight: number
  experience_weight: number
  qualification_weight: number
  minimum_match_score: number
  skills?: (string | { skill?: number; name?: string; is_required?: boolean; required_level?: string; weight?: number })[]
  deadline?: string
  status?: 'OPEN' | 'CLOSED' | 'DRAFT'
}

export interface AdminDashboardStats {
  users: {
    total: number
    graduates: number
    companies: number
    admins: number
    active: number
    inactive: number
  }
  companies_verification: {
    pending: number
    approved: number
    rejected: number
  }
  jobs: {
    total: number
    open: number
    closed: number
    draft: number
  }
  applications: {
    total: number
    submitted: number
    under_review: number
    accepted: number
    rejected: number
    withdrawn: number
  }
  matching: {
    average_score: number | null
    total_results: number
  }
}

export interface AdminCompanyItem {
  id: number
  user_name: string
  user_email: string
  user_phone?: string
  company_name: string
  commercial_reg: string
  registration_number?: string
  industry: string
  location: string
  description?: string
  website?: string
  logo_url?: string
  cr_document_url?: string
  verification_status: 'PENDING' | 'APPROVED' | 'REJECTED'
  verified_by?: number
  verified_at?: string
}

export interface AppNotification {
  id: number
  type: 'NEW_APPLICATION' | 'STATUS_UPDATE' | 'COMPANY_VERIFIED' | 'SYSTEM'
  title: string
  message: string
  is_read: boolean
  related_application_id?: number | null
  created_at: string
}

export interface CompanyJob extends Job {
  applicants_count?: number
}

export interface CandidateProfile {
  id: number
  application_id?: number
  graduate_id?: number
  full_name: string
  email: string
  phone: string
  city: string
  university: string
  major: string
  graduation_year: number
  gpa: string
  experience_years: string
  bio: string
  skills: {
    id: number
    name: string
    category: 'TECHNICAL' | 'SOFT'
    proficiency_level?: string
  }[]
  projects: ProjectItem[]
  video_cv_url?: string | null
  video_duration_seconds?: number
  video_visibility?: 'PUBLIC' | 'COMPANIES_ONLY' | 'PRIVATE'
  match_score?: number
  score_breakdown?: {
    skills_score: number
    specialization_score: number
    experience_score: number
    qualification_score: number
    final_score: number
  }
  github_url?: string | null
  linkedin_url?: string | null
  contact_unlocked?: boolean
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED'
  status_history?: ApplicationStatusHistoryItem[]
  applied_at: string
}

export interface AdminUser {
  id: number
  name: string
  email: string
  phone?: string
  role: 'GRADUATE' | 'COMPANY' | 'ADMIN'
  is_active: boolean
  email_verified: boolean
  created_at: string
  company_name?: string
  verification_status?: 'PENDING' | 'APPROVED' | 'REJECTED'
}

export interface AdminJobItem {
  id: number
  title: string
  company_id: number
  company_name: string
  company_verified: boolean
  required_major: string
  required_exp: number
  status: 'OPEN' | 'CLOSED' | 'HIDDEN'
  applicants_count: number
  minimum_match_score: number
  created_at: string
}
