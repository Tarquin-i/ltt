/**
 * embedImages.js - 将章节文件中的图片路径替换为 base64 data URI
 *
 * 用法: node scripts/embedImages.js
 *
 * 读取 data/chapters/*.ts，将 src="/static/images/book/xxx.png"
 * 替换为 src="data:image/png;base64,..." 内联图片。
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const CHAPTERS_DIR = path.join(ROOT, 'data', 'chapters')
const IMAGES_DIR = path.join(ROOT, 'assets', 'images', 'book')

function main() {
  const files = fs.readdirSync(CHAPTERS_DIR).filter(f => f.endsWith('.ts'))
  let totalReplaced = 0

  for (const file of files) {
    const filePath = path.join(CHAPTERS_DIR, file)
    let content = fs.readFileSync(filePath, 'utf-8')

    // 在文件原始文本中，图片路径格式为:
    //   src=\"/static/images/book/imageXXX.png\"
    // 其中 \" 是 JSON 转义的双引号（反斜杠 + 引号）
    let count = 0
    const updated = content.replace(
      /src=\\"\/static\/images\/book\/([^"\\]+)\\"/g,
      (match, imageName) => {
        const imgPath = path.join(IMAGES_DIR, imageName)
        if (!fs.existsSync(imgPath)) {
          console.warn(`  Warning: ${imageName} not found, skipping`)
          return match
        }
        const ext = path.extname(imageName).slice(1)
        const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`
        const base64 = fs.readFileSync(imgPath).toString('base64')
        count++
        return `src=\\"data:${mime};base64,${base64}\\"`
      }
    )

    if (count > 0) {
      fs.writeFileSync(filePath, updated)
      console.log(`${file}: replaced ${count} image(s)`)
      totalReplaced += count
    }
  }

  console.log(`\nDone! Total: ${totalReplaced} image(s) embedded in ${files.length} chapter files.`)
}

main()
