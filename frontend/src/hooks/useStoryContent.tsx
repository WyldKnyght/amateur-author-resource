// frontend/src/hooks/useStoryContent.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { ProjectEditorState, StoryContent } from '../types/project-types';
import { handleApiError, AutoSaveManager, projectAPI } from '../services/project-api';

export const useStoryContent = (projectId: number, autoSaveDelay: number = 3000) => {
  const [state, setState] = useState<ProjectEditorState>({
    isLoading: false,
    isSaving: false,
    isAutoSaving: false,
    hasUnsavedChanges: false,
    lastSaved: undefined,
    error: undefined,
    content: null
  });
  const autoSaveManager = useRef<AutoSaveManager | null>(null);
  const lastSavedContent = useRef<string>('');

  useEffect(() => {
    if (projectId) {
      autoSaveManager.current = new AutoSaveManager(projectId, autoSaveDelay);
    }
    return () => {
      if (autoSaveManager.current) {
        autoSaveManager.current.destroy();
      }
    };
  }, [projectId, autoSaveDelay]);

  const loadContent = useCallback(async () => {
    if (!projectId) {
      return;
    }
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    try {
      const contentData = await projectAPI.getStoryContent(projectId);
      setState(prev => ({
        ...prev,
        isLoading: false,
        content: contentData,
        hasUnsavedChanges: false,
        lastSaved: contentData.updated_at
      }));
      lastSavedContent.current = contentData.content || '';
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: handleApiError(error)
      }));
    }
  }, [projectId]);

  const updateContent = useCallback((newContent: string) => {
    setState(prev => ({
      ...prev,
      content: prev.content ? { ...prev.content, content: newContent } : null,
      hasUnsavedChanges: newContent !== lastSavedContent.current,
      error: undefined
    }));
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

  const saveContent = useCallback(async (): Promise<boolean> => {
    if (!state.content) {
      return false;
    }
    const contentToSave = state.content.content || '';
    setState(prev => ({ ...prev, isSaving: true, error: undefined }));
    try {
      const savedContent = await projectAPI.saveStoryContent(projectId, { content: contentToSave });
      setState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: savedContent.updated_at,
        content: savedContent
      }));
      lastSavedContent.current = contentToSave;
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

  const createVersion = useCallback(async (): Promise<boolean> => {
    try {
      await projectAPI.createContentVersion(projectId);
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error: handleApiError(error) }));
      return false;
    }
  }, [projectId]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);
  const refreshContent = useCallback(() => { loadContent(); }, [loadContent]);

  const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      saveContent();
    }
  }, [saveContent]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyboardShortcuts);
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  useEffect(() => { loadContent(); }, [loadContent]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  return {
    ...state,
    updateContent,
    saveContent,
    createVersion,
    clearError,
    refreshContent,
    loadContent
  };
};

export const useContentVersions = (projectId: number) => {
  const [versions, setVersions] = useState<StoryContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const fetchVersions = useCallback(async () => {
    if (!projectId) {
      return;
    }
    setIsLoading(true);
    setError(undefined);
    try {
      const versionData = await projectAPI.getContentVersions(projectId);
      setVersions(versionData);
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
    refreshVersions,
  };
};
