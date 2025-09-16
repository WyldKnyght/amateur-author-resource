// frontend/src/pages/ProjectsDashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { ProjectFilters, Project } from '../types/project-types';
import ProjectList from '../components/projects/ProjectList';
import CreateProjectForm from '../components/projects/CreateProjectForm';
import DeleteProjectModal from '../components/projects/DeleteProjectModal';
import './ProjectsDashboard.css';

const ProjectsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    projects,
    isLoading,
    error,
    filters,
    pagination,
    createProject,
    updateProject,
    deleteProject,
    setFilters,
    setPage,
    refreshProjects,
    clearError
  } = useProjects();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleCreateProject = () => {
    setShowCreateForm(true);
  };

  const handleProjectCreated = async (projectData: any) => {
    const newProject = await createProject(projectData);
    if (newProject) {
      setShowCreateForm(false);
    }
  };

  const handleProjectSelect = (projectId: number) => {
    navigate(`/projects/${projectId}/editor`);
  };

  const handleProjectEdit = (project: Project) => {
    navigate(`/projects/${project.id}/settings`);
  };

  const handleProjectDelete = (project: Project) => {
    setProjectToDelete(project);
  };

  const confirmDelete = async () => {
    if (projectToDelete) {
      const success = await deleteProject(projectToDelete.id);
      if (success) {
        setProjectToDelete(null);
      }
    }
  };

  const handleFiltersChange = (newFilters: ProjectFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="projects-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>My Writing Projects</h1>
          <button 
            className="btn btn-primary"
            onClick={handleCreateProject}
          >
            + New Project
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {error && (
          <div className="error-alert">
            <span>{error}</span>
            <button onClick={clearError} className="close-btn">×</button>
          </div>
        )}

        <ProjectList
          projects={projects}
          isLoading={isLoading}
          onCreateNew={handleCreateProject}
          onProjectSelect={handleProjectSelect}
          onProjectEdit={handleProjectEdit}
          onProjectDelete={handleProjectDelete}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${pagination.page === page ? 'active' : ''}`}
                onClick={() => setPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal">
            <CreateProjectForm
              onSubmit={handleProjectCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <DeleteProjectModal
          project={projectToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setProjectToDelete(null)}
        />
      )}
    </div>
  );
};

export default ProjectsDashboard;