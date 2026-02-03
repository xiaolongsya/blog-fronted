<template>
  <div class="category-detail-page">
    <!-- 返回按钮 -->
    <div class="back-button-section">
      <button class="back-btn" @click="router.back()">
        ← 返回成长历程
      </button>
    </div>

    <!-- 分类标题 -->
    <div class="category-header">
      <h1 class="category-title">{{ category?.name || '分类详情' }}</h1>
    </div>

    <!-- 节点列表 -->
    <div class="nodes-list">
      <div 
        v-for="node in nodes" 
        :key="node.id"
        class="node-card"
      >
        <!-- 时间标签 -->
        <div class="node-time-label">
          {{ formatTime(node.createTime) }}
        </div>

        <!-- 文字内容 -->
        <div class="node-content">
          <div class="node-text">{{ node.content }}</div>
        </div>

        <!-- 图片区域 -->
        <div class="node-images">
          <img 
            v-for="(imgUrl, index) in node.imgUrls" 
            :key="index"
            :src="imgUrl" 
            :alt="`图片${index + 1}`" 
            class="node-image"
            @error="handleImageError"
            @click="showBigImage(imgUrl)"
          >
        </div>
      </div>
    </div>

    <!-- 图片放大弹窗（添加ref和触摸事件） -->
    <div class="image-modal-mask" v-if="bigImageUrl" @click="closeBigImage">
      <img 
        ref="modalImageRef"
        :src="bigImageUrl" 
        class="image-modal-img" 
        @click.stop
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 初始化路由实例
const router = useRouter()
const route = useRoute()

// 定义响应式数据
const category = ref(null)
const nodes = ref([])
const bigImageUrl = ref('') // 大图URL

// 新增：图片缩放拖拽相关变量
const modalImageRef = ref(null) // 大图DOM引用
const scale = ref(1) // 缩放比例
const lastDistance = ref(0) // 上一次双指距离
const startPos = ref({ x: 0, y: 0 }) // 拖拽起始位置
const translatePos = ref({ x: 0, y: 0 }) // 图片偏移位置

// 页面加载时执行
onMounted(async () => {
  const categoryId = parseInt(route.params.id)
  await loadCategoryData(categoryId)
  await loadNodes(categoryId)
})

// 加载分类信息（适配Result封装）
const loadCategoryData = async (categoryId) => {
  try {
    const res = await fetch(`https://xiaolongya.cn/blog/growth/${categoryId}`)
    if (!res.ok) throw new Error('加载分类失败，HTTP状态码：' + res.status)
    
    const result = await res.json() // 先获取完整的Result对象
    // 1. 验证接口响应是否成功（默认code=200为成功，可根据后端调整）
    if (result.code !== 200) {
      throw new Error('加载分类失败：' + (result.msg || '未知错误'))
    }
    // 2. 提取Result中的核心数据data，赋值给category
    category.value = result.data || null
  } catch (error) {
    console.error('加载分类信息失败:', error)
  }
}

// 加载节点列表（适配Result封装，修复imgUrls数组处理问题）
const loadNodes = async (categoryId) => {
  try {
    const res = await fetch(`https://xiaolongya.cn/blog/node/list?growthId=${categoryId}`)
    if (!res.ok) throw new Error('加载节点失败，HTTP状态码：' + res.status)
    
    const result = await res.json() // 先获取完整的Result对象
    // 1. 验证接口响应是否成功
    if (result.code !== 200) {
      throw new Error('加载节点失败：' + (result.msg || '未知错误'))
    }
    // 2. 提取Result中的核心数据data（节点数组）
    const originalNodes = result.data || []
    
    // 3. 修复关键问题：imgUrls已经是数组，无需split，直接复用
    // 移除多余的split(',')，保留容错处理即可
    nodes.value = originalNodes.map(item => ({
      ...item,
      // 直接使用item.imgUrls，默认值设为空数组（避免null/undefined）
      imgUrls: item.imgUrls || []
    }))
  } catch (error) {
    console.error('加载节点失败:', error)
  }
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 图片加载失败处理
const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// 新增：触摸开始（双指初始距离/单指起始位置）
const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    // 双指：计算初始距离
    const x1 = e.touches[0].clientX
    const y1 = e.touches[0].clientY
    const x2 = e.touches[1].clientX
    const y2 = e.touches[1].clientY
    lastDistance.value = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  } else if (e.touches.length === 1) {
    // 单指：记录拖拽起始位置
    startPos.value = {
      x: e.touches[0].clientX - translatePos.value.x,
      y: e.touches[0].clientY - translatePos.value.y
    }
  }
}

