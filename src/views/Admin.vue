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

    <!-- 1. 龙的成长记录主弹窗 -->
    <div class="modal-mask" v-if="showGrowthMainModal" @click="closeGrowthMainModal">
      <div class="modal-container" @click.stop>
        <div class="modal-title">龙的成长记录</div>
        <div class="growth-btn-group">
          <button class="growth-sub-btn" @click="openAddCategoryModal">添加成长分类</button>
          <button class="growth-sub-btn" @click="openAddNodeModal">添加成长节点</button>
        </div>
        <button class="modal-close-btn" @click="closeGrowthMainModal">关闭</button>
      </div>
    </div>

    <!-- 2. 添加成长分类弹窗 - 新增类型选择下拉框 -->
    <div class="modal-mask" v-if="showAddCategoryModal" @click="closeAddCategoryModal">
      <div class="modal-container" @click.stop>
        <div class="modal-title">添加成长分类</div>
        <div class="modal-form-item">
          <label>分类名称：</label>
          <input 
            v-model="categoryForm.name" 
            placeholder="请输入分类名称"
            class="modal-input"
          />
        </div>
        <!-- 关键新增：类型选择下拉框 -->
        <div class="modal-form-item">
          <label>类型选择：</label>
          <select v-model="categoryForm.type" class="modal-select" required>
            <option value="" disabled>请选择分类类型</option>
            <option value="前端">前端</option>
            <option value="后端">后端</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn" 
            @click="submitCategory"
            :disabled="!categoryForm.name.trim() || !categoryForm.type || isSubmitting"
          >
            <span v-if="isSubmitting" class="loading-icon">🔄</span>
            {{ isSubmitting ? '提交中...' : '提交分类' }}
          </button>
          <button class="modal-close-btn" @click="closeAddCategoryModal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>

    <!-- 3. 添加成长节点弹窗 -->
    <div class="modal-mask" v-if="showAddNodeModal" @click="closeAddNodeModal">
      <div class="modal-container" @click.stop>
        <div class="modal-title">添加成长节点</div>
        <div class="modal-form-item">
          <label>分类ID：</label>
          <input 
            v-model.number="nodeForm.growthId" 
            type="number"
            placeholder="请输入分类ID"
            class="modal-input"
          />
        </div>
        <div class="modal-form-item">
          <label>节点内容：</label>
          <textarea 
            v-model="nodeForm.content" 
            placeholder="请输入节点内容"
            class="modal-textarea"
            rows="3"
          ></textarea>
        </div>
        <div class="modal-form-item">
          <label>上传图片（可选）：</label>
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/gif"
            @change="handleNodeImageUpload"
            class="modal-file-input"
          />
          <div class="upload-preview" v-if="nodeForm.imgUrls.length > 0">
            <div v-for="(url, idx) in nodeForm.imgUrls" :key="idx" class="preview-item">
              <img :src="url" alt="预览图" class="preview-img" @error="handleNodeImgError(idx)" />
              <button @click="removeNodeImage(idx)" class="remove-img-btn">×</button>
            </div>
          </div>
          <p class="upload-tip" v-if="nodeForm.imgUrls.length === 0">暂未上传图片，支持JPG/PNG/GIF格式</p>
        </div>
        <div class="modal-btn-group">
          <button 
            class="modal-submit-btn" 
            @click="submitNode"
            :disabled="!nodeForm.growthId || !nodeForm.content.trim() || isSubmitting"
          >
            <span v-if="isSubmitting" class="loading-icon">🔄</span>
            {{ isSubmitting ? '提交中...' : '提交节点' }}
          </button>
          <button class="modal-close-btn" @click="closeAddNodeModal" :disabled="isSubmitting">取消</button>
        </div>
      </div>
    </div>

    <!-- 4. 更新龙岛日志弹窗 -->
    <div class="modal-mask" v-if="showLogModal" @click="closeLogModal">
      <div class="modal-container" @click.stop>
        <div class="modal-title">更新龙岛日志</div>
        <div class="modal-form-item">
          <label>日志内容：</label>
          <textarea 
            v-model="logForm.content" 
            placeholder="请输入日志内容（必填）"
            class="modal-textarea"
            rows="5"
          ></textarea>
        </div>
        <div class="modal-form-item">
          <label>上传图片：</label>
          <input 
            type="file" 
            accept="image/jpeg,image/png,image/gif"
            @change="handleImageUpload"
            class="modal-file-input"
          />
          <div class="upload-preview" v-if="logForm.imgUrls.length > 0">
            <div v-for="(url, idx) in logForm.imgUrls" :key="idx" class="preview-item">
              <img :src="url" alt="预览图" class="preview-img" @error="handleImgError(idx)" />
              <button @click="removeImage(idx)" class="remove-img-btn">×</button>
            </div>
          </div>
          <p class="upload-tip" v-if="logForm.imgUrls.length === 0">暂未上传图片，支持JPG/PNG/GIF格式</p>
        </div>
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

