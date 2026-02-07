<template>
  <view class="more-page">
    <view class="more-header">
      <text class="more-title">更多</text>
    </view>
    <view class="more-content">
      <text class="placeholder">更多功能即将推出</text>
    </view>
  </view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.more-page {
  min-height: 100vh;
  background: #f8f8f8;
}
.more-header {
  padding: 40rpx 30rpx;
  background: #fff;
  .more-title {
    font-size: 36rpx;
    font-weight: bold;
  }
}
.more-content {
  padding: 60rpx 30rpx;
  text-align: center;
  .placeholder {
    color: #999;
    font-size: 28rpx;
  }
}
</style>
