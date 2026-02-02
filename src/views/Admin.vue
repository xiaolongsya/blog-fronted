<template>
  <!-- 管理员页面容器 -->
  <div class="admin-page">
    <!-- 顶部标题 -->
    <section class="admin-header">
      <h1 class="admin-title">龙岛的后台</h1>
    </section>

    <!-- 主体圆圈按钮区域 -->
    <section class="admin-main-content">
      <div 
        class="circle-item" 
        v-for="(item, idx) in circleList" 
        :key="idx"  
        @click.prevent="handleCircleClick(item)"
      >
        <div class="circle-bg">
          <span class="circle-text">{{ item.content }}</span>
        </div>
      </div>
    </section>

    <!-- 更新龙岛日志弹窗 -->
    <div class="modal-mask" v-if="showLogModal" @click="closeLogModal">
      <div class="modal-container" @click.stop>
        <div class="modal-title">更新龙岛日志</div>
        
        <!-- 内容输入 -->
        <div class="modal-form-item">
          <label>日志内容：</label>
          <textarea 
            v-model="logForm.content" 
            placeholder="请输入日志内容（必填）"
            class="modal-textarea"
            rows="5"
          ></textarea>
        </div>

        <!-- 图片上传 -->
        <div class="modal-form-item">
          <label>上传图片：</label>
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/gif"
            @change="handleImageUpload"
            class="modal-file-input"
          />
          <!-- 已上传图片预览 -->
          <div class="upload-preview" v-if="logForm.imgUrls.length > 0">
            <div v-for="(url, idx) in logForm.imgUrls" :key="idx" class="preview-item">
              <img :src="url" alt="预览图" class="preview-img" @error="handleImgError(idx)" />
              <button @click="removeImage(idx)" class="remove-img-btn">×</button>
            </div>
          </div>
          <p class="upload-tip" v-if="logForm.imgUrls.length === 0">暂未上传图片，支持JPG/PNG/GIF格式</p>
        </div>

        <!-- 提交/关闭按钮 -->
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn" 
            @click="submitLog"
            :disabled="!logForm.content.trim() || isSubmitting"
          >
            <span v-if="isSubmitting" class="loading-icon">🔄</span>
            {{ isSubmitting ? '提交中...' : '提交日志' }}
          </button>
          <button class="modal-close-btn" @click="closeLogModal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

// 圆圈按钮列表
const circleList = [
  { content: "更新龙岛日志", type: "log" },
  { content: "龙的成长记录", type: "growth" },
  { content: "暂无", type: "none" },
  { content: "暂无", type: "none" },
  { content: "暂无", type: "none" }
];

// 日志弹窗相关
const showLogModal = ref(false)
const logForm = ref({
  content: '',
  imgUrls: [] // 存储图片URL的纯字符串数组
})
const isSubmitting = ref(false)

/**
 * 处理圆圈按钮点击
 */
const handleCircleClick = (item) => {
  if (item.type === "log") {
    showLogModal.value = true
  } else if (item.type === "growth") {
    alert("龙的成长记录功能待开发～")
  }
}

/**
 * 关闭日志弹窗并重置表单
 */
const closeLogModal = () => {
  showLogModal.value = false
  // 重置表单数据
  logForm.value = {
    content: '',
    imgUrls: []
  }
  isSubmitting.value = false
}

/**
 * 处理图片上传
 * @param {Event} e - 文件选择事件
 */
const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    alert('请上传合法的图片格式（JPG/PNG/GIF）')
    return
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await axios.post(
      'https://xiaolongya.cn/blog/upload/image',
      formData,
      {
        // 注意：后端返回的是JSON格式（包含code、msg、data），不是纯文本，所以要去掉responseType: 'text'
        // （这是之前的关键错误！后端返回的是JSON对象，不是纯字符串）
        // responseType: 'text',
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          console.log(`图片上传进度：${progress}%`)
        }
      }
    )

    // ---------------------- 修正：直接取后端返回的data字段（完整URL） ----------------------
    // 后端返回的是JSON对象：{ "code": 200, "msg": "成功", "data": "http://xxx/xxx.png" }
    const validImgUrl = res.data.data.trim() // 从data中提取URL
    // ---------------------- 结束修正 ----------------------

    if (validImgUrl && validImgUrl.startsWith('http')) {
      logForm.value.imgUrls.push(validImgUrl)
      alert('图片上传成功！')
    } else {
      throw new Error('返回的URL格式不合法，未包含http协议')
    }

    e.target.value = ''
  } catch (err) {
    console.error('图片上传失败：', err)
    const errorMsg = err.response?.data?.msg || err.message || '未知上传错误'
    alert(`图片上传失败：${errorMsg}`)
  }
}

/**
 * 移除已上传的图片
 * @param {Number} idx - 图片在数组中的索引
 */
const removeImage = (idx) => {
  if (idx >= 0 && idx < logForm.value.imgUrls.length) {
    logForm.value.imgUrls.splice(idx, 1)
  }
}

/**
 * 处理图片预览加载失败
 * @param {Number} idx - 图片在数组中的索引
 */
const handleImgError = (idx) => {
  console.warn(`第${idx+1}张图片预览失败，已自动移除`)
  removeImage(idx)
  alert(`第${idx+1}张图片无效，已自动移除`)
}

