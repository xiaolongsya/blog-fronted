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

        <!-- 核心修改：图文混排区域（解析content中的图片标记） -->
        <div class="node-mix-content">
          <div 
            v-for="(item, idx) in node.mixContent" 
            :key="idx"
            :class="['mix-item', `mix-${item.type}`]"
          >
            <!-- 文字内容 -->
            <p v-if="item.type === 'text'" class="mix-text">
              {{ item.value }}
            </p>
            <!-- 嵌入的图片 -->
            <div v-else-if="item.type === 'image'" class="mix-img-wrap">
              <img 
                :src="item.value" 
                :alt="`嵌入图片${idx+1}`" 
                class="node-image"
                @error="handleImageError"
                @click="showBigImage(item.value)"
              >
            </div>
          </div>
        </div>

        <!-- 保留：底部图片区域（imgUrls中的图片，和原有逻辑一致） -->
        <div v-if="node.imgUrls.length > 0" class="node-bottom-images">
          <div class="bottom-img-title">附件图片</div>
          <div class="bottom-img-wrap">
            <img 
              v-for="(imgUrl, idx) in node.imgUrls" 
              :key="idx"
              :src="imgUrl" 
              :alt="`底部图片${idx+1}`" 
              class="node-image"
              @error="handleImageError"
              @click="showBigImage(imgUrl)"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 图片放大弹窗（保留原有缩放拖拽功能） -->
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

// 图片缩放拖拽相关变量
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

// 加载分类信息
const loadCategoryData = async (categoryId) => {
  try {
    const res = await fetch(`https://xiaolongya.cn/blog/growth/${categoryId}`)
    if (!res.ok) throw new Error('加载分类失败，HTTP状态码：' + res.status)
    
    const result = await res.json()
    if (result.code !== 200) {
      throw new Error('加载分类失败：' + (result.msg || '未知错误'))
    }
    category.value = result.data || null
  } catch (error) {
    console.error('加载分类信息失败:', error)
  }
}

// 加载节点 + 核心解析：图文混排数据
const loadNodes = async (categoryId) => {
  try {
    const res = await fetch(`https://xiaolongya.cn/blog/node/list?growthId=${categoryId}`);
    if (!res.ok) throw new Error('加载节点失败，HTTP状态码：' + res.status);
    
    const result = await res.json();
    if (result.code !== 200) {
      throw new Error('加载节点失败：' + (result.msg || '未知错误'));
    }
    let originalNodes = result.data || [];
    
    // 修复排序bug：倒序（新时间在前，符合成长历程逻辑）
    originalNodes = originalNodes.sort((a, b) => {
      if (!a.createTime) return 1;
      if (!b.createTime) return -1;
      const timeA = new Date(a.createTime).getTime();
      const timeB = new Date(b.createTime).getTime();
      return timeB - timeA;
    });
    
    // 解析每个节点的图文混排数据
    nodes.value = originalNodes.map(item => ({
      ...item,
      mixContent: parseMixContent(item.content || ''), // 解析嵌入的图片
      imgUrls: item.imgUrls || [] // 保留底部图片
    }));
  } catch (error) {
    console.error('加载节点失败:', error);
  }
};

// 核心方法：解析content中的[IMAGE:URL]标记，生成图文混排数组
const parseMixContent = (content) => {
  const mixList = [];
  if (!content.trim()) return mixList;
  // 按特殊标记分割，奇数项为文字，偶数项为图片URL
  const splitItems = content.split(/\[IMAGE:([^\]]+)\]/);
  splitItems.forEach(item => {
    if (!item.trim()) return;
    // 判断是否为图片URL
    if (splitItems.indexOf(item) % 2 === 1) {
      mixList.push({ type: 'image', value: item.trim() });
    } else {
      // 文字按换行分割，保留排版
      const textParas = item.split('\n');
      textParas.forEach(para => {
        if (para.trim()) mixList.push({ type: 'text', value: para });
      });
    }
  });
  return mixList;
};

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

// 图片缩放拖拽事件（保留原有功能）
const handleTouchStart = (e) => {
  if (e.touches.length === 2) {
    const x1 = e.touches[0].clientX
    const y1 = e.touches[0].clientY
    const x2 = e.touches[1].clientX
    const y2 = e.touches[1].clientY
    lastDistance.value = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  } else if (e.touches.length === 1) {
    startPos.value = {
      x: e.touches[0].clientX - translatePos.value.x,
      y: e.touches[0].clientY - translatePos.value.y
    }
  }
}
const handleTouchMove = (e) => {
  e.preventDefault()
  const imageDom = modalImageRef.value
  if (!imageDom) return

  if (e.touches.length === 2) {
    const x1 = e.touches[0].clientX
    const y1 = e.touches[0].clientY
    const x2 = e.touches[1].clientX
    const y2 = e.touches[1].clientY
    const currentDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    const scaleDelta = currentDistance / lastDistance.value
    scale.value = Math.max(1, Math.min(5, scale.value * scaleDelta))
    lastDistance.value = currentDistance
    imageDom.style.transform = `scale(${scale.value}) translate(${translatePos.value.x}px, ${translatePos.value.y}px)`
  } else if (e.touches.length === 1 && scale.value > 1) {
    translatePos.value = {
      x: e.touches[0].clientX - startPos.value.x,
      y: e.touches[0].clientY - startPos.value.y
    }
    imageDom.style.transform = `scale(${scale.value}) translate(${translatePos.value.x}px, ${translatePos.value.y}px)`
  }
}
const handleTouchEnd = () => {
  lastDistance.value = 0
}

// 图片放大/关闭
const showBigImage = (url) => {
  bigImageUrl.value = url
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
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.4rem;
}

.back-btn:hover {
  background: #5a6268;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #033ab1;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100px;
}

.node-time-label {
  font-size: 1.2rem;
  color: #2f5496;
  padding: 0 0 10px 0;
  margin-bottom: 15px;
  font-weight: bold;
  border-bottom: 1px solid #2f549633;
}

/* 图文混排区域样式 */
.node-mix-content {
  line-height: 1.8;
  width: 100%;
  margin-bottom: 20px;
}
.mix-item {
  margin-bottom: 12px;
}
.mix-text {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}
.mix-img-wrap {
  display: inline-block;
  margin: 8px 0;
}

/* 底部图片区域样式 */
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

/* 图片通用样式 */
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
  overflow: hidden;
  touch-action: none;
}

.image-modal-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
  touch-action: none;
  transform-origin: center center;
  transition: transform 0.1s ease;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .category-detail-page {
    padding: 15px;
  }

  .category-title {
    font-size: 2.2rem;
  }

  .node-card {
    padding: 15px;
    min-height: 100px;
  }

  .node-time-label {
    font-size: 1.1rem;
  }

  .mix-text {
    font-size: 1.1rem;
  }

  .node-image {
    width: 120px;
    height: 90px;
  }
}
</style>