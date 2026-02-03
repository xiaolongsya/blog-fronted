<!-- DragonGrowth.vue -->
<template>
  <div class="growth-journey-page">
    <!-- 顶部标题 -->
    <div class="page-header">
      <h1 class="title">龙的成长历程</h1>
    </div>

    <!-- 分类展示区域 -->
    <div class="categories-container">
      <!-- 遍历分类数据并渲染每个分类卡片 -->
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

// 存储分类数据的响应式变量
const categories = ref([])
// 控制加载状态的响应式变量
const loading = ref(true)

/**
 * 获取分类列表数据
 * 从指定API获取分类信息，并处理异常情况
 */

const fetchCategories = async () => {
  try {
    const res = await fetch('https://xiaolongya.cn/blog/growth/list')
    if (!res.ok) throw new Error('网络请求失败，HTTP 状态码：' + res.status)
    
    const result = await res.json() // 先获取完整的Result封装对象
    // 步骤1：判断Result响应是否成功（根据后端定义的成功码，通常是200）
    if (result.code !== 200) {
      throw new Error('接口返回失败：' + (result.msg || '未知错误'))
    }
    // 步骤2：提取Result中的data字段（这才是原来的分类数组）
    const originalCategoryList = result.data || []
    
    // 步骤3：后续映射逻辑不变，基于提取出的originalCategoryList处理
    categories.value = originalCategoryList.map(category => ({
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

/**
 * 跳转到指定分类页面
 * @param {string} categoryId - 分类ID
 */
const goToCategory = (categoryId) => {
  if (!categoryId) return
  router.push(`/category/${categoryId}`)
}

/**
 * 格式化时间戳为 YYYY-MM-DD 格式
 * @param {number|string} timestamp - 时间戳
 * @returns {string} 格式化后的日期字符串
 */
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * 获取分类预览内容
 * @param {string} lastNodeId - 最新节点ID
 * @returns {string} 预览文本
 */
const getCategoryPreviewContent = (lastNodeId) => {
  return lastNodeId ? `节点${lastNodeId}` : '暂无节点'
}

// 页面挂载时调用获取分类数据的方法
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
/* 页面整体样式 */
.growth-journey-page {
  padding: 20px; /* 内边距 */
  font-family: "楷体", "KaiTi", "STKaiti", serif; /* 字体设置 */
}

/* 顶部标题区域样式 */
.page-header {
  text-align: center; /* 居中对齐 */
  margin-bottom: 30px; /* 下边距 */
}

/* 主标题样式 */
.title {
  font-size: 100px; /* 字体大小 */
  font-weight: bold; /* 字体粗细 */
  color: #00c0e2; /* 文字颜色 */
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1); /* 文字阴影效果 */
}

/* 分类容器布局 */
.categories-container {
  display: grid; /* 使用网格布局 */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 自适应列宽 */
  gap: 20px; /* 卡片间距 */
}

/* 分类卡片基础样式 */
.category-card {
  /* 核心修改：将 white 改为 rgba(255,255,255,0.6)，仅背景透明（0.6为透明度） */
  background: rgba(255, 255, 255, 0.6); 
  border-radius: 16px; /* 圆角 */
  padding: 20px; /* 内边距 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); /* 阴影效果 */
  cursor: pointer; /* 鼠标悬停时显示手型 */
  transition: all 0.3s ease; /* 过渡动画 */
  border: 1px solid #e8e8e8; /* 边框 */
}

/* 分类卡片悬停效果 */
.category-card:hover {
  transform: translateY(-5px); /* 向上移动 */
  box-shadow: 0 8px 20px rgba(0,0,0,0.15); /* 更深的阴影 */
  border-color: #2f5496; /* 改变边框颜色 */
  /* 可选优化：悬停时背景透明度提高到1，突出卡片 */
  background: rgba(255, 255, 255, 1);
}

/* 可点击元素样式 */
.clickable {
  cursor: pointer; /* 鼠标悬停时显示手型 */
}

/* 分类标题样式 */
.category-title {
  font-size: 3rem; /* 字体大小 */
  margin-bottom: 15px; /* 下边距 */
  color: #2f5496; /* 文字颜色 */
  font-weight: 700; /* 字体粗细 */
}

/* 分类统计信息样式 */
.category-stats {
  margin: 10px 0; /* 上下边距 */
  font-size: 1.8rem; /* 字体大小 */
  color: #666; /* 文字颜色 */
}

/* 节点预览区域样式 */
.nodes-preview {
  margin-top: 15px; /* 上边距 */
  border-top: 1px solid #eee; /* 顶部边框 */
  padding-top: 15px; /* 上内边距 */
}

/* 预览节点样式 */
.preview-node {
  display: flex; /* 弹性布局 */
  gap: 10px; /* 元素间距 */
  margin-bottom: 8px; /* 下边距 */
  font-size: 2.1rem; /* 字体大小 */
}

/* 预览时间样式 */
.preview-time {
  color: #888; /* 文字颜色 */
  min-width: 80px; /* 最小宽度 */
}

/* 预览标题样式 */
.preview-title {
  color: #333; /* 文字颜色 */
  flex: 1; /* 占据剩余空间 */
}

/* 加载状态提示样式 */
.loading-message {
  text-align: center; /* 居中对齐 */
  color: #666; /* 文字颜色 */
  padding: 20px; /* 内边距 */
  font-size: 1rem; /* 字体大小 */
}

/* 空状态提示样式 */
.empty-message {
  text-align: center; /* 居中对齐 */
  color: #999; /* 文字颜色 */
  padding: 40px; /* 内边距 */
  font-size: 1rem; /* 字体大小 */
}

/* 响应式适配 */
@media (max-width: 768px) {
  .title {
    font-size: 1.8rem; /* 在小屏幕下减小字体大小 */
  }

  .categories-container {
    grid-template-columns: 1fr; /* 单列布局 */
  }

  .category-card {
    padding: 15px; /* 减少内边距 */
    /* 手机端同步保持背景透明度 0.6 */
    background: rgba(255, 255, 255, 0.6);
  }

  .category-card:hover {
    /* 手机端悬停时同步恢复背景不透明 */
    background: rgba(255, 255, 255, 1);
  }

  .category-title {
    font-size: 1.2rem; /* 减小标题字体大小 */
  }
}
</style>