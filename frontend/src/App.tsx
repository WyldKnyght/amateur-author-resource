import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import Dashboard from '@/pages/Dashboard';
import ProjectsDashboard from '@/pages/ProjectsDashboard';
import ProjectEditor from '@/pages/ProjectEditorPage';
import './App.css';

// AuthGate automatically redirects unauthenticated users to login page
function AuthGate({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <main className="main-content">
            <Routes>
              {/* Redirect root to login for direct access */}
              <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Login and Registration */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />

              {/* Protected Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Projects and Editor - could be protected as well */}
              <Route path="/projects" element={
                <AuthGate>
                  <ProjectsDashboard />
                </AuthGate>
              } />
              <Route path="/projects/:projectId/editor" element={
                <AuthGate>
                  <ProjectEditor />
                </AuthGate>
              } />

              {/* Catch-all: redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
