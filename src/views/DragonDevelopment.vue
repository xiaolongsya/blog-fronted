<template>
  <div class="development-page" id="dev-anchor">
    <h1 class="page-title">龙岛的发展</h1>
    
    <div class="repo-links">
      <a 
        href="https://github.com/xiaolongsya/blog-fronted" 
        target="_blank" 
        rel="noopener noreferrer"
        class="repo-link"
      >
        <i class="icon-github"></i>
        前端github仓库: https://github.com/xiaolongsya/blog-fronted
      </a>
      <a 
        href="https://github.com/xiaolongsya/blog-backend" 
        target="_blank" 
        rel="noopener noreferrer"
        class="repo-link"
      >
        <i class="icon-github"></i>
        后端github仓库: https://github.com/xiaolongsya/blog-backend
      </a>
    </div>

    <div v-if="isLoading" style="text-align:center; padding: 20px; font-size: 18px; color: #00c0e2;">
      🌀 正在读取历史记录...
    </div>

    <div class="update-item" v-for="(item, idx) in updateList" :key="idx">
      <div class="item-time">{{ item.time }}</div>
      <div class="item-content markdown-body" v-html="formatContent(item.content)"></div>
      <div class="item-image-wrap" v-if="item.images.length">
        <img 
          v-for="(img, imgIdx) in item.images" 
          :key="imgIdx" 
          :src="img" 
          class="item-image"
          @click="showBigImage(img)"
        >
      </div>
    </div>

    <div v-if="!isLoading && updateList.length === 0" class="no-more-text">
      暂无更新记录
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
// 1. 引入你的限流请求工具
import request from '@/utils/request'
// 引入 Markdown
import MarkdownIt from 'markdown-it'
import 'github-markdown-css/github-markdown.css'

// 初始化 Markdown 实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true
})

const updateList = ref([])
const bigImageUrl = ref('')

// 分页相关变量
const pageNum = ref(1)
const pageSize = 5 // 每页显示5条
const totalCount = ref(0) // 总条数
const isLoading = ref(false)

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize) || 1
})

// 分页数字按钮逻辑 (保持你原有的逻辑，非常完美)
const displayPageNums = computed(() => {
  const total = totalPages.value
  const current = pageNum.value
  let pages = []
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    let start = current - 1
    let end = current + 1
    if (start < 2) { start = 2; end = 4 }
    if (end >= total) { end = total - 1; start = total - 3 }
    pages.push(1)
    if (start > 2) pages.push('...')
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < total - 1) pages.push('...')
    pages.push(total)
  }
  return pages
})

// ================= 图片查看器逻辑 (保持不变) =================
const modalImageRef = ref(null)
let state = { scale: 1, x: 0, y: 0, isDragging: false, isPinching: false, startX: 0, startY: 0, lastX: 0, lastY: 0, startDist: 0, startScale: 1 }
let dims = { imgW: 0, imgH: 0, winW: 0, winH: 0 }

const updateDims = () => {
  if (!bigImageUrl.value) return
  dims.winW = window.innerWidth
  dims.winH = window.innerHeight
}

onMounted(() => {
  fetchUpdateList()
  window.addEventListener('resize', updateDims)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDims)
})

const showBigImage = (url) => {
  if (!url) return
  bigImageUrl.value = url
  state = { scale: 1, x: 0, y: 0, isDragging: false, isPinching: false, startX: 0, startY: 0, lastX: 0, lastY: 0, startDist: 0, startScale: 1 }
  nextTick(() => {
    if (!modalImageRef.value) return
    dims.winW = window.innerWidth
    dims.winH = window.innerHeight
    dims.imgW = modalImageRef.value.offsetWidth
    dims.imgH = modalImageRef.value.offsetHeight
    updateTransform(false)
  })
}

const closeBigImage = () => { bigImageUrl.value = '' }

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
  state.scale = newScale; state.x *= ratio; state.y *= ratio
  clampPosition(); updateTransform(true)
}

const handleMouseDown = (e) => {
  if (e.button !== 0) return
  e.preventDefault(); state.isDragging = true; state.startX = e.clientX; state.startY = e.clientY; state.lastX = state.x; state.lastY = state.y
  if (modalImageRef.value) modalImageRef.value.style.transition = 'none'
}

const handleMouseMove = (e) => {
  if (!state.isDragging) return
  e.preventDefault()
  state.x = state.lastX + (e.clientX - state.startX)
  state.y = state.lastY + (e.clientY - state.startY)
  updateTransform(false)
}

const handleMouseUp = () => {
  if (!state.isDragging) return
  state.isDragging = false; clampPosition(); updateTransform(true)
}

const getDistance = (touches) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY)

const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    state.isPinching = true; state.startDist = getDistance(e.touches); state.startScale = state.scale
  } else if (e.touches.length === 1) {
    state.isDragging = true; state.startX = e.touches[0].clientX; state.startY = e.touches[0].clientY; state.lastX = state.x; state.lastY = state.y
  }
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
      state.scale = newScale; state.x *= ratio; state.y *= ratio
      updateTransform(false)
    }
  } else if (state.isDragging && e.touches.length === 1 && !state.isPinching) {
    state.x = state.lastX + (e.touches[0].clientX - state.startX)
    state.y = state.lastY + (e.touches[0].clientY - state.startY)
    updateTransform(false)
  }
}

const handleTouchEnd = (e) => {
  if (e.touches.length === 0) {
    state.isDragging = false; state.isPinching = false; clampPosition(); updateTransform(true)
  }
}

const clampPosition = () => {
  const curW = dims.imgW * state.scale; const curH = dims.imgH * state.scale
  if (curW <= dims.winW) state.x = 0; else {
    const maxX = (curW - dims.winW) / 2
    state.x = Math.max(-maxX, Math.min(maxX, state.x))
  }
  if (curH <= dims.winH) state.y = 0; else {
    const maxY = (curH - dims.winH) / 2
    state.y = Math.max(-maxY, Math.min(maxY, state.y))
  }
}

// ================= 数据获取与分页 (核心修改适配 request.js) =================
const formatContent = (content) => {
  return md.render(content || '')
}

const fetchUpdateList = async () => {
  isLoading.value = true
  updateList.value = []
  
  try {
    // 使用 request 工具，baseURL 已经在 request.js 中配置好
    const res = await request.get('/development/listPage', {
      params: {
        pageNum: pageNum.value,
        pageSize: pageSize
      }
    })

    // 适配 request 拦截器返回的 res (即 response.data)
    if (res.code === 200) {
      const d = res.data || {}
      totalCount.value = d.total || 0
      
      const rawList = d.list || []
      updateList.value = rawList.map(item => ({
        time: item.createTime ? item.createTime.split(' ')[0] : '',
        content: item.content || '',
        images: Array.isArray(item.imgUrls) 
          ? item.imgUrls 
          : (item.imgUrls ? item.imgUrls.split(',') : [])
      }))
    }
  } catch (err) {
    console.error('获取更新记录失败：', err)
  } finally {
    isLoading.value = false
  }
}

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value || newPage === pageNum.value) return
  pageNum.value = newPage
  fetchUpdateList()
  nextTick(() => {
    const anchor = document.getElementById('dev-anchor')
    if (anchor) anchor.scrollIntoView({ behavior: 'smooth' })
  })
}
</script>

<style scoped>
.development-page {
  width: 90%;
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  font-size: 20px;
}

.page-title {
  font-size: 64px;
  color: #00c0e2;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 10px;
}

.repo-links {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: #00c0e2;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.repo-link {
  display: inline-block;
  margin: 8px 15px;
  padding: 10px 20px;
  background: #2f5496;
  color: rgb(220, 132, 132) !important;
  text-decoration: none;
  border-radius: 8px;
  font-size: 18px;
  transition: all 0.3s ease;
  max-width: 90%;
  word-break: break-all;
}

.repo-link:hover {
  background: #1d3b6f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(47, 84, 150, 0.3);
}

.repo-link .icon-github {
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  background: url("data:image/svg+xml,%3Csvg xmlns='https://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
  vertical-align: middle;
}

.update-item {
  background: #00c0e2;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  position: relative;
}

.item-time {
  position: absolute;
  top: 15px;
  left: 20px;
  font-size: 28px;
  font-weight: 900;
  color: #2f5496;
}

.item-content {
  margin-top: 40px;
  font-size: 22px;
  color: #333;
  line-height: 1.8;
  /* 移除 white-space: pre-line，让 markdown 处理换行 */
}

/* 覆盖 github-markdown-css，保持原有的字体和透明背景 */
.item-content.markdown-body {
  background: transparent !important;
  font-family: inherit !important;
  font-size: inherit !important;
  color: inherit !important;
}

/* 强制 markdown 内部的元素也继承颜色，防止变黑/变白 */
:deep(.markdown-body p) {
  margin-bottom: 16px;
  color: inherit;
}
:deep(.markdown-body a) {
  color: #2f5496;
  text-decoration: underline;
}

.item-image-wrap {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}
.item-image:hover {
  transform: scale(1.05);
}

.no-more-text {
  color: #999;
  font-size: 18px;
  margin-top: 20px;
  text-align: center;
}

/* ============ 分页器样式 ============ */
.pagination-box {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  margin-bottom: 40px;
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

/* ✅ 常规按钮 Hover 效果 */
.page-btn:hover:not(:disabled):not(.dots) {
  background-color: #00c0e2;
  color: #fff;
  border-color: #00c0e2;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 192, 226, 0.3);
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

/* ✅ 省略号样式：和普通按钮一样，但不可点击 */
.page-btn.dots {
  cursor: default;
  /* 继承了 page-btn 的 border 和 background，所以外观是小方格 */
}
.page-btn.dots:hover {
  background-color: #f0f7ff;
  color: #2f5496;
  border-color: #b3d8ff;
  transform: none;
  box-shadow: none;
}

/* ============ 图片弹窗样式 ============ */
.image-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  touch-action: none;
}

.image-modal-img {
  /* 修改：限制最大宽高为屏幕的 80% */
  max-width: 80vw;
  max-height: 80vh;
  object-fit: contain;
  transform-origin: center center;
  cursor: grab;
  user-select: none;
  -webkit-user-drag: none;
  will-change: transform;
}

.image-modal-img:active {
  cursor: grabbing;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 40px;
    letter-spacing: 6px;
  }
  .repo-link {
    font-size: 16px;
    padding: 8px 15px;
    margin: 6px 0;
    display: block;
  }
  .item-time {
    font-size: 24px;
  }
  .item-content {
    font-size: 20px;
  }
  .item-image {
    width: 100px;
    height: 100px;
  }
  .page-btn {
    min-width: 32px;
    height: 32px;
    font-size: 14px;
    border-radius: 8px;
    padding: 0 6px;
  }
}
</style>