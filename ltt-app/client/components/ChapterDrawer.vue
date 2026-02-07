<template>
  <view class="drawer-mask" v-if="visible" @click="$emit('close')">
    <view class="drawer" :class="{ dark: isDark }" @click.stop>
      <view class="drawer-header">
        <text class="drawer-title">目录</text>
      </view>
      <scroll-view scroll-y class="chapter-list">
        <view
          v-for="chapter in chapters"
          :key="chapter.id"
          class="chapter-item"
          :class="{ active: chapter.id === currentChapterId }"
          @click="$emit('select', chapter.id)"
        >
          <text class="chapter-title">{{ chapter.title }}</text>
          <text class="chapter-subtitle" v-if="chapter.subtitle">
            {{ chapter.subtitle }}
          </text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  chapters: { type: Array, default: () => [] },
  currentChapterId: { type: String, default: '' },
  isDark: { type: Boolean, default: false },
})

defineEmits(['close', 'select'])
</script>

<style lang="scss" scoped>
.drawer-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
}

.drawer {
  position: absolute;
  top: 0;
  left: 0;
  width: 560rpx;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;

  &.dark {
    background: #1a1a1a;
    .drawer-title { color: #eee; }
    .chapter-item {
      border-bottom-color: #333;
      .chapter-title { color: #ddd; }
      .chapter-subtitle { color: #888; }
      &.active {
        background: #2a2a2a;
        .chapter-title { color: #6ba3d6; }
      }
    }
  }
}

.drawer-header {
  padding: 80rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #eee;
}

.drawer-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
}

.chapter-list {
  flex: 1;
  height: 0;
}

.chapter-item {
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  flex-direction: column;

  &.active {
    background: #f5f5f5;
    .chapter-title { color: #1a73e8; }
  }
}

.chapter-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.chapter-subtitle {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}
</style>
