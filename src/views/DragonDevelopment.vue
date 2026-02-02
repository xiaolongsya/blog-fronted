<!-- DragonDevelopment.vue -->
<template>
  <div class="development-page">
    <!-- 页面顶部标题 -->
    <h1 class="page-title">龙岛的发展</h1>
    
    <!-- 新增仓库链接区域 -->
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

    <!-- 多个更新节点 -->
    <div class="update-item" v-for="(item, idx) in updateList" :key="idx">
      <!-- 节点左上角的时间（放大加粗） -->
      <div class="item-time">{{ item.time }}</div>
      <!-- 文字内容 -->
      <div class="item-content">{{ item.content }}</div>
      <!-- 可选图片（缩小排列，点击放大） -->
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

const updateList = ref([])
const bigImageUrl = ref('')

// 新增：图片缩放拖拽相关变量
const modalImageRef = ref(null) // 大图DOM引用
const scale = ref(1) // 缩放比例
const lastDistance = ref(0) // 上一次双指距离
const startPos = ref({ x: 0, y: 0 }) // 拖拽起始位置
const translatePos = ref({ x: 0, y: 0 }) // 图片偏移位置

const fetchUpdateList = async () => {
  try {
    const res = await fetch('https://xiaolongya.cn/blog/development/list')
    if (!res.ok) throw new Error('网络请求失败')
    const data = await res.json()
    
    if (data.code === 200 || !data.code) {
      updateList.value = (data.data || []).map(item => ({
        time: item.createTime ? item.createTime.split(' ')[0] : '',
        content: item.content || '',
        images: Array.isArray(item.imgUrls) 
          ? item.imgUrls 
          : (item.imgUrls ? item.imgUrls.split(',') : [])
      }))
    }
  } catch (err) {
    console.error('获取更新记录失败：', err)
  }
}

onMounted(() => {
  fetchUpdateList()
})

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

const closeBigImage = () => {
  bigImageUrl.value = ''
}
</script>

<style scoped>
.development-page {
  width: 90%;
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  font-size: 20px; /* 全局字体加大 */
}

.page-title {
  font-size: 64px; /* 标题字体加大 */
  color: #2f5496;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 10px; /* 字间距加大 */
}

.repo-links {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.repo-link {
  display: inline-block;
  margin: 8px 15px;
  padding: 10px 20px;
  background: #2f5496;
  color: white !important;
  text-decoration: none;
  border-radius: 8px;
  font-size: 18px; /* 链接字体加大 */
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
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
  vertical-align: middle;
}

.update-item {
  background: #fff;
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
  font-size: 28px; /* 时间字体加大 */
  font-weight: 900;
  color: #2f5496;
}

.item-content {
  margin-top: 40px;
  font-size: 22px; /* 内容字体加大 */
  color: #333;
  line-height: 1.8; /* 行高增加以提升可读性 */
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
  overflow: hidden; /* 隐藏超出遮罩层的图片部分 */
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
  .page-title {
    font-size: 40px; /* 移动端标题字体加大 */
    letter-spacing: 6px;
  }
  .repo-link {
    font-size: 16px; /* 移动端链接字体加大 */
    padding: 8px 15px;
    margin: 6px 0;
    display: block;
  }
  .item-time {
    font-size: 24px; /* 移动端时间字体加大 */
  }
  .item-content {
    font-size: 20px; /* 移动端内容字体加大 */
  }
  .item-image {
    width: 100px;
    height: 100px;
  }
}
</style>