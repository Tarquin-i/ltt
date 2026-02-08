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
  { id: 'preface', anchor: 'Preface', title: 'Preface', subtitle: '', description: '' },
  { id: 'section-01', anchor: 'INTRODUCTION_AND_HISTORY', title: 'Section I', subtitle: 'Introduction and History', description: 'Perfumes in use from the Earliest Periods—Origin lost in the Depth of its Antiquity—Possibly derived from Religious Observances—Use of perfumes by the Greeks and Romans—Scriptural Authority for the use of Perfume—The Art of Perfumery of little Distinction in England—The South of France the principal Seat of the Art—Odor of Plants owing to a peculiar Principle known as Essential Oil or Otto' },
  { id: 'section-02', anchor: 'SECTION_II', title: 'Section II', subtitle: 'Expression, Distillation, Maceration, Absorption', description: 'Consumption of Perfumery—Methods of obtaining the Odors: Expression, Distillation, Maceration, Absorption' },
  { id: 'section-03', anchor: 'SECTION_III', title: 'Section III', subtitle: 'Simple Extracts', description: 'Steam-Still—Macerating Pan—Ottos exhibited at the Crystal Palace of 1851—Simple Extracts: Allspice, Almond, Anise, Balm, Balsams, Bergamot, Benzoin, Cassia, Cassie, Cedar, Cinnamon, Clove, Geranium, Heliotrope, Jasmine, Jonquil, Lavender, Lilac, Magnolia, Mignonette, Myrtle, Neroli, Orange, Orris, Patchouly, Rose, Rosemary, Santal, Thyme, Tonquin, Tuberose, Vanilla, Verbena, Violet, and more' },
  { id: 'section-04', anchor: 'SECTION_IV', title: 'Section IV', subtitle: 'Animal Perfumes', description: 'Ambergris—Civet—Musk' },
  { id: 'section-05', anchor: 'SECTION_V', title: 'Section V', subtitle: 'Smelling Salts and Acetic Acid', description: 'Smelling Salts: Ammonia, Preston Salts, Inexhaustible Salts, Eau de Luce, Sal Volatile—Acetic Acid and its Use in Perfumery: Aromatic Vinegar, Four Thieves\' Vinegar, Toilet Vinegar, Vinaigre de Cologne' },
  { id: 'section-06', anchor: 'SECTION_VI', title: 'Section VI', subtitle: 'Bouquets and Nosegays', description: 'Proposed Use of the Term "Otto"—Compound Odors: Alhambra Perfume, Bosphorus Bouquet, Buckingham Palace Bouquet, Eau de Chypre, Ess Bouquet, Eau de Cologne, Jockey Club, Millefleurs, Rondeletia, and more' },
  { id: 'section-07', anchor: 'SECTION_VII', title: 'Section VII', subtitle: 'Sachets, Pastils and Fumigation', description: 'Sachet Powders—Pot Pourri—Olla Podrida—Perfumed Leather—Peau d\'Espagne—Perfumed Letter Paper—Pastils—The Censer—Incense for Altar Service—Fumigation—The Perfume Lamp—Fumigating Paper—Odoriferous Lighters' },
  { id: 'section-08', anchor: 'SECTION_VIII', title: 'Section VIII', subtitle: 'Perfumed Soap', description: 'Ancient Origin of Soap—Remelting—Primary Soaps—Scented Soaps: Almond, Camphor, Honey, Windsor, Otto of Rose, Patchouly, Transparent Soap—Medicated Soaps: Juniper Tar, Iodine, Sulphur, Creosote' },
  { id: 'section-09', anchor: 'SECTION_IX', title: 'Section IX', subtitle: 'Emulsines', description: 'Form Emulsions or Milks when mixed with Water—Amandine—Olivine—Honey and Almond Paste—Jasmine Emulsion—Violet Emulsion' },
  { id: 'section-10', anchor: 'SECTION_X', title: 'Section X', subtitle: 'Milks or Emulsions', description: 'Liebig\'s notice of Almond Milk—Milk of Roses—Milk of Almonds—Milk of Elder—Milk of Cucumber—Lait Virginal—Extract of Elder Flowers' },
  { id: 'section-11', anchor: 'SECTION_XI', title: 'Section XI', subtitle: 'Cold Cream', description: 'Manipulation—Cold Cream of Almonds—Violet Cold Cream—Camphor Cold Cream—Cucumber Cold Cream—Pomade Divine—Almond Balls—Camphor Balls—Glycerine Balsam—Rose Lip Salve' },
  { id: 'section-12', anchor: 'SECTION_XII', title: 'Section XII', subtitle: 'Pomades and Oils', description: 'Pomatum originally made with Apples—Enfleurage and Maceration process—Cassie Pomade—Benzoin Pomade—Bear\'s Grease—Circassian Cream—Crystallized Oils—Marrow Cream—Philocome—Hard or Stick Pomatums' },
  { id: 'section-13', anchor: 'SECTION_XIII', title: 'Section XIII', subtitle: 'Hair Dyes and Depilatories', description: 'Painting the Face universal among the Women of Egypt—Kohhl—Turkish Hair Dye—Silver Dye—Hair Dyes with Mordant—Brown and Black Hair Dye—Depilatory, Rusma' },
  { id: 'section-14', anchor: 'SECTION_XIV', title: 'Section XIV', subtitle: 'Absorbent Powders', description: 'Violet Powder—Rose Face Powder—Perle Powder—Liquid Blanc for Theatrical Use—Calcined Talc—Rouge and Red Paints—Bloom of Roses—Carmine Toilet Rouge' },
  { id: 'section-15', anchor: 'SECTION_XV', title: 'Section XV', subtitle: 'Tooth Powders and Mouth Washes', description: 'Mialhi\'s Tooth Powder—Camphorated Chalk—Quinine Tooth Powder—Prepared Charcoal—Borax and Myrrh—Rose Tooth Powder—Violet Mouth Wash—Eau Botot—Tincture of Myrrh' },
  { id: 'section-16', anchor: 'SECTION_XVI', title: 'Section XVI', subtitle: 'Hair Washes', description: 'Rosemary Hair Wash—Athenian Water—Vegetable or Botanic Hair Wash—Astringent Extract of Roses and Rosemary—Saponaceous Wash—Egg Julep—Bandolines' },
  { id: 'appendix', anchor: 'APPENDIX', title: 'Appendix', subtitle: '', description: '' },
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
  // 移除残留的 Page_XX id 属性（在其他标签上）
  html = html.replace(/ id="Page_\d+"/g, '')
  // 移除脚注锚点 id（FNanchor_XX, Footnote_XX 等）
  html = html.replace(/ id="FN[^"]*"/g, '')
  html = html.replace(/ id="Footnote_[^"]*"/g, '')
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

  return { chapterHtmls, $ }
}

