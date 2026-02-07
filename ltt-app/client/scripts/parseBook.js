/**
 * parseBook.js - 从原始 HTML 中提取电子书章节内容
 *
 * 用法: node scripts/parseBook.js
 * 依赖: cheerio (npm install cheerio)
 */
const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

const CLIENT_DIR = path.resolve(__dirname, '..')
const HTML_PATH = path.join(CLIENT_DIR, '.doc', 'The Project Gutenberg eBook of The Art of Perfumery, by G.W. Septimus Piesse..html')
const IMAGES_SRC = path.join(CLIENT_DIR, '.doc', 'The Project Gutenberg eBook of The Art of Perfumery, by G.W. Septimus Piesse._files')
const IMAGES_DEST = path.join(CLIENT_DIR, 'static', 'images', 'book')
const CHAPTERS_DIR = path.join(CLIENT_DIR, 'data', 'chapters')
const DATA_DIR = path.join(CLIENT_DIR, 'data')

// 章节定义：anchor ID → 元数据
const CHAPTER_DEFS = [
  { id: 'preface', anchor: 'Preface', title: 'Preface', subtitle: '' },
  { id: 'section-01', anchor: 'INTRODUCTION_AND_HISTORY', title: 'Section I', subtitle: 'Introduction and History' },
  { id: 'section-02', anchor: 'SECTION_II', title: 'Section II', subtitle: 'Methods of Obtaining Odors' },
  { id: 'section-03', anchor: 'SECTION_III', title: 'Section III', subtitle: 'Simple Extracts' },
  { id: 'section-04', anchor: 'SECTION_IV', title: 'Section IV', subtitle: 'Animal Perfumes' },
  { id: 'section-05', anchor: 'SECTION_V', title: 'Section V', subtitle: 'Smelling Salts' },
  { id: 'section-06', anchor: 'SECTION_VI', title: 'Section VI', subtitle: 'Bouquets and Nosegays' },
  { id: 'section-07', anchor: 'SECTION_VII', title: 'Section VII', subtitle: 'Sachet Powders' },
  { id: 'section-08', anchor: 'SECTION_VIII', title: 'Section VIII', subtitle: 'Perfumed Soap' },
  { id: 'section-09', anchor: 'SECTION_IX', title: 'Section IX', subtitle: 'Emulsines' },
  { id: 'section-10', anchor: 'SECTION_X', title: 'Section X', subtitle: 'Milks or Emulsions' },
  { id: 'section-11', anchor: 'SECTION_XI', title: 'Section XI', subtitle: 'Cold Cream' },
  { id: 'section-12', anchor: 'SECTION_XII', title: 'Section XII', subtitle: 'Pomades and Oils' },
  { id: 'section-13', anchor: 'SECTION_XIII', title: 'Section XIII', subtitle: 'Hair Dyes and Depilatories' },
  { id: 'section-14', anchor: 'SECTION_XIV', title: 'Section XIV', subtitle: 'Absorbent Powders' },
  { id: 'section-15', anchor: 'SECTION_XV', title: 'Section XV', subtitle: 'Tooth Powders and Mouth Washes' },
  { id: 'section-16', anchor: 'SECTION_XVI', title: 'Section XVI', subtitle: 'Hair Washes' },
  { id: 'appendix', anchor: 'APPENDIX', title: 'Appendix', subtitle: '' },
]

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function copyImages() {
  ensureDir(IMAGES_DEST)
  const files = fs.readdirSync(IMAGES_SRC)
  files.forEach(file => {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
      fs.copyFileSync(path.join(IMAGES_SRC, file), path.join(IMAGES_DEST, file))
    }
  })
  console.log(`Copied ${files.length} images to static/images/book/`)
}

