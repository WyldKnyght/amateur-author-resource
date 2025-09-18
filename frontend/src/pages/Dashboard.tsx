// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import ProjectList from '@/components/projects/ProjectList';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

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

interface UserStats {
  totalProjects: number;
  totalWords: number;
  averageWordsPerProject: number;
  lastUpdated: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
    refreshProjects
  } = useProjects();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalProjects: 0,
    totalWords: 0,
    averageWordsPerProject: 0,
    lastUpdated: new Date().toISOString(),
  });
  const navigate = useNavigate();

  // Fetch dashboard data from API
  useEffect(() => {
    fetchDashboardData();
    refreshProjects();
    // eslint-disable-next-line
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("/api/users/dashboard", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
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

  // Calculate stats from projects (if available)
  useEffect(() => {
    if (projects.length > 0) {
      const totalWords = projects.reduce((sum, project) => sum + (project.word_count || 0), 0);
      const avgWords = Math.round(totalWords / projects.length);
      setStats({
        totalProjects: projects.length,
        totalWords,
        averageWordsPerProject: avgWords,
        lastUpdated: new Date().toISOString(),
      });
    }
  }, [projects]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isLoading || projectsLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Loading your dashboard...</p>
      </div>
    );
  }
  if (projectsError) {
    return <ErrorMessage message={projectsError} />;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, {user?.username}!</h1>
            <p>Ready to continue your writing journey?</p>
          </div>
          <button onClick={handleLogout} className="logout-button">Sign Out</button>
        </header>

        {/* Backend dashboard API message and account info */}
        <div>
          <p>{dashboardData?.message}</p>
          {dashboardData?.user && (
            <p>Member since: {dashboardData.user.member_since}</p>
          )}
        </div>

        {/* Analytics Section */}
        <section className="analytics-section">
          <h2>Your Writing Analytics</h2>
          <div className="stats-grid">
            <div className="stat-card"><h3>{stats.totalProjects}</h3><p>Total Projects</p></div>
            <div className="stat-card"><h3>{stats.totalWords.toLocaleString()}</h3><p>Total Words Written</p></div>
            <div className="stat-card"><h3>{stats.averageWordsPerProject.toLocaleString()}</h3><p>Average Words per Project</p></div>
            <div className="stat-card"><h3>{new Date(stats.lastUpdated).toLocaleDateString()}</h3><p>Last Updated</p></div>
          </div>
        </section>

        {/* Recent Projects Section */}
        <section className="recent-projects">
          <h2>Recent Projects</h2>
          {projects.length === 0 ? (
            <div className="empty-state">
              <p>No projects yet. Create your first story project!</p>
              <Link to="/projects" className="btn-primary">Create Project</Link>
            </div>
          ) : (
            <ProjectList
              projects={projects.slice(0, 5)}
              isLoading={projectsLoading}
              showCreateButton={false}
              onProjectSelect={id => navigate(`/projects/${id}`)}
              // Provide dummy or real implementations for other required props
              onProjectEdit={() => {}}
              onProjectDelete={() => {}}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
