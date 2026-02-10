<template>
  <div class="comment-area" id="comment-anchor">
    <h1 class="comment-title">🐉 龙岛聚会 · 评论区</h1>

    <div class="comment-form-wrap" v-if="!ipLimitExceeded">
      <h3 class="form-title">留下你的足迹</h3>
      <form @submit.prevent="handleSubmit" class="comment-form">
        <div class="form-item">
          <label class="form-label">昵称：</label>
          <input 
            v-model="name" 
            type="text" 
            placeholder="请输入你的昵称" 
            required
            class="form-input"
          >
        </div>

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

    <div class="ip-limit-tip" v-else>
      📌 当前IP每小时评论次数已达上限（5次），请1小时后再试～
    </div>

    <div class="comment-list-wrap">
      <h3 class="list-title">大家的留言 ({{ totalCount }})</h3>
      
      <div class="loading-box" v-if="isLoading">
        <div class="loading-spinner"></div>
        <div class="loading-text">🌀 正在召唤神龙送信...</div>
      </div>

      <div v-else>
        <div class="comment-item" v-for="(item, idx) in commentList" :key="item.id || idx">
          <div class="item-header">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-time">{{ formatTime(item.create_time) }}</span>
          </div>
          <div class="item-content">{{ item.content }}</div>
          
          <div class="item-reply" v-if="getIsValidReply(item.reply)">
            <span class="reply-author">小龙回复：</span>
            <span class="reply-content">{{ item.reply }}</span>
          </div>
        </div>

        <div class="empty-tip" v-if="commentList.length === 0">
          暂无留言，快来抢沙发～
        </div>

        <div class="pagination-box" v-if="totalCount > 0">
          <button 
            class="page-btn prev-btn" 
            :disabled="pageNum === 1" 
            @click="changePage(pageNum - 1)"
          >
            &lt;
          </button>

          <button 
            v-for="(p, index) in displayPageNums" 
            :key="index"
            class="page-btn number-btn"
            :class="{ 'active': pageNum === p, 'dots': p === '...' }"
            :disabled="p === '...'"
            @click="p !== '...' && changePage(p)"
          >
            {{ p }}
          </button>

          <button 
            class="page-btn next-btn" 
            :disabled="pageNum === totalPages" 
            @click="changePage(pageNum + 1)"
          >
            &gt;
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'

// 配置 Axios
axios.defaults.baseURL = 'https://xiaolongya.cn/blog'
axios.defaults.timeout = 10000

// 表单数据
const name = ref('') 
const contact = ref('') 
const content = ref('') 
const commentList = ref([]) 
const ipLimitExceeded = ref(false) 

// 分页相关状态
const pageNum = ref(1)
const pageSize = ref(10) // 每页显示10条
const totalCount = ref(0)

// 加载状态
const isLoading = ref(false)
const isSubmitting = ref(false)

// 滑块验证相关变量
const showSliderVerify = ref(false) 
const sliderLeft = ref(0) 
const sliderBox = ref(null) 
const isDragging = ref(false) 
const sliderWidth = ref(0) 
const btnWidth = ref(40) 

// 辅助函数：时间格式化
const formatTime = (timeStr) => {
  if (!timeStr) return '未知时间'
  try {
    const formattedTime = timeStr.replace(/ /g, 'T') + '+08:00'
    const date = new Date(formattedTime)
    if (isNaN(date.getTime())) return '未知时间'
    return date.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  } catch (e) {
    return timeStr
  }
}

const getIsValidReply = (reply) => {
  return !!((reply ?? '').toString().trim())
}

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value) || 1
})

