// frontend/src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className="container">
          <h1>Fiction Platform</h1>
          <p className="hero-subtitle">
            Empower your creative journey with comprehensive writing tools
          </p>
          <p className="hero-description">
            A free, open-source platform designed for fiction writers of all levels. 
            Plan, create, edit, and organize your stories with ease.
          </p>
          {user ? (
            <Link to="/dashboard" className="cta-button">
              Go to Dashboard
            </Link>
          ) : (
            <div className="cta-buttons">
              <Link to="/register" className="cta-button primary">
                Get Started Free
              </Link>
              <Link to="/login" className="cta-button secondary">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </header>
      {/* Additional features and sections can be included here */}
    </div>
  );
};

export default HomePage;

