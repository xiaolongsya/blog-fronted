<template>
  <div class="comment-area">
    <!-- 页面标题 -->
    <h1 class="comment-title">🐉 龙岛聚会 · 评论区</h1>

    <!-- 评论表单 -->
    <div class="comment-form-wrap">
      <h3 class="form-title">留下你的足迹</h3>
      <form @submit.prevent="handleSubmit" class="comment-form">
        <!-- 原有昵称输入项 -->
        <div class="form-item">
          <label class="form-label">昵称：</label>
          <input 
            v-model="username" 
            type="text" 
            placeholder="请输入你的昵称" 
            required
            class="form-input"
          >
        </div>

        <!-- 新增：联系方式输入框 -->
        <div class="form-item">
          <label class="form-label">联系方式：</label>
          <input 
            v-model="contact"  
            type="text" 
            placeholder="微信/QQ/手机号等（可选，仅用于后台联系）" 
            class="form-input"
          >
          <small class="contact-tip">（评论区不显示）</small> <!-- 标注提示 -->
        </div>

        <!-- 原有留言输入项 -->
        <div class="form-item">
          <label class="form-label">留言：</label>
          <textarea 
            v-model="content" 
            rows="4" 
            placeholder="想说点什么？和小龙聊聊～" 
            required
            class="form-textarea"
          ></textarea>
        </div>

        <!-- 新增：滑块验证码 -->
        <div class="slider-verify-wrap" v-if="showSliderVerify">
          <div class="slider-verify-title">请完成滑块验证</div>
          <div class="slider-verify-box" ref="sliderBox">
            <div class="slider-verify-bg"></div>
            <div 
              class="slider-verify-btn" 
              :style="{ left: sliderLeft + 'px' }"
              @mousedown="startDrag"
              @touchstart="startDrag"
            >
              🚀
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="showSliderVerify">提交留言</button>
      </form>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list-wrap">
      <h3 class="list-title">大家的留言 ({{ commentList.length }})</h3>
      <!-- 评论项 -->
      <div class="comment-item" v-for="(item, idx) in commentList" :key="idx">
        <div class="item-header">
          <span class="item-username">{{ item.username }}</span>
          <span class="item-time">{{ item.time }}</span>
        </div>
        <div class="item-content">{{ item.content }}</div>
      </div>
      <!-- 空评论提示 -->
      <div class="empty-tip" v-if="commentList.length === 0">
        暂无留言，快来抢沙发～
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

axios.defaults.baseURL = 'https://xiaolongya.cn/blog'

// 表单数据
const username = ref('')
const contact = ref('')
const content = ref('')
const commentList = ref([])

// 滑块验证码相关变量
const showSliderVerify = ref(false) // 是否显示滑块验证
const sliderLeft = ref(0) // 滑块左侧距离
const sliderBox = ref(null) // 滑块容器ref
const isDragging = ref(false) // 是否正在拖动
const sliderWidth = ref(0) // 滑块容器宽度
const btnWidth = ref(40) // 滑块按钮宽度

// 页面加载逻辑
onMounted(async () => {
  const savedName = localStorage.getItem('dragonCommentName')
  if (savedName) {
    username.value = savedName
  }

  // 初始化滑块宽度
  if (sliderBox.value) {
    sliderWidth.value = sliderBox.value.offsetWidth
  }

  try {
    const res = await axios.get('/comment/list', {
      params: { articleId: 1 }
    })
    if (res.data.code === 200) {
      commentList.value = res.data.data.map(item => ({
        id: item.id,
        username: item.name,
        content: item.content,
        time: item.createTime
      }))
    } else {
      alert('获取评论失败：' + res.data.msg)
    }
  } catch (error) {
    console.error('获取评论列表失败：', error)
    alert('网络异常，无法加载评论～')
  }
})

// 监听窗口大小变化，更新滑块宽度
onMounted(() => {
  window.addEventListener('resize', updateSliderWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSliderWidth)
  // 移除鼠标/触摸事件监听
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchmove', handleDrag)
  window.removeEventListener('touchend', endDrag)
})

// 更新滑块容器宽度
const updateSliderWidth = () => {
  if (sliderBox.value) {
    sliderWidth.value = sliderBox.value.offsetWidth
  }
}

// 开始拖动滑块
const startDrag = (e) => {
  isDragging.value = true
  sliderLeft.value = 0 // 重置滑块位置

  // 添加鼠标/触摸事件监听
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchmove', handleDrag)
  window.addEventListener('touchend', endDrag)

  // 阻止默认事件，防止拖动时页面滚动
  e.preventDefault()
}

// 拖动过程中
const handleDrag = (e) => {
  if (!isDragging.value || !sliderBox.value) return

  // 兼容鼠标和触摸事件
  let clientX = e.clientX
  if (e.touches && e.touches[0]) {
    clientX = e.touches[0].clientX
  }

  // 获取滑块容器的页面坐标
  const boxRect = sliderBox.value.getBoundingClientRect()
  // 计算滑块左侧距离
  let left = clientX - boxRect.left

  // 限制滑块移动范围
  if (left < 0) left = 0
  if (left > sliderWidth.value - btnWidth.value) left = sliderWidth.value - btnWidth.value

  sliderLeft.value = left
}