// ✅ 核心修改：保证恰好显示5个数字按钮的逻辑
const displayPageNums = computed(() => {
  const total = totalPages.value
  const current = pageNum.value
  let pages = []

  // 情况1：总页数 <= 5，显示全部
  if (total <= 5) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } 
  // 情况2：总页数 > 5，固定5个数字
  else {
    // 默认中间范围：[current-1, current, current+1]
    let start = current - 1
    let end = current + 1

    // 修正左边界
    if (start < 2) {
      start = 2
      end = 4
    }

    // 修正右边界
    if (end >= total) {
      end = total - 1
      start = total - 3
    }

    // 1. 永远添加第1页
    pages.push(1)

    // 2. 左侧省略号
    if (start > 2) {
      pages.push('...')
    }

    // 3. 添加中间的3个数字
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // 4. 右侧省略号
    if (end < total - 1) {
      pages.push('...')
    }

    // 5. 永远添加最后一页
    pages.push(total)
  }
  return pages
})

// 获取评论列表（分页模式）
const fetchCommentList = async () => {
  isLoading.value = true
  commentList.value = []
  
  try {
    const res = await axios.get('/comment/listPage', { 
      params: { 
        pageNum: pageNum.value, 
        pageSize: pageSize.value
      } 
    })

    if (res.data.code === 200) {
      const responseData = res.data.data || {}
      const rawList = responseData.list || []
      const total = responseData.total || 0

      totalCount.value = total

      commentList.value = rawList.map(item => ({
        id: item.id,
        name: item.name,
        content: item.content,
        create_time: item.createTime, 
        reply: item.reply ?? ''
      }))
    }
  } catch (error) {
    console.error('获取评论列表失败：', error)
  } finally {
    isLoading.value = false
  }
}

// 切换页码事件
const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value || newPage === pageNum.value) return
  
  pageNum.value = newPage
  fetchCommentList()

  nextTick(() => {
    const anchor = document.getElementById('comment-anchor')
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' })
  })
}

