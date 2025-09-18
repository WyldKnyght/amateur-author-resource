// frontend/src/types/project-types.ts
export interface Project {
  id: number;
  title: string;
  description?: string;
  genre?: string;
  status: ProjectStatus;
  is_private: boolean;
  word_count: number;
  target_word_count?: number;
  user_id: number;
  created_at: string;
  updated_at?: string;
  last_edited_at?: string;
}

export interface ProjectCreate {
  title: string;
  description?: string;
  genre?: string;
  status?: ProjectStatus;
  is_private?: boolean;
  target_word_count?: number;
}

export interface ProjectUpdate {
  title?: string;
  description?: string;
  genre?: string;
  status?: ProjectStatus;
  is_private?: boolean;
  target_word_count?: number;
}

export interface ProjectWithContent extends Project {
  content?: StoryContent;
}

export interface StoryContent {
  id: number;
  project_id: number;
  content?: string;
  content_type: ContentType;
  version: number;
  is_active: boolean;
  auto_saved: boolean;
  save_reason: SaveReason;
  created_at: string;
  updated_at?: string;
}

export interface StoryContentUpdate {
  content?: string;
  auto_saved?: boolean;
  save_reason?: SaveReason;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ProjectStats {
  project_id: number;
  word_count: number;
  target_word_count?: number;
  character_count: number;
  progress_percentage: number;
  days_since_creation: number;
  last_edited?: string;
}

export interface ProjectBackup {
  project: {
    id: number;
    title: string;
    description?: string;
    genre?: string;
    status: string;
    created_at: string;
    word_count: number;
  };
  content_versions: Array<{
    version: number;
    content?: string;
    content_type: string;
    is_active: boolean;
    created_at: string;
    save_reason: string;
  }>;
  backup_created_at: string;
}

// Enums
export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'published';

export type ContentType = 'markdown' | 'html' | 'plain_text';

export type SaveReason = 
  | 'manual_save' 
  | 'auto_save' 
  | 'version_save' 
  | 'initial_creation' 
  | 'version_restore';

// Filter and query types
export interface ProjectFilters {
  status?: ProjectStatus;
  genre?: string;
  search?: string;
  skip?: number;
  limit?: number;
}

// UI State types
export interface ProjectEditorState {
  isLoading: boolean;
  isSaving: boolean;
  isAutoSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved?: string;
  error?: string;
  content: StoryContent | null;
}

export interface ProjectListState {
  projects: Project[];
  isLoading: boolean;
  error?: string;
  filters: ProjectFilters;
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };
}

// Form validation types
export interface ProjectFormErrors {
  title?: string;
  description?: string;
  genre?: string;
  target_word_count?: string;
}

// Genre options for dropdowns
export const GENRE_OPTIONS = [
  'Fiction',
  'Non-Fiction',
  'Romance',
  'Mystery',
  'Fantasy',
  'Science Fiction',
  'Thriller',
  'Horror',
  'Adventure',
  'Young Adult',
  'Children\'s',
  'Biography',
  'Memoir',
  'Self-Help',
  'Business',
  'Poetry',
  'Other'
] as const;

// Status options
export const STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'in_progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'published', label: 'Published', color: 'purple' }
];

// API Response types
export interface ApiError {
  detail: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// Component Props types
export interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: number) => void;
  onOpen: (projectId: number) => void;
}

export interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  onCreateNew: () => void;
  onProjectSelect: (projectId: number) => void;
  onProjectEdit: (project: Project) => void;
  onProjectDelete: (projectId: number) => void;
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
}

export interface ProjectEditorProps {
  projectId: number;
  onSave: (content: string) => void;
  onAutoSave: (content: string) => void;
  autoSaveInterval?: number; // in milliseconds
}