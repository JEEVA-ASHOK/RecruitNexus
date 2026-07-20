import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { JobListings } from './pages/JobListings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { AiChatbot } from './components/AiChatbot';
import { GoogleLensTranslator } from './components/GoogleLensTranslator';
import { Companies } from './pages/Companies';
import { AiTools } from './pages/AiTools';
import { Resources } from './pages/Resources';
import { Pricing } from './pages/Pricing';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';

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
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflowX: 'hidden' }}>
        <div className="rgb-blob rgb-blob-1"></div>
        <div className="rgb-blob rgb-blob-2"></div>
        <div className="rgb-blob rgb-blob-3"></div>
        <NavBar />
        <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<JobListings />} />
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
        <AiChatbot />
        <GoogleLensTranslator />
      </div>
    </Router>
  );
}

const styles = {
  footer: {
    textAlign: 'center' as const,
    padding: '30px',
    color: '#64748b',
    fontSize: '0.85rem',
    borderTop: '1px solid var(--glass-border)',
    marginTop: '60px',
  }
};

export default App;
