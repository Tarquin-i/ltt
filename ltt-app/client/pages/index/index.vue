<template>
	<view class="page">
		<view class="nav">
			<text class="title">信码产品激活系统</text>
		</view>
		<view class="content">
			<view class="scan-area">
				<view class="scan-btn" :class="{ loading: loading }" @click="startScan">
					<text v-if="!loading" class="iconfont icon-QRcode"></text>
					<text v-else class="iconfont icon-loading loading-icon"></text>
					<text class="scan-text">{{ loading ? '激活中...' : '点击扫码激活' }}</text>
				</view>
			</view>

			<!-- 手动输入测试 -->
			<view class="input-area">
				<input class="input" v-model="inputCode" placeholder="输入二维码内容" :disabled="btnLoading" />
				<button class="btn" @click="testActivate" :disabled="btnLoading">
					{{ btnLoading ? '激活中' : '激活' }}
				</button>
			</view>

			<view class="result" v-if="scanResult" :class="resultClass" :key="resultKey">
				<view class="result-item">
					<text class="label">扫描内容：</text>
					<text class="value">{{ scanResult }}</text>
				</view>
				<view class="result-item" v-if="activateResult">
					<text class="label">激活结果：</text>
					<text class="value" :class="activateResult.success ? 'success' : 'error'">
						<text v-if="activateResult.success" class="iconfont icon-success status-icon"></text>
						<text v-else class="iconfont icon-close status-icon"></text>
						{{ activateResult.success ? `成功激活 ${activateResult.affected} 条记录` : activateResult.message }}
					</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { activate } from '@/services/appService.js'

export default {
	data() {
		return {
			scanResult: '',
			codeType: '',
			activateResult: null,
			loading: false,
			btnLoading: false,
			inputCode: '',
			resultKey: 0
		}
	},
	computed: {
		resultClass() {
			if (!this.activateResult) return ''
			return this.activateResult.success ? 'success-result' : 'error-result'
		}
	},
	methods: {
		testActivate() {
			if (!this.inputCode.trim()) {
				uni.showToast({ title: '请输入二维码内容', icon: 'none' })
				return
			}
			if (this.btnLoading) return
			let code = this.inputCode.trim()
			if (code.includes('?c=')) {
				const match = code.match(/[?&]c=([^&]+)/)
				if (match) code = match[1]
			}
			this.scanResult = code
			this.codeType = this.getCodeType(code)
			this.doBtnActivate(code)
		},

		startScan() {
			if (this.loading) return
			uni.scanCode({
				scanType: ['qrCode', 'barCode'],
				autoDecodeCharset: true,
				autoZoom: true,
				success: (res) => {
					let code = res.result
					// 处理微信二维码 URL 格式
					if (code.includes('?c=')) {
						const match = code.match(/[?&]c=([^&]+)/)
						if (match) code = match[1]
					}
					this.scanResult = code
					this.codeType = this.getCodeType(code)
					this.doActivate(code)
				},
				fail: () => {
					uni.showToast({ title: '扫码失败', icon: 'none' })
				}
			})
		},

		getCodeType(code) {
			// 页码格式：13v + 6位纯数字
			return /^13v\d{6}$/.test(code) ? 'page' : 'sheet'
		},

		async doActivate(code) {
			this.loading = true
			this.activateResult = null
			this.resultKey++
			try {
				const res = await activate(code)
				this.activateResult = res
			} catch (err) {
				this.activateResult = { success: false, message: err.message || '激活失败' }
			} finally {
				this.loading = false
			}
		},

		async doBtnActivate(code) {
			this.btnLoading = true
			this.activateResult = null
			this.resultKey++
			try {
				const res = await activate(code)
				this.activateResult = res
			} catch (err) {
				this.activateResult = { success: false, message: err.message || '激活失败' }
			} finally {
				this.btnLoading = false
			}
		}
	}
}
</script>

<style lang="scss" scoped>
// 动画关键帧定义
@keyframes pulse {
	0% {
		transform: scale(1);
		box-shadow: 0 0 0 0 rgba(41, 123, 255, 0.7);
	}
	70% {
		transform: scale(1);
		box-shadow: 0 0 0 20px rgba(41, 123, 255, 0);
	}
	100% {
		transform: scale(1);
		box-shadow: 0 0 0 0 rgba(41, 123, 255, 0);
	}
}

