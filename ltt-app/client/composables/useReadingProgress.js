import { ref, watch } from 'vue'

const STORAGE_KEY = 'reading_progress'

export function useReadingProgress() {
  const currentChapterId = ref('')
  const scrollTop = ref(0)

  function restore() {
    try {
      const saved = uni.getStorageSync(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        currentChapterId.value = data.chapterId || ''
        scrollTop.value = data.scrollTop || 0
      }
    } catch (e) {
      console.warn('Failed to restore reading progress:', e)
    }
  }

  function save() {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify({
        chapterId: currentChapterId.value,
        scrollTop: scrollTop.value,
      }))
    } catch (e) {
      console.warn('Failed to save reading progress:', e)
    }
  }

  // 自动保存
  watch([currentChapterId, scrollTop], () => {
    save()
  })

  return {
    currentChapterId,
    scrollTop,
    restore,
    save,
  }
}
