import { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { bookMeta } from '../../data/bookMeta';

const coverImage = require('../../assets/images/book/image002.png');

export default function BookshelfScreen() {
  const router = useRouter();
  const [progressText, setProgressText] = useState('');

  const updateProgress = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('reading_progress');
      if (!saved) { setProgressText(''); return; }
      const data = JSON.parse(saved);
      if (!data.chapterId) { setProgressText(''); return; }
      const idx = bookMeta.chapters.findIndex(c => c.id === data.chapterId);
      if (idx < 0) { setProgressText(''); return; }
      setProgressText(
        `已读到：${bookMeta.chapters[idx].title}（${idx + 1}/${bookMeta.chapters.length}）`
      );
    } catch {
      setProgressText('');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      updateProgress();
    }, [updateProgress])
  );

  return (
    <View style={styles.page}>
      <Pressable style={styles.card} onPress={() => router.push('/reader')}>
        <View style={styles.cover}>
          <Image source={coverImage} style={styles.coverImg} resizeMode="cover" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{bookMeta.title}</Text>
          <Text style={styles.author}>{bookMeta.author}</Text>
          {progressText ? <Text style={styles.progress}>{progressText}</Text> : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cover: {
    width: 90,
    height: 120,
    borderRadius: 4,
    overflow: 'hidden',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  progress: {
    fontSize: 12,
    color: '#999',
  },
});
