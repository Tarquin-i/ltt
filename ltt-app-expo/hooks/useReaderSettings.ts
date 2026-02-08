import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReaderSettings } from '../types/book';

const STORAGE_KEY = 'reader_settings';
export const FONT_SIZE_MIN = 14;
export const FONT_SIZE_MAX = 24;
const FONT_SIZE_DEFAULT = 16;
const FONT_SIZE_STEP = 2;

export function useReaderSettings() {
  const [fontSize, setFontSize] = useState(FONT_SIZE_DEFAULT);
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const restoreSettings = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: ReaderSettings = JSON.parse(saved);
        setFontSize(data.fontSize || FONT_SIZE_DEFAULT);
        setIsDark(data.isDark || false);
      }
    } catch (e) {
      console.warn('Failed to restore reader settings:', e);
    }
    setLoaded(true);
  }, []);

  const saveSettings = useCallback(async (fs: number, dark: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        fontSize: fs,
        isDark: dark,
      }));
    } catch (e) {
      console.warn('Failed to save reader settings:', e);
    }
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize(prev => {
      const next = Math.min(prev + FONT_SIZE_STEP, FONT_SIZE_MAX);
      saveSettings(next, isDark);
      return next;
    });
  }, [isDark, saveSettings]);

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => {
      const next = Math.max(prev - FONT_SIZE_STEP, FONT_SIZE_MIN);
      saveSettings(next, isDark);
      return next;
    });
  }, [isDark, saveSettings]);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      saveSettings(fontSize, next);
      return next;
    });
  }, [fontSize, saveSettings]);

  useEffect(() => {
    restoreSettings();
  }, [restoreSettings]);

  return {
    fontSize,
    isDark,
    loaded,
    increaseFontSize,
    decreaseFontSize,
    toggleDarkMode,
  };
}
