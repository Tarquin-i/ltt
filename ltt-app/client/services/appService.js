// 后端服务地址（开发环境使用本地，生产环境需要修改）
const BASE_URL = 'http://localhost:3000'

export function activate(code) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}/api/activate`,
      method: 'POST',
      data: { code },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error('请求失败'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}
