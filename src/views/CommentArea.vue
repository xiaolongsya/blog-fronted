<template>
  <div class="comment-area">
    <!-- 页面标题 -->
    <h1 class="comment-title">🐉 龙岛聚会 · 评论区</h1>

    <!-- 评论表单（IP超限后隐藏表单，显示提示） -->
    <div class="comment-form-wrap" v-if="!ipLimitExceeded">
      <h3 class="form-title">留下你的足迹</h3>
      <form @submit.prevent="handleSubmit" class="comment-form">
        <!-- 昵称输入项（每次评论都可填写，无登录功能） -->
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

        <!-- 联系方式输入框 -->
        <div class="form-item">
          <label class="form-label">联系方式：</label>
          <input 
            v-model="contact"  
            type="text" 
            placeholder="微信/QQ/手机号等（可选，仅用于后台联系）" 
            class="form-input"
          >
          <small class="contact-tip">（评论区不显示）</small>
        </div>

        <!-- 留言输入项 -->
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

        <!-- 滑块验证码 -->
        <div class="slider-verify-wrap" v-if="showSliderVerify">
          <div class="slider-verify-title">请完成滑块验证</div>
          <div class="slider-verify-box" ref="sliderBox">
            <div class="slider-verify-bg" :style="{ width: sliderLeft + btnWidth + 'px' }"></div>
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

        <button type="submit" class="submit-btn" :disabled="showSliderVerify || isSubmitting">提交留言</button>
      </form>
    </div>

    <!-- IP每小时超限提示 -->
    <div class="ip-limit-tip" v-else>
      📌 当前IP每小时评论次数已达上限（5次），请1小时后再试～
    </div>

    <!-- 评论列表 -->
    <div class="comment-list-wrap">
      <h3 class="list-title">大家的留言 ({{ commentList.length }})</h3>
      <!-- 评论项 -->
      <div class="comment-item" v-for="(item, idx) in commentList" :key="idx">
        <div class="item-header">
          <span class="item-username">{{ item.name }}</span>
          <span class="item-time">{{ formatTime(item.create_time) }}</span>
        </div>
        <div class="item-content">{{ item.content }}</div>
        
        <!-- 安全判断reply是否为有效内容 -->
        <div class="item-reply" v-if="getIsValidReply(item.reply)">
          <span class="reply-author">小龙回复：</span>
          <span class="reply-content">{{ item.reply }}</span>
        </div>
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

// 后端接口地址
axios.defaults.baseURL = 'https://xiaolongya.cn/blog'
// 请求超时时间
axios.defaults.timeout = 10000

// 表单数据（和数据库字段对应：name/contact/content）
const username = ref('') // 对应数据库的name字段
const contact = ref('') // 对应数据库的contact字段
const content = ref('') // 对应数据库的content字段
const commentList = ref([]) // 存储评论列表

// IP限制相关变量
const ipLimitExceeded = ref(false) // 是否超出IP每小时限制

// 滑块验证码相关变量
const showSliderVerify = ref(false) // 是否显示滑块验证
const sliderLeft = ref(0) // 滑块左侧距离
const sliderBox = ref(null) // 滑块容器ref
const isDragging = ref(false) // 是否正在拖动
const sliderWidth = ref(0) // 滑块容器宽度
const btnWidth = ref(40) // 滑块按钮宽度

// 防重复提交
const isSubmitting = ref(false) // 防止重复提交

/**
 * 时间格式化工具（对应数据库的create_time字段）
 */
const formatTime = (timeStr) => {
  if (!timeStr) return '未知时间'
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return timeStr
  }
}

/**
 * 安全判断reply是否为有效内容（对应数据库的reply字段）
 */
const getIsValidReply = (reply) => {
  // 步骤：1. 排除null/undefined 2. 转为字符串 3. 去除首尾空格 4. 判断是否非空
  return !!((reply ?? '').toString().trim())
}

