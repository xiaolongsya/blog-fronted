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
                  :alt="`图片${groupIdx+1}-${idx+1}`" 
                  class="node-image"
                  @error="handleImageError"
                  @click="openImage(item.value)"
                >
              </div>
            </div>
          </div>
        </div>

        <div v-if="node.imgUrls && node.imgUrls.length > 0" class="node-bottom-images">
          <div class="bottom-img-title">附件图片</div>
          <div class="bottom-img-wrap">
            <img 
              v-for="(imgUrl, idx) in node.imgUrls" 
              :key="idx"
              :src="imgUrl" 
              :alt="`底部图片${idx+1}`" 
              class="node-image"
              @error="handleImageError"
              @click="openImage(imgUrl)"
            >
          </div>
        </div>
      </div>
    </div>

    <div v-if="showImageModal" class="image-modal-mask" @click="closeImageModal">
      <img 
        ref="imageRef"
        :src="currentImageUrl" 
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
import { useRouter, useRoute } from 'vue-router'

// ================= 路由与基础数据 =================
const router = useRouter()
const route = useRoute()

const categoryName = ref('分类详情')
const nodeList = ref([])

// ================= 图片查看器状态 =================
const showImageModal = ref(false)
const currentImageUrl = ref('')
const imageRef = ref(null)

// 视图变换状态 (非响应式变量，提升性能)
let state = {
  scale: 1,      // 当前缩放比例
  x: 0,          // 当前X轴偏移
  y: 0,          // 当前Y轴偏移
  isDragging: false,
  startX: 0,     // 拖拽起始鼠标X
  startY: 0,     // 拖拽起始鼠标Y
  lastX: 0,      // 拖拽起始时的图片X偏移
  lastY: 0       // 拖拽起始时的图片Y偏移
}

// 缓存尺寸信息，避免重复读取DOM
let dims = {
  imgW: 0,       // 图片原始渲染宽度
  imgH: 0,       // 图片原始渲染高度
  winW: 0,       // 窗口宽度
  winH: 0        // 窗口高度
}

// ================= 生命周期与数据加载 =================
onMounted(async () => {
  try {
    const categoryId = Number(route.params.id) || 0
    if (categoryId) await Promise.all([loadCategory(categoryId), loadNodes(categoryId)])
    // 监听窗口大小变化
    window.addEventListener('resize', updateDims)
  } catch (err) {
    console.log('页面加载失败:', err)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateDims)
})

const updateDims = () => {
  if (!showImageModal.value) return
  dims.winW = window.innerWidth
  dims.winH = window.innerHeight
}

// ================= 业务逻辑函数 =================
const goBack = () => {
  try { router.back() } catch (err) { router.push('/growth') }
}

const loadCategory = async (id) => {
  try {
    const res = await fetch(`https://xiaolongya.cn/blog/growth/${id}`)
    const data = await res.json()
    if (data.code === 200 && data.data?.name) categoryName.value = data.data.name
  } catch (err) {
    console.log('加载分类失败:', err)
  }
}

const loadNodes = async (id) => {
  try {
    const res = await fetch(`https://xiaolongya.cn/blog/node/list?growthId=${id}`)
    const data = await res.json()
    if (data.code === 200 && Array.isArray(data.data)) {
      const sortedNodes = data.data.sort((a, b) => {
        const tA = a.createTime ? new Date(a.createTime).getTime() : 0
        const tB = b.createTime ? new Date(b.createTime).getTime() : 0
        return tA - tB
      })
      nodeList.value = sortedNodes.map(item => ({
        ...item,
        mixContent: parseContent(item.content || ''),
        imgUrls: Array.isArray(item.imgUrls) ? item.imgUrls : []
      }))
    }
  } catch (err) {
    console.log('加载节点失败:', err)
  }
}

const parseContent = (content) => {
  if (!content) return []
  const result = []
  const parts = content.split(/\[IMAGE:([^\]]+)\]/)
  parts.forEach((part, idx) => {
    if (!part.trim()) return
    idx % 2 === 1 
      ? result.push({ type: 'image', value: part.trim() })
      : part.split('\n').forEach(line => line.trim() && result.push({ type: 'text', value: line }))
  })
  return result
}