// 状态管理：弹窗显示控制
const showLogModal = ref(false)
const showGrowthMainModal = ref(false)
const showAddCategoryModal = ref(false)
const showAddNodeModal = ref(false)
const isSubmitting = ref(false)

// 表单数据 - 关键修改：categoryForm 新增 type 字段
const logForm = ref({ content: '', imgUrls: [] })
const categoryForm = ref({ 
  name: '', 
  type: '' // 新增：存储分类类型（前端/后端/其他）
})
const nodeForm = ref({ growthId: null, content: '', imgUrls: [] })

/**
 * 处理圆圈按钮点击
 */
const handleCircleClick = (item) => {
  if (item.type === "log") {
    showLogModal.value = true
  } else if (item.type === "growth") {
    showGrowthMainModal.value = true
  }
}

/**
 * 龙的成长记录主弹窗 - 打开子弹窗
 */
const openAddCategoryModal = () => {
  showGrowthMainModal.value = false
  showAddCategoryModal.value = true
}
const openAddNodeModal = () => {
  showGrowthMainModal.value = false
  showAddNodeModal.value = true
}

/**
 * 弹窗关闭逻辑 - 关键修改：重置 categoryForm 的 type 字段
 */
const closeGrowthMainModal = () => {
  showGrowthMainModal.value = false
}
const closeAddCategoryModal = () => {
  showAddCategoryModal.value = false
  // 重置表单，包括新增的 type 字段
  categoryForm.value = { name: '', type: '' }
}
const closeAddNodeModal = () => {
  showAddNodeModal.value = false
  nodeForm.value = { growthId: null, content: '', imgUrls: [] }
}
const closeLogModal = () => {
  showLogModal.value = false
  logForm.value = { content: '', imgUrls: [] }
}

/**
 * 图片上传通用方法（复用）
 */
const uploadImage = async (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!validTypes.includes(file.type)) {
    alert('请上传合法的图片格式（JPG/PNG/GIF）')
    return null
  }
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await axios.post('https://xiaolongya.cn/blog/upload/image', formData)
    if (res.data.code === 200) {
      return res.data.data.trim()
    }
    throw new Error(res.data.msg || '图片上传失败')
  } catch (err) {
    alert(`图片上传失败：${err.message}`)
    return null
  }
}

/**
 * 龙岛日志 - 图片上传
 */
const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const imgUrl = await uploadImage(file)
  if (imgUrl) {
    logForm.value.imgUrls.push(imgUrl)
  }
  e.target.value = ''
}
const removeImage = (idx) => logForm.value.imgUrls.splice(idx, 1)
const handleImgError = (idx) => {
  alert(`第${idx+1}张图片无效，已自动移除`)
  removeImage(idx)
}

/**
 * 成长节点 - 图片上传
 */
const handleNodeImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const imgUrl = await uploadImage(file)
  if (imgUrl) {
    nodeForm.value.imgUrls.push(imgUrl)
  }
  e.target.value = ''
}
const removeNodeImage = (idx) => nodeForm.value.imgUrls.splice(idx, 1)
const handleNodeImgError = (idx) => {
  alert(`第${idx+1}张图片无效，已自动移除`)
  removeNodeImage(idx)
}

/**
 * 提交成长分类 - 关键修改：上传数据新增 type 参数
 */
const submitCategory = async () => {
  const { name, type } = categoryForm.value
  // 校验：新增 type 字段非空校验
  if (!name.trim() || !type) return
  isSubmitting.value = true
  try {
    const res = await axios.post('https://xiaolongya.cn/blog/growth/upload', {
      name,
      type // 新增：将分类类型一同上传
    })
    if (res.data.code === 200) {
      alert('成长分类添加成功！')
      closeAddCategoryModal()
    } else {
      throw new Error(res.data.msg || '分类添加失败')
    }
  } catch (err) {
    alert(`分类添加失败：${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 提交成长节点
 */
const submitNode = async () => {
  const { growthId, content, imgUrls } = nodeForm.value
  if (!growthId || !content.trim()) return
  isSubmitting.value = true
  try {
    const res = await axios.post('https://xiaolongya.cn/blog/node/upload', {
      growthId,
      content: content.trim(),
      imgUrls
    })
    if (res.data.code === 200) {
      alert('成长节点添加成功！')
      closeAddNodeModal()
    } else {
      throw new Error(res.data.msg || '节点添加失败')
    }
  } catch (err) {
    alert(`节点添加失败：${err.message}`)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * 提交龙岛日志
 */
const submitLog = async () => {
  const content = logForm.value.content.trim()
  if (!content) return
  isSubmitting.value = true
  try {
    const res = await axios.post('https://xiaolongya.cn/blog/development/upload', {
      content,
      imgUrls: logForm.value.imgUrls
    })
    if (res.data.code === 200) {
      alert('龙岛日志更新成功！')
      closeLogModal()
    } else {
      throw new Error(res.data.msg || '日志提交失败')
    }
  } catch (err) {
    alert(`日志提交失败：${err.message}`)
  } finally {
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
  font-size: 100px;
  font-weight: 900;
  color: #00c0e2;
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
  flex-wrap: wrap;
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
  font-size: 25px;
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

/* 输入框 */
.modal-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}
.modal-input:focus {
  border-color: #2f5496;
  box-shadow: 0 0 0 2px rgba(47, 84, 150, 0.1);
}

/* 关键新增：下拉选择框样式 */
.modal-select {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  background-color: #fff;
  cursor: pointer;
}
.modal-select:focus {
  border-color: #2f5496;
  box-shadow: 0 0 0 2px rgba(47, 84, 150, 0.1);
}
.modal-select option {
  font-size: 16px;
  padding: 10px 0;
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
.growth-btn-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}
.growth-sub-btn {
  padding: 12px 0;
  background-color: #2f5496;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.growth-sub-btn:hover {
  background-color: #3a66b8;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 响应式适配 - 关键新增：下拉框移动端适配 */
@media (max-width: 768px) {
  .admin-title { font-size: 36px; }
  .admin-main-content { border-radius: 40px; padding: 30px 10px; gap: 20px; }
  .circle-item { width: 120px; height: 120px; }
  .circle-bg { width: 120px; height: 120px; }
  .circle-text { font-size: 18px; }
  .modal-container { padding: 20px; }
  .modal-title { font-size: 20px; margin-bottom: 20px; }
  .modal-btn-group { gap: 15px; }
  .modal-submit-btn, .modal-close-btn { padding: 8px 20px; font-size: 16px; }
  .growth-sub-btn { font-size: 16px; }
  /* 下拉框移动端适配 */
  .modal-select { padding: 10px 12px; font-size: 14px; }
}
</style>