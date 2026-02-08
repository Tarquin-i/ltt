import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReaderToolbarProps {
  isDark: boolean;
  fontSize: number;
  fontSizeMin: number;
  fontSizeMax: number;
  onToggleDrawer: () => void;
  onDecreaseFont: () => void;
  onIncreaseFont: () => void;
  onToggleDark: () => void;
}

export default function ReaderToolbar({
  isDark, fontSize, fontSizeMin, fontSizeMax,
  onToggleDrawer, onDecreaseFont, onIncreaseFont, onToggleDark,
}: ReaderToolbarProps) {
  const insets = useSafeAreaInsets();
  const textColor = isDark ? '#f0f0f0' : '#333';
  const labelColor = isDark ? '#f0f0f0' : '#666';
  const bg = isDark ? '#222' : '#fff';
  const border = isDark ? '#333' : '#eee';

  return (
    <View style={[styles.toolbar, {
      backgroundColor: bg,
      borderTopColor: border,
      paddingBottom: insets.bottom,
    }]}>
      <View style={styles.row}>
        <Pressable style={styles.btn} onPress={onToggleDrawer}>
          <Text style={[styles.icon, { color: textColor }]}>☰</Text>
          <Text style={[styles.label, { color: labelColor }]}>目录</Text>
        </Pressable>

        <Pressable
          style={[styles.btn, fontSize <= fontSizeMin && styles.disabled]}
          onPress={onDecreaseFont}
          disabled={fontSize <= fontSizeMin}
        >
          <Text style={[styles.btnIcon, { color: textColor }]}>A-</Text>
        </Pressable>

        <View style={styles.fontDisplay}>
          <Text style={[styles.fontText, { color: labelColor }]}>{fontSize}px</Text>
        </View>

        <Pressable
          style={[styles.btn, fontSize >= fontSizeMax && styles.disabled]}
          onPress={onIncreaseFont}
          disabled={fontSize >= fontSizeMax}
        >
          <Text style={[styles.btnIcon, { color: textColor }]}>A+</Text>
        </Pressable>

        <Pressable style={styles.btn} onPress={onToggleDark}>
          <Text style={[styles.btnIcon, { color: textColor }]}>{isDark ? '☀' : '☾'}</Text>
          <Text style={[styles.label, { color: labelColor }]}>{isDark ? '日间' : '夜间'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    zIndex: 100,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 45,
    paddingHorizontal: 10,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  disabled: {
    opacity: 0.3,
  },
  icon: {
    fontSize: 18,
  },
  btnIcon: {
    fontSize: 16,
  },
  label: {
    fontSize: 10,
    marginTop: 1,
  },
  fontDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontText: {
    fontSize: 12,
  },
});