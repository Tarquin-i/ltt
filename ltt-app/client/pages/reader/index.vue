<template>
  <view class="book-page" :class="{ dark: isDark }">
    <!-- 顶部导航栏 -->
    <view class="nav-bar" :class="{ dark: isDark }" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="nav-left">
        <view class="nav-btn" @click="goBack">
          <text class="nav-icon" :style="{ color: isDark ? '#f0f0f0' : '#333' }">←</text>
        </view>
        <view class="nav-btn" @click="showDrawer = true">
          <text class="nav-icon" :style="{ color: isDark ? '#f0f0f0' : '#333' }">☰</text>
        </view>
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
          :tag-style="tagStyle"
          selectable
          lazy-load
          @load="onMpHtmlLoad"
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
      :isDark="isDark"
      :fontSize="fontSize"
      :fontSizeMin="FONT_SIZE_MIN"
      :fontSizeMax="FONT_SIZE_MAX"
      @toggleDrawer="showDrawer = true"
      @decreaseFont="decreaseFontSize"
      @increaseFont="increaseFontSize"
      @toggleDark="toggleDarkMode"
    />

    <!-- 目录抽屉 -->
    <ChapterDrawer
      :visible="showDrawer"
      :chapters="bookMeta.chapters"
      :currentChapterId="currentChapterId"
      :isDark="isDark"
      :statusBarHeight="statusBarHeight"
      @close="showDrawer = false"
      @select="onSelectChapter"
    />
  </view>
</template>

<script>
import ChapterDrawer from '@/components/ChapterDrawer.vue'
import ReaderToolbar from '@/components/ReaderToolbar.vue'
import { bookMeta } from '@/data/bookMeta.js'
import { loadChapter } from '@/data/chapterLoader.js'
import { readerSettingsMixin } from '@/composables/useReaderSettings.js'
import { readingProgressMixin } from '@/composables/useReadingProgress.js'

export default {
  components: { ChapterDrawer, ReaderToolbar },
  mixins: [readerSettingsMixin, readingProgressMixin],
  data() {
    return {
      bookMeta,
      chapterHtml: '',
      loading: false,
      showDrawer: false,
      scrollTopValue: 0,
      statusBarHeight: 0,
      isSwitching: false,
    }
  },
  computed: {
    currentChapterIndex() {
      return bookMeta.chapters.findIndex(c => c.id === this.currentChapterId)
    },
    currentChapterTitle() {
      const chapter = bookMeta.chapters[this.currentChapterIndex]
      if (!chapter) return bookMeta.title
      return chapter.subtitle
        ? `${chapter.title} - ${chapter.subtitle}`
        : chapter.title
    },
    readerStyle() {
      return {
        background: this.isDark ? '#1a1a1a' : '#fff',
        paddingTop: (this.statusBarHeight + 44) + 'px',
      }
    },
  },
  watch: {
    fontSize() { this.reRenderContent() },
    isDark() { this.reRenderContent() },
  },
  mounted() {
    const sysInfo = uni.getWindowInfo()
    this.statusBarHeight = sysInfo.statusBarHeight || 0
    this.restoreSettings()
    this.restoreProgress()
    const chapterId = this.currentChapterId || bookMeta.chapters[0].id
    this.switchChapter(chapterId, !!this.currentChapterId)
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    switchChapter(chapterId, restoreScroll) {
      this.isSwitching = true
      this.loading = true
      this.chapterHtml = loadChapter(chapterId)
      this.currentChapterId = chapterId
      if (!restoreScroll) {
        this.scrollTopValue = 1
        this.$nextTick(() => {
          this.scrollTopValue = 0
          this.scrollTop = 0
        })
      }
      this.loading = false
      this.isSwitching = false
    },
    onSelectChapter(chapterId) {
      this.showDrawer = false
      this.switchChapter(chapterId)
    },
    prevChapter() {
      if (this.currentChapterIndex > 0) {
        this.switchChapter(bookMeta.chapters[this.currentChapterIndex - 1].id)
      }
    },
    nextChapter() {
      const max = bookMeta.chapters.length - 1
      if (this.currentChapterIndex < max) {
        this.switchChapter(bookMeta.chapters[this.currentChapterIndex + 1].id)
      }
    },
    onScroll(e) {
      if (this._scrollTimer) clearTimeout(this._scrollTimer)
      this._scrollTimer = setTimeout(() => {
        this.scrollTop = e.detail.scrollTop
      }, 300)
    },
    onMpHtmlLoad() {
      if (this.scrollTop > 0) {
        this.scrollTopValue = this.scrollTop
      }
    },
    reRenderContent() {
      if (this.isSwitching) return
      const html = this.chapterHtml
      if (!html) return
      this.chapterHtml = ''
      this.$nextTick(() => {
        this.chapterHtml = html
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.book-page {
  min-height: 100vh;
  background: #fff;
  &.dark { background: #1a1a1a; }
}

.nav-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 44px;
  background: #fff;
  border-bottom: 1rpx solid #eee;
  &.dark {
    background: #222;
    border-bottom-color: #333;
    .nav-title, .chapter-progress { color: #f0f0f0; }
  }
}

.nav-left {
  width: 140rpx;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx; height: 60rpx;
}

.nav-icon { font-size: 40rpx; }

.nav-center { flex: 1; text-align: center; overflow: hidden; }

.nav-title {
  font-size: 28rpx; color: #333;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.nav-right {
  width: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chapter-progress { font-size: 24rpx; color: #999; }

.reader-content { height: 100vh; }

.reader-inner { padding: 20rpx 30rpx; }

.chapter-nav {
  display: flex;
  justify-content: space-between;
  padding: 40rpx 30rpx;
}

.chapter-nav-btn {
  padding: 16rpx 32rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx; color: #666;
  &.disabled { opacity: 0.3; pointer-events: none; }
}

.book-page.dark {
  .chapter-nav-btn { border-color: #444; color: #ddd; }
}

.loading {
  position: fixed;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  padding: 20rpx 40rpx;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 12rpx;
  color: #fff; font-size: 28rpx;
  z-index: 200;
}
</style>