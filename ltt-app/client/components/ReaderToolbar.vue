<template>
  <view class="toolbar" :class="{ dark: isDark }">
    <view class="toolbar-row">
      <!-- 目录按钮 -->
      <view class="toolbar-btn" @click="$emit('toggleDrawer')">
        <text class="toolbar-icon" :style="{ color: isDark ? '#f0f0f0' : '#333' }">☰</text>
        <text class="btn-label">目录</text>
      </view>

      <!-- 字体缩小 -->
      <view
        class="toolbar-btn"
        :class="{ disabled: fontSize <= fontSizeMin }"
        @click="$emit('decreaseFont')"
      >
        <text class="btn-icon">A-</text>
      </view>

      <!-- 字体大小显示 -->
      <view class="font-size-display">
        <text class="font-size-text">{{ fontSize }}px</text>
      </view>

      <!-- 字体放大 -->
      <view
        class="toolbar-btn"
        :class="{ disabled: fontSize >= fontSizeMax }"
        @click="$emit('increaseFont')"
      >
        <text class="btn-icon">A+</text>
      </view>

      <!-- 深色模式 -->
      <view class="toolbar-btn" @click="$emit('toggleDark')">
        <text class="btn-icon">{{ isDark ? '☀' : '☾' }}</text>
        <text class="btn-label">{{ isDark ? '日间' : '夜间' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    isDark: { type: Boolean, default: false },
    fontSize: { type: Number, default: 16 },
    fontSizeMin: { type: Number, default: 14 },
    fontSizeMax: { type: Number, default: 24 },
  },
}
</script>

<style lang="scss" scoped>
.toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1rpx solid #eee;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;

  &.dark {
    background: #222;
    border-top-color: #333;
    .btn-icon, .btn-label, .font-size-text { color: #f0f0f0; }
    .toolbar-btn.disabled .btn-icon { color: #555; }
  }
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 90rpx;
  padding: 0 20rpx;
}

.toolbar-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8rpx 16rpx;

  &.disabled {
    opacity: 0.3;
  }
}

.btn-icon {
  font-size: 32rpx;
  color: #333;
}

.toolbar-icon { font-size: 36rpx; }

.btn-label {
  font-size: 20rpx;
  color: #666;
  margin-top: 2rpx;
}

.font-size-display {
  display: flex;
  align-items: center;
  justify-content: center;
}

.font-size-text {
  font-size: 24rpx;
  color: #666;
}
</style>