function writeChapterFiles(chapterHtmls) {
  ensureDir(CHAPTERS_DIR)

  CHAPTER_DEFS.forEach(def => {
    const html = chapterHtmls[def.id]
    if (!html) return

    const content = `export default ${JSON.stringify(html)}\n`
    const filePath = path.join(CHAPTERS_DIR, `${def.id}.js`)
    fs.writeFileSync(filePath, content)
    console.log(`Written: data/chapters/${def.id}.js (${html.length} chars)`)
  })
}

function extractAppendixSubChapters($) {
  const subChapters = []
  const appendixH2 = $('body').find('h2 a#APPENDIX').parent()
  let current = appendixH2.next()
  while (current.length > 0) {
    if (current.is('h3')) {
      const anchor = current.find('a').attr('id')
      const title = current.text().trim().replace(/\s+/g, ' ')
      if (anchor && title && title !== 'FOOTNOTES:') {
        subChapters.push({ title, anchor })
      }
    }
    // 停止条件
    const tagName = current.prop('tagName')
    if (tagName && ['PRE', 'SECTION', 'STYLE', 'SCRIPT'].includes(tagName.toUpperCase())) break
    if (current.is('h2')) break
    current = current.next()
  }
  return subChapters
}

function writeBookMeta($) {
  ensureDir(DATA_DIR)

  const appendixSubChapters = extractAppendixSubChapters($)

  const chapters = CHAPTER_DEFS.map(d => {
    const chapter = {
      id: d.id,
      title: d.title,
      subtitle: d.subtitle,
      description: d.description,
    }
    if (d.id === 'appendix' && appendixSubChapters.length > 0) {
      chapter.subChapters = appendixSubChapters
    }
    return chapter
  })

  const meta = {
    title: 'The Art of Perfumery',
    subtitle: 'And Methods of Obtaining the Odors of Plants',
    author: 'G.W. Septimus Piesse',
    chapters,
  }

  const content = `export const bookMeta = ${JSON.stringify(meta, null, 2)}\n`
  fs.writeFileSync(path.join(DATA_DIR, 'bookMeta.js'), content)
  console.log(`Written: data/bookMeta.js (${chapters.length} chapters, ${appendixSubChapters.length} appendix sub-chapters)`)
}

// 主流程
function main() {
  console.log('=== Parsing The Art of Perfumery ===\n')

  // 1. 复制图片
  copyImages()

  // 2. 解析 HTML 并拆分章节
  const { chapterHtmls, $ } = parseBook()

  // 3. 写入章节文件
  writeChapterFiles(chapterHtmls)

  // 4. 写入元数据（需要 $ 来提取附录子章节锚点）
  writeBookMeta($)

  console.log('\n=== Done! ===')
}

main()
