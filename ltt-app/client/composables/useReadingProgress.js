const STORAGE_KEY = 'reading_progress'

export const readingProgressMixin = {
  data() {
    return {
      currentChapterId: '',
      scrollTop: 0,
    }
  },
  watch: {
    currentChapterId() {
      this.saveProgress()
    },
    scrollTop() {
      this.saveProgress()
    },
  },
  methods: {
    restoreProgress() {
      try {
        const saved = uni.getStorageSync(STORAGE_KEY)
        if (saved) {
          const data = JSON.parse(saved)
          this.currentChapterId = data.chapterId || ''
          this.scrollTop = data.scrollTop || 0
        }
      } catch (e) {
        console.warn('Failed to restore reading progress:', e)
      }
    },
    saveProgress() {
      try {
        uni.setStorageSync(STORAGE_KEY, JSON.stringify({
          chapterId: this.currentChapterId,
          scrollTop: this.scrollTop,
        }))
      } catch (e) {
        console.warn('Failed to save reading progress:', e)
      }
    },
  },
}
