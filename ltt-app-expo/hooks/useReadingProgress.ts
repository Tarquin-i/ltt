import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingProgress } from '../types/book';

const STORAGE_KEY = 'reading_progress';

export function useReadingProgress() {
  const [currentChapterId, setCurrentChapterId] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveProgress = useCallback(async (chapterId: string, scroll: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        chapterId,
        scrollTop: scroll,
      }));
    } catch (e) {
      console.warn('Failed to save reading progress:', e);
    }
  }, []);

  const restoreProgress = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: ReadingProgress = JSON.parse(saved);
        setCurrentChapterId(data.chapterId || '');
        setScrollTop(data.scrollTop || 0);
      }
    } catch (e) {
      console.warn('Failed to restore reading progress:', e);
    }
    setLoaded(true);
  }, []);

  const updateChapter = useCallback((chapterId: string) => {
    setCurrentChapterId(chapterId);
    setScrollTop(0);
    saveProgress(chapterId, 0);
  }, [saveProgress]);

  const updateScrollTop = useCallback((scroll: number) => {
    setScrollTop(scroll);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setCurrentChapterId(prev => {
        saveProgress(prev, scroll);
        return prev;
      });
    }, 300);
  }, [saveProgress]);

  useEffect(() => {
    restoreProgress();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [restoreProgress]);

  return {
    currentChapterId,
    scrollTop,
    loaded,
    updateChapter,
    updateScrollTop,
  };
}
