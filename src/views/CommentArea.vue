<template>
  <div class="comment-area">
    <!-- 页面标题 -->
    <h1 class="comment-title">🐉 龙岛聚会 · 评论区</h1>

    <!-- 评论表单（新增：IP超限后隐藏表单，显示提示） -->
    <div class="comment-form-wrap" v-if="!ipLimitExceeded">
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

    <!-- 新增：IP每小时超限提示 -->
    <div class="ip-limit-tip" v-else>
      📌 当前IP每小时评论次数已达上限（5次），请1小时后再试～
    </div>

    <!-- 评论列表 -->
    <div class="comment-list-wrap">
      <h3 class="list-title">大家的留言 ({{ commentList.length }})</h3>
      <!-- 评论项 -->
      <div class="comment-item" v-for="(item, idx) in commentList" :key="idx">
        <div class="item-header">
          <span class="item-username">{{ item.username }}</span>
          <span class="item-time">{{ formatTime(item.time) }}</span> <!-- 新增：时间格式化优化 -->
        </div>
        <div class="item-content">{{ item.content }}</div>
        
        <!-- 优化：安全判断reply是否为有效内容（兼容null、空字符串） -->
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

    <!-- 自定义中奖结果弹窗 -->
    <div class="lottery-modal-mask" v-if="showLotteryModal">
      <div class="lottery-modal">
        <div class="modal-icon" :class="{ 'win-icon': lotteryResult.isWinner, 'lose-icon': !lotteryResult.isWinner }">
          {{ lotteryResult.isWinner ? '🎉' : '😢' }}
        </div>
        <div class="modal-title">
          {{ lotteryResult.isWinner ? '恭喜中奖！' : '本次未中奖' }}
        </div>
        <div class="modal-desc">
          {{ 
            lotteryResult.isWinner 
              ? `你中得了【${lotteryResult.prize}】！请通过联系方式联系小龙领取～` 
              : '下次评论还有机会，加油哦～' 
          }}
        </div>
        <button class="modal-confirm-btn" @click="showLotteryModal = false">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, readonly } from 'vue'
import axios from 'axios'

// 修正：后端接口地址（根据你的实际后端地址调整，本地开发可改为 localhost:端口）
axios.defaults.baseURL = 'https://xiaolongya.cn/blog'
// 新增：请求超时时间，避免网络卡顿无响应
axios.defaults.timeout = 10000

// 表单数据
const username = ref('')
const contact = ref('')
const content = ref('')
const commentList = ref([])

// 新增：IP限制相关变量
const ipLimitExceeded = ref(false) // 是否超出IP每小时限制

// 滑块验证码相关变量
const showSliderVerify = ref(false) // 是否显示滑块验证
const sliderLeft = ref(0) // 滑块左侧距离
const sliderBox = ref(null) // 滑块容器ref
const isDragging = ref(false) // 是否正在拖动
const sliderWidth = ref(0) // 滑块容器宽度
const btnWidth = ref(40) // 滑块按钮宽度

// 抽奖结果弹窗控制
const showLotteryModal = ref(false)
const lotteryResult = ref({ isWinner: false, prize: '', status: '' }) // 新增：存储对应后端的status值

// 防篡改相关配置（保留签名+提交锁，防止恶意刷奖）
const isSubmitting = ref(false) // 防止重复提交（避免恶意快速多次触发）
const LOTTERY_SIGN = readonly('dragon_lottery_20260203') // 抽奖签名（只读，无法被篡改）
const LOTTERY_RULE = readonly({ // 抽奖规则（只读，固定概率区间）
  oneYuan: 10, // 1元红包概率 10%
  twoYuan: 5,  // 2元红包概率 5%
  noPrize: 85  // 未中奖概率 85%
})
// 新增：抽奖结果与后端status的映射关系（统一管理，方便维护）
const PRIZE_TO_STATUS = readonly({
  '1元红包': '中奖一元',
  '2元红包': '中奖两元',
  '': '未中奖'
})

