<template>
  <view class="bookshelf-page">
    <view class="book-list">
      <view class="book-card" @click="openBook">
        <view class="book-cover">
          <image
            class="cover-img"
            src="/static/images/book/image002.png"
            mode="aspectFill"
          />
        </view>
        <view class="book-info">
          <text class="book-name">{{ bookMeta.title }}</text>
          <text class="book-author">{{ bookMeta.author }}</text>
          <text class="book-progress" v-if="progressText">
            {{ progressText }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { bookMeta } from '@/data/bookMeta.js'

const STORAGE_KEY = 'reading_progress'

export default {
  data() {
    return {
      bookMeta,
      progressText: '',
    }
  },
  onShow() {
    this.updateProgress()
  },
  methods: {
    updateProgress() {
      try {
        const saved = uni.getStorageSync(STORAGE_KEY)
        if (!saved) {
          this.progressText = ''
          return
        }
        const data = JSON.parse(saved)
        if (!data.chapterId) {
          this.progressText = ''
          return
        }
        const idx = bookMeta.chapters.findIndex(c => c.id === data.chapterId)
        if (idx < 0) {
          this.progressText = ''
          return
        }
        this.progressText = `已读到：${bookMeta.chapters[idx].title}（${idx + 1}/${bookMeta.chapters.length}）`
      } catch (e) {
        this.progressText = ''
      }
    },
    openBook() {
      uni.navigateTo({ url: '/pages/reader/index' })
    },
  },
}
</script>

<style lang="scss" scoped>
.bookshelf-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.book-list {
  padding: 30rpx;
}

.book-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.book-cover {
  width: 180rpx;
  height: 240rpx;
  border-radius: 8rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.book-info {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.book-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.book-author {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.book-progress {
  font-size: 24rpx;
  color: #999;
}
</style>
