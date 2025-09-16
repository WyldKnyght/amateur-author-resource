// frontend/src/pages/ProjectEditor.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useStoryContent, useContentVersions } from '../hooks/useStoryContent';
import { useProjectStats } from '../hooks/useProjects';
import ProjectEditorComponent from '../components/projects/ProjectEditor';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './ProjectEditor.css';

const ProjectEditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const numericProjectId = parseInt(projectId || '0', 10);

  const { project, isLoading: projectLoading, error: projectError } = useProject(numericProjectId);
  const { stats, refreshStats } = useProjectStats(numericProjectId);
  const {
    content,
    isLoading: contentLoading,
    isSaving,
    isAutoSaving,
    hasUnsavedChanges,
    lastSaved,
    error: contentError,
    updateContent,
    saveContent,
    forceSave,
    createVersion,
    clearError
  } = useStoryContent(numericProjectId);

  const { versions, refreshVersions } = useContentVersions(numericProjectId);
  
  const [showVersions, setShowVersions] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const isLoading = projectLoading || contentLoading;
  const error = projectError || contentError;

  useEffect(() => {
    if (!projectId || isNaN(numericProjectId)) {
      navigate('/projects');
    }
  }, [projectId, numericProjectId, navigate]);

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/projects');
  };

  const handleSaveAndCreateVersion = async () => {
    const saveSuccess = await forceSave();
    if (saveSuccess) {
      const versionSuccess = await createVersion();
      if (versionSuccess) {
        refreshVersions();
        alert('Version created successfully!');
      }
    }
  };

  const formatLastSaved = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)} minutes ago`;
    } else if (diff < 86400000) { // Less than 1 day
      return `${Math.floor(diff / 3600000)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusIndicator = () => {
    if (isSaving) return { text: 'Saving...', class: 'saving' };
    if (isAutoSaving) return { text: 'Auto-saving...', class: 'auto-saving' };
    if (hasUnsavedChanges) return { text: 'Unsaved changes', class: 'unsaved' };
    return { text: 'All changes saved', class: 'saved' };
  };

  const statusIndicator = getStatusIndicator();

  if (isLoading) {
    return (
      <div className="editor-loading">
        <LoadingSpinner />
        <p>Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editor-error">
        <ErrorMessage message={error} />
        <button onClick={handleBackToDashboard} className="btn btn-secondary">
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="editor-error">
        <ErrorMessage message="Project not found" />
        <button onClick={handleBackToDashboard} className="btn btn-secondary">
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="project-editor-page">
      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button 
            onClick={handleBackToDashboard}
            className="btn btn-secondary btn-sm"
            title="Back to Projects"
          >
            ← Back
          </button>
          <h2 className="project-title">{project.title}</h2>
        </div>

        <div className="toolbar-center">
          <div className={`save-status ${statusIndicator.class}`}>
            <span className="status-dot"></span>
            {statusIndicator.text}
            {lastSaved && (
              <small className="last-saved">
                Last saved: {formatLastSaved(lastSaved)}
              </small>
            )}
          </div>
        </div>

        <div className="toolbar-right">
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn btn-outline btn-sm"
            title="Toggle Statistics"
          >
            Stats
          </button>
          
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="btn btn-outline btn-sm"
            title="Version History"
          >
            Versions
          </button>
          
          <button
            onClick={handleSaveAndCreateVersion}
            className="btn btn-secondary btn-sm"
            disabled={isSaving}
            title="Save and Create Version"
          >
            Save Version
          </button>
          
          <button
            onClick={() => forceSave()}
            className="btn btn-primary btn-sm"
            disabled={isSaving || (!hasUnsavedChanges && !isAutoSaving)}
            title="Save Now (Ctrl+S)"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="editor-main">
        {/* Side Panel */}
        {(showStats || showVersions) && (
          <div className="editor-sidebar">
            {showStats && stats && (
              <div className="stats-panel">
                <h3>Statistics</h3>
                <div className="stat-item">
                  <label>Word Count:</label>
                  <span>{stats.word_count.toLocaleString()}</span>
                </div>
                
                {stats.target_word_count && (
                  <div className="stat-item">
                    <label>Target:</label>
                    <span>{stats.target_word_count.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="stat-item">
                  <label>Characters:</label>
                  <span>{stats.character_count.toLocaleString()}</span>
                </div>
                
                {stats.progress_percentage > 0 && (
                  <div className="stat-item">
                    <label>Progress:</label>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${Math.min(100, stats.progress_percentage)}%` }}
                      ></div>
                      <span className="progress-text">
                        {Math.round(stats.progress_percentage)}%
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="stat-item">
                  <label>Days Active:</label>
                  <span>{stats.days_since_creation}</span>
                </div>
              </div>
            )}

            {showVersions && (
              <div className="versions-panel">
                <h3>Version History</h3>
                <div className="versions-list">
                  {versions.map((version) => (
                    <div 
                      key={version.id}
                      className={`version-item ${version.is_active ? 'active' : ''}`}
                    >
                      <div className="version-info">
                        <strong>Version {version.version}</strong>
                        {version.is_active && <span className="active-badge">Current</span>}
                        <small>{new Date(version.created_at).toLocaleDateString()}</small>
                      </div>
                      <div className="version-meta">
                        <span className="save-reason">{version.save_reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Editor */}
        <div className="editor-content">
          <ProjectEditorComponent
            projectId={numericProjectId}
            content={content}
            onContentChange={updateContent}
            isLoading={contentLoading}
            isSaving={isSaving}
            isAutoSaving={isAutoSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            error={contentError}
            onClearError={clearError}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectEditorPage;