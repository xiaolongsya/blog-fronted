<template>
  <div class="comment-area" id="comment-anchor">
    <h1 class="comment-title">🐉 龙岛聚会 · 评论区</h1>

    <div class="comment-form-wrap" v-if="!ipLimitExceeded">
      <h3 class="form-title">留下你的足迹</h3>
      <form @submit.prevent="handleSubmit" class="comment-form">
        <div class="form-row">
          <div class="form-item half-width">
            <label class="form-label">昵称：</label>
            <input 
              v-model="name" 
              type="text" 
              placeholder="请输入你的昵称" 
              required
              class="form-input"
            >
          </div>

          <div class="form-item half-width">
            <label class="form-label">联系方式：</label>
            <input 
              v-model="contact"  
              type="text" 
              placeholder="手机/微信（可选，仅后台可见）" 
              class="form-input"
            >
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">留言：</label>
          <div class="textarea-wrapper">
            <textarea 
              v-model="content" 
              rows="4" 
              placeholder="想说点什么？和小龙聊聊～" 
              required
              class="form-textarea"
              ref="textareaRef"
            ></textarea>
            
            <div class="toolbar">
              <div class="upload-btn-wrapper" @click="triggerFileUpload" title="上传图片">
                <div class="upload-btn">
                  <span class="icon">🖼️</span>
                  <span class="text">插入图片</span>
                </div>
              </div>
              <span v-if="isUploading" class="upload-status">
                <span class="loading-dot"></span> 图片上传中...
              </span>
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                multiple
                style="display: none" 
                @change="handleFileChange"
              >
            </div>
          </div>
        </div>

        <div class="slider-verify-wrap" v-if="showSliderVerify">
          <div class="slider-verify-title">请完成滑块验证</div>
          <div class="slider-verify-box" ref="sliderBox">
            <div class="slider-verify-text" :style="{ opacity: isDragging ? 0.5 : 1 }">拖动滑块验证</div>
            
            <div class="slider-verify-bg" :style="{ width: sliderLeft + 'px' }"></div>
            
            <div 
              class="slider-verify-btn" 
              :class="{ 'is-dragging': isDragging, 'is-success': sliderLeft >= maxLeft }"
              :style="{ transform: `translateX(${sliderLeft}px)` }"
              @mousedown="startDrag"
              @touchstart="startDrag"
            >
              <span v-if="sliderLeft >= maxLeft">✅</span>
              <span v-else>🚀</span>
            </div>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="showSliderVerify || isSubmitting || isUploading">
          {{ isSubmitting ? '提交中...' : '提交留言' }}
        </button>
      </form>
    </div>

    <div class="ip-limit-tip" v-else>
      📌 当前IP每小时评论次数已达上限，请稍后休息再来～
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
            <div class="header-left">
              <div class="avatar-circle">{{ item.name.charAt(0) }}</div>
              <span class="item-name">{{ item.name }}</span>
            </div>
            <span class="header-right">
              <span class="item-time">{{ formatTime(item.create_time) }}</span>
              <button class="reply-action-btn" @click.stop="toggleReplyForm(item.id)">
                <span class="reply-icon">💬</span> 回复
              </button>
            </span>
          </div>
          
          <div 
            class="item-content" 
            v-html="formatContent(item.content)"
            @click="handleContentClick($event)"
          ></div>
          
          <div class="reply-section" v-if="item.replies && item.replies.length > 0">
            <div class="reply-triangle"></div>
            <transition-group name="list-anim">
              <div 
                class="item-reply" 
                v-for="(reply, rIdx) in item.replies" 
                :key="reply.id"
                v-show="rIdx < item.visibleReplyCount"
              >
                <span class="reply-author">{{ reply.name }}：</span>
                <span class="reply-content">{{ reply.content }}</span>
                <div class="reply-meta">{{ formatTime(reply.createTime) }}</div>
              </div>
            </transition-group>

            <div class="load-more-replies" v-if="item.replies.length > item.visibleReplyCount">
              <span @click="loadMoreReplies(item)">
                展开更多 ({{ item.replies.length - item.visibleReplyCount }}) ▼
              </span>
            </div>
          </div>

          <transition name="slide-fade">
            <div class="inline-reply-form" v-if="activeReplyId === item.id" @click.stop>
               <div class="reply-form-header">
                 <span>回复 @{{ item.name }}</span>
                 <span class="close-btn" @click="activeReplyId = null">×</span>
               </div>
               <div class="reply-form-body">
                 <input 
                    v-model="replyForm.name" 
                    placeholder="你的昵称" 
                    class="reply-input-name" 
                 />
                 <input 
                    v-model="replyForm.content" 
                    placeholder="写下你的回复..." 
                    class="reply-input-content" 
                    @keyup.enter="submitReply(item.id)"
                 />
                 <button 
                    type="button"
                    class="reply-submit-btn" 
                    @click="submitReply(item.id)" 
                    :disabled="isSubmittingReply"
                 >
                    {{ isSubmittingReply ? '发送中...' : '发送' }}
                 </button>
               </div>
            </div>
          </transition>

        </div>

        <div class="empty-tip" v-if="commentList.length === 0">
          暂无留言，快来抢沙发～
        </div>

        <div class="pagination-box" v-if="totalCount > 0">
          <button class="page-btn prev-btn" :disabled="pageNum === 1" @click="changePage(pageNum - 1)">&lt;</button>
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
          <button class="page-btn next-btn" :disabled="pageNum === totalPages" @click="changePage(pageNum + 1)">&gt;</button>
        </div>
      </div>
    </div>

    <div class="image-modal-mask" v-if="bigImageUrl" @click="closeBigImage">
      <img 
        ref="modalImageRef"
        :src="bigImageUrl" 
        class="image-modal-img" 
        @click.stop
        @wheel.prevent="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
      <div class="modal-tip">滚轮缩放 / 拖动查看 / 双击关闭</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
// 1. 替换为你的 request 工具
import request from '@/utils/request'

const USER_NAME_KEY = 'dragon_island_visitor_name'

// 表单数据
const name = ref('') 
const contact = ref('') 
const content = ref('') 
const commentList = ref([]) 
const ipLimitExceeded = ref(false) 

// 图片上传
const fileInput = ref(null)
const isUploading = ref(false)

// 回复
const activeReplyId = ref(null) 
const replyForm = ref({ name: '', content: '' })
const isSubmittingReply = ref(false)

// 分页
const pageNum = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const isLoading = ref(false) 
const isSubmitting = ref(false)

// === ⚡️ 滑块验证优化版 ===
const showSliderVerify = ref(false) 
const sliderLeft = ref(0) 
const sliderBox = ref(null) 
const isDragging = ref(false) 
const sliderWidth = ref(0) 
const btnWidth = ref(50) 

const maxLeft = computed(() => sliderWidth.value - btnWidth.value)

// === 图片查看器状态 ===
const bigImageUrl = ref('')
const modalImageRef = ref(null)
let state = { scale: 1, x: 0, y: 0, isDragging: false, isPinching: false, startX: 0, startY: 0, lastX: 0, lastY: 0, startDist: 0, startScale: 1 }
let dims = { imgW: 0, imgH: 0, winW: 0, winH: 0 }