/**
 * 提交日志到后端
 */
const submitLog = async () => {
  // 1. 前置校验
  const content = logForm.value.content.trim()
  if (!content) {
    alert('日志内容不能为空，请填写后提交！')
    return
  }

  // 2. 处理图片URL数组，确保是纯字符串数组（兜底过滤）
  const validImgUrls = logForm.value.imgUrls
    .filter(url => {
      const pureUrl = (url || '').trim()
      return pureUrl && pureUrl.startsWith('http')
    })
    .map(url => url.trim())

  // 3. 开始提交
  isSubmitting.value = true
  try {
    const response = await axios.post(
      'https://xiaolongya.cn/blog/development/upload',
      {
        content: content,
        imgUrls: validImgUrls
      },
      {
        // 自动设置正确的Content-Type，无需手动配置
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    // 4. 提交成功处理
    console.log('日志提交成功：', response.data)
    alert('龙岛日志更新成功！')
    closeLogModal()
  } catch (err) {
    // 5. 提交失败处理
    console.error('日志提交失败：', err)
    const errorDetail = err.response?.data || '后端服务暂不可用'
    alert(`日志提交失败：${JSON.stringify(errorDetail).substring(0, 200)}`)
  } finally {
    // 6. 无论成败，结束提交状态
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* 页面容器 */
.admin-page {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 0;
  font-family: "Microsoft YaHei", "楷体", sans-serif;
}

/* 顶部标题 */
.admin-header {
  text-align: center;
  margin-bottom: 60px;
}
.admin-title {
  font-size: 60px;
  font-weight: 900;
  color: #2f5496;
  font-family: "Ma Shan Zheng", "楷体", "STKaiti", cursive;
  letter-spacing: 10px;
  margin: 0;
}

/* 主体圆圈区域 */
.admin-main-content {
  width: 100%;
  background-color: #b3d8ff;
  border-radius: 80px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 60px 20px;
  box-sizing: border-box;
  flex-wrap: wrap; /* 适配小屏幕自动换行 */
  gap: 40px;
  margin-bottom: 40px;
}

/* 圆圈按钮样式 */
.circle-item {
  width: 180px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.circle-bg {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  border: 2px solid #2f5496;
  padding: 10px;
  box-sizing: border-box;
}
.circle-bg:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  background-color: #f8fbff;
}
.circle-text {
  font-size: 24px;
  font-weight: 700;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  text-align: center;
  white-space: pre-line;
  line-height: 1.5;
}

/* 弹窗遮罩 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

/* 弹窗容器 */
.modal-container {
  width: 500px;
  max-width: 90vw;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-sizing: border-box;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-family: "Microsoft YaHei", "楷体", serif;
}

/* 弹窗标题 */
.modal-title {
  font-size: 24px;
  color: #2f5496;
  text-align: center;
  margin-bottom: 25px;
  font-weight: 700;
  padding-bottom: 15px;
  border-bottom: 1px solid #e8e8e8;
}

/* 表单项 */
.modal-form-item {
  margin-bottom: 25px;
}
.modal-form-item label {
  display: block;
  font-size: 18px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 500;
}

/* 文本域 */
.modal-textarea {
  width: 100%;
  height: auto;
  padding: 12px 15px;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  font-size: 16px;
  font-family: "Microsoft YaHei", "楷体", serif;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}
.modal-textarea:focus {
  border-color: #2f5496;
  box-shadow: 0 0 0 2px rgba(47, 84, 150, 0.1);
}

/* 文件输入 */
.modal-file-input {
  font-size: 16px;
  font-family: "Microsoft YaHei", "楷体", serif;
  padding: 8px 0;
  color: #666;
}

/* 上传提示 */
.upload-tip {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
  margin-bottom: 0;
}

/* 图片预览 */
.upload-preview {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
.remove-img-btn {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background-color: #ff4d4f;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s ease;
}
.remove-img-btn:hover {
  background-color: #ff7875;
}

/* 按钮组 */
.modal-btn-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}
.modal-submit-btn {
  padding: 10px 30px;
  background-color: #2f5496;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}
.modal-submit-btn:disabled {
  background-color: #b3d8ff;
  cursor: not-allowed;
  transform: none;
}
.modal-submit-btn:not(:disabled):hover {
  background-color: #3a66b8;
}
.modal-close-btn {
  padding: 10px 30px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.modal-close-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.modal-close-btn:not(:disabled):hover {
  background-color: #f0f0f0;
  border-color: #ccc;
}

/* 加载图标 */
.loading-icon {
  animation: rotate 1.5s linear infinite;
}
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .admin-title {
    font-size: 36px;
  }
  .admin-main-content {
    border-radius: 40px;
    padding: 30px 10px;
    gap: 20px;
  }
  .circle-item {
    width: 120px;
    height: 120px;
  }
  .circle-bg {
    width: 120px;
    height: 120px;
  }
  .circle-text {
    font-size: 18px;
  }
  .modal-container {
    padding: 20px;
  }
  .modal-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  .modal-btn-group {
    gap: 15px;
  }
  .modal-submit-btn, .modal-close-btn {
    padding: 8px 20px;
    font-size: 16px;
  }
}
</style>