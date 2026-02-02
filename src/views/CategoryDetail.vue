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

    <!-- 图片放大弹窗 -->
    <div class="image-modal-mask" v-if="bigImageUrl" @click="closeBigImage">
      <img :src="bigImageUrl" class="image-modal-img" @click.stop>
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

// 页面加载时执行
onMounted(async () => {
  const categoryId = parseInt(route.params.id)
  await loadCategoryData(categoryId)
  await loadNodes(categoryId)
})

// 加载分类信息
const loadCategoryData = async (categoryId) => {
  try {
    const res = await fetch(`https://xiaolongya.cn/blog/growth/${categoryId}`)
    if (!res.ok) throw new Error('加载分类失败')
    const data = await res.json()
    category.value = data
  } catch (error) {
    console.error('加载分类信息失败:', error)
  }
}

// 加载节点列表（适配你提供的接口格式）
const loadNodes = async (categoryId) => {
  try {
    const res = await fetch(`https://xiaolongya.cn/blog/node/list?growthId=${categoryId}`)
    if (!res.ok) throw new Error('加载节点失败')
    const data = await res.json()
    nodes.value = data.map(item => ({
      ...item,
      imgUrls: item.imgUrls ? item.imgUrls.split(',') : []
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

// 图片点击放大
const showBigImage = (url) => {
  bigImageUrl.value = url
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
  background-color: #e6f7ff; /* 浅蓝色背景 */
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
  margin-bottom: 30px;
}

.category-title {
  font-size: 2.2rem;
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
  height: 320px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.node-time-label {
  font-size: 1rem;
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
  line-height: 1.6;
  overflow: hidden;
}

.node-text {
  font-size: 1rem;
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
  width: 120px;
  height: 90px;
  object-fit: contain;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.node-image:hover {
  transform: scale(1.05);
}

/* 图片放大弹窗 */
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
}

.image-modal-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .category-detail-page {
    padding: 15px;
  }

  .category-title {
    font-size: 1.8rem;
  }

  .node-card {
    padding: 15px;
    height: 280px;
  }

  .node-time-label {
    font-size: 0.9rem;
  }

  .node-text {
    font-size: 0.9rem;
  }

  .node-image {
    width: 100px;
    height: 75px;
  }
}
</style>