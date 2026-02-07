const chapterModules = {
  'preface': () => import('./chapters/preface.js'),
  'section-01': () => import('./chapters/section-01.js'),
  'section-02': () => import('./chapters/section-02.js'),
  'section-03': () => import('./chapters/section-03.js'),
  'section-04': () => import('./chapters/section-04.js'),
  'section-05': () => import('./chapters/section-05.js'),
  'section-06': () => import('./chapters/section-06.js'),
  'section-07': () => import('./chapters/section-07.js'),
  'section-08': () => import('./chapters/section-08.js'),
  'section-09': () => import('./chapters/section-09.js'),
  'section-10': () => import('./chapters/section-10.js'),
  'section-11': () => import('./chapters/section-11.js'),
  'section-12': () => import('./chapters/section-12.js'),
  'section-13': () => import('./chapters/section-13.js'),
  'section-14': () => import('./chapters/section-14.js'),
  'section-15': () => import('./chapters/section-15.js'),
  'section-16': () => import('./chapters/section-16.js'),
  'appendix': () => import('./chapters/appendix.js'),
}

export async function loadChapter(chapterId) {
  const loader = chapterModules[chapterId]
  if (!loader) return ''
  const mod = await loader()
  return mod.default
}
