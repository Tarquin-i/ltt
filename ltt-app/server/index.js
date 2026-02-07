require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { Pool } = require('pg')

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// 判断是页码还是张码
function isPageCode(code) {
  return /^13v\d{6}$/.test(code)
}

// 激活接口
app.post('/api/activate', async (req, res) => {
  const { code } = req.body
  if (!code) {
    return res.json({ success: false, message: '缺少 code 参数' })
  }

  try {
    let result
    let type

    if (isPageCode(code)) {
      // 页码：激活该页所有未激活的记录
      type = 'page'
      result = await pool.query(
        'UPDATE xinma_code_inf SET is_active = true WHERE page_code = $1 AND is_active IS NOT TRUE',
        [code]
      )
    } else {
      // 张码：激活所有相关记录
      type = 'sheet'
      result = await pool.query(
        'UPDATE xinma_code_inf SET is_active = true WHERE code = $1 AND is_active IS NOT TRUE',
        [code]
      )
    }

    if (result.rowCount === 0) {
      // 查询码是否存在
      const checkSql = isPageCode(code)
        ? 'SELECT 1 FROM xinma_code_inf WHERE page_code = $1 LIMIT 1'
        : 'SELECT 1 FROM xinma_code_inf WHERE code = $1 LIMIT 1'
      const checkResult = await pool.query(checkSql, [code])

      if (checkResult.rowCount === 0) {
        return res.json({ success: false, message: '该码不存在' })
      }
      return res.json({ success: false, message: '该码已激活，无需重复操作' })
    }

    res.json({
      success: true,
      type,
      affected: result.rowCount
    })
  } catch (err) {
    console.error('激活失败:', err)
    res.json({ success: false, message: '数据库操作失败' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
