import React, { useRef, useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

interface ReaderWebViewProps {
  html: string;
  scrollTop?: number;
  onScroll?: (scrollTop: number) => void;
  onLoaded?: () => void;
}

export default function ReaderWebView({ html, scrollTop, onScroll, onLoaded }: ReaderWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const hasRestoredScroll = useRef(false);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'scroll' && onScroll) {
        onScroll(data.scrollTop);
      } else if (data.type === 'loaded') {
        if (scrollTop && scrollTop > 0 && !hasRestoredScroll.current) {
          hasRestoredScroll.current = true;
          webViewRef.current?.injectJavaScript(`scrollToPosition(${scrollTop}); true;`);
        }
        onLoaded?.();
      }
    } catch {}
  }, [scrollTop, onScroll, onLoaded]);

  useEffect(() => {
    hasRestoredScroll.current = false;
  }, [html]);

  return (
    <WebView
      ref={webViewRef}
      source={{ html, baseUrl: 'file:///' }}
      style={styles.webview}
      originWhitelist={['*']}
      onMessage={handleMessage}
      javaScriptEnabled
      scrollEnabled
      showsVerticalScrollIndicator={false}
      allowFileAccess
      allowFileAccessFromFileURLs
      allowUniversalAccessFromFileURLs
    />
  );
}

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
