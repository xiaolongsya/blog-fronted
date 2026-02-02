<!-- DragonGrowth.vue -->
<template>
  <div class="growth-journey-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="title">龙的成长历程</h1>
    </div>

    <!-- 分类展示区域 -->
    <div class="categories-container">
      <div 
        v-for="category in categories" 
        :key="category.id"
        class="category-card clickable"
        @click="goToCategory(category.id)"
      >
        <h3 class="category-title">{{ category.name }}</h3>
        <div class="category-stats">
          <span class="node-count">{{ category.nodeCount }} 个节点</span>
        </div>
        <div class="nodes-preview">
          <div class="preview-node">
            <span class="preview-time">{{ formatTime(category.createTime) }}</span>
            <span class="preview-title">{{ getCategoryPreviewContent(category.lastNode) }}</span>
          </div>
        </div>
      </div>
      
      <!-- 加载状态提示 -->
      <div v-if="loading" class="loading-message">
        正在加载分类...
      </div>
      
      <!-- 空状态提示 -->
      <div v-if="!loading && categories.length === 0" class="empty-message">
        暂无分类，请稍后重试
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const categories = ref([])
const loading = ref(true)

const fetchCategories = async () => {
  try {
    const res = await fetch('https://xiaolongya.cn/blog/growth/list')
    if (!res.ok) throw new Error('网络请求失败，HTTP 状态码：' + res.status)
    
    const data = await res.json()
    categories.value = (data || []).map(category => ({
      id: category.id || '',
      name: category.name || '未命名分类',
      nodeCount: category.nodeCount || 0,
      lastNode: category.lastNode || '',
      createTime: category.createTime || ''
    }))
    categories.value.sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
  } catch (err) {
    console.error('加载分类失败：', err)
    alert('加载分类失败，请检查网络连接或联系管理员')
  } finally {
    loading.value = false
  }
}

const goToCategory = (categoryId) => {
  if (!categoryId) return
  router.push(`/category/${categoryId}`)
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getCategoryPreviewContent = (lastNodeId) => {
  return lastNodeId ? `节点${lastNodeId}` : '暂无节点'
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.growth-journey-page {
  padding: 20px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2f5496;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.categories-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.category-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  border-color: #2f5496;
}

.clickable {
  cursor: pointer;
}

.category-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #2f5496;
  font-weight: 700;
}

.category-stats {
  margin: 10px 0;
  font-size: 0.9rem;
  color: #666;
}

.nodes-preview {
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.preview-node {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  font-size: 0.85rem;
}

.preview-time {
  color: #888;
  min-width: 80px;
}

.preview-title {
  color: #333;
  flex: 1;
}

.loading-message {
  text-align: center;
  color: #666;
  padding: 20px;
  font-size: 1rem;
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 1rem;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .title {
    font-size: 1.8rem;
  }

  .categories-container {
    grid-template-columns: 1fr;
  }

  .category-card {
    padding: 15px;
  }

  .category-title {
    font-size: 1.2rem;
  }
}
</style>