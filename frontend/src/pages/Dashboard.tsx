import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';

interface DashboardData {
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    member_since: string;
  };
  stats: {
    projects: number;
    characters: number;
    word_count: number;
  };
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/users/dashboard', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch {
      // Optionally handle fetch errors here
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");  // Redirect to login page after logout
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.username}!</h1>
            <p>Ready to continue your writing journey?</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Sign Out
          </button>
        </header>

        {/* Example dashboard content */}
        <div>
          <p>{dashboardData?.message}</p>
          {dashboardData?.stats && (
            <ul>
              <li>Projects: {dashboardData.stats.projects}</li>
              <li>Characters: {dashboardData.stats.characters}</li>
              <li>Word Count: {dashboardData.stats.word_count}</li>
            </ul>
          )}
          {dashboardData?.user && (
            <p>
              Member since: {dashboardData.user.member_since}
            </p>
          )}
        </div>

        {/* Add your additional dashboard widgets/content here */}
      </div>
    </div>
  );
};

export default Dashboard;
