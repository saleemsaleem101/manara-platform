export interface GraduateFile {
  name: string
  size: string
  uploadedAt: string
  type: string
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
  completionPercentage: number
  skills: string[]
  avatarUrl?: string
  cvFile?: GraduateFile | null
}

export interface AuthState {
  isAuthenticated: boolean
  user: GraduateProfile | null
}