// === 图片查看器方法 ===
const handleContentClick = (e) => {
  if (e.target.tagName === 'IMG') {
    showBigImage(e.target.src)
  }
}
const showBigImage = (url) => {
  if (!url) return
  bigImageUrl.value = url
  state = { scale: 1, x: 0, y: 0, isDragging: false, isPinching: false, startX: 0, startY: 0, lastX: 0, lastY: 0, startDist: 0, startScale: 1 }
  nextTick(() => {
    updateDims()
    if (!modalImageRef.value) return
    dims.imgW = modalImageRef.value.offsetWidth
    dims.imgH = modalImageRef.value.offsetHeight
    updateTransform(false)
  })
}
const closeBigImage = () => { bigImageUrl.value = '' }
const updateDims = () => { if (!bigImageUrl.value) return; dims.winW = window.innerWidth; dims.winH = window.innerHeight }
const updateTransform = (animation = true) => {
  if (!modalImageRef.value) return
  modalImageRef.value.style.transition = animation ? 'transform 0.1s linear' : 'none'
  modalImageRef.value.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`
}
const handleWheel = (e) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  let newScale = state.scale + delta
  newScale = Math.max(0.5, Math.min(5, newScale))
  const ratio = newScale / state.scale
  state.scale = newScale
  state.x *= ratio
  state.y *= ratio
  clampPosition()
  updateTransform(true)
}
const handleMouseDown = (e) => { if (e.button !== 0) return; e.preventDefault(); state.isDragging = true; state.startX = e.clientX; state.startY = e.clientY; state.lastX = state.x; state.lastY = state.y; if(modalImageRef.value) modalImageRef.value.style.transition = 'none' }
const handleMouseMove = (e) => { if (!state.isDragging) return; e.preventDefault(); state.x = state.lastX + (e.clientX - state.startX); state.y = state.lastY + (e.clientY - state.startY); updateTransform(false) }
const handleMouseUp = () => { if (!state.isDragging) return; state.isDragging = false; clampPosition(); updateTransform(true) }
const getDistance = (touches) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)
const handleTouchStart = (e) => {
  if (e.touches.length === 2) { state.isPinching = true; state.isDragging = false; state.startDist = getDistance(e.touches); state.startScale = state.scale } 
  else if (e.touches.length === 1) { state.isDragging = true; state.isPinching = false; state.startX = e.touches[0].clientX; state.startY = e.touches[0].clientY; state.lastX = state.x; state.lastY = state.y }
  if (modalImageRef.value) modalImageRef.value.style.transition = 'none'
}
const handleTouchMove = (e) => {
  e.preventDefault()
  if (state.isPinching && e.touches.length === 2) {
    const curDist = getDistance(e.touches)
    if (state.startDist > 0) {
      let newScale = state.startScale * (curDist / state.startDist)
      newScale = Math.max(0.5, Math.min(5, newScale))
      const ratio = newScale / state.scale
      state.scale = newScale
      state.x *= ratio; state.y *= ratio
      updateTransform(false)
    }
  } else if (state.isDragging && e.touches.length === 1 && !state.isPinching) {
    state.x = state.lastX + (e.touches[0].clientX - state.startX)
    state.y = state.lastY + (e.touches[0].clientY - state.startY)
    updateTransform(false)
  }
}
const handleTouchEnd = (e) => {
  if (e.touches.length === 0) { state.isDragging = false; state.isPinching = false; clampPosition(); updateTransform(true) }
  else if (e.touches.length === 1) { state.isPinching = false; state.isDragging = true; state.startX = e.touches[0].clientX; state.startY = e.touches[0].clientY; state.lastX = state.x; state.lastY = state.y }
}
const clampPosition = () => {
  const curW = dims.imgW * state.scale; const curH = dims.imgH * state.scale
  if (curW <= dims.winW) state.x = 0; else { const maxX = (curW - dims.winW) / 2; state.x = Math.max(-maxX, Math.min(maxX, state.x)) }
  if (curH <= dims.winH) state.y = 0; else { const maxY = (curH - dims.winH) / 2; state.y = Math.max(-maxY, Math.min(maxY, state.y)) }
}

// === 通用逻辑 ===
const loadSavedName = () => { const s = localStorage.getItem(USER_NAME_KEY); if(s) name.value = s; return s || '' }
const saveName = (n) => { if(n && n.trim()){ localStorage.setItem(USER_NAME_KEY, n.trim()); name.value = n.trim(); replyForm.value.name = n.trim() } }

const formatTime = (t) => { if(!t) return '未知'; try { return t.replace(/T/, ' ').replace(/\+.+/, '') } catch(e){ return t } }

const formatContent = (t) => { 
  if(!t) return ''; 
  let safeText = t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  safeText = safeText.replace(/\[img\](.*?)\[\/img\]/g, (match, url) => `<img src="${url}" class="comment-thumb" />`);
  return safeText.replace(/\n/g, '<br>'); 
}

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value) || 1)
const displayPageNums = computed(() => {
  const total = totalPages.value, cur = pageNum.value, arr = []
  if (total <= 5) for(let i=1; i<=total; i++) arr.push(i)
  else {
    arr.push(1); let s = cur - 1, e = cur + 1
    if (s < 2) { s=2; e=4 } if (e >= total) { e=total-1; s=total-3 }
    if (s > 2) arr.push('...')
    for(let i=s; i<=e; i++) arr.push(i)
    if (e < total-1) arr.push('...'); arr.push(total)
  }
  return arr
})

const triggerFileUpload = () => fileInput.value.click()

const handleFileChange = async (e) => {
  const files = e.target.files
  if (!files || !files.length) return
  isUploading.value = true
  try {
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData(); fd.append('file', files[i])
      const res = await request.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      // 适配 request 结构：res 直接是后端数据对象
      if (res.code === 200) {
        content.value += `\n[img]${res.data}[/img]\n` 
      }
      else alert('上传失败：'+res.msg)
    }
  } catch { alert('网络错误') } finally { isUploading.value = false; e.target.value = '' }
}

// === 核心数据获取逻辑 (已修正解构层级) ===
const fetchCommentList = async (bg = false) => {
  if (!bg) isLoading.value = true
  const replyMap = new Map(); commentList.value.forEach(i => replyMap.set(i.id, i.visibleReplyCount))
  try {
    const res = await request.get('/comment/listPage', { params: { pageNum: pageNum.value, pageSize: pageSize.value } })
    // 注意：request 拦截器返回的是后端返回的 data(code/msg/data) 这一层
    if (res.code === 200) {
      const d = res.data || {} // 这里是分页对象
      totalCount.value = d.total || 0
      commentList.value = (d.list || []).map(i => {
        const reps = (d.replyList || []).filter(r => r.commentId === i.id).sort((a,b)=> new Date(b.createTime)-new Date(a.createTime))
        return { ...i, create_time: i.createTime, replies: reps, visibleReplyCount: replyMap.get(i.id) || 3 }
      })
    }
  } catch(e) { console.error(e) } finally { isLoading.value = false }
}

const loadMoreReplies = (i) => i.visibleReplyCount += 5
const toggleReplyForm = (id) => {
  if (activeReplyId.value === id) activeReplyId.value = null
  else {
    activeReplyId.value = id; replyForm.value = { name: name.value || loadSavedName(), content: '' }
    nextTick(() => { const el = document.querySelector('.reply-input-content'); if(el) el.focus() })
  }
}

const submitReply = async (cid) => {
  if (!replyForm.value.name.trim() || !replyForm.value.content.trim()) return alert('请完善信息')
  isSubmittingReply.value = true; saveName(replyForm.value.name)
  try {
    const res = await request.post('/reply/add', { commentId: cid, name: replyForm.value.name, content: replyForm.value.content })
    if (res.code === 200) { activeReplyId.value = null; await fetchCommentList(true) }
    else alert(res.msg)
  } catch { alert('异常') } finally { isSubmittingReply.value = false }
}

const changePage = (p) => { if (p<1 || p>totalPages.value || p===pageNum.value) return; pageNum.value = p; fetchCommentList(false); nextTick(()=>document.getElementById('comment-anchor')?.scrollIntoView({behavior:'smooth'})) }

const submitComment = async () => {
  if (isSubmitting.value || ipLimitExceeded.value) return
  isSubmitting.value = true; saveName(name.value)
  try {
    const res = await request.post('/comment/upload', { name: name.value.trim(), content: content.value.trim(), contact: contact.value.trim() })
    if (res?.code === 200) { alert('✅ 留言成功！'); content.value = ''; showSliderVerify.value = false; pageNum.value = 1; await fetchCommentList(false) }
    else { alert(`❌ ${res?.msg||'失败'}`); if (res?.code === 403) ipLimitExceeded.value = true; showSliderVerify.value = false }
  } catch { alert('网络异常'); showSliderVerify.value = false } finally { isSubmitting.value = false }
}

const handleSubmit = () => {
  if (!name.value.trim() || !content.value.trim()) return alert('昵称和留言不能为空')
  if (ipLimitExceeded.value) return
  showSliderVerify.value = true; sliderLeft.value = 0
  setTimeout(() => { if (sliderBox.value) sliderWidth.value = sliderBox.value.offsetWidth }, 100)
}

// === 滑块逻辑 ===
const startDrag = (e) => {
  if (sliderLeft.value >= maxLeft.value) return 
  isDragging.value = true
  window.addEventListener('mousemove', handleDrag)
  window.addEventListener('mouseup', endDrag)
  window.addEventListener('touchmove', handleDrag, { passive: false }) 
  window.addEventListener('touchend', endDrag)
}

const handleDrag = (e) => {
  if (!isDragging.value) return
  if (e.type === 'touchmove') e.preventDefault() 
  let clientX = e.clientX
  if (e.touches && e.touches[0]) clientX = e.touches[0].clientX
  const boxRect = sliderBox.value.getBoundingClientRect()
  let left = clientX - boxRect.left - (btnWidth.value / 2) 
  if (left < 0) left = 0
  if (left > maxLeft.value) left = maxLeft.value
  sliderLeft.value = left
}

const endDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  window.removeEventListener('mousemove', handleDrag)
  window.removeEventListener('mouseup', endDrag)
  window.removeEventListener('touchmove', handleDrag)
  window.removeEventListener('touchend', endDrag)
  if (sliderLeft.value >= (maxLeft.value - 5)) {
    sliderLeft.value = maxLeft.value 
    setTimeout(submitComment, 100)
  } else {
    sliderLeft.value = 0 
  }
}

onMounted(() => {
  loadSavedName(); fetchCommentList(false)
  window.addEventListener('resize', updateSliderWidth)
  window.addEventListener('resize', updateDims)
})
onUnmounted(() => {
  window.removeEventListener('resize', updateSliderWidth)
  window.removeEventListener('resize', updateDims)
})
const updateSliderWidth = () => { if (sliderBox.value) sliderWidth.value = sliderBox.value.offsetWidth }
</script>

<style scoped>
/* 保持原有布局样式 */
.comment-area { width: 90%; max-width: 800px; margin: 40px auto; font-family: "Ma Shan Zheng", "楷体", sans-serif; }
.comment-title { font-size: 48px; color: #2f5496; text-align: center; margin-bottom: 30px; letter-spacing: 4px; font-weight: 900; }
.comment-form-wrap { background: #fff; border-radius: 20px; padding: 30px; box-shadow: 0 10px 25px rgba(47, 84, 150, 0.1); border: 1px solid #e1eaff; margin-bottom: 30px; }
.form-title { font-size: 24px; color: #2f5496; margin-bottom: 20px; font-weight: bold; border-left: 5px solid #2f5496; padding-left: 10px; }
.form-row { display: flex; gap: 20px; margin-bottom: 20px; }
.half-width { flex: 1; margin-bottom: 0; }
.form-label { display: block; font-size: 16px; color: #555; margin-bottom: 8px; font-weight: bold; }
.form-input, .form-textarea { width: 100%; padding: 12px; border: 2px solid #eef2f7; border-radius: 10px; font-size: 15px; transition: all 0.3s; background: #f9fbff; box-sizing: border-box; }
.form-input:focus, .form-textarea:focus { border-color: #2f5496; background: #fff; box-shadow: 0 0 0 3px rgba(47, 84, 150, 0.1); outline: none; }
.form-textarea { min-height: 120px; resize: vertical; }

.toolbar { margin-top: 10px; display: flex; align-items: center; gap: 15px; border-top: 1px dashed #e1eaff; padding-top: 10px; }
.upload-btn { display: inline-flex; align-items: center; gap: 6px; background-color: #eef6ff; color: #2f5496; padding: 8px 16px; border-radius: 20px; font-size: 14px; cursor: pointer; transition: all 0.3s ease; font-weight: 500; }
.upload-btn:hover { background-color: #fff; border-color: #2f5496; box-shadow: 0 4px 10px rgba(47, 84, 150, 0.15); transform: translateY(-2px); }
.submit-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #2f5496 0%, #4a74ba 100%); color: #fff; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.3s; box-shadow: 0 5px 15px rgba(47, 84, 150, 0.2); margin-top: 10px; }
.submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(47, 84, 150, 0.3); }
.submit-btn:disabled { background: #ccc; cursor: not-allowed; }

.comment-list-wrap { background: #fff; border-radius: 20px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); min-height: 300px; }
.list-title { font-size: 22px; color: #333; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #f0f0f0; }
.comment-item { padding: 25px 0; border-bottom: 1px solid #f0f0f0; }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.header-left { display: flex; align-items: center; gap: 10px; }
.avatar-circle { width: 40px; height: 40px; background: #e1eaff; color: #2f5496; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; }
.item-name { font-size: 18px; font-weight: bold; color: #333; }
.item-time { font-size: 13px; color: #aaa; margin-right: 15px; }
.reply-action-btn { background: none; border: none; color: #2f5496; cursor: pointer; font-size: 14px; padding: 4px 8px; border-radius: 4px; }
.reply-action-btn:hover { background: #f0f7ff; }

/* === 图片缩略图样式 (通过 ::v-deep 控制 [img] 渲染出的 img 标签) === */
.item-content { font-size: 16px; line-height: 1.8; color: #444; margin-left: 50px; }
/* deep选择器适配 v-html 插入的内容 */
:deep(.comment-thumb) {
  display: block;
  max-width: 100%;
  max-height: 150px; /* 缩略图高度 */
  border-radius: 8px;
  margin: 10px 0;
  cursor: zoom-in;
  border: 1px solid #eee;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s;
}
:deep(.comment-thumb:hover) { transform: scale(1.02); }

.reply-section { margin-left: 50px; margin-top: 15px; background: #f9fbfd; border-radius: 12px; padding: 15px 20px; position: relative; border: 1px solid #edf2f7; }
.reply-triangle { position: absolute; top: -8px; left: 20px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-bottom: 8px solid #edf2f7; }
.item-reply { padding: 8px 0; border-bottom: 1px dashed #e1eaff; font-size: 14px; display: flex; flex-wrap: wrap; align-items: baseline; }
.reply-author { color: #2f5496; font-weight: bold; margin-right: 5px; }
.reply-content { color: #555; flex: 1; }
.reply-meta { font-size: 12px; color: #bbb; margin-left: 10px; }
.load-more-replies { text-align: center; margin-top: 10px; font-size: 12px; color: #2f5496; cursor: pointer; }

.inline-reply-form { margin-left: 50px; margin-top: 15px; background: #fff; border-radius: 12px; padding: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); border: 1px solid #e1eaff; }
.reply-form-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #666; }
.reply-form-body { display: flex; gap: 10px; flex-wrap: wrap; }
.reply-input-name { width: 120px; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; }
.reply-input-content { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; min-width: 200px; }
.reply-submit-btn { background: #2f5496; color: #fff; border: none; padding: 0 20px; border-radius: 8px; cursor: pointer; font-weight: bold; }

/* === ⚡️ 核心优化：滑块验证 === */
.slider-verify-wrap { 
  margin: 20px 0; 
  user-select: none; /* 防止选中文本变工字 */
  -webkit-user-select: none;
  touch-action: none; /* 防止移动端滚动 */
}
.slider-verify-box { 
  position: relative; 
  height: 50px; 
  background-color: #eef2f8; 
  border-radius: 25px; 
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.06); 
  border: 1px solid #dce5f2;
  overflow: hidden;
}
.slider-verify-text {
  position: absolute; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: #999; font-size: 14px; z-index: 1; pointer-events: none; transition: opacity 0.2s;
}
.slider-verify-bg { 
  position: absolute; top: 0; left: 0; height: 100%; 
  background: linear-gradient(90deg, #d7e8ff 0%, #b3d8ff 100%); 
  z-index: 2; 
}
.slider-verify-btn { 
  position: absolute; 
  top: 0; left: 0; 
  width: 50px; height: 50px; 
  background: #fff; 
  border-radius: 50%; 
  display: flex; align-items: center; justify-content: center; 
  font-size: 20px; 
  cursor: grab; 
  z-index: 3; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.15); 
  /* 关键：默认有过渡，用于回弹 */
  transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  will-change: transform; /* GPU 优化 */
}

/* 拖拽中：移除过渡，保证跟手 */
.slider-verify-btn.is-dragging { 
  cursor: grabbing; 
  background-color: #fff; 
  transition: none !important; 
  box-shadow: 0 4px 12px rgba(47, 84, 150, 0.2);
}
.slider-verify-btn.is-success {
  background-color: #52c41a;
  color: #fff;
}

.pagination-box { margin-top: 30px; display: flex; justify-content: center; gap: 8px; }
.page-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #fff; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; color: #555; }
.page-btn.active { background: #2f5496; color: #fff; border-color: #2f5496; }
.loading-box { padding: 40px 0; text-align: center; }
.loading-spinner { width: 40px; height: 40px; border: 4px solid #e1eaff; border-top: 4px solid #2f5496; border-radius: 50%; margin: 0 auto 15px; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* 图片弹窗 */
.image-modal-mask { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.9); display: flex; justify-content: center; align-items: center; z-index: 9999; overflow: hidden; touch-action: none; }
.image-modal-img { max-width: 100%; max-height: 100%; object-fit: contain; cursor: grab; user-select: none; }
.image-modal-img:active { cursor: grabbing; }
.modal-tip { position: absolute; bottom: 20px; color: rgba(255,255,255,0.6); font-size: 14px; pointer-events: none; }

@media (max-width: 768px) {
  .form-row { flex-direction: column; gap: 10px; }
  .item-content, .reply-section, .inline-reply-form { margin-left: 0; }
  .reply-form-body { flex-direction: column; }
  .reply-input-name, .reply-input-content, .reply-submit-btn { width: 100%; box-sizing: border-box; }
  .reply-submit-btn { margin-top: 5px; padding: 10px; }
}
</style>