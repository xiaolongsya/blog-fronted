<template>
  <div class="development-page">
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

    <div class="update-item" v-for="(item, idx) in updateList" :key="idx">
      <div class="item-time">{{ item.time }}</div>
      <div class="item-content" v-html="formatContent(item.content)"></div>
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

    <div class="load-more-wrap">
      <button 
        v-if="hasMore" 
        class="load-more-btn" 
        @click="loadMore" 
        :disabled="isLoading"
      >
        {{ isLoading ? '加载中...' : '查看更多' }}
      </button>
      <p v-else class="no-more-text">—— 到底啦，没有更多记录了 ——</p>
    </div>

    <div class="image-modal-mask" v-if="bigImageUrl" @click="closeBigImage">
      <img 
        ref="modalImageRef"
        :src="bigImageUrl" 
        class="image-modal-img" 
        @click.stop
        @wheel.prevent="handleWheel"
        @mousedown="handleDragStart"
        @mousemove="handleDragMove"
        @mouseup="handleDragEnd"
        @mouseleave="handleDragEnd"
        @touchstart="handleDragStart"
        @touchmove="handleDragMove"
        @touchend="handleDragEnd"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const updateList = ref([])
const bigImageUrl = ref('')

// 分页相关变量
const pageNum = ref(1)
const pageSize = 5
const hasMore = ref(true)
const isLoading = ref(false)

// ================= 图片查看器核心逻辑 (从 CategoryDetail 迁移) =================
const modalImageRef = ref(null)
// 状态管理：缩放比例、位移XY、拖拽状态、起始坐标、上一帧坐标
let state = { scale: 1, x: 0, y: 0, isDragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 }
// 尺寸记录：图片宽高、窗口宽高
let dims = { imgW: 0, imgH: 0, winW: 0, winH: 0 }

// 监听窗口大小变化
const updateDims = () => {
  if (!bigImageUrl.value) return
  dims.winW = window.innerWidth
  dims.winH = window.innerHeight
}

onMounted(() => {
  fetchUpdateList() // 初始加载列表
  window.addEventListener('resize', updateDims)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDims)
})

// 打开图片
const showBigImage = (url) => {
  if (!url) return
  bigImageUrl.value = url
  // 重置状态
  state = { scale: 1, x: 0, y: 0, isDragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 }
  
  nextTick(() => {
    if (!modalImageRef.value) return
    // 初始化尺寸
    dims.winW = window.innerWidth
    dims.winH = window.innerHeight
    dims.imgW = modalImageRef.value.offsetWidth
    dims.imgH = modalImageRef.value.offsetHeight
    updateTransform(false)
  })
}

// 关闭图片
const closeBigImage = () => {
  bigImageUrl.value = ''
}

