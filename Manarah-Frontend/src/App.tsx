import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProfileProvider, useProfile } from './context/ProfileContext'

// Pages
import { LandingPage } from './pages/LandingPage'
import { RegisterPage } from './pages/RegisterPage'
import { CompanyRegisterPage } from './pages/CompanyRegisterPage'
import { LoginPage } from './pages/LoginPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { AuthPasswordResetRequestPage } from './pages/AuthPasswordResetRequestPage'
import { AuthPasswordResetConfirmPage } from './pages/AuthPasswordResetConfirmPage'
import { NotFoundPage } from './pages/NotFoundPage'

// Graduate Suite
import { ProfileViewPage } from './pages/ProfileViewPage'
import { ProfileEditPage } from './pages/ProfileEditPage'
import { SkillsPortfolioPage } from './pages/SkillsPortfolioPage'
import { JobsBrowsePage } from './pages/JobsBrowsePage'
import { JobDetailsApplyPage } from './pages/JobDetailsApplyPage'
import { ApplicationsTrackingPage } from './pages/ApplicationsTrackingPage'

// Company Suite
import { CompanyVerificationStatusPage } from './pages/CompanyVerificationStatusPage'
import { CompanyProfilePage } from './pages/CompanyProfilePage'
import { CompanyJobsPage } from './pages/CompanyJobsPage'
import { JobPostPage } from './pages/JobPostPage'
import { CompanyApplicantsMatchingPage } from './pages/CompanyApplicantsMatchingPage'
import { CompanyCandidateProfilePage } from './pages/CompanyCandidateProfilePage'

// Admin Suite
import { AdminDashboardReportsPage } from './pages/AdminDashboardReportsPage'
import { AdminUsersManagementPage } from './pages/AdminUsersManagementPage'
import { AdminJobsManagementPage } from './pages/AdminJobsManagementPage'

// Shared
import { NotificationsCenterPage } from './pages/NotificationsCenterPage'

interface RoleRouteProps {
  children: React.ReactNode
  allowedRoles: ('GRADUATE' | 'COMPANY' | 'ADMIN')[]
}

/**
 * حماية المسارات وفق الدور ونوع الحساب بدقة تامة (FR-03 & NFR-02)
 * الخريج للخريج فقط، الشركة للشركة فقط، والأدمن لإدارة النظام فقط.
 */
function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { isAuthenticated, isLoading, role } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#64748B]">جاري التحقق من الجلسة والصلاحيات...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const effectiveRole =
    role ||
    (localStorage.getItem('manarah_user_role') as 'GRADUATE' | 'COMPANY' | 'ADMIN' | null) ||
    'GRADUATE'

  if (!allowedRoles.includes(effectiveRole)) {
    if (effectiveRole === 'ADMIN') return <Navigate to="/admin" replace />
    if (effectiveRole === 'COMPANY') return <Navigate to="/company/jobs" replace />
    return <Navigate to="/profile" replace />
  }

  return <>{children}</>
}

