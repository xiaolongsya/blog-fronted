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

    <div class="load-more-wrap">
      <button 
        v-if="hasMore" 
        class="load-more-btn" 
        @click="loadMore" 
        :disabled="isLoading"
      >
        {{ isLoading ? '加载中...' : '查看更多' }}
      </button>
      <p v-else-if="nodeList.length > 0" class="no-more-text">—— 到底啦，没有更多记录了 ——</p>
      <p v-else class="no-more-text">暂无数据</p>
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

// ================= 分页与筛选相关变量 =================
const pageNum = ref(1)
const pageSize = 5
const hasMore = ref(true)
const isLoading = ref(false)
// 新增：用于存储当前分类的ID，对应接口的 growthId
const currentGrowthId = ref(0) 

// ================= 图片查看器状态 (保持不变) =================
const showImageModal = ref(false)
const currentImageUrl = ref('')
const imageRef = ref(null)
let state = { scale: 1, x: 0, y: 0, isDragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 }
let dims = { imgW: 0, imgH: 0, winW: 0, winH: 0 }

// ================= 生命周期与数据加载 =================
onMounted(async () => {
  try {
    // 1. 从路由参数获取 ID (例如 /growth/12 -> id=12)
    const categoryId = Number(route.params.id) || 0
    
    if (categoryId) {
      // 2. 存入 currentGrowthId，后续请求都要用它
      currentGrowthId.value = categoryId
      
      // 并行加载：分类详情信息 + 该分类下的节点列表
      await Promise.all([loadCategory(categoryId), loadNodes()])
    } else {
      console.error("未获取到有效的分类ID")
    }
    
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

// 加载分类的基本信息（标题等）
const loadCategory = async (id) => {
  try {
    const res = await fetch(`https://xiaolongya.cn/blog/growth/${id}`)
    const data = await res.json()
    if (data.code === 200 && data.data?.name) {
      categoryName.value = data.data.name
    }
  } catch (err) {
    console.log('加载分类失败:', err)
  }
}

// 核心修复：加载节点列表（带上 growthId）
const loadNodes = async () => {
  // 防止重复请求
  if (isLoading.value) return
  isLoading.value = true

  try {
    // 构造URL：拼接 growthId, pageNum, pageSize
    // 注意：这里使用了 currentGrowthId.value
    const url = `https://xiaolongya.cn/blog/node/listPage?growthId=${currentGrowthId.value}&pageNum=${pageNum.value}&pageSize=${pageSize}`
    
    const res = await fetch(url)
    
    if (!res.ok) throw new Error(`网络请求失败: ${res.status}`)
    
    const result = await res.json()

    if (result.code === 200) {
      // 兼容后端可能直接返回数组，或返回分页对象(data.records)的情况
      // 根据你的截图，如果使用了分页插件，数据通常在 result.data.records 或 result.data 中
      // 这里做个兼容判断：
      let listData = []
      if (Array.isArray(result.data)) {
        listData = result.data
      } else if (result.data && Array.isArray(result.data.records)) {
        listData = result.data.records
      }

      // 按时间正序排序 (旧 -> 新)
      const sortedChunk = listData.sort((a, b) => {
        const tA = a.createTime ? new Date(a.createTime).getTime() : 0
        const tB = b.createTime ? new Date(b.createTime).getTime() : 0
        return tA - tB
      })

      // 解析内容（处理 [IMAGE:...] 标签）
      const processedNodes = sortedChunk.map(item => ({
        ...item,
        mixContent: parseContent(item.content || ''),
        imgUrls: Array.isArray(item.imgUrls) ? item.imgUrls : []
      }))

      // 追加数据（而不是覆盖）
      nodeList.value = [...nodeList.value, ...processedNodes]

      // 判断是否还有更多数据
      if (listData.length < pageSize) {
        hasMore.value = false
      } else {
        pageNum.value++
      }
    } else {
       console.error(`获取节点失败: ${result.msg}`)
    }
  } catch (err) {
    console.error('加载节点出错:', err)
  } finally {
    isLoading.value = false
  }
}

// 点击加载更多
const loadMore = () => {
  loadNodes()
}

// ... (parseContent, getContentGroups, formatTime 等辅助函数保持不变) ...
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

// ================= 图片查看器交互逻辑 (保持不变) =================
const openImage = (url) => {
  if (!url) return
  currentImageUrl.value = url
  showImageModal.value = true
  state = { scale: 1, x: 0, y: 0, isDragging: false, startX: 0, startY: 0, lastX: 0, lastY: 0 }
  nextTick(() => {
    if (!imageRef.value) return
    dims.winW = window.innerWidth
    dims.winH = window.innerHeight
    dims.imgW = imageRef.value.offsetWidth
    dims.imgH = imageRef.value.offsetHeight
    updateTransform(false)
  })
}

const closeImageModal = () => {
  showImageModal.value = false
  currentImageUrl.value = ''
}

const updateTransform = (animation = true) => {
  if (!imageRef.value) return
  imageRef.value.style.transition = animation ? 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)' : 'none'
  imageRef.value.style.transform = `translate3d(${state.x}px, ${state.y}px, 0) scale(${state.scale})`
}

const handleWheel = (e) => {
  if (!imageRef.value) return
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  let newScale = state.scale + delta
  newScale = Math.max(0.5, Math.min(5, newScale))
  if (Math.abs(newScale - state.scale) < 0.01) return
  const ratio = newScale / state.scale
  state.scale = newScale
  state.x *= ratio
  state.y *= ratio
  // clampPosition逻辑省略，保持原有即可
  const curW = dims.imgW * state.scale
  const curH = dims.imgH * state.scale
  if (curW <= dims.winW) state.x = 0
  else { const maxX = (curW - dims.winW) / 2; state.x = Math.max(-maxX, Math.min(maxX, state.x)) }
  if (curH <= dims.winH) state.y = 0
  else { const maxY = (curH - dims.winH) / 2; state.y = Math.max(-maxY, Math.min(maxY, state.y)) }
  updateTransform(true)
}
// 拖拽相关逻辑保持不变...
const handleDragStart = (e) => {
  if (e.type === 'mousedown' && e.button !== 0) return
  e.preventDefault()
  state.isDragging = true
  const point = e.touches ? e.touches[0] : e
  state.startX = point.clientX
  state.startY = point.clientY
  state.lastX = state.x
  state.lastY = state.y
  if (imageRef.value) imageRef.value.style.transition = 'none'
}
const handleDragMove = (e) => {
  if (!state.isDragging) return
  e.preventDefault()
  const point = e.touches ? e.touches[0] : e
  const deltaX = point.clientX - state.startX
  const deltaY = point.clientY - state.startY
  state.x = state.lastX + deltaX
  state.y = state.lastY + deltaY
  updateTransform(false)
}
const handleDragEnd = () => {
  if (!state.isDragging) return
  state.isDragging = false
  const curW = dims.imgW * state.scale
  const curH = dims.imgH * state.scale
  if (curW <= dims.winW) state.x = 0
  else { const maxX = (curW - dims.winW) / 2; state.x = Math.max(-maxX, Math.min(maxX, state.x)) }
  if (curH <= dims.winH) state.y = 0
  else { const maxY = (curH - dims.winH) / 2; state.y = Math.max(-maxY, Math.min(maxY, state.y)) }
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

/* --- 新增：加载更多按钮样式 --- */
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
  
  /* 移动端加载按钮适配 */
  .load-more-btn {
    width: 80%;
    padding: 12px 0;
  }
}
</style>