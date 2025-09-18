// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext"; 
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import Dashboard from './pages/Dashboard';
import ProjectsDashboard from './pages/ProjectsDashboard';
import ProjectEditorPage from './pages/ProjectEditorPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage'; // Import the new page
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterPage />} /> {/* Add this line */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/projects" element={<ProtectedRoute><ProjectsDashboard /></ProtectedRoute>} />
              <Route path="/projects/:projectId/editor" element={<ProtectedRoute><ProjectEditorPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
