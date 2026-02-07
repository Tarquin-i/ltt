<template>
  <view class="book-page" :class="{ dark: settings.isDark.value }">
    <!-- 顶部导航栏 -->
    <view class="nav-bar" :class="{ dark: settings.isDark.value }">
      <view class="nav-left" @click="showDrawer = true">
        <text class="nav-icon">☰</text>
      </view>
      <view class="nav-center">
        <text class="nav-title">{{ currentChapterTitle }}</text>
      </view>
      <view class="nav-right">
        <text class="chapter-progress">
          {{ currentChapterIndex + 1 }}/{{ bookMeta.chapters.length }}
        </text>
      </view>
    </view>

    <!-- 阅读内容区域 -->
    <scroll-view
      scroll-y
      class="reader-content"
      :scroll-top="scrollTopValue"
      @scroll="onScroll"
      :style="readerStyle"
    >
      <view class="reader-inner" v-if="chapterHtml">
        <mp-html
          :content="chapterHtml"
          :tag-style="settings.tagStyle.value"
          selectable
          lazy-load
        />
      </view>

      <!-- 章节切换按钮 -->
      <view class="chapter-nav">
        <view
          class="chapter-nav-btn prev-btn"
          :class="{ disabled: currentChapterIndex <= 0 }"
          @click="prevChapter"
        >
          <text>← 上一章</text>
        </view>
        <view
          class="chapter-nav-btn next-btn"
          :class="{ disabled: currentChapterIndex >= bookMeta.chapters.length - 1 }"
          @click="nextChapter"
        >
          <text>下一章 →</text>
        </view>
      </view>

      <!-- 底部留白 -->
      <view style="height: 200rpx;"></view>
    </scroll-view>

    <!-- 加载中 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 底部工具栏 -->
    <ReaderToolbar
      :isDark="settings.isDark.value"
      :fontSize="settings.fontSize.value"
      :fontSizeMin="settings.FONT_SIZE_MIN"
      :fontSizeMax="settings.FONT_SIZE_MAX"
      @toggleDrawer="showDrawer = true"
      @decreaseFont="settings.decreaseFontSize"
      @increaseFont="settings.increaseFontSize"
      @toggleDark="settings.toggleDarkMode"
    />

    <!-- 目录抽屉 -->
    <ChapterDrawer
      :visible="showDrawer"
      :chapters="bookMeta.chapters"
      :currentChapterId="progress.currentChapterId.value"
      :isDark="settings.isDark.value"
      @close="showDrawer = false"
      @select="onSelectChapter"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import ChapterDrawer from '@/components/ChapterDrawer.vue'
import ReaderToolbar from '@/components/ReaderToolbar.vue'
import { bookMeta } from '@/data/bookMeta.js'
import { loadChapter } from '@/data/chapterLoader.js'
import { useReadingProgress } from '@/composables/useReadingProgress.js'
import { useReaderSettings } from '@/composables/useReaderSettings.js'

const progress = useReadingProgress()
const settings = useReaderSettings()

const chapterHtml = ref('')
const loading = ref(false)
const showDrawer = ref(false)
const scrollTopValue = ref(0)

let scrollTimer = null

const currentChapterIndex = computed(() => {
  return bookMeta.chapters.findIndex(
    c => c.id === progress.currentChapterId.value
  )
})

const currentChapterTitle = computed(() => {
  const chapter = bookMeta.chapters[currentChapterIndex.value]
  if (!chapter) return bookMeta.title
  return chapter.subtitle
    ? `${chapter.title} - ${chapter.subtitle}`
    : chapter.title
})

const readerStyle = computed(() => ({
  background: settings.isDark.value ? '#1a1a1a' : '#fff',
}))

async function switchChapter(chapterId, restoreScroll = false) {
  loading.value = true
  try {
    const html = await loadChapter(chapterId)
    chapterHtml.value = html
    progress.currentChapterId.value = chapterId
    await nextTick()
    if (restoreScroll && progress.scrollTop.value > 0) {
      scrollTopValue.value = progress.scrollTop.value
    } else {
      scrollTopValue.value = 1
      await nextTick()
      scrollTopValue.value = 0
      progress.scrollTop.value = 0
    }
  } catch (e) {
    console.error('Failed to load chapter:', e)
  } finally {
    loading.value = false
  }
}

function onSelectChapter(chapterId) {
  showDrawer.value = false
  switchChapter(chapterId)
}

function prevChapter() {
  if (currentChapterIndex.value > 0) {
    switchChapter(bookMeta.chapters[currentChapterIndex.value - 1].id)
  }
}

function nextChapter() {
  const max = bookMeta.chapters.length - 1
  if (currentChapterIndex.value < max) {
    switchChapter(bookMeta.chapters[currentChapterIndex.value + 1].id)
  }
}

function onScroll(e) {
  if (scrollTimer) clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    progress.scrollTop.value = e.detail.scrollTop
  }, 300)
}

onMounted(() => {
  settings.restore()
  progress.restore()
  const chapterId =
    progress.currentChapterId.value || bookMeta.chapters[0].id
  switchChapter(chapterId, !!progress.currentChapterId.value)
})
</script>

<style lang="scss" scoped>
.book-page {
  min-height: 100vh;
  background: #fff;
  &.dark {
    background: #1a1a1a;
  }
}

.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 88rpx;
  padding-top: var(--status-bar-height, 0);
  background: #fff;
  border-bottom: 1rpx solid #eee;
  &.dark {
    background: #222;
    border-bottom-color: #333;
    .nav-icon,
    .nav-title,
    .chapter-progress {
      color: #ccc;
    }
  }
}

.nav-left {
  width: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon {
  font-size: 36rpx;
  color: #333;
}

.nav-center {
  flex: 1;
  text-align: center;
  overflow: hidden;
}

.nav-title {
  font-size: 28rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-right {
  width: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chapter-progress {
  font-size: 24rpx;
  color: #999;
}

.reader-content {
  height: 100vh;
  padding-top: calc(88rpx + var(--status-bar-height, 0));
}

.reader-inner {
  padding: 20rpx 30rpx;
}

.chapter-nav {
  display: flex;
  justify-content: space-between;
  padding: 40rpx 30rpx;
}

.chapter-nav-btn {
  padding: 16rpx 32rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666;
  &.disabled {
    opacity: 0.3;
    pointer-events: none;
  }
}

.book-page.dark {
  .chapter-nav-btn {
    border-color: #444;
    color: #aaa;
  }
}

.loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20rpx 40rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12rpx;
  color: #fff;
  font-size: 28rpx;
  z-index: 200;
}
</style>
