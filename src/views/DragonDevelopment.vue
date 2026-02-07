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

// 分页相关变量
const pageNum = ref(1)
const pageSize = 5
const hasMore = ref(true)   // 是否还有更多数据
const isLoading = ref(false) // 是否正在请求中

// 图片缩放拖拽相关变量 (保持不变)
const modalImageRef = ref(null)
const scale = ref(1)
const lastDistance = ref(0)
const startPos = ref({ x: 0, y: 0 })
const translatePos = ref({ x: 0, y: 0 })

// 格式化内容 (保持不变)
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

// 核心修改：获取数据方法（支持分页）
const fetchUpdateList = async () => {
  // 如果正在加载或没有更多数据，则中断
  if (isLoading.value) return 
  
  isLoading.value = true
  try {
    // 拼接分页参数
    const url = `https://xiaolongya.cn/blog/development/listPage?pageNum=${pageNum.value}&pageSize=${pageSize}`
    const res = await fetch(url)
    
    if (!res.ok) throw new Error(`网络请求失败，HTTP状态码：${res.status}`)
    
    const result = await res.json()

    if (result.code === 200) {
      const newData = result.data || []
      
      // 处理单页数据格式
      const processedData = newData.map(item => ({
        time: item.createTime ? item.createTime.split(' ')[0] : '',
        content: item.content || '',
        // 兼容处理：新接口返回的是数组，但也保留对字符串分割的兼容
        images: Array.isArray(item.imgUrls) 
          ? item.imgUrls 
          : (item.imgUrls ? item.imgUrls.split(',') : [])
      }))

      // 将新数据追加到列表末尾
      updateList.value = [...updateList.value, ...processedData]

      // 判断是否还有更多数据
      if (newData.length < pageSize) {
        hasMore.value = false // 返回不足5条，说明到头了
      } else {
        pageNum.value++ // 准备下一次加载下一页
      }
    } else {
      throw new Error(`获取更新记录失败：${result.msg || '未知业务错误'}`)
    }
  } catch (err) {
    console.error('获取更新记录失败：', err)
    // alert(err.message) // 可选报错提示
  } finally {
    isLoading.value = false
  }
}

// 点击加载更多
const loadMore = () => {
  fetchUpdateList()
}

onMounted(() => {
  fetchUpdateList() // 初始加载第一页
})

// 触摸事件处理函数 (保持不变)
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

/* --- 新增样式：加载更多按钮 --- */
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
  
  /* 移动端加载按钮适配 */
  .load-more-btn {
    width: 80%;
    padding: 12px 0;
  }
}
</style>