import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Modal } from 'react-native';
import { Chapter } from '../types/book';

interface ChapterDrawerProps {
  visible: boolean;
  chapters: Chapter[];
  currentChapterId: string;
  isDark: boolean;
  statusBarHeight: number;
  onClose: () => void;
  onSelect: (chapterId: string, anchor?: string) => void;
}

export default function ChapterDrawer({
  visible, chapters, currentChapterId, isDark,
  statusBarHeight, onClose, onSelect,
}: ChapterDrawerProps) {
  const bg = isDark ? '#1a1a1a' : '#fff';
  const titleColor = isDark ? '#fff' : '#333';
  const borderColor = isDark ? '#333' : '#f0f0f0';
  const headerBorder = isDark ? '#333' : '#eee';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.mask} onPress={onClose}>
        <Pressable style={[styles.drawer, { backgroundColor: bg }]} onPress={e => e.stopPropagation()}>
          <View style={[styles.header, {
            paddingTop: statusBarHeight + 10,
            borderBottomColor: headerBorder,
          }]}>
            <Text style={[styles.drawerTitle, { color: titleColor }]}>目录</Text>
          </View>
          <ScrollView style={styles.list}>
            {chapters.map(chapter => (
              <View key={chapter.id}>
                <Pressable
                  style={[
                    styles.item,
                    { borderBottomColor: borderColor },
                    chapter.id === currentChapterId && (isDark ? styles.activeDark : styles.active),
                  ]}
                  onPress={() => onSelect(chapter.id)}
                >
                  <Text style={[
                    styles.chapterTitle,
                    { color: isDark ? '#f0f0f0' : '#333' },
                    chapter.id === currentChapterId && { color: isDark ? '#6ba3d6' : '#1a73e8' },
                  ]}>
                    {chapter.title}
                  </Text>
                  {chapter.subtitle ? (
                    <Text style={[styles.chapterSubtitle, { color: isDark ? '#bbb' : '#999' }]}>
                      {chapter.subtitle}
                    </Text>
                  ) : null}
                </Pressable>
                {chapter.subChapters?.map(sub => (
                  <Pressable
                    key={sub.anchor}
                    style={[styles.item, styles.subItem, { borderBottomColor: borderColor }]}
                    onPress={() => onSelect(chapter.id, sub.anchor)}
                  >
                    <Text style={[styles.subTitle, { color: isDark ? '#aaa' : '#666' }]}>
                      {sub.title}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: '100%',
  },
  header: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  drawerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  active: {
    backgroundColor: '#f5f5f5',
  },
  activeDark: {
    backgroundColor: '#2a2a2a',
  },
  chapterTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  chapterSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  subItem: {
    paddingLeft: 30,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 'normal',
  },
});