// 更新 CSS Transform
const updateTransform = (animation = true) => {
  if (!modalImageRef.value) return
  // 拖拽时关闭过渡动画，提升跟手性；释放后开启，提升平滑度
  modalImageRef.value.style.transition = animation ? 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)' : 'none'
  modalImageRef.value.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`
}

// 滚轮缩放
const handleWheel = (e) => {
  if (!modalImageRef.value) return
  // 滚轮向上(deltaY<0)放大，向下缩小
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  let newScale = state.scale + delta
  // 限制缩放范围 [0.5, 5]
  newScale = Math.max(0.5, Math.min(5, newScale))
  
  if (Math.abs(newScale - state.scale) < 0.01) return

  // 计算缩放比例，用于修正位置（让图片中心相对稳定）
  const ratio = newScale / state.scale
  state.scale = newScale
  state.x *= ratio
  state.y *= ratio

  // 边界检查
  clampPosition()
  updateTransform(true)
}

// 拖拽开始 (兼容鼠标和触摸)
const handleDragStart = (e) => {
  // 如果是鼠标右键，忽略
  if (e.type === 'mousedown' && e.button !== 0) return
  e.preventDefault()
  
  state.isDragging = true
  const point = e.touches ? e.touches[0] : e
  state.startX = point.clientX
  state.startY = point.clientY
  state.lastX = state.x
  state.lastY = state.y
  
  // 拖拽开始时移除过渡，避免延迟
  if (modalImageRef.value) modalImageRef.value.style.transition = 'none'
}

// 拖拽移动
const handleDragMove = (e) => {
  if (!state.isDragging) return
  e.preventDefault() // 防止触发原生滚动
  
  const point = e.touches ? e.touches[0] : e
  const deltaX = point.clientX - state.startX
  const deltaY = point.clientY - state.startY
  
  state.x = state.lastX + deltaX
  state.y = state.lastY + deltaY
  
  updateTransform(false)
}

// 拖拽结束
const handleDragEnd = () => {
  if (!state.isDragging) return
  state.isDragging = false
  // 结束后进行边界修正
  clampPosition()
  updateTransform(true)
}

// 边界限制辅助函数：防止图片移出视野太远
const clampPosition = () => {
  const curW = dims.imgW * state.scale
  const curH = dims.imgH * state.scale
  
  // 水平方向
  if (curW <= dims.winW) {
    state.x = 0
  } else {
    const maxX = (curW - dims.winW) / 2
    state.x = Math.max(-maxX, Math.min(maxX, state.x))
  }
  
  // 垂直方向
  if (curH <= dims.winH) {
    state.y = 0
  } else {
    const maxY = (curH - dims.winH) / 2
    state.y = Math.max(-maxY, Math.min(maxY, state.y))
  }
}

// ================= 原有业务逻辑 =================

// 格式化内容
const formatContent = (content) => {
  if (!content) return ''
  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
  return escapeHtml(content).replace(/\n/g, '<br>')
}

// 获取列表
const fetchUpdateList = async () => {
  if (isLoading.value) return 
  isLoading.value = true
  try {
    const url = `https://xiaolongya.cn/blog/development/listPage?pageNum=${pageNum.value}&pageSize=${pageSize}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Status: ${res.status}`)
    const result = await res.json()

    if (result.code === 200) {
      const newData = result.data || []
      const processedData = newData.map(item => ({
        time: item.createTime ? item.createTime.split(' ')[0] : '',
        content: item.content || '',
        images: Array.isArray(item.imgUrls) 
          ? item.imgUrls 
          : (item.imgUrls ? item.imgUrls.split(',') : [])
      }))

      updateList.value = [...updateList.value, ...processedData]

      if (newData.length < pageSize) {
        hasMore.value = false 
      } else {
        pageNum.value++ 
      }
    } else {
      console.error(result.msg)
    }
  } catch (err) {
    console.error('获取更新记录失败：', err)
  } finally {
    isLoading.value = false
  }
}

const loadMore = () => {
  fetchUpdateList()
}
</script>

<style scoped>
/* 原有样式保持不变 */
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
  white-space: pre-line;
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

.load-more-wrap {
  text-align: center;
  margin-top: 40px;
  margin-bottom: 40px;
}

.load-more-btn {
  background-color: #00c0e2;
  color: #fff;
  border: none;
  padding: 12px 40px;
  font-size: 20px;
  border-radius: 30px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  font-weight: bold;
}

.load-more-btn:hover:not(:disabled) {
  background-color: #00a0be;
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(0,0,0,0.15);
}

.load-more-btn:disabled {
  background-color: #9cddec;
  cursor: not-allowed;
  transform: none;
}

.no-more-text {
  color: #999;
  font-size: 18px;
  margin-top: 20px;
}

/* ============ 核心修改：图片弹窗样式 ============ */
.image-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9); /* 加深背景颜色，突出主体 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  touch-action: none; /* 禁止默认触摸行为 */
}

.image-modal-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transform-origin: center center;
  cursor: grab; /* 鼠标手势 */
  user-select: none;
  -webkit-user-drag: none;
  will-change: transform; /* 性能优化 */
}

.image-modal-img:active {
  cursor: grabbing; /* 拖拽时手势 */
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
  .load-more-btn {
    width: 80%;
    padding: 12px 0;
  }
}
</style>