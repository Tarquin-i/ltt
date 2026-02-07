class ApiService {
	constructor(baseURL) {
		this.baseURL = baseURL || 'https://vitahou-backend-uwcyfvmjoh.cn-shenzhen.fcapp.run'; // 你的API基础URL
		this.timeout = 600000; // 请求超时时间
	}

	// 获取 token 的方法，你可以根据实际情况修改
	getToken() {
		return uni.getStorageSync('token');
	}

	// 请求方法的通用配置
	request(options) {
		return new Promise((resolve, reject) => {
			uni.showLoading({
				title: "处理中..."
			})
			const token = options.requireAuth !== false ? this.getToken() : null;
			console.log(this.baseURL + options.url)
			uni.request({
				url: this.baseURL + options.url,
				method: options.method || 'POST',
				data: options.data || {},
				header: {
					'Authorization': token ? `${token}` : '',
					...options.header
				},
				timeout: this.timeout,
				success: (response) => {
					console.log(response)
					uni.hideLoading()
					if (response.statusCode === 200) {
						switch (response.data.code) {
							case 1:
								resolve(response.data);
								break;
							case -1:
								uni.removeStorageSync('token');
								reject('Token expired');
								break;
							default:
								reject(response.data.msg);
								break;
						}
					} else {
						reject('请求失败');
					}
				},
				fail: (error) => {
					uni.hideLoading()
					console.log(error)
					reject(error);
				}
			});
		});
	}

	// 新增方法：下载文件
	downloadFile(url, fileName, requireAuth = true) {
		return new Promise((resolve, reject) => {
			const token = requireAuth ? this.getToken() : null;

			uni.downloadFile({
				url: this.baseURL + url,
				header: {
					'Authorization': token ? `${token}` : ''
				},
				success: (res) => {
					if (res.statusCode === 200) {
						uni.saveFile({
							tempFilePath: res.tempFilePath,
							success: (result) => {
								resolve(result.savedFilePath);
							},
							fail: (error) => {
								reject(error);
							}
						});
					} else {
						reject('File download failed');
					}
				},
				fail: (error) => {
					reject(error);
				}
			});
		});
	}

	// API 调用方法
	get(url, params, requireAuth = true) {
		return this.request({
			url: url,
			method: 'GET',
			data: params,
			requireAuth: requireAuth
		});
	}

	post(url, data, requireAuth = true) {
		return this.request({
			url: url,
			method: 'POST',
			data: data,
			requireAuth: requireAuth
		});
	}

	// 其他 HTTP 方法，如 put, delete 等可以按需添加
}

export default ApiService;