// 新增：时间格式化工具（优化后端返回的时间显示）
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

// 新增：安全判断reply是否为有效内容（兼容null、undefined、空字符串）
const getIsValidReply = (reply) => {
  // 步骤：1. 排除null/undefined 2. 转为字符串 3. 去除首尾空格 4. 判断是否非空
  return !!((reply ?? '').toString().trim())
}

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
        time: item.createTime,
        reply: item.reply ?? '' // 优化：使用空值合并运算符，将null转为空字符串，避免后续报错
      }))
    } else {
      alert('获取评论失败：' + res.data.msg)
    }
  } catch (error) {
    console.error('获取评论列表失败：', error)
    alert('网络异常，无法加载评论～')
  }

  // 禁用控制台作弊相关操作（增加篡改难度）
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

// 禁用控制台作弊相关操作（增加篡改难度）
const disableConsoleCheat = () => {
  // 禁止重写抽奖相关函数（简单拦截）
  if (window.console && window.console.log) {
    const originalLog = window.console.log
    window.console.log = function (...args) {
      // 检测是否包含篡改抽奖的关键字
      const cheatKeywords = ['commentLottery', 'lotteryResult', 'LOTTERY_SIGN', 'PRIZE_TO_STATUS']
      const isCheat = args.some(arg => {
        return cheatKeywords.some(keyword => String(arg).includes(keyword))
      })
      if (isCheat) {
        originalLog('🚫 禁止非法篡改抽奖逻辑！')
        return
      }
      originalLog.apply(this, args)
    }
  }

  // 禁止右键查看源码（可选，进一步增加门槛）
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })
}

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

// 防篡改抽奖逻辑（签名验证+只读规则+固定随机数计算，新增映射status）
const commentLottery = () => {
  // 1. 签名验证（防止函数被篡改替换）
  if (LOTTERY_SIGN !== 'dragon_lottery_20260203') {
    return { isWinner: false, prize: '', status: PRIZE_TO_STATUS[''] }
  }

  // 2. 固定随机数生成逻辑（避免被篡改随机数来源）
  const randomNum = Math.floor(Math.random() * 100)
  let prize = ''
  let isWinner = false

  // 3. 使用只读规则判断（避免概率被篡改）
  if (randomNum < LOTTERY_RULE.oneYuan) {
    prize = '1元红包'
    isWinner = true
  } else if (randomNum < LOTTERY_RULE.oneYuan + LOTTERY_RULE.twoYuan) {
    prize = '2元红包'
    isWinner = true
  }

  // 4. 新增：映射后端对应的status值
  const status = PRIZE_TO_STATUS[prize]

  return { isWinner, prize, status }
}

