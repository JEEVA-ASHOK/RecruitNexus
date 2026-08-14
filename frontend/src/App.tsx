import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { NavBar } from './components/NavBar';
import { LandingPage } from './pages/LandingPage';
import { JobListings } from './pages/JobListings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { FloatingAiAssistant } from './components/FloatingAiAssistant';
import { AutoLogoutManager } from './components/AutoLogoutManager';
import { Companies } from './pages/Companies';
import { AiTools } from './pages/AiTools';
import { Resources } from './pages/Resources';
import { Pricing } from './pages/Pricing';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { CompanyProfile } from './pages/CompanyProfile';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// Dashboard Route Dispatcher
const DashboardDispatcher: React.FC = () => {
  const userJson = localStorage.getItem('user');
  if (!userJson) return <Navigate to="/login" replace />;
  
  const user = JSON.parse(userJson);
  if (user.role === 'Recruiter' || user.role === 'Admin') {
    return <RecruiterDashboard />;
  }
  return <CandidateDashboard />;
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
        <NavBar />
        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/jobs" element={<JobListings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardDispatcher />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/companies" element={<Companies />} />
            <Route path="/company/:id" element={<CompanyProfile />} />
            <Route path="/ai-tools" element={<AiTools />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/pricing" element={<Pricing />} />
            {/* Fallback to Job Listings */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer style={styles.footer}>
          <p>© {new Date().getFullYear()} RecruitNexus - AI Recruitment Portal. All rights reserved.</p>
        </footer>
        <FloatingAiAssistant />
        <AutoLogoutManager />
      </div>
    </Router>
    </LanguageProvider>
  );
}

const styles = {
  footer: {
    textAlign: 'center' as const,
    padding: '30px',
    color: '#6B7280',
    fontSize: '0.85rem',
    borderTop: '1px solid var(--glass-border)',
    marginTop: '60px',
  }
};

export default App;