const getContentGroups = (mixContent) => {
  if (!Array.isArray(mixContent) || mixContent.length === 0) return []
  const groups = []
  let curGroup = [mixContent[0]]
  for (let i = 1; i < mixContent.length; i++) {
    mixContent[i].type === curGroup[0].type ? curGroup.push(mixContent[i]) : (groups.push(curGroup), curGroup = [mixContent[i]])
  }
  groups.push(curGroup)
  return groups
}

const formatTime = (time) => {
  if (!time) return ''
  try {
    const d = new Date(time)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  } catch (err) { return '' }
}

const handleImageError = (e) => { e.target.style.display = 'none' }

// ================= 核心：图片查看器交互逻辑 =================

/**
 * 打开弹窗：初始化所有状态
 */
const openImage = (url) => {
  if (!url) return
  currentImageUrl.value = url
  showImageModal.value = true
  
  // 重置变换状态
  state = { scale: 1, x: 0, y: 0, isDragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 }
  
  nextTick(() => {
    if (!imageRef.value) return
    // 初始化尺寸缓存
    dims.winW = window.innerWidth
    dims.winH = window.innerHeight
    dims.imgW = imageRef.value.offsetWidth
    dims.imgH = imageRef.value.offsetHeight
    
    // 应用初始样式 (无动画)
    updateTransform(false)
  })
}

const closeImageModal = () => {
  showImageModal.value = false
  currentImageUrl.value = ''
}

/**
 * 统一应用样式变换
 * @param {boolean} animation 是否启用过渡动画（拖拽时禁用以保证跟手）
 */
