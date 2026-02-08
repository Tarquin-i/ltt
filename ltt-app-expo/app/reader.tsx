import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bookMeta } from '../data/bookMeta';
import { loadChapter } from '../data/chapterLoader';
import { useReaderSettings, FONT_SIZE_MIN, FONT_SIZE_MAX } from '../hooks/useReaderSettings';
import { useReadingProgress } from '../hooks/useReadingProgress';
import { buildHtmlDocument } from '../lib/htmlTemplate';
import ReaderWebView from '../components/ReaderWebView';
import ReaderToolbar from '../components/ReaderToolbar';
import ChapterDrawer from '../components/ChapterDrawer';

export default function ReaderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fontSize, isDark, loaded: settingsLoaded, increaseFontSize, decreaseFontSize, toggleDarkMode } = useReaderSettings();
  const { currentChapterId, scrollTop, loaded: progressLoaded, updateChapter, updateScrollTop } = useReadingProgress();

  const [chapterHtml, setChapterHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize: load chapter after settings & progress restored
  useEffect(() => {
    if (!settingsLoaded || !progressLoaded || initialized) return;
    const chapterId = currentChapterId || bookMeta.chapters[0].id;
    const html = loadChapter(chapterId);
    setChapterHtml(html);
    if (!currentChapterId) {
      updateChapter(chapterId);
    }
    setLoading(false);
    setInitialized(true);
  }, [settingsLoaded, progressLoaded, initialized, currentChapterId, updateChapter]);

  const currentChapterIndex = useMemo(
    () => bookMeta.chapters.findIndex(c => c.id === currentChapterId),
    [currentChapterId]
  );

  const currentChapterTitle = useMemo(() => {
    const chapter = bookMeta.chapters[currentChapterIndex];
    if (!chapter) return bookMeta.title;
    return chapter.subtitle ? `${chapter.title} - ${chapter.subtitle}` : chapter.title;
  }, [currentChapterIndex]);

  const htmlDocument = useMemo(() => {
    if (!chapterHtml) return '';
    return buildHtmlDocument({ content: chapterHtml, fontSize, isDark });
  }, [chapterHtml, fontSize, isDark]);

  const switchChapter = useCallback((chapterId: string) => {
    setLoading(true);
    const html = loadChapter(chapterId);
    setChapterHtml(html);
    updateChapter(chapterId);
    setLoading(false);
  }, [updateChapter]);

  const prevChapter = useCallback(() => {
    if (currentChapterIndex > 0) {
      switchChapter(bookMeta.chapters[currentChapterIndex - 1].id);
    }
  }, [currentChapterIndex, switchChapter]);

  const nextChapter = useCallback(() => {
    if (currentChapterIndex < bookMeta.chapters.length - 1) {
      switchChapter(bookMeta.chapters[currentChapterIndex + 1].id);
    }
  }, [currentChapterIndex, switchChapter]);

  const onSelectChapter = useCallback((chapterId: string) => {
    setShowDrawer(false);
    switchChapter(chapterId);
  }, [switchChapter]);

  const navBarBg = isDark ? '#222' : '#fff';
  const navBarBorder = isDark ? '#333' : '#eee';
  const textColor = isDark ? '#f0f0f0' : '#333';
  const pageBg = isDark ? '#1a1a1a' : '#fff';

  return (
    <View style={[styles.page, { backgroundColor: pageBg }]}>
      {/* Nav Bar */}
      <View style={[styles.navBar, {
        paddingTop: insets.top,
        backgroundColor: navBarBg,
        borderBottomColor: navBarBorder,
      }]}>
        <View style={styles.navLeft}>
          <Pressable style={styles.navBtn} onPress={() => router.back()}>
            <Text style={[styles.navIcon, { color: textColor }]}>←</Text>
          </Pressable>
          <Pressable style={styles.navBtn} onPress={() => setShowDrawer(true)}>
            <Text style={[styles.navIcon, { color: textColor }]}>☰</Text>
          </Pressable>
        </View>
        <View style={styles.navCenter}>
          <Text style={[styles.navTitle, { color: textColor }]} numberOfLines={1}>
            {currentChapterTitle}
          </Text>
        </View>
        <View style={styles.navRight}>
          <Text style={styles.chapterProgress}>
            {currentChapterIndex + 1}/{bookMeta.chapters.length}
          </Text>
        </View>
      </View>

      {/* WebView Content */}
      <View style={[styles.content, { marginTop: insets.top + 44 }]}>
        {htmlDocument ? (
          <ReaderWebView
            html={htmlDocument}
            scrollTop={scrollTop}
            onScroll={updateScrollTop}
          />
        ) : null}
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      )}

      {/* Toolbar */}
      <ReaderToolbar
        isDark={isDark}
        fontSize={fontSize}
        fontSizeMin={FONT_SIZE_MIN}
        fontSizeMax={FONT_SIZE_MAX}
        onToggleDrawer={() => setShowDrawer(true)}
        onDecreaseFont={decreaseFontSize}
        onIncreaseFont={increaseFontSize}
        onToggleDark={toggleDarkMode}
      />

      {/* Chapter Drawer */}
      <ChapterDrawer
        visible={showDrawer}
        chapters={bookMeta.chapters}
        currentChapterId={currentChapterId}
        isDark={isDark}
        statusBarHeight={insets.top}
        onClose={() => setShowDrawer(false)}
        onSelect={onSelectChapter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    height: undefined,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navLeft: {
    width: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 20,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 14,
  },
  navRight: {
    width: 50,
    alignItems: 'center',
  },
  chapterProgress: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -25 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    zIndex: 200,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
});
