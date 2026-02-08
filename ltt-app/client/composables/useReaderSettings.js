const STORAGE_KEY = 'reader_settings'

const FONT_SIZE_MIN = 14
const FONT_SIZE_MAX = 24
const FONT_SIZE_DEFAULT = 16
const FONT_SIZE_STEP = 2

export const readerSettingsMixin = {
  data() {
    return {
      fontSize: FONT_SIZE_DEFAULT,
      isDark: false,
    }
  },
  computed: {
    tagStyle() {
      const bg = this.isDark ? '#1a1a1a' : '#fff'
      const color = this.isDark ? '#f0f0f0' : '#333'
      const linkColor = this.isDark ? '#6ba3d6' : '#1a73e8'
      return {
        body: `font-size:${this.fontSize}px;color:${color};background:${bg};line-height:1.8;`,
        div: `font-size:${this.fontSize}px;color:${color};`,
        span: `font-size:${this.fontSize}px;color:${color};`,
        p: `font-size:${this.fontSize}px;color:${color};margin:0.8em 0;text-indent:2em;`,
        h2: `font-size:${this.fontSize + 6}px;color:${this.isDark ? '#ffffff' : '#111'};margin:1.2em 0 0.6em;`,
        h3: `font-size:${this.fontSize + 4}px;color:${this.isDark ? '#f5f5f5' : '#222'};margin:1em 0 0.5em;`,
        h4: `font-size:${this.fontSize + 2}px;color:${this.isDark ? '#f5f5f5' : '#222'};margin:0.8em 0 0.4em;`,
        img: `max-width:100%;height:auto;border-radius:4px;${this.isDark ? 'opacity:0.85;' : ''}`,
        table: `border-collapse:collapse;margin:1em 0;width:100%;`,
        td: `font-size:${this.fontSize}px;padding:4px 8px;border:1px solid ${this.isDark ? '#444' : '#ddd'};`,
        a: `font-size:${this.fontSize}px;color:${linkColor};text-decoration:none;`,
      }
    },
    FONT_SIZE_MIN() { return FONT_SIZE_MIN },
    FONT_SIZE_MAX() { return FONT_SIZE_MAX },
  },
  methods: {
    restoreSettings() {
      try {
        const saved = uni.getStorageSync(STORAGE_KEY)
        if (saved) {
          const data = JSON.parse(saved)
          this.fontSize = data.fontSize || FONT_SIZE_DEFAULT
          this.isDark = data.isDark || false
        }
      } catch (e) {
        console.warn('Failed to restore reader settings:', e)
      }
    },
    saveSettings() {
      try {
        uni.setStorageSync(STORAGE_KEY, JSON.stringify({
          fontSize: this.fontSize,
          isDark: this.isDark,
        }))
      } catch (e) {
        console.warn('Failed to save reader settings:', e)
      }
    },
    increaseFontSize() {
      if (this.fontSize < FONT_SIZE_MAX) {
        this.fontSize += FONT_SIZE_STEP
        this.saveSettings()
      }
    },
    decreaseFontSize() {
      if (this.fontSize > FONT_SIZE_MIN) {
        this.fontSize -= FONT_SIZE_STEP
        this.saveSettings()
      }
    },
    toggleDarkMode() {
      this.isDark = !this.isDark
      this.saveSettings()
    },
  },
}