// 页面加载逻辑
onMounted(async () => {
  // 初始化滑块宽度
  if (sliderBox.value) {
    sliderWidth.value = sliderBox.value.offsetWidth
  }

  try {
    // 获取评论列表（和数据库字段对应：name/content/create_time/reply）
    const res = await axios.get('/comment/list', {
      params: { articleId: 1 }
    })
    if (res.data.code === 200) {
      commentList.value = res.data.data.map(item => ({
        id: item.id,
        name: item.name, // 对应数据库的name字段
        content: item.content, // 对应数据库的content字段
        create_time: item.create_time, // 对应数据库的create_time字段
        reply: item.reply ?? '' // 对应数据库的reply字段（兼容null）
      }))
    } else {
      alert('获取评论失败：' + res.data.msg)
    }
  } catch (error) {
    console.error('获取评论列表失败：', error)
    alert('网络异常，无法加载评论～')
  }

  // 禁用控制台作弊相关操作
  disableConsoleCheat()
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

/**
 * 禁用控制台作弊相关操作
 */
const disableConsoleCheat = () => {
  // 禁止重写相关函数
  if (window.console && window.console.log) {
    const originalLog = window.console.log
    window.console.log = function (...args) {
      // 检测是否包含篡改关键字
      const cheatKeywords = ['dragonCommentName', 'submitComment', 'ipLimitExceeded']
      const isCheat = args.some(arg => {
        return cheatKeywords.some(keyword => String(arg).includes(keyword))
      })
      if (isCheat) {
        originalLog('🚫 禁止非法篡改评论逻辑！')
        return
      }
      originalLog.apply(this, args)
    }
  }

  // 禁止右键查看源码
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })
}

/**
 * 更新滑块容器宽度
 */
const updateSliderWidth = () => {
  if (sliderBox.value) {
    sliderWidth.value = sliderBox.value.offsetWidth
  }
}

/**
 * 开始拖动滑块
 */
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

/**
 * 拖动过程中
 */
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

/**
 * 结束拖动
 */
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

/**
 * 提交评论（和数据库字段完全对应）
 */
const submitComment = async () => {
  // 防止重复提交
  if (isSubmitting.value || ipLimitExceeded.value) return
  isSubmitting.value = true

  // 构造请求参数（和数据库字段对应：name/contact/content）
  const commentData = {
    name: username.value.trim(), // 对应数据库的name字段
    contact: contact.value.trim(), // 对应数据库的contact字段
    content: content.value.trim(), // 对应数据库的content字段
    articleId: 1
  }

  try {
    const res = await axios.post('/comment/upload', commentData)
    // 统一处理后端返回结果
    if (res.data && res.data.code === 200) {
      // 显示评论成功提示
      alert('✅ 评论提交成功！感谢你的留言～')

      // 清空表单（昵称、联系方式、留言都清空，因为无登录功能，每次都需填写）
      username.value = ''
      contact.value = ''
      content.value = ''
      // 隐藏滑块验证
      showSliderVerify.value = false
      // 重新获取评论列表，更新页面
      const listRes = await axios.get('/comment/list', { params: { articleId: 1 } })
      if (listRes.data.code === 200) {
        commentList.value = listRes.data.data.map(item => ({
          id: item.id,
          name: item.name,
          content: item.content,
          create_time: item.create_time,
          reply: item.reply ?? ''
        }))
      }
    } else {
      // 处理后端返回的错误提示
      const errorMsg = res.data?.msg || '提交失败，请稍后再试'
      alert(`❌ ${errorMsg}`)
      // 判断是否为IP超限
      if (res.data?.code === 403) {
        ipLimitExceeded.value = true // 标记超限，隐藏表单
      }
      // 隐藏滑块验证
      showSliderVerify.value = false
    }
  } catch (error) {
    console.error('提交评论失败：', error)
    // 更友好的错误提示
    const errorMsg = error.response?.data?.msg || '网络异常，留言提交失败～'
    alert(`❌ ${errorMsg}`)
    // 若后端返回403，标记超限
    if (error.response?.status === 403 || error.response?.data?.code === 403) {
      ipLimitExceeded.value = true
    }
    // 隐藏滑块验证
    showSliderVerify.value = false
  } finally {
    // 解除提交锁
    isSubmitting.value = false
  }
}

/**
 * 处理提交（先显示滑块验证）
 */