/**
 * منع المستخدم المسجل من زيارة شاشات الدخول والتسجيل وإعادة توجيهه لواجهته الرئيسية
 */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, role } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-[#0284C7] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#64748B]">جاري التحقق من الجلسة...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    const effectiveRole =
      role ||
      (localStorage.getItem('manarah_user_role') as 'GRADUATE' | 'COMPANY' | 'ADMIN' | null) ||
      'GRADUATE'
    if (effectiveRole === 'ADMIN') return <Navigate to="/admin" replace />
    if (effectiveRole === 'COMPANY') return <Navigate to="/company/jobs" replace />
    return <Navigate to="/profile" replace />
  }
  return <>{children}</>
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6 text-start font-sans" dir="rtl">
          <div className="max-w-[480px] w-full bg-white border border-[#EAE4D9] rounded-3xl p-8 shadow-sm text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-3xl mx-auto">
              ⚠️
            </div>
            <h1 className="text-xl font-black text-[#0F172A]">حدث خطأ غير متوقع في الواجهة</h1>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              واجه التطبيق مشكلة أثناء عرض هذه الصفحة. يمكنك محاولة إعادة التحميل أو العودة للرئيسية.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#10B981] hover:from-[#0369A1] hover:to-[#059669] text-white font-black text-xs shadow-xs transition"
              >
                إعادة المحاولة
              </button>
              <a
                href="/"
                className="flex-1 h-11 rounded-xl border border-[#EAE4D9] bg-white hover:bg-[#F4EFE6]/60 text-[#0F172A] font-bold text-xs flex items-center justify-center transition shadow-2xs"
              >
                الصفحة الرئيسية
              </a>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export function App() {
  return (
    <ProfileProvider>
      <Router>
        <ErrorBoundary>
          <Routes>
          {/* 00: الصفحة التعريفية الرئيسية */}
          <Route path="/" element={<LandingPage />} />

          {/* مصادقة عامة */}
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/company/register"
            element={
              <PublicOnlyRoute>
                <CompanyRegisterPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<AuthPasswordResetRequestPage />} />
          <Route path="/reset-password" element={<AuthPasswordResetConfirmPage />} />
          <Route path="/password-reset" element={<AuthPasswordResetConfirmPage />} />
          <Route path="/password-reset-request" element={<AuthPasswordResetRequestPage />} />
          <Route path="/company/applicants" element={<Navigate to="/company/jobs" replace />} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/admin-panel" element={<Navigate to="/admin" replace />} />
          <Route path="/admin-panel/*" element={<Navigate to="/admin" replace />} />

          {/* منظومة الخريج (07 - 12) - للخريج فقط */}
          <Route
            path="/profile"
            element={
              <RoleRoute allowedRoles={['GRADUATE']}>
                <ProfileViewPage />
              </RoleRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <RoleRoute allowedRoles={['GRADUATE']}>
                <ProfileEditPage />
              </RoleRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <RoleRoute allowedRoles={['GRADUATE']}>
                <SkillsPortfolioPage />
              </RoleRoute>
            }
          />
          <Route path="/jobs" element={<JobsBrowsePage />} />
          <Route path="/jobs/:id" element={<JobDetailsApplyPage />} />
          <Route
            path="/applications"
            element={
              <RoleRoute allowedRoles={['GRADUATE']}>
                <ApplicationsTrackingPage />
              </RoleRoute>
            }
          />

          {/* منظومة الشركة (16 - 21) - للشركة فقط */}
          <Route
            path="/company/status"
            element={
              <RoleRoute allowedRoles={['COMPANY']}>
                <CompanyVerificationStatusPage />
              </RoleRoute>
            }
          />
          <Route
            path="/company/profile"
            element={
              <RoleRoute allowedRoles={['COMPANY']}>
                <CompanyProfilePage />
              </RoleRoute>
            }
          />
          <Route
            path="/company/jobs"
            element={
              <RoleRoute allowedRoles={['COMPANY']}>
                <CompanyJobsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/company/jobs/new"
            element={
              <RoleRoute allowedRoles={['COMPANY']}>
                <JobPostPage />
              </RoleRoute>
            }
          />
          <Route
            path="/company/jobs/:id/edit"
            element={
              <RoleRoute allowedRoles={['COMPANY']}>
                <JobPostPage />
              </RoleRoute>
            }
          />
          <Route
            path="/company/jobs/:id/applicants"
            element={
              <RoleRoute allowedRoles={['COMPANY']}>
                <CompanyApplicantsMatchingPage />
              </RoleRoute>
            }
          />
          <Route
            path="/company/applications/:id"
            element={
              <RoleRoute allowedRoles={['COMPANY']}>
                <CompanyCandidateProfilePage />
              </RoleRoute>
            }
          />

          {/* منظومة الأدمن (22 - 24) - للأدمن فقط */}
          <Route
            path="/admin"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminDashboardReportsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminUsersManagementPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/jobs"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AdminJobsManagementPage />
              </RoleRoute>
            }
          />

          {/* مركز الإشعارات (14) - لجميع الأدوار */}
          <Route
            path="/notifications"
            element={
              <RoleRoute allowedRoles={['GRADUATE', 'COMPANY', 'ADMIN']}>
                <NotificationsCenterPage />
              </RoleRoute>
            }
          />

          {/* مسار عام غير موجود */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </ErrorBoundary>
      </Router>
    </ProfileProvider>
  )
}

export default App
