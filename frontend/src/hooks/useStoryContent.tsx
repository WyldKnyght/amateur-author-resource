// frontend/src/hooks/useStoryContent.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  StoryContent, 
  StoryContentUpdate, 
  ProjectEditorState 
} from '../types/project-types';
import { projectAPI, handleApiError, AutoSaveManager } from '../services/project-api';

export const useStoryContent = (projectId: number, autoSaveDelay: number = 3000) => {
  const [state, setState] = useState<ProjectEditorState>({
    isLoading: false,
    isSaving: false,
    isAutoSaving: false,
    hasUnsavedChanges: false,
    lastSaved: undefined,
    error: undefined,
    content: ''
  });

  const autoSaveManager = useRef<AutoSaveManager | null>(null);
  const lastSavedContent = useRef<string>('');

  // Initialize auto-save manager
  useEffect(() => {
    if (projectId) {
      autoSaveManager.current = new AutoSaveManager(projectId, autoSaveDelay);
    }
    
    return () => {
      autoSaveManager.current?.destroy();
    };
  }, [projectId, autoSaveDelay]);

  // Load initial content
  const loadContent = useCallback(async () => {
    if (!projectId) return;

    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const content = await projectAPI.getStoryContent(projectId);
      const contentText = content.content || '';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        content: contentText,
        hasUnsavedChanges: false,
        lastSaved: content.updated_at
      }));
      
      lastSavedContent.current = contentText;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: handleApiError(error)
      }));
    }
  }, [projectId]);

  // Update content in state and schedule auto-save
  const updateContent = useCallback((newContent: string) => {
    setState(prev => ({
      ...prev,
      content: newContent,
      hasUnsavedChanges: newContent !== lastSavedContent.current,
      error: undefined
    }));

    // Schedule auto-save if content has changed
    if (newContent !== lastSavedContent.current && autoSaveManager.current) {
      setState(prev => ({ ...prev, isAutoSaving: true }));
      
      autoSaveManager.current.scheduleAutoSave(newContent, () => {
        setState(prev => ({ 
          ...prev, 
          isAutoSaving: false,
          lastSaved: new Date().toISOString()
        }));
        lastSavedContent.current = newContent;
      });
    }
  }, []);

  // Manual save
  const saveContent = useCallback(async (content?: string): Promise<boolean> => {
    const contentToSave = content !== undefined ? content : state.content;
    
    setState(prev => ({ ...prev, isSaving: true, error: undefined }));

    try {
      const savedContent = await projectAPI.saveStoryContent(projectId, {
        content: contentToSave,
        auto_saved: false,
        save_reason: 'manual_save'
      });

      setState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: savedContent.updated_at
      }));

      lastSavedContent.current = contentToSave;
      
      // Cancel any pending auto-save
      autoSaveManager.current?.cancel();
      
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: handleApiError(error)
      }));
      return false;
    }
  }, [projectId, state.content]);

  // Force save (bypass auto-save)
  const forceSave = useCallback(() => {
    autoSaveManager.current?.cancel();
    return saveContent();
  }, [saveContent]);

  // Version management
  const createVersion = useCallback(async (): Promise<boolean> => {
    try {
      await projectAPI.createContentVersion(projectId);
      // Refresh content to get the new version info
      await loadContent();
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: handleApiError(error)
      }));
      return false;
    }
  }, [projectId, loadContent]);

  const restoreVersion = useCallback(async (version: number): Promise<boolean> => {
    try {
      await projectAPI.restoreContentVersion(projectId, version);
      // Refresh content to get the restored version
      await loadContent();
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: handleApiError(error)
      }));
      return false;
    }
  }, [projectId, loadContent]);

  // Utility functions
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);

  const refreshContent = useCallback(() => {
    loadContent();
  }, [loadContent]);

  // Keyboard shortcut support
  const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          saveContent();
          break;
        case 'b': // Backup/Version
          event.preventDefault();
          createVersion();
          break;
      }
    }
  }, [saveContent, createVersion]);

  // Set up keyboard shortcuts
  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [handleKeyboardShortcuts]);

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Warn user about unsaved changes when leaving
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [state.hasUnsavedChanges]);

  return {
    ...state,
    updateContent,
    saveContent,
    forceSave,
    createVersion,
    restoreVersion,
    clearError,
    refreshContent,
    loadContent
  };
};

// Hook for managing content versions
export const useContentVersions = (projectId: number) => {
  const [versions, setVersions] = useState<StoryContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const fetchVersions = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const versionsData = await projectAPI.getContentVersions(projectId);
      setVersions(versionsData);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const refreshVersions = useCallback(() => {
    fetchVersions();
  }, [fetchVersions]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  return {
    versions,
    isLoading,
    error,
    refreshVersions
  };
};

// Hook for content backup
export const useContentBackup = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const exportBackup = useCallback(async (projectId: number) => {
    setIsExporting(true);
    setError(undefined);

    try {
      const backup = await projectAPI.backupContent(projectId);
      
      // Create and download file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${backup.project.title}_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      setError(handleApiError(err));
      return false;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    error,
    exportBackup
  };
};