// 结束拖动
const endDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false

  // 移除鼠标/触摸事件监听
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchmove', handleDrag)
  window.removeEventListener('touchend', endDrag)

  // 验证是否拖动到最右侧（误差±5px）
  const isVerified = sliderLeft.value >= (sliderWidth.value - btnWidth.value - 5)
  if (isVerified) {
    // 验证成功，提交评论
    submitComment()
  } else {
    // 验证失败，重置滑块
    alert('验证失败，请拖动到最右侧完成验证～')
    sliderLeft.value = 0
  }
}

// 处理提交（先显示滑块验证）
const handleSubmit = () => {
  // 先校验昵称和留言是否为空
  if (!username.value.trim() || !content.value.trim()) {
    alert('昵称和留言不能为空哦～')
    return
  }

  // 显示滑块验证
  showSliderVerify.value = true
  // 重置滑块位置
  sliderLeft.value = 0
  // 延迟更新滑块宽度（确保容器已渲染）
  setTimeout(() => {
    if (sliderBox.value) {
      sliderWidth.value = sliderBox.value.offsetWidth
    }
  }, 100)
}

// 提交评论（验证成功后执行）
const submitComment = async () => {
  // 构造请求参数
  const commentData = {
    name: username.value.trim(),
    contact: contact.value.trim(),
    content: content.value.trim(),
    articleId: 1
  }

  try {
    const res = await axios.post('/comment/upload', commentData)
    if (res.data.code === 200) {
      alert('留言成功！🎉')
      localStorage.setItem('dragonCommentName', username.value.trim())
      // 清空表单
      contact.value = ''
      content.value = ''
      // 隐藏滑块验证
      showSliderVerify.value = false
      // 重新获取评论列表
      const listRes = await axios.get('/comment/list', { params: { articleId: 1 } })
      commentList.value = listRes.data.data.map(item => ({
        id: item.id,
        username: item.name,
        content: item.content,
        time: item.createTime
      }))
    } else {
      alert('提交失败：' + res.data.msg)
      // 隐藏滑块验证
      showSliderVerify.value = false
    }
  } catch (error) {
    console.error('提交评论失败：', error)
    alert('网络异常，留言提交失败～')
    // 隐藏滑块验证
    showSliderVerify.value = false
  }
}
</script>

<style scoped>
/* 全局容器 */
.comment-area {
  width: 90%;
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 标题样式（和主页风格统一） */
.comment-title {
  font-size: 56px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  text-align: center;
  margin-bottom: 40px;
  letter-spacing: 8px;
}

/* 表单区域 */
.comment-form-wrap {
  background-color: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
  margin-bottom: 40px;
}

.form-title {
  font-size: 32px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 20px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  margin-bottom: 8px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #b3d8ff;
  border-radius: 12px;
  font-size: 16px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  box-sizing: border-box;
}

.form-textarea {
  resize: none;
}

.submit-btn {
  padding: 12px 30px;
  background-color: #2f5496;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 20px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:disabled {
  background-color: #89a4d4;
  cursor: not-allowed;
}

.submit-btn:hover:not(:disabled) {
  background-color: #1f3a6b;
}

/* 评论列表 */
.comment-list-wrap {
  background-color: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
}

.list-title {
  font-size: 32px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  margin-bottom: 20px;
}

.comment-item {
  padding: 20px 0;
  border-bottom: 1px dashed #b3d8ff;
}

.comment-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.item-username {
  font-size: 20px;
  font-weight: bold;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

.item-time {
  font-size: 14px;
  color: #999;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

.item-content {
  font-size: 18px;
  color: #333;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  line-height: 1.6;
}

.empty-tip {
  text-align: center;
  font-size: 20px;
  color: #999;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  padding: 20px 0;
}

/* 联系方式提示文字样式 */
.contact-tip {
  display: inline-block;
  margin-top: 5px;
  font-size: 14px;
  color: #999;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

/* 新增：滑块验证码样式 */
.slider-verify-wrap {
  margin: 20px 0;
  width: 100%;
  box-sizing: border-box;
}

.slider-verify-title {
  font-size: 16px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  margin-bottom: 8px;
}

.slider-verify-box {
  width: 100%;
  height: 40px;
  background-color: #f5f8ff;
  border: 2px solid #b3d8ff;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.slider-verify-bg {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: v-bind(sliderLeft + btnWidth + 'px');
  background-color: #d7e8ff;
  transition: width 0.1s ease;
  z-index: 1;
}

.slider-verify-btn {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 100%;
  background-color: #2f5496;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  cursor: grab;
  z-index: 2;
  transition: left 0.1s ease;
  user-select: none;
}

.slider-verify-btn:active {
  cursor: grabbing;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .comment-title {
    font-size: 32px;
    letter-spacing: 4px;
    margin-bottom: 20px;
  }

  .comment-form-wrap, .comment-list-wrap {
    padding: 20px;
    border-radius: 16px;
  }

  .form-title, .list-title {
    font-size: 24px;
  }

  .form-label {
    font-size: 18px;
  }

  .form-input, .form-textarea {
    padding: 10px 12px;
    font-size: 14px;
  }

  .submit-btn {
    padding: 10px 20px;
    font-size: 18px;
  }

  .item-username {
    font-size: 18px;
  }

  .item-content {
    font-size: 16px;
  }

  .contact-tip {
    font-size: 12px;
  }

  /* 滑块验证码移动端适配 */
  .slider-verify-title {
    font-size: 14px;
  }

  .slider-verify-box {
    height: 36px;
  }

  .slider-verify-btn {
    width: 36px;
    font-size: 16px;
  }
}
</style>