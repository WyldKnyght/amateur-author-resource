// frontend/src/hooks/useProjects.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  Project, ProjectCreate, ProjectUpdate, ProjectFilters,
  ProjectListState, ProjectWithContent, ProjectStats
} from '../types/project-types';
import { projectAPI, handleApiError } from '../services/project-api';

// Projects list and CRUD hook
export const useProjects = (initialFilters: ProjectFilters = {}) => {
  const [state, setState] = useState<ProjectListState>({
    projects: [],
    isLoading: false,
    error: undefined,
    filters: { limit: 10, skip: 0, ...initialFilters },
    pagination: { page: 1, size: 0, total: 0, pages: 0 }
  });

  const fetchProjects = useCallback(async (filters?: ProjectFilters) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    try {
      const filtersToUse = { ...state.filters, ...filters };
      const response = await projectAPI.getProjects(filtersToUse);
      setState(prev => ({
        ...prev,
        projects: response.projects,
        isLoading: false,
        filters: filtersToUse,
        pagination: {
          page: response.page,
          size: response.size,
          total: response.total,
          pages: response.pages
        }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: handleApiError(error)
      }));
    }
  }, [state.filters]);

  const createProject = useCallback(async (projectData: ProjectCreate): Promise<Project | null> => {
    try {
      const newProject = await projectAPI.createProject(projectData);
      setState(prev => ({
        ...prev,
        projects: [newProject, ...prev.projects],
        pagination: { ...prev.pagination, total: prev.pagination.total + 1 }
      }));
      return newProject;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: handleApiError(error)
      }));
      return null;
    }
  }, []);

  const updateProject = useCallback(async (projectId: number, projectData: ProjectUpdate): Promise<Project | null> => {
    try {
      const updatedProject = await projectAPI.updateProject(projectId, projectData);
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(project =>
          project.id === projectId ? updatedProject : project
        )
      }));
      return updatedProject;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: handleApiError(error)
      }));
      return null;
    }
  }, []);

  const deleteProject = useCallback(async (projectId: number): Promise<boolean> => {
    try {
      await projectAPI.deleteProject(projectId);
      setState(prev => ({
        ...prev,
        projects: prev.projects.filter(project => project.id !== projectId),
        pagination: { ...prev.pagination, total: prev.pagination.total - 1 }
      }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: handleApiError(error)
      }));
      return false;
    }
  }, []);

  const setFilters = useCallback((filters: Partial<ProjectFilters>) => {
    const newFilters = { ...state.filters, ...filters, skip: 0 };
    fetchProjects(newFilters);
  }, [fetchProjects, state.filters]);

  const setPage = useCallback((page: number) => {
    const skip = (page - 1) * (state.filters.limit || 10);
    fetchProjects({ ...state.filters, skip });
  }, [fetchProjects, state.filters]);

  const refreshProjects = useCallback(() => { fetchProjects(); }, [fetchProjects]);
  const clearError = useCallback(() => { setState(prev => ({ ...prev, error: undefined })); }, []);

  useEffect(() => { fetchProjects(); }, []);
  return {
    ...state,
    createProject,
    updateProject,
    deleteProject,
    setFilters,
    setPage,
    refreshProjects,
    clearError
  };
};

// Single project detail hook
export const useProject = (projectId: number) => {
  const [project, setProject] = useState<ProjectWithContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const fetchProject = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const projectData = await projectAPI.getProject(projectId);
      setProject(projectData);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const updateProject = useCallback(async (projectData: ProjectUpdate): Promise<boolean> => {
    try {
      const updatedProject = await projectAPI.updateProject(projectId, projectData);
      setProject(prev => prev ? { ...prev, ...updatedProject } : updatedProject);
      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [projectId]);

  const refreshProject = useCallback(() => {
    fetchProject();
  }, [fetchProject]);

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  return {
    project,
    isLoading,
    error,
    updateProject,
    refreshProject,
    clearError
  };
};

// Project statistics hook
export const useProjectStats = (projectId: number) => {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const fetchStats = useCallback(async () => {
    if (!projectId) {
      return;
    }
    setIsLoading(true);
    setError(undefined);
    try {
      const statsData = await projectAPI.getProjectStats(projectId); // FIXED
      setStats(statsData); // Use this state for results
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const refreshStats = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats, isLoading, error, refreshStats
  };
};
