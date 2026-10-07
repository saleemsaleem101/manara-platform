import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProfileProvider } from './context/ProfileContext'
import { RegisterPage } from './pages/RegisterPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { LoginPage } from './pages/LoginPage'
import { ProfileViewPage } from './pages/ProfileViewPage'
import { ProfileEditPage } from './pages/ProfileEditPage'

export function App() {
  return (
    <ProfileProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ProfileViewPage />} />
          <Route path="/profile" element={<ProfileViewPage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ProfileProvider>
  )
}

export default App
