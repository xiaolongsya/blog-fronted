<template>
  <div class="category-detail-page">
    <div class="back-button-section">
      <button class="back-btn" @click="goBack">
        ← 返回成长历程
      </button>
    </div>

    <div class="category-header">
      <h1 class="category-title">{{ categoryName }}</h1>
    </div>

    <div class="nodes-list">
      <div 
        v-for="node in nodeList" 
        :key="node.id"
        class="node-card"
      >
        <div class="node-time-label">
          {{ formatTime(node.createTime) }}
        </div>

        <div class="node-mix-content">
          <div 
            v-for="(group, groupIdx) in getContentGroups(node.mixContent)" 
            :key="groupIdx"
            :class="['content-group', `group-${group[0].type}`]"
          >
            <p v-if="group[0].type === 'text'" class="mix-text">
              {{ group.map(item => item.value).join('\n') }}
            </p>
            <div v-else-if="group[0].type === 'image'" class="mix-img-group">
              <div 
                v-for="(item, idx) in group" 
                :key="idx"
                class="mix-img-wrap"
              >
                <img 
                  :src="item.value" 
                  class="mix-img" 
                  @click="showBigImage(item.value)"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const categoryId = route.query.id
const categoryName = ref(route.query.name || '分类详情')
const nodeList = ref([])
const bigImageUrl = ref('')

// ================= 图片查看器核心逻辑 =================
const modalImageRef = ref(null)

// 状态管理
let state = { 
  scale: 1, 
  x: 0, 
  y: 0, 
  isDragging: false, 
  isPinching: false,
  startX: 0, 
  startY: 0, 
  lastX: 0, 
  lastY: 0,
  startDist: 0,
  startScale: 1
}

let dims = { imgW: 0, imgH: 0, winW: 0, winH: 0 }

const updateDims = () => {
  if (!bigImageUrl.value) return
  dims.winW = window.innerWidth
  dims.winH = window.innerHeight
}

onMounted(() => {
  if (categoryId) {
    fetchNodes()
  }
  window.addEventListener('resize', updateDims)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDims)
})

const showBigImage = (url) => {
  if (!url) return
  bigImageUrl.value = url
  // 重置状态
  state = { 
    scale: 1, x: 0, y: 0, 
    isDragging: false, isPinching: false,
    startX: 0, startY: 0, lastX: 0, lastY: 0,
    startDist: 0, startScale: 1
  }
  
  nextTick(() => {
    if (!modalImageRef.value) return
    dims.winW = window.innerWidth
    dims.winH = window.innerHeight
    dims.imgW = modalImageRef.value.offsetWidth
    dims.imgH = modalImageRef.value.offsetHeight
    updateTransform(false)
  })
}

const closeBigImage = () => {
  bigImageUrl.value = ''
}

const updateTransform = (animation = true) => {
  if (!modalImageRef.value) return
  modalImageRef.value.style.transition = animation ? 'transform 0.1s linear' : 'none'
  modalImageRef.value.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`
}

// ----------------- PC端鼠标事件 -----------------
const handleWheel = (e) => {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  let newScale = state.scale + delta
  newScale = Math.max(0.5, Math.min(5, newScale))
  if (Math.abs(newScale - state.scale) < 0.01) return

  const ratio = newScale / state.scale
  state.scale = newScale
  state.x *= ratio
  state.y *= ratio

  clampPosition()
  updateTransform(true)
}

const handleMouseDown = (e) => {
  if (e.button !== 0) return
  e.preventDefault()
  state.isDragging = true
  state.startX = e.clientX
  state.startY = e.clientY
  state.lastX = state.x
  state.lastY = state.y
  if (modalImageRef.value) modalImageRef.value.style.transition = 'none'
}

const handleMouseMove = (e) => {
  if (!state.isDragging) return
  e.preventDefault()
  const deltaX = e.clientX - state.startX
  const deltaY = e.clientY - state.startY
  state.x = state.lastX + deltaX
  state.y = state.lastY + deltaY
  updateTransform(false)
}

const handleMouseUp = () => {
  if (!state.isDragging) return
  state.isDragging = false
  clampPosition()
  updateTransform(true)
}

// ----------------- 移动端触摸事件 (核心修改) -----------------
const getDistance = (touches) => {
  return Math.hypot(
    touches[0].clientX - touches[1].clientX,
    touches[0].clientY - touches[1].clientY
  )
}

const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    state.isPinching = true
    state.isDragging = false
    state.startDist = getDistance(e.touches)
    state.startScale = state.scale
  } else if (e.touches.length === 1) {
    state.isDragging = true
    state.isPinching = false
    state.startX = e.touches[0].clientX
    state.startY = e.touches[0].clientY
    state.lastX = state.x
    state.lastY = state.y
  }
  if (modalImageRef.value) modalImageRef.value.style.transition = 'none'
}

const handleTouchMove = (e) => {
  e.preventDefault()
  
  if (state.isPinching && e.touches.length === 2) {
    const curDist = getDistance(e.touches)
    if (state.startDist > 0) {
      const scaleRatio = curDist / state.startDist
      let newScale = state.startScale * scaleRatio
      newScale = Math.max(0.5, Math.min(5, newScale))
      
      const ratio = newScale / state.scale
      state.scale = newScale
      state.x *= ratio
      state.y *= ratio
      
      updateTransform(false)
    }
  } else if (state.isDragging && e.touches.length === 1 && !state.isPinching) {
    const deltaX = e.touches[0].clientX - state.startX
    const deltaY = e.touches[0].clientY - state.startY
    state.x = state.lastX + deltaX
    state.y = state.lastY + deltaY
    updateTransform(false)
  }
}

const handleTouchEnd = (e) => {
  if (e.touches.length === 0) {
    state.isDragging = false
    state.isPinching = false
    clampPosition()
    updateTransform(true)
  } else if (e.touches.length === 1) {
    state.isPinching = false
    state.isDragging = true
    state.startX = e.touches[0].clientX
    state.startY = e.touches[0].clientY
    state.lastX = state.x
    state.lastY = state.y
  }
}

const clampPosition = () => {
  const curW = dims.imgW * state.scale
  const curH = dims.imgH * state.scale
  
  if (curW <= dims.winW) {
    state.x = 0
  } else {
    const maxX = (curW - dims.winW) / 2
    state.x = Math.max(-maxX, Math.min(maxX, state.x))
  }
  
  if (curH <= dims.winH) {
    state.y = 0
  } else {
    const maxY = (curH - dims.winH) / 2
    state.y = Math.max(-maxY, Math.min(maxY, state.y))
  }
}

// ================= 原有业务逻辑 =================
const fetchNodes = async () => {
  try {
    const res = await axios.get(`https://xiaolongya.cn/blog/node/list?growthId=${categoryId}`)
    if (res.data.code === 200) {
      const data = res.data.data || []
      
      // 预处理内容：解析混合排版
      nodeList.value = data.map(node => {
        return {
          ...node,
          mixContent: parseMixContent(node.content, node.imgUrls)
        }
      })
    }
  } catch (err) {
    console.error('获取节点失败', err)
  }
}

