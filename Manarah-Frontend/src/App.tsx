import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProfileProvider, useProfile } from './context/ProfileContext'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { LoginPage } from './pages/LoginPage'
import { ProfileViewPage } from './pages/ProfileViewPage'
import { ProfileEditPage } from './pages/ProfileEditPage'

/**
 * حماية مسارات الخريج والملف الشخصي (MNRA-54, MNRA-55, MNRA-60)
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-3 border-[#0F1E36] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#64748B]">جاري التحقق من الجلسة والصلاحيات...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/**
 * منع المستخدم المسجل من زيارة شاشات الدخول والتسجيل وإعادة توجيهه للملف المهني
 */
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useProfile()
  if (isAuthenticated) {
    return <Navigate to="/profile" replace />
  }
  return <>{children}</>
}

function RootRedirect() {
  const { isAuthenticated } = useProfile()
  return <Navigate to={isAuthenticated ? '/profile' : '/login'} replace />
}

export function App() {
  return (
    <ProfileProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileViewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <ProfileEditPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ProfileProvider>
  )
}

export default App
