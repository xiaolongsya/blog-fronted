<template>
  <div class="comment-area">
    <h1 class="comment-title">🐉 龙岛聚会 · 评论区</h1>

    <div class="comment-form-wrap" v-if="!ipLimitExceeded">
      <h3 class="form-title">留下你的足迹</h3>
      <form @submit.prevent="handleSubmit" class="comment-form">
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
      <h3 class="list-title">大家的留言 ({{ totalCount > 0 ? totalCount + '+' : commentList.length }})</h3>
      
      <div class="loading-box" v-if="isFirstLoading">
        <div class="loading-spinner"></div>
        <div class="loading-text">🌀 正在召唤神龙送信...</div>
      </div>

      <div v-else>
        <div class="comment-item" v-for="(item, idx) in commentList" :key="item.id || idx">
          <div class="item-header">
            <span class="item-username">{{ item.name }}</span>
            <span class="item-time">{{ formatTime(item.create_time) }}</span>
          </div>
          <div class="item-content">{{ item.content }}</div>
          
          <div class="item-reply" v-if="getIsValidReply(item.reply)">
            <span class="reply-author">小龙回复：</span>
            <span class="reply-content">{{ item.reply }}</span>
          </div>
        </div>

        <div class="empty-tip" v-if="commentList.length === 0 && !isLoading">
          暂无留言，快来抢沙发～
        </div>

        <div class="load-more-section" v-if="commentList.length > 0">
          <button 
            v-if="hasMore" 
            class="load-more-btn" 
            :disabled="isLoading" 
            @click="loadMore"
          >
            {{ isLoading ? '加载中...' : '查看更多留言' }}
          </button>
          <div v-else class="no-more-tips">🌸 到底啦，没有更多留言了 🌸</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

axios.defaults.baseURL = 'https://xiaolongya.cn/blog'
axios.defaults.timeout = 10000

const username = ref('') 
const contact = ref('') 
const content = ref('') 
const commentList = ref([]) 
const ipLimitExceeded = ref(false) 

// 分页相关状态
const pageNum = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const totalCount = ref(0) // 可选：如果你想显示总数

// 区分首次加载和加载更多，优化体验
const isFirstLoading = ref(true)
const isLoading = ref(false)

// 滑块相关变量
const showSliderVerify = ref(false) 
const sliderLeft = ref(0) 
const sliderBox = ref(null) 
const isDragging = ref(false) 
const sliderWidth = ref(0) 
const btnWidth = ref(40) 
const isSubmitting = ref(false) 

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

// 【修改核心】：获取评论列表（支持分页）
const fetchCommentList = async (isLoadMore = false) => {
  if (isLoading.value) return
  isLoading.value = true
  
  try {
    // 接口变更为 listPage，参数增加 pageNum 和 pageSize
    const res = await axios.get('/comment/listPage', { 
      params: { 
        pageNum: pageNum.value, 
        pageSize: pageSize.value,
        // 如果后端该接口还需要 articleId 过滤，请取消下面注释，Postman截图未显示但原逻辑有
        // articleId: 1 
      } 
    })

    if (res.data.code === 200) {
      const rawData = res.data.data || []
      const newData = rawData.map(item => ({
        id: item.id,
        name: item.name,
        content: item.content,
        create_time: item.createTime, 
        reply: item.reply ?? ''
      }))

      if (isLoadMore) {
        // 追加模式
        commentList.value = [...commentList.value, ...newData]
      } else {
        // 覆盖模式（初始化或刷新）
        commentList.value = newData
      }

      // 判断是否还有更多数据
      // 如果返回的数据条数少于 pageSize，说明是最后一页
      if (newData.length < pageSize.value) {
        hasMore.value = false
      } else {
        hasMore.value = true
      }
    }
  } catch (error) {
    console.error('获取评论列表失败：', error)
  } finally {
    isLoading.value = false
    isFirstLoading.value = false
  }
}

// 加载更多按钮点击事件
const loadMore = () => {
  pageNum.value++
  fetchCommentList(true)
}

// 页面加载逻辑
onMounted(async () => {
  if (sliderBox.value) {
    sliderWidth.value = sliderBox.value.offsetWidth
  }
  // 初始化加载第一页
  pageNum.value = 1
  await fetchCommentList(false)

  disableConsoleCheat()
})

// ... (resize 和 unmount 逻辑保持不变) ...
onMounted(() => {
  window.addEventListener('resize', updateSliderWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateSliderWidth)
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchmove', handleDrag)
  window.removeEventListener('touchend', endDrag)
})

