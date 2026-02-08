import preface from './chapters/preface.js'
import section01 from './chapters/section-01.js'
import section02 from './chapters/section-02.js'
import section03 from './chapters/section-03.js'
import section04 from './chapters/section-04.js'
import section05 from './chapters/section-05.js'
import section06 from './chapters/section-06.js'
import section07 from './chapters/section-07.js'
import section08 from './chapters/section-08.js'
import section09 from './chapters/section-09.js'
import section10 from './chapters/section-10.js'
import section11 from './chapters/section-11.js'
import section12 from './chapters/section-12.js'
import section13 from './chapters/section-13.js'
import section14 from './chapters/section-14.js'
import section15 from './chapters/section-15.js'
import section16 from './chapters/section-16.js'
import appendix from './chapters/appendix.js'

const chapterModules = {
  'preface': preface,
  'section-01': section01,
  'section-02': section02,
  'section-03': section03,
  'section-04': section04,
  'section-05': section05,
  'section-06': section06,
  'section-07': section07,
  'section-08': section08,
  'section-09': section09,
  'section-10': section10,
  'section-11': section11,
  'section-12': section12,
  'section-13': section13,
  'section-14': section14,
  'section-15': section15,
  'section-16': section16,
  'appendix': appendix,
}

function processChapterHtml(html) {
  let processed = html
  // #ifdef APP-PLUS
  // App 端 /static/ 根路径无法直接访问，转为 file:// 本地路径
  try {
    const wwwPath = plus.io.convertLocalFileSystemURL('_www/')
    const basePath = wwwPath.startsWith('file://') ? wwwPath : ('file://' + wwwPath)
    processed = processed.replace(
      /src="\/static\//g,
      `src="${basePath}static/`
    )
  } catch (e) {
    console.warn('Failed to convert image paths:', e)
  }
  // #endif
  return processed
}

export function loadChapter(chapterId) {
  const raw = chapterModules[chapterId] || ''
  if (!raw) return ''
  return processChapterHtml(raw)
}