// 处理提交（先显示滑块验证）
const handleSubmit = () => {
  // 1. 先校验昵称和留言是否为空
  if (!username.value.trim() || !content.value.trim()) {
    alert('昵称和留言不能为空哦～')
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

// 提交评论（验证成功后执行，新增status参数提交 + 处理IP超限提示）
const submitComment = async () => {
  // 防止重复提交（避免恶意快速多次提交）
  if (isSubmitting.value || ipLimitExceeded.value) return
  isSubmitting.value = true

  // 先执行抽奖，获取status（必须先抽奖，才能拿到对应的status值）
  const lotteryRes = commentLottery()
  lotteryResult.value = lotteryRes

  // 构造请求参数（新增：status字段，传递给后端）
  const commentData = {
    name: username.value.trim(),
    contact: contact.value.trim(),
    content: content.value.trim(),
    articleId: 1,
    status: lotteryRes.status // 新增：传递抽奖对应的status，存入后端数据库
  }

  try {
    const res = await axios.post('/comment/upload', commentData)
    // 新增：统一处理后端返回结果（适配后端Result格式）
    if (res.data && res.data.code === 200) {
      // 显示自定义中奖弹窗
      showLotteryModal.value = true

      localStorage.setItem('dragonCommentName', username.value.trim())
      // 清空表单（留言框清空，昵称保留，方便再次评论）
      contact.value = ''
      content.value = ''
      // 隐藏滑块验证
      showSliderVerify.value = false
      // 重新获取评论列表
      const listRes = await axios.get('/comment/list', { params: { articleId: 1 } })
      if (listRes.data.code === 200) {
        commentList.value = listRes.data.data.map(item => ({
          id: item.id,
          username: item.name,
          content: item.content,
          time: item.createTime,
          reply: item.reply ?? '' // 优化：同样将null转为空字符串
        }))
      }
    } else {
      // 新增：处理后端返回的错误提示（含IP超限）
      const errorMsg = res.data?.msg || '提交失败'
      alert(errorMsg)
      // 判断是否为IP超限（403状态码）
      if (res.data?.code === 403) {
        ipLimitExceeded.value = true // 标记超限，隐藏表单
      }
      // 隐藏滑块验证
      showSliderVerify.value = false
    }
  } catch (error) {
    console.error('提交评论失败：', error)
    // 新增：更友好的错误提示
    const errorMsg = error.response?.data?.msg || '网络异常，留言提交失败～'
    alert(errorMsg)
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

/* 新增：IP超限提示样式 */
.ip-limit-tip {
  background-color: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
  margin-bottom: 40px;
  text-align: center;
  font-size: 20px;
  color: #e63946;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

.form-title {
  font-size: 32px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  margin-bottom: 20px;
  /* 核心修改：让"留下你的足迹"居中显示 */
  text-align: center;
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
  margin-bottom: 12px; /* 新增：和回复区域拉开间距 */
}

/* 新增：小龙回复区域样式 */
.item-reply {
  background-color: #f0f0f0; /* 浅灰色背景，凸显回复 */
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  line-height: 1.5;
  /* 增加显隐性，确保有效回复一眼可见 */
  border-left: 3px solid #2f5496;
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

/* 滑块验证码样式 */
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

/* 自定义中奖结果弹窗样式（显眼且风格统一） */
.lottery-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.lottery-modal {
  width: 80%;
  max-width: 400px;
  background: #fff;
  border-radius: 24px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

.modal-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.win-icon {
  color: #ffd700;
  animation: bounce 0.5s ease;
}

.lose-icon {
  color: #999;
}

.modal-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2f5496;
}

.modal-desc {
  font-size: 18px;
  color: #666;
  margin-bottom: 25px;
  line-height: 1.6;
}

.modal-confirm-btn {
  padding: 12px 30px;
  background-color: #2f5496;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-confirm-btn:hover {
  background-color: #1f3a6b;
}

/* 中奖弹窗动画 */
@keyframes bounce {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .comment-title {
    font-size: 32px;
    letter-spacing: 4px;
    margin-bottom: 20px;
  }

  .comment-form-wrap, .comment-list-wrap, .ip-limit-tip {
    padding: 20px;
    border-radius: 16px;
  }

  .form-title, .list-title {
    font-size: 24px;
    /* 移动端同步居中，保持风格统一 */
    text-align: center;
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
    margin-bottom: 10px; /* 移动端同步调整和回复的间距 */
  }

  /* 新增：移动端回复区域样式适配 */
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
  }

  .slider-verify-btn {
    width: 36px;
    font-size: 16px;
  }

  /* 中奖弹窗移动端适配 */
  .lottery-modal {
    padding: 20px;
  }

  .modal-icon {
    font-size: 40px;
  }

  .modal-title {
    font-size: 22px;
  }

  .modal-desc {
    font-size: 16px;
  }

  .modal-confirm-btn {
    padding: 10px 20px;
    font-size: 18px;
  }

  /* IP超限提示移动端适配 */
  .ip-limit-tip {
    font-size: 18px;
  }
}
</style>