// ... (disableConsoleCheat, updateSliderWidth, Drag 逻辑保持不变) ...
const disableConsoleCheat = () => { /* ...略... */ }
const updateSliderWidth = () => { if (sliderBox.value) sliderWidth.value = sliderBox.value.offsetWidth }
const startDrag = (e) => {
  isDragging.value = true
  sliderLeft.value = 0 
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchmove', handleDrag)
  window.addEventListener('touchend', endDrag)
  e.preventDefault() // 防止移动端滚动
}

const handleDrag = (e) => {
  if (!isDragging.value || !sliderBox.value) return
  let clientX = e.clientX
  if (e.touches && e.touches[0]) {
    clientX = e.touches[0].clientX
  }
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
    alert('验证失败，请拖动到最右侧完成验证～')
    sliderLeft.value = 0
  }
}

const submitComment = async () => {
  if (isSubmitting.value || ipLimitExceeded.value) return
  isSubmitting.value = true

  const commentData = {
    name: username.value.trim(),
    contact: contact.value.trim(),
    content: content.value.trim(),
    articleId: 1
  }

  try {
    const res = await axios.post('/comment/upload', commentData)
    if (res.data && res.data.code === 200) {
      alert('✅ 评论提交成功！感谢你的留言～')
      username.value = ''
      contact.value = ''
      content.value = ''
      showSliderVerify.value = false
      
      // 【修改点】：提交成功后，重置回第一页并刷新
      pageNum.value = 1
      hasMore.value = true
      await fetchCommentList(false)
      
    } else {
      const errorMsg = res.data?.msg || '提交失败，请稍后再试'
      alert(`❌ ${errorMsg}`)
      if (res.data?.code === 403) {
        ipLimitExceeded.value = true 
      }
      showSliderVerify.value = false
    }
  } catch (error) {
    console.error('提交评论失败：', error)
    const errorMsg = error.response?.data?.msg || '网络异常，留言提交失败～'
    alert(`❌ ${errorMsg}`)
    if (error.response?.status === 403 || error.response?.data?.code === 403) {
      ipLimitExceeded.value = true
    }
    showSliderVerify.value = false
  } finally {
    isSubmitting.value = false
  }
}

const handleSubmit = () => {
  if (!username.value.trim() || !content.value.trim()) {
    alert('⚠️ 昵称和留言不能为空哦～')
    return
  }
  if (ipLimitExceeded.value) return
  showSliderVerify.value = true
  sliderLeft.value = 0
  setTimeout(() => {
    if (sliderBox.value) {
      sliderWidth.value = sliderBox.value.offsetWidth
    }
  }, 100)
}
</script>

<style scoped>
/* 保持原有的 CSS */
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
.item-username { font-size: 20px; font-weight: bold; color: #2f5496; }
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

/* === 新增：分页加载更多样式 === */
.load-more-section { margin-top: 25px; padding-bottom: 10px; }
.load-more-btn {
  display: block; width: 100%; padding: 12px; 
  background: #f0f7ff; 
  border: 1px dashed #b3d8ff; 
  border-radius: 16px; 
  color: #2f5496; 
  font-size: 18px;
  font-weight: bold; 
  cursor: pointer; 
  transition: 0.3s;
  font-family: "楷体", serif;
}
.load-more-btn:hover { background: #e1efff; border-color: #2f5496; }
.load-more-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.no-more-tips { text-align: center; color: #89a4d4; padding: 15px; font-size: 16px; }

@media (max-width: 768px) {
  /* ... 移动端适配保持不变 ... */
  .comment-area { margin: 20px auto; }
  .comment-title { font-size: 32px; letter-spacing: 4px; margin-bottom: 20px; }
  .comment-form-wrap, .comment-list-wrap, .ip-limit-tip { padding: 20px; border-radius: 16px; border-width: 1px; }
  .form-title, .list-title { font-size: 24px; text-align: center; }
  .form-label { font-size: 18px; }
  .form-input, .form-textarea { padding: 10px 12px; font-size: 14px; border-width: 1px; }
  .submit-btn { padding: 10px 20px; font-size: 18px; }
  .item-username { font-size: 18px; }
  .item-content { font-size: 16px; margin-bottom: 10px; }
  .item-reply { padding: 10px 14px; font-size: 14px; border-left: 2px solid #2f5496; }
  .contact-tip { font-size: 12px; }
  .slider-verify-title { font-size: 14px; }
  .slider-verify-box { height: 36px; border-width: 1px; }
  .slider-verify-btn { width: 36px; font-size: 16px; }
  .ip-limit-tip { font-size: 18px; }
  .empty-tip { font-size: 18px; padding: 20px 0; }
}
</style>