@keyframes ripple {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	100% {
		transform: scale(1.5);
		opacity: 0;
	}
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes bounceIn {
	0% {
		opacity: 0;
		transform: scale(0.3) translateY(50px);
	}
	50% {
		transform: scale(1.05) translateY(-10px);
	}
	70% {
		transform: scale(0.95) translateY(5px);
	}
	100% {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

@keyframes shake {
	0%, 100% { transform: translateX(0); }
	10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
	20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

@keyframes successBounce {
	0% { transform: scale(0); }
	50% { transform: scale(1.2); }
	100% { transform: scale(1); }
}

@keyframes breathe {
	0%, 100% { transform: scale(1); }
	50% { transform: scale(1.05); }
}

@keyframes gradientFlow {
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
}

.title {
	font-size: 24px;
	font-weight: bold;
	background: linear-gradient(90deg, #297BFF, #5F11D7, #FF6B6B, #297BFF);
	background-size: 300% 100%;
	-webkit-background-clip: text;
	background-clip: text;
	-webkit-text-fill-color: transparent;
	animation: slideDown 0.6s ease-out, gradientFlow 4s ease infinite;
}

.scan-area {
	display: flex;
	justify-content: center;
	margin-top: 60px;
	animation: bounceIn 0.8s ease-out 0.2s both;
}

.scan-btn {
	width: 200px;
	height: 200px;
	border-radius: 50%;
	background: linear-gradient(135deg, #297BFF, #5F11D7);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: white;
	box-shadow: 0 10px 30px rgba(41, 123, 255, 0.3);
	position: relative;
	cursor: pointer;
	transition: transform 0.3s ease, box-shadow 0.3s ease;
	animation: pulse 2s infinite;

	&::before {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: rgba(41, 123, 255, 0.3);
		animation: ripple 2s infinite;
	}

	&:hover {
		transform: translateY(-5px) scale(1.02);
		box-shadow: 0 15px 40px rgba(41, 123, 255, 0.4);
	}

	&:active {
		transform: translateY(0) scale(0.95);
		box-shadow: 0 5px 20px rgba(41, 123, 255, 0.3);
	}

	&.loading {
		animation: breathe 1.5s ease-in-out infinite;
		pointer-events: none;
		opacity: 0.8;

		&::before {
			animation: none;
		}
	}

	.iconfont {
		font-size: 60px;
		margin-bottom: 10px;
		transition: transform 0.3s ease;
	}

	.loading-icon {
		font-size: 60px;
		margin-bottom: 10px;
		animation: spin 1s linear infinite;
	}

	.scan-text {
		font-size: 16px;
	}
}

.result {
	margin-top: 20px;
	padding: 20px;
	background: white;
	border-radius: 10px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
	animation: fadeInUp 0.5s ease-out;

	&.success-result {
		border-left: 4px solid #37CF76;
	}

	&.error-result {
		border-left: 4px solid #FF5238;
		animation: fadeInUp 0.5s ease-out, shake 0.5s ease-out 0.5s;
	}

	.result-item {
		display: flex;
		padding: 10px 0;
		border-bottom: 1px solid #f0f0f0;

		&:last-child {
			border-bottom: none;
		}

		.label {
			color: #999;
			width: 80px;
		}

		.value {
			flex: 1;
			word-break: break-all;
			display: flex;
			align-items: center;
			gap: 8px;

			&.success {
				color: #37CF76;

				.status-icon {
					animation: successBounce 0.5s ease-out;
				}
			}

			&.error {
				color: #FF5238;
			}
		}
	}
}

.input-area {
	margin-top: 60px;
	display: flex;
	gap: 10px;
	animation: fadeInUp 0.6s ease-out 0.4s both;

	.input {
		flex: 1;
		height: 44px;
		padding: 0 16px;
		border: 2px solid transparent;
		border-radius: 12px;
		font-size: 14px;
		background: linear-gradient(#fff, #fff) padding-box,
					linear-gradient(135deg, #297BFF, #5F11D7) border-box;
		transition: all 0.3s ease;

		&:focus {
			box-shadow: 0 4px 20px rgba(41, 123, 255, 0.25);
			transform: translateY(-2px);
			outline: none;
		}

		&::placeholder {
			color: #aaa;
		}
	}

	.btn {
		width: 100px;
		height: 44px;
		background: linear-gradient(135deg, #297BFF, #5F11D7);
		background-size: 200% 200%;
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.2s ease, box-shadow 0.2s ease, background-position 0.5s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 5px 15px rgba(41, 123, 255, 0.3);
			background-position: 100% 0;
		}

		&:active {
			transform: translateY(0) scale(0.98);
		}

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
			transform: none;
		}
	}
}
</style>
