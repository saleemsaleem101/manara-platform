/**
 * Manara Platform - Types Definition (Sprint 1)
 * الحقول المعتمدة لسبرنت 1 (US-01 / FR-01, FR-03, FR-24, FR-26)
 */

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
  completionPercentage: number
}

export interface AuthState {
  isAuthenticated: boolean
  user: GraduateProfile | null
}