const parseMixContent = (content, imgUrls) => {
  let images = []
  if (Array.isArray(imgUrls)) {
    images = [...imgUrls]
  } else if (imgUrls) {
    images = imgUrls.split(',')
  }

  const result = []
  const regex = /\[IMAGE:(.+?)\]/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(content)) !== null) {
    const textPart = content.substring(lastIndex, match.index)
    if (textPart.trim()) {
      result.push({ type: 'text', value: textPart.trim() })
    }
    result.push({ type: 'image', value: match[1] })
    lastIndex = regex.lastIndex
  }
  const remainingText = content.substring(lastIndex)
  if (remainingText.trim()) {
    result.push({ type: 'text', value: remainingText.trim() })
  }

  images.forEach(url => {
    const exists = result.find(item => item.type === 'image' && item.value === url)
    if (!exists) {
      result.push({ type: 'image', value: url })
    }
  })

  return result
}

const getContentGroups = (mixContent) => {
  if (!mixContent || mixContent.length === 0) return []
  const groups = []
  let currentGroup = []
  
  mixContent.forEach((item, index) => {
    if (index === 0) {
      currentGroup.push(item)
    } else {
      const prevType = mixContent[index - 1].type
      if (item.type === prevType) {
        currentGroup.push(item)
      } else {
        groups.push([...currentGroup])
        currentGroup = [item]
      }
    }
  })
  if (currentGroup.length > 0) {
    groups.push(currentGroup)
  }
  return groups
}

const goBack = () => {
  router.back()
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.split(' ')[0]
}
</script>

<style scoped>
/* 原有样式保持不变 */
.category-detail-page {
  width: 90%;
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  min-height: 100vh;
}

.back-button-section {
  margin-bottom: 20px;
}

.back-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.back-btn:hover {
  background: #5a6268;
}

.category-header {
  text-align: center;
  margin-bottom: 40px;
}

.category-title {
  font-size: 3rem;
  color: #2f5496;
  margin: 0;
  font-weight: bold;
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.node-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border: 1px solid #e8e8e8;
  position: relative;
}

.node-time-label {
  position: absolute;
  top: 15px;
  right: 20px;
  background: #e6f7ff;
  color: #2f5496;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: bold;
}

.node-mix-content {
  margin-top: 10px;
  font-size: 1.2rem;
  color: #333;
  line-height: 1.8;
}

.mix-text {
  white-space: pre-wrap;
  margin-bottom: 15px;
}

.mix-img-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.mix-img-wrap {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #eee;
}

.mix-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.mix-img:hover {
  transform: scale(1.05);
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
  touch-action: none; /* 禁止默认触摸行为 */
}

.image-modal-img {
  max-width: 100%;
  max-height: 100%;
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
  .category-title {
    font-size: 2rem;
  }
  .node-card {
    padding: 15px;
  }
  .node-mix-content {
    font-size: 1rem;
  }
  .mix-img-wrap {
    width: 90px;
    height: 90px;
  }
}
</style>