const updateTransform = (animation = true) => {
  if (!imageRef.value) return
  
  // 拖拽时关闭动画，松手或缩放时开启动画
  imageRef.value.style.transition = animation ? 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)' : 'none'
  
  // 使用 translate3d 开启硬件加速
  // 核心：Translate 是基于屏幕坐标的，Scale 是基于中心点的
  imageRef.value.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`
}

/**
 * 计算边界限制（Clamp）
 * 规则：
 * 1. 图片比视窗小 -> 强制居中 (x=0, y=0)
 * 2. 图片比视窗大 -> 允许移动，但边缘不能露出视窗背景
 */
const clampPosition = () => {
  // 当前缩放后的实际尺寸
  const curW = dims.imgW * state.scale
  const curH = dims.imgH * state.scale
  
  // 计算X轴允许的最大偏移量
  // 偏移量 0 代表中心。最大正负偏移 = (图片宽 - 视窗宽) / 2
  if (curW <= dims.winW) {
    state.x = 0 // 居中
  } else {
    const maxX = (curW - dims.winW) / 2
    state.x = Math.max(-maxX, Math.min(maxX, state.x))
  }

  // 计算Y轴
  if (curH <= dims.winH) {
    state.y = 0
  } else {
    const maxY = (curH - dims.winH) / 2
    state.y = Math.max(-maxY, Math.min(maxY, state.y))
  }
}

/**
 * 滚轮缩放：以屏幕中心为锚点
 */
const handleWheel = (e) => {
  if (!imageRef.value) return
  
  // 计算缩放增量
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  let newScale = state.scale + delta
  
  // 限制缩放范围 (0.5倍 - 5倍)
  newScale = Math.max(0.5, Math.min(5, newScale))
  
  // 如果缩放比例没变，直接返回
  if (Math.abs(newScale - state.scale) < 0.01) return

  // 【核心算法】：保持中心点不变
  // 当图片放大 N 倍时，原有的偏移量也必须放大 N 倍，才能保持视野中心的内容不变
  const ratio = newScale / state.scale
  state.scale = newScale
  state.x *= ratio
  state.y *= ratio
  
  // 缩放结束后，进行边界修正（防止缩小后出现黑边）
  clampPosition()
  
  updateTransform(true)
}

/**
 * 拖拽开始
 */
const handleDragStart = (e) => {
  // 仅在左键点击或触摸时触发
  if (e.type === 'mousedown' && e.button !== 0) return
  e.preventDefault() // 防止默认拖拽图片行为
  
  state.isDragging = true
  const point = e.touches ? e.touches[0] : e
  state.startX = point.clientX
  state.startY = point.clientY
  state.lastX = state.x
  state.lastY = state.y
  
  // 拖拽开始，关闭动画，提升跟手度
  if (imageRef.value) imageRef.value.style.transition = 'none'
}

/**
 * 拖拽移动
 */
const handleDragMove = (e) => {
  if (!state.isDragging) return
  e.preventDefault() // 防止页面滚动
  
  const point = e.touches ? e.touches[0] : e
  const deltaX = point.clientX - state.startX
  const deltaY = point.clientY - state.startY
  
  // 更新位置 = 初始位置 + 移动距离
  state.x = state.lastX + deltaX
  state.y = state.lastY + deltaY
  
  // 拖拽过程中【不】强制限制边界，允许用户稍微拖出界（阻尼感），松手再弹回
  updateTransform(false)
}

/**
 * 拖拽结束
 */
const handleDragEnd = () => {
  if (!state.isDragging) return
  state.isDragging = false
  
  // 松手时，计算边界并弹回
  clampPosition()
  updateTransform(true)
}

</script>

<style scoped>
.category-detail-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  font-size: 20px;
}

.back-button-section {
  margin-bottom: 20px;
}

.back-btn {
  background: rgb(102, 139, 197);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.4rem;
  transition: background 0.2s ease;
}

.back-btn:hover {
  background: #4a7cb8;
}

.category-header {
  text-align: center;
  margin-bottom: 30px;
}

.category-title {
  font-size: 4rem;
  color: #00c0e2;
  margin: 0;
  font-weight: bold;
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.node-card {
  background: rgb(102, 139, 197);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #033ab1;
  width: 100%;
  box-sizing: border-box;
}

.node-time-label {
  font-size: 1.2rem;
  color: #2f5496;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-weight: bold;
  border-bottom: 1px solid #2f549633;
}

/* 图文混排样式 */
.node-mix-content {
  line-height: 1.8;
  width: 100%;
  margin-bottom: 20px;
}
.content-group {
  margin-bottom: 12px;
}
.group-text .mix-text {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}
.group-image .mix-img-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.mix-img-wrap {
  flex: 0 0 auto;
}

/* 底部图片区域 */
.node-bottom-images {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #2f549666;
}
.bottom-img-title {
  font-size: 1.1rem;
  color: #2f5496;
  margin-bottom: 10px;
  font-weight: 500;
}
.bottom-img-wrap {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 缩略图样式 */
.node-image {
  width: 140px;
  height: 105px;
  object-fit: contain;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.node-image:hover {
  transform: scale(1.05);
}

/* ============ 图片弹窗样式 ============ */
.image-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.9); /* 深色背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
  touch-action: none; /* 禁止iOS默认触摸行为 */
}

.image-modal-img {
  /* 移除 max-width 等限制，尺寸完全由JS控制以保证缩放逻辑正确 */
  /* 设置最大视口限制，防止初始加载过大，但允许缩放突破 */
  max-width: 100%; 
  max-height: 100%;
  
  object-fit: contain;
  
  /* 关键：设置变换原点为中心，配合JS的translate计算 */
  transform-origin: center center;
  
  cursor: grab;
  user-select: none;
  -webkit-user-drag: none;
  
  /* 开启硬件加速 */
  will-change: transform;
}

.image-modal-img:active {
  cursor: grabbing;
}

@media (max-width: 768px) {
  .category-detail-page {
    padding: 15px;
  }
  .category-title {
    font-size: 2.2rem;
  }
  .node-card {
    padding: 15px;
  }
  .node-time-label {
    font-size: 1.1rem;
  }
  .group-text .mix-text {
    font-size: 1.1rem;
  }
  .node-image {
    width: 120px;
    height: 90px;
  }
  .group-image .mix-img-group {
    gap: 8px;
  }
}
</style>