// 提交评论
const submitComment = async () => {
  if (isSubmitting.value || ipLimitExceeded.value) return
  isSubmitting.value = true

  const commentData = {
    name: name.value.trim(),
    content: content.value.trim(),
    contact: contact.value.trim()
  }

  try {
    const res = await axios.post('/comment/upload', commentData)
    if (res.data && res.data.code === 200) {
      alert('✅ 评论提交成功！')
      name.value = ''
      contact.value = ''
      content.value = ''
      showSliderVerify.value = false
      
      pageNum.value = 1
      await fetchCommentList()
      
    } else {
      const errorMsg = res.data?.msg || '提交失败'
      alert(`❌ ${errorMsg}`)
      if (res.data?.code === 403) ipLimitExceeded.value = true 
      showSliderVerify.value = false
    }
  } catch (error) {
    const errorMsg = error.response?.data?.msg || '网络异常'
    alert(`❌ ${errorMsg}`)
    if (error.response?.status === 403) ipLimitExceeded.value = true
    showSliderVerify.value = false
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = () => {
  if (!name.value.trim() || !content.value.trim()) {
    alert('⚠️ 昵称和留言不能为空哦～')
    return
  }
  if (ipLimitExceeded.value) return
  showSliderVerify.value = true
  sliderLeft.value = 0
  setTimeout(() => {
    if (sliderBox.value) sliderWidth.value = sliderBox.value.offsetWidth
  }, 100)
}

// 滑块逻辑
const startDrag = (e) => {
  isDragging.value = true
  sliderLeft.value = 0 
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchmove', handleDrag)
  window.addEventListener('touchend', endDrag)
}

const handleDrag = (e) => {
  if (!isDragging.value || !sliderBox.value) return
  let clientX = e.clientX
  if (e.touches && e.touches[0]) clientX = e.touches[0].clientX
  const boxRect = sliderBox.value.getBoundingClientRect()
  let left = clientX - boxRect.left
  if (left < 0) left = 0
  if (left > sliderWidth.value - btnWidth.value) left = sliderWidth.value - btnWidth.value
  sliderLeft.value = left
}

const endDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchmove', handleDrag)
  window.removeEventListener('touchend', endDrag)
  const isVerified = sliderLeft.value >= (sliderWidth.value - btnWidth.value - 5)
  if (isVerified) {
    submitComment()
  } else {
    alert('验证失败～')
    sliderLeft.value = 0
  }
}

onMounted(async () => {
  if (sliderBox.value) sliderWidth.value = sliderBox.value.offsetWidth
  pageNum.value = 1
  await fetchCommentList()
})
onMounted(() => { window.addEventListener('resize', updateSliderWidth) })
onUnmounted(() => {
  window.removeEventListener('resize', updateSliderWidth)
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchmove', handleDrag)
  window.removeEventListener('touchend', endDrag)
})
const updateSliderWidth = () => { if (sliderBox.value) sliderWidth.value = sliderBox.value.offsetWidth }

</script>

<style scoped>
/* 原有样式保持不变 */
.comment-area { width: 90%; max-width: 800px; margin: 40px auto; padding: 0 20px; box-sizing: border-box; font-family: "Ma Shan Zheng", "楷体", "KaiTi", "STKaiti", cursive, serif; }
.comment-title { font-size: 56px; color: #00c0e2; text-align: center; margin-bottom: 40px; letter-spacing: 8px; font-weight: 900; text-shadow: 1px 1px 2px rgba(47, 84, 150, 0.1); }
.comment-form-wrap { background-color: #fff; border-radius: 24px; padding: 30px; box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15); margin-bottom: 40px; border: 2px solid rgba(179, 216, 255, 0.5); }
.ip-limit-tip { background-color: #fff; border-radius: 24px; padding: 30px; box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15); margin-bottom: 40px; text-align: center; font-size: 20px; color: #e63946; border: 2px solid rgba(230, 57, 70, 0.2); }
.form-title { font-size: 32px; color: #2f5496; margin-bottom: 20px; text-align: center; font-weight: 700; }
.form-item { margin-bottom: 20px; }
.form-label { display: block; font-size: 20px; color: #2f5496; margin-bottom: 8px; font-weight: 500; }
.form-input, .form-textarea { width: 100%; padding: 12px 16px; border: 2px solid #b3d8ff; border-radius: 12px; font-size: 16px; font-family: "楷体", "KaiTi", "STKaiti", serif; box-sizing: border-box; transition: border-color 0.15s ease; }
.form-input:focus, .form-textarea:focus { outline: none; border-color: #2f5496; box-shadow: 0 0 0 3px rgba(47, 84, 150, 0.1); }
.form-textarea { resize: none; line-height: 1.6; }
.submit-btn { padding: 12px 30px; background-color: #2f5496; color: #fff; border: none; border-radius: 24px; font-size: 20px; cursor: pointer; transition: all 0.15s ease; display: block; margin: 0 auto; font-weight: 500; }
.submit-btn:disabled { background-color: #89a4d4; cursor: not-allowed; transform: none; }
.submit-btn:hover:not(:disabled) { background-color: #1f3a6b; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(47, 84, 150, 0.2); }
.submit-btn:active:not(:disabled) { transform: translateY(0); box-shadow: 0 2px 4px rgba(47, 84, 150, 0.2); }
.comment-list-wrap { background-color: #fff; border-radius: 24px; padding: 30px; box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15); border: 2px solid rgba(179, 216, 255, 0.5); min-height: 200px; }
.list-title { font-size: 32px; color: #2f5496; margin-bottom: 20px; font-weight: 700; text-align: center; }
.comment-item { padding: 20px 0; border-bottom: 1px dashed #b3d8ff; transition: background-color 0.15s ease; }
.comment-item:hover { background-color: rgba(179, 216, 255, 0.05); padding-left: 10px; padding-right: 10px; border-radius: 12px; margin-left: -10px; margin-right: -10px; }
.comment-item:last-child { border-bottom: none; }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.item-name { font-size: 20px; font-weight: bold; color: #2f5496; }
.item-time { font-size: 14px; color: #999; font-family: "楷体", "KaiTi", "STKaiti", serif; }
.item-content { font-size: 18px; color: #333; line-height: 1.6; margin-bottom: 12px; padding: 8px 0; }
.item-reply { background-color: rgba(179, 216, 255, 0.1); padding: 12px 16px; border-radius: 8px; font-size: 16px; line-height: 1.5; border-left: 3px solid #2f5496; transition: background-color 0.15s ease; }
.comment-item:hover .item-reply { background-color: rgba(179, 216, 255, 0.2); }
.reply-author { font-weight: bold; color: #2f5496; margin-right: 8px; }
.reply-content { color: #555; }
.empty-tip { text-align: center; font-size: 20px; color: #999; padding: 40px 0; font-weight: 500; }
.contact-tip { display: inline-block; margin-top: 5px; font-size: 14px; color: #999; font-family: "楷体", "KaiTi", "STKaiti", serif; }
.slider-verify-wrap { margin: 20px 0; width: 100%; box-sizing: border-box; }
.slider-verify-title { font-size: 16px; color: #2f5496; margin-bottom: 8px; font-weight: 500; }
.slider-verify-box { width: 100%; height: 40px; background-color: #f5f8ff; border: 2px solid #b3d8ff; border-radius: 20px; position: relative; overflow: hidden; box-sizing: border-box; }
.slider-verify-bg { position: absolute; top: 0; left: 0; height: 100%; background-color: #d7e8ff; transition: width 0.1s ease; z-index: 1; }
.slider-verify-btn { position: absolute; top: 0; left: 0; width: 40px; height: 100%; background-color: #2f5496; border-radius: 20px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; cursor: grab; z-index: 2; transition: left 0.1s ease; user-select: none; }
.slider-verify-btn:active { cursor: grabbing; background-color: #1f3a6b; }
.loading-box { padding: 40px 0; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.loading-spinner { width: 40px; height: 40px; border: 4px solid rgba(179, 216, 255, 0.3); border-top: 4px solid #2f5496; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 15px; }
.loading-text { color: #2f5496; font-size: 18px; font-weight: 500; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* === ✅ 分页器样式 === */
.pagination-box {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
  padding-bottom: 10px;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 10px;
  border: 2px solid #b3d8ff;
  background-color: #f0f7ff;
  color: #2f5496;
  border-radius: 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: "Ma Shan Zheng", "楷体", serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 常规 Hover */
.page-btn:hover:not(:disabled):not(.dots) {
  background-color: #d7e8ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(47, 84, 150, 0.2);
}

.page-btn.active {
  background-color: #2f5496;
  color: #fff;
  border-color: #2f5496;
  font-weight: bold;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* ✅ 省略号样式：和普通按钮长得一样，只是不可点击 */
.page-btn.dots {
  cursor: default;
}
/* 省略号禁用 Hover 效果 */
.page-btn.dots:hover {
  background-color: #f0f7ff;
  color: #2f5496;
  border-color: #b3d8ff;
  transform: none;
  box-shadow: none;
}

@media (max-width: 768px) {
  /* ...原有移动端适配... */
  .comment-area { margin: 20px auto; }
  .comment-title { font-size: 32px; letter-spacing: 4px; margin-bottom: 20px; }
  .comment-form-wrap, .comment-list-wrap, .ip-limit-tip { padding: 20px; border-radius: 16px; border-width: 1px; }
  .form-title, .list-title { font-size: 24px; text-align: center; }
  .form-label { font-size: 18px; }
  .form-input, .form-textarea { padding: 10px 12px; font-size: 14px; border-width: 1px; }
  .submit-btn { padding: 10px 20px; font-size: 18px; }
  .item-name { font-size: 18px; }
  .item-content { font-size: 16px; margin-bottom: 10px; }
  .item-reply { padding: 10px 14px; font-size: 14px; border-left: 2px solid #2f5496; }
  .contact-tip { font-size: 12px; }
  .slider-verify-title { font-size: 14px; }
  .slider-verify-box { height: 36px; border-width: 1px; }
  .slider-verify-btn { width: 36px; font-size: 16px; }
  .ip-limit-tip { font-size: 18px; }
  .empty-tip { font-size: 18px; padding: 20px 0; }
  
  /* 分页移动端适配 */
  .page-btn {
    min-width: 32px;
    height: 32px;
    font-size: 14px;
    border-radius: 8px;
    padding: 0 6px;
  }
}
</style>