function cleanHtml(html) {
  // 修复图片路径：相对路径 → /static/images/book/
  html = html.replace(
    /src="\.\/[^"]*_files\/(image[^"]+)"/g,
    'src="/static/images/book/$1"'
  )
  // 移除 pagenum span
  html = html.replace(/<span class="pagenum"[^>]*>.*?<\/span>/g, '')
  // 移除空的 page anchor: <p><a id="Page_XX"></a></p>
  html = html.replace(/<p><a id="Page_\d+"><\/a><\/p>/g, '')
  // 移除 pginternal 链接的 href（改为纯文本或内部锚点）
  html = html.replace(/href="https:\/\/www\.gutenberg\.org[^"]*#([^"]*)"/g, 'href="#$1"')
  return html.trim()
}

function parseBook() {
  console.log('Reading HTML file...')
  const rawHtml = fs.readFileSync(HTML_PATH, 'utf-8')
  const $ = cheerio.load(rawHtml)

  // 移除 Gutenberg header 和 footer
  $('#pg-header').remove()
  $('#pg-footer').remove()

  // 获取 body 内容
  const body = $('body')

  // 移除 body 开头的装饰性内容（书名页，在 Preface 之前）
  // 书名页包含 h1 "The Art", h2 "OF", h1 "PERFUMERY" 等
  // 以及 Contents 和 Illustrations 部分
  // 我们把这些作为一个 "title-page" 章节保留

  // 找到所有 h2 元素及其位置
  const h2Elements = body.find('h2')
  const chapterHtmls = {}

  // 提取书名页（从开头到 Preface 之前）
  const prefaceH2 = body.find('h2 a#Preface').parent()

  // 按章节定义提取内容
  CHAPTER_DEFS.forEach((def, index) => {
    const anchorSelector = `h2 a#${def.anchor}`
    const h2El = body.find(anchorSelector).parent()

    if (h2El.length === 0) {
      console.warn(`Warning: Chapter anchor "${def.anchor}" not found`)
      return
    }

    // 收集从当前 h2 到下一个章节 h2 之间的所有内容
    let html = ''
    let current = h2El

    // 包含当前 h2
    html += $.html(current)

    // 遍历后续兄弟节点，直到遇到下一个章节的 h2
    const nextDef = CHAPTER_DEFS[index + 1]
    const nextAnchor = nextDef ? nextDef.anchor : null

    current = h2El.next()
    while (current.length > 0) {
      // 停止条件：遇到非正文内容（浏览器插件注入、Gutenberg footer 残留等）
      const tagName = current.prop('tagName')
      if (tagName && ['PRE', 'SECTION', 'STYLE', 'SCRIPT'].includes(tagName.toUpperCase())) {
        break
      }
      // 检查是否到达下一个章节
      if (current.is('h2')) {
        const anchorInH2 = current.find('a').attr('id')
        if (anchorInH2 && CHAPTER_DEFS.some(d => d.anchor === anchorInH2)) {
          break
        }
        // 非章节 h2（如 "Contents of Appendix"），也检查文本
        const h2Text = current.text().trim()
        if (h2Text === 'THE ART OF PERFUMERY.' || h2Text === 'Contents.' || h2Text === 'Contents of Appendix.' || h2Text === 'Illustrations.') {
          break
        }
      }
      html += $.html(current)
      current = current.next()
    }

    chapterHtmls[def.id] = cleanHtml(html)
  })

  return chapterHtmls
}

function writeChapterFiles(chapterHtmls) {
  ensureDir(CHAPTERS_DIR)

  CHAPTER_DEFS.forEach(def => {
    const html = chapterHtmls[def.id]
    if (!html) return

    // 转义反引号和 ${} 模板字符串语法
    const escaped = html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
    const content = `export default \`${escaped}\`\n`
    const filePath = path.join(CHAPTERS_DIR, `${def.id}.js`)
    fs.writeFileSync(filePath, content)
    console.log(`Written: data/chapters/${def.id}.js (${html.length} chars)`)
  })
}

function writeBookMeta() {
  ensureDir(DATA_DIR)
  const meta = {
    title: 'The Art of Perfumery',
    subtitle: 'And Methods of Obtaining the Odors of Plants',
    author: 'G.W. Septimus Piesse',
    chapters: CHAPTER_DEFS.map(d => ({
      id: d.id,
      title: d.title,
      subtitle: d.subtitle,
    })),
  }

  const content = `export const bookMeta = ${JSON.stringify(meta, null, 2)}\n`
  fs.writeFileSync(path.join(DATA_DIR, 'bookMeta.js'), content)
  console.log('Written: data/bookMeta.js')
}

// 主流程
function main() {
  console.log('=== Parsing The Art of Perfumery ===\n')

  // 1. 复制图片
  copyImages()

  // 2. 解析 HTML 并拆分章节
  const chapterHtmls = parseBook()

  // 3. 写入章节文件
  writeChapterFiles(chapterHtmls)

  // 4. 写入元数据
  writeBookMeta()

  console.log('\n=== Done! ===')
}

main()