const handleSubmit = () => {
  // 1. 先校验昵称和留言是否为空
  if (!username.value.trim() || !content.value.trim()) {
    alert('⚠️ 昵称和留言不能为空哦～')
    return
  }

  // 2. 显示滑块验证（若已超限，不显示）
  if (ipLimitExceeded.value) return
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
</script>

<style scoped>
/* 全局容器 */
.comment-area {
  width: 90%;
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  box-sizing: border-box;
  font-family: "Ma Shan Zheng", "楷体", "KaiTi", "STKaiti", cursive, serif; /* 统一全站字体 */
}

/* 标题样式（和主页风格统一） */
.comment-title {
  font-size: 56px;
  color: #00c0e2;
  text-align: center;
  margin-bottom: 40px;
  letter-spacing: 8px;
  font-weight: 900;
  text-shadow: 1px 1px 2px rgba(47, 84, 150, 0.1);
}

/* 表单区域 */
.comment-form-wrap {
  background-color: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
  margin-bottom: 40px;
  border: 2px solid rgba(179, 216, 255, 0.5);
}

/* IP超限提示样式 */
.ip-limit-tip {
  background-color: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
  margin-bottom: 40px;
  text-align: center;
  font-size: 20px;
  color: #e63946;
  border: 2px solid rgba(230, 57, 70, 0.2);
}

.form-title {
  font-size: 32px;
  color: #2f5496;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 20px;
  color: #2f5496;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #b3d8ff;
  border-radius: 12px;
  font-size: 16px;
  font-family: "楷体", "KaiTi", "STKaiti", serif; /* 输入框统一楷体 */
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #2f5496;
  box-shadow: 0 0 0 3px rgba(47, 84, 150, 0.1);
}

.form-textarea {
  resize: none;
  line-height: 1.6;
}

.submit-btn {
  padding: 12px 30px;
  background-color: #2f5496;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: block;
  margin: 0 auto;
  font-weight: 500;
}

.submit-btn:disabled {
  background-color: #89a4d4;
  cursor: not-allowed;
  transform: none;
}

.submit-btn:hover:not(:disabled) {
  background-color: #1f3a6b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(47, 84, 150, 0.2);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(47, 84, 150, 0.2);
}

/* 评论列表 */
.comment-list-wrap {
  background-color: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(179, 216, 255, 0.5);
}

.list-title {
  font-size: 32px;
  color: #2f5496;
  margin-bottom: 20px;
  font-weight: 700;
  text-align: center;
}

.comment-item {
  padding: 20px 0;
  border-bottom: 1px dashed #b3d8ff;
  transition: background-color 0.15s ease;
}

.comment-item:hover {
  background-color: rgba(179, 216, 255, 0.05);
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 12px;
  margin-left: -10px;
  margin-right: -10px;
}

.comment-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.item-username {
  font-size: 20px;
  font-weight: bold;
  color: #2f5496;
}

.item-time {
  font-size: 14px;
  color: #999;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

.item-content {
  font-size: 18px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
  padding: 8px 0;
}

/* 小龙回复区域样式 */
.item-reply {
  background-color: rgba(179, 216, 255, 0.1); /* 统一浅蓝背景，贴合全站风格 */
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.5;
  border-left: 3px solid #2f5496;
  transition: background-color 0.15s ease;
}

.comment-item:hover .item-reply {
  background-color: rgba(179, 216, 255, 0.2);
}

.reply-author {
  font-weight: bold;
  color: #2f5496;
  margin-right: 8px;
}

.reply-content {
  color: #555;
}

.empty-tip {
  text-align: center;
  font-size: 20px;
  color: #999;
  padding: 40px 0;
  font-weight: 500;
}

/* 联系方式提示文字样式 */
.contact-tip {
  display: inline-block;
  margin-top: 5px;
  font-size: 14px;
  color: #999;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

/* 滑块验证码样式 */
.slider-verify-wrap {
  margin: 20px 0;
  width: 100%;
  box-sizing: border-box;
}

.slider-verify-title {
  font-size: 16px;
  color: #2f5496;
  margin-bottom: 8px;
  font-weight: 500;
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
  background-color: #1f3a6b;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .comment-area {
    margin: 20px auto;
  }

  .comment-title {
    font-size: 32px;
    letter-spacing: 4px;
    margin-bottom: 20px;
  }

  .comment-form-wrap, .comment-list-wrap, .ip-limit-tip {
    padding: 20px;
    border-radius: 16px;
    border-width: 1px;
  }

  .form-title, .list-title {
    font-size: 24px;
    text-align: center;
  }

  .form-label {
    font-size: 18px;
  }

  .form-input, .form-textarea {
    padding: 10px 12px;
    font-size: 14px;
    border-width: 1px;
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
    margin-bottom: 10px;
  }

  /* 移动端回复区域样式适配 */
  .item-reply {
    padding: 10px 14px;
    font-size: 14px;
    border-left: 2px solid #2f5496;
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
    border-width: 1px;
  }

  .slider-verify-btn {
    width: 36px;
    font-size: 16px;
  }

  /* IP超限提示移动端适配 */
  .ip-limit-tip {
    font-size: 18px;
  }

  .empty-tip {
    font-size: 18px;
    padding: 20px 0;
  }
}
</style>