import { ref, computed } from 'vue'

const STORAGE_KEY = 'reader_settings'

const FONT_SIZE_MIN = 14
const FONT_SIZE_MAX = 24
const FONT_SIZE_DEFAULT = 16
const FONT_SIZE_STEP = 2

export function useReaderSettings() {
  const fontSize = ref(FONT_SIZE_DEFAULT)
  const isDark = ref(false)

  function restore() {
    try {
      const saved = uni.getStorageSync(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        fontSize.value = data.fontSize || FONT_SIZE_DEFAULT
        isDark.value = data.isDark || false
      }
    } catch (e) {
      console.warn('Failed to restore reader settings:', e)
    }
  }

  function save() {
    try {
      uni.setStorageSync(STORAGE_KEY, JSON.stringify({
        fontSize: fontSize.value,
        isDark: isDark.value,
      }))
    } catch (e) {
      console.warn('Failed to save reader settings:', e)
    }
  }

  function increaseFontSize() {
    if (fontSize.value < FONT_SIZE_MAX) {
      fontSize.value += FONT_SIZE_STEP
      save()
    }
  }

  function decreaseFontSize() {
    if (fontSize.value > FONT_SIZE_MIN) {
      fontSize.value -= FONT_SIZE_STEP
      save()
    }
  }

  function toggleDarkMode() {
    isDark.value = !isDark.value
    save()
  }

  // mp-html 的 tag-style 属性，用于动态控制渲染样式
  const tagStyle = computed(() => {
    const bg = isDark.value ? '#1a1a1a' : '#fff'
    const color = isDark.value ? '#ccc' : '#333'
    const linkColor = isDark.value ? '#6ba3d6' : '#1a73e8'
    return {
      body: `font-size:${fontSize.value}px;color:${color};background:${bg};line-height:1.8;`,
      p: `margin:0.8em 0;text-align:justify;`,
      h2: `font-size:${fontSize.value + 6}px;color:${isDark.value ? '#eee' : '#111'};margin:1.2em 0 0.6em;`,
      h3: `font-size:${fontSize.value + 4}px;color:${isDark.value ? '#ddd' : '#222'};margin:1em 0 0.5em;`,
      h4: `font-size:${fontSize.value + 2}px;color:${isDark.value ? '#ddd' : '#222'};margin:0.8em 0 0.4em;`,
      img: `max-width:100%;height:auto;border-radius:4px;${isDark.value ? 'opacity:0.85;' : ''}`,
      table: `border-collapse:collapse;margin:1em 0;width:100%;`,
      td: `padding:4px 8px;border:1px solid ${isDark.value ? '#444' : '#ddd'};`,
      a: `color:${linkColor};text-decoration:none;`,
    }
  })

  return {
    fontSize,
    isDark,
    tagStyle,
    restore,
    save,
    increaseFontSize,
    decreaseFontSize,
    toggleDarkMode,
    FONT_SIZE_MIN,
    FONT_SIZE_MAX,
  }
}