// 新增：触摸移动（双指缩放/单指拖拽）
const handleTouchMove = (e) => {
  e.preventDefault() // 阻止页面滚动穿透
  const imageDom = modalImageRef.value
  if (!imageDom) return

  if (e.touches.length === 2) {
    // 双指缩放
    const x1 = e.touches[0].clientX
    const y1 = e.touches[0].clientY
    const x2 = e.touches[1].clientX
    const y2 = e.touches[1].clientY
    const currentDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

    // 计算缩放增量，限制1~5倍缩放
    const scaleDelta = currentDistance / lastDistance.value
    scale.value = Math.max(1, Math.min(5, scale.value * scaleDelta))
    lastDistance.value = currentDistance

    // 应用缩放+拖拽样式
    imageDom.style.transform = `scale(${scale.value}) translate(${translatePos.value.x}px, ${translatePos.value.y}px)`
  } else if (e.touches.length === 1 && scale.value > 1) {
    // 单指拖拽（仅缩放后可用）
    translatePos.value = {
      x: e.touches[0].clientX - startPos.value.x,
      y: e.touches[0].clientY - startPos.value.y
    }

    // 应用缩放+拖拽样式
    imageDom.style.transform = `scale(${scale.value}) translate(${translatePos.value.x}px, ${translatePos.value.y}px)`
  }
}

// 新增：触摸结束（重置临时变量）
const handleTouchEnd = () => {
  lastDistance.value = 0
}

// 图片点击放大（重置缩放和拖拽状态）
const showBigImage = (url) => {
  bigImageUrl.value = url
  // 重置缩放和拖拽
  scale.value = 1
  translatePos.value = { x: 0, y: 0 }
  if (modalImageRef.value) {
    modalImageRef.value.style.transform = 'scale(1) translate(0, 0)'
  }
}

// 关闭大图弹窗
const closeBigImage = () => {
  bigImageUrl.value = ''
}
</script>

<style scoped>
.category-detail-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  font-size: 20px; /* 全局字体加大 */
  /* 已删除浅蓝色背景属性，页面恢复默认背景（通常为白色） */
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
  font-size: 1.1rem; /* 按钮文字加大 */
}

.back-btn:hover {
  background: #5a6268;
}

.category-header {
  text-align: center;
  margin-bottom: 30px;
}

.category-title {
  font-size: 2.8rem; /* 标题字体加大 */
  color: #2f5496;
  margin: 0;
  font-weight: bold;
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 核心修改：节点卡片统一长方形 */
.node-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #e8e8e8;
  width: 100%;
  /* 固定卡片高度，保证所有节点大小一致 */
  height: 360px; /* 卡片高度加大 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.node-time-label {
  font-size: 1.2rem; /* 时间标签字体加大 */
  color: #2f5496;
  background: transparent;
  padding: 0 0 10px 0;
  border-radius: 0;
  display: inline-block;
  margin-bottom: 10px;
  font-weight: bold;
  border-bottom: 0;
}

.node-content {
  flex: 1;
  margin-bottom: 15px;
  line-height: 1.8; /* 行高加大 */
  overflow: hidden;
}

.node-text {
  font-size: 1.2rem; /* 内容文字加大 */
  color: #333;
  white-space: pre-wrap;
  max-width: 100%;
  word-break: break-word;
}

.node-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
  align-self: flex-start;
}

/* 小图完整显示 */
.node-image {
  width: 140px; /* 图片宽度加大 */
  height: 105px; /* 图片高度加大 */
  object-fit: contain;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.node-image:hover {
  transform: scale(1.05);
}

/* 图片放大弹窗（优化样式适配缩放拖拽） */
.image-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden; /* 隐藏超出遮罩的图片部分 */
  touch-action: none; /* 禁用默认触摸行为 */
}

.image-modal-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  touch-action: none; /* 禁用浏览器默认触摸行为 */
  transform-origin: center center; /* 以图片中心缩放，更符合直觉 */
  transition: transform 0.1s ease; /* 缩放/拖拽过渡，更顺滑 */
}

/* 响应式适配 */
@media (max-width: 768px) {
  .category-detail-page {
    padding: 15px;
  }

  .category-title {
    font-size: 2.2rem; /* 移动端标题加大 */
  }

  .node-card {
    padding: 15px;
    height: 320px; /* 移动端卡片高度加大 */
  }

  .node-time-label {
    font-size: 1.1rem; /* 移动端时间标签加大 */
  }

  .node-text {
    font-size: 1.1rem; /* 移动端内容文字加大 */
  }

  .node-image {
    width: 120px; /* 移动端图片宽度加大 */
    height: 90px; /* 移动端图片高度加大 */
  }
}
</style>