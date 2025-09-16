// frontend/src/services/project-api.ts
import axios from 'axios';
import {
  Project,
  ProjectCreate,
  ProjectUpdate,
  ProjectWithContent,
  ProjectListResponse,
  ProjectStats,
  ProjectBackup,
  ProjectFilters,
  StoryContent,
  StoryContentUpdate,
  ApiResponse
} from '../types/project-types';

// Get the API base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const projectAPI = {
  // Project Management APIs
  async getProjects(filters: ProjectFilters = {}): Promise<ProjectListResponse> {
    const params = new URLSearchParams();
    
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.search) params.append('search', filters.search);

    const response = await apiClient.get<ProjectListResponse>(`/projects?${params.toString()}`);
    return response.data;
  },

  async getProject(projectId: number): Promise<ProjectWithContent> {
    const response = await apiClient.get<ProjectWithContent>(`/projects/${projectId}`);
    return response.data;
  },

  async createProject(projectData: ProjectCreate): Promise<Project> {
    const response = await apiClient.post<Project>('/projects', projectData);
    return response.data;
  },

  async updateProject(projectId: number, projectData: ProjectUpdate): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${projectId}`, projectData);
    return response.data;
  },

  async deleteProject(projectId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/projects/${projectId}`);
    return response.data;
  },

  async getProjectStats(projectId: number): Promise<ProjectStats> {
    const response = await apiClient.get<ProjectStats>(`/projects/${projectId}/stats`);
    return response.data;
  },

  // Story Content APIs
  async getStoryContent(projectId: number): Promise<StoryContent> {
    const response = await apiClient.get<StoryContent>(`/stories/${projectId}/content`);
    return response.data;
  },

  async saveStoryContent(projectId: number, contentData: StoryContentUpdate): Promise<StoryContent> {
    const response = await apiClient.put<StoryContent>(`/stories/${projectId}/content`, contentData);
    return response.data;
  },

  async autoSaveStoryContent(projectId: number, content: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/stories/${projectId}/auto-save`, {
      content,
      auto_saved: true,
      save_reason: 'auto_save'
    });
    return response.data;
  },

  async createContentVersion(projectId: number): Promise<StoryContent> {
    const response = await apiClient.post<StoryContent>(`/stories/${projectId}/content/version`);
    return response.data;
  },

  async getContentVersions(projectId: number): Promise<StoryContent[]> {
    const response = await apiClient.get<StoryContent[]>(`/stories/${projectId}/content/versions`);
    return response.data;
  },

  async restoreContentVersion(projectId: number, version: number): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(`/stories/${projectId}/content/restore/${version}`);
    return response.data;
  },

  async backupContent(projectId: number): Promise<ProjectBackup> {
    const response = await apiClient.get<ProjectBackup>(`/stories/${projectId}/content/backup`);
    return response.data;
  }
};

export default projectAPI;

// Utility functions for error handling
export const handleApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Auto-save utility class
export class AutoSaveManager {
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly projectId: number;
  private readonly delay: number;

  constructor(projectId: number, delay: number = 3000) {
    this.projectId = projectId;
    this.delay = delay;
  }

  scheduleAutoSave(content: string, callback?: () => void): void {
    // Clear existing timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Schedule new auto-save
    this.timeoutId = setTimeout(async () => {
      try {
        await projectAPI.autoSaveStoryContent(this.projectId, content);
        callback?.();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, this.delay);
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  destroy(): void {
    this.cancel();
  }
}