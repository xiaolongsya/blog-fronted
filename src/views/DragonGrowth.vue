<!-- DragonGrowth.vue -->
<template>
  <div class="growth-journey-page">
    <!-- 顶部标题：移出背景包裹层，不被蓝色背景覆盖 -->
    <div class="page-header">
      <h1 class="title">龙的成长历程</h1>
    </div>

    <!-- 包裹核心内容（仅分类卡片）：蓝色背景区块（无条纹） -->
    <div class="core-content-wrap">
      <!-- 四大静态分类区域（新增「算法」板块） -->
      <div class="main-categories-container">
        <div 
          class="main-category-card clickable"
          @click="openModal('前端')"
        >
          <h3 class="main-category-title">前端</h3>
        </div>
        <div 
          class="main-category-card clickable"
          @click="openModal('后端')"
        >
          <h3 class="main-category-title">后端</h3>
        </div>
        <div 
          class="main-category-card clickable"
          @click="openModal('算法')"
        >
          <h3 class="main-category-title">算法</h3>
        </div>
        <div 
          class="main-category-card clickable"
          @click="openModal('其他')"
        >
          <h3 class="main-category-title">其他</h3>
        </div>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <div v-if="modalVisible" class="modal-mask" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ currentMainCategory }} 分类详情</h2>
          <button class="modal-close-btn" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <!-- 遍历筛选后的分类数据 -->
          <div 
            v-for="category in filteredCategories" 
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
                <!-- 移除节点显示，仅保留时间 -->
                <span class="preview-time">{{ formatTime(category.createTime) }}</span>
              </div>
            </div>
          </div>
          
          <!-- 加载状态提示 -->
          <div v-if="loading" class="loading-message">
            正在加载分类...
          </div>
          
          <!-- 空状态提示 -->
          <div v-if="!loading && filteredCategories.length === 0" class="empty-message">
            暂无{{ currentMainCategory }}相关分类，请稍后重试
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 存储所有分类数据的响应式变量
const categories = ref([])
// 控制加载状态的响应式变量
const loading = ref(true)
// 弹窗相关响应式变量
const modalVisible = ref(false)
const currentMainCategory = ref('') // 记录当前点击的四大分类

/**
 * 获取分类列表数据
 */
const fetchCategories = async () => {
  try {
    const res = await fetch('https://xiaolongya.cn/blog/growth/list')
    if (!res.ok) throw new Error('网络请求失败，HTTP 状态码：' + res.status)
    
    const result = await res.json()
    if (result.code !== 200) {
      throw new Error('接口返回失败：' + (result.msg || '未知错误'))
    }
    const originalCategoryList = result.data || []
    categories.value = originalCategoryList.map(category => ({
      id: category.id || '',
      name: category.name || '未命名分类',
      nodeCount: category.nodeCount || 0,
      lastNode: category.lastNode || '',
      createTime: category.createTime || '',
      type: category.type || ''
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
 * 打开弹窗
 */
const openModal = (type) => {
  currentMainCategory.value = type
  modalVisible.value = true
}

/**
 * 关闭弹窗
 */
const closeModal = () => {
  modalVisible.value = false
  currentMainCategory.value = ''
}

/**
 * 筛选对应type的分类（支持「算法」类型筛选）
 */
const filteredCategories = computed(() => {
  if (!currentMainCategory.value) return []
  return categories.value.filter(category => category.type === currentMainCategory.value)
})

/**
 * 跳转到分类详情
 */
const goToCategory = (categoryId) => {
  if (!categoryId) return
  closeModal()
  router.push(`/category/${categoryId}`)
}

/**
 * 格式化时间
 */
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 页面挂载时加载数据
onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
/* 页面整体样式 */
.growth-journey-page {
  padding: 20px; 
  font-family: "楷体", "KaiTi", "STKaiti", serif; 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center; /* 让核心内容居中 */
}

/* 顶部标题区域样式 */
.page-header {
  text-align: center; 
  margin-bottom: 30px; /* 与下方蓝色背景保持间距 */
}

/* 主标题样式 */
.title {
  font-size: 100px; 
  font-weight: bold; 
  color: #00c0e2; 
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1); 
}

/* 核心：蓝色背景区块（无条纹纹理）- 关键修改 */
.core-content-wrap {
  width: 90%;
  max-width: 1200px; 
  background-color: rgba(179, 216, 255, 0.6); /* 保留浅蓝透明，移除条纹 */
  /* 删掉 background-image 相关代码，去除条纹纹理 */
  border-radius: 120px; 
  padding: 40px 180px; 
  box-sizing: border-box;
  margin-bottom: 50px; 
}

/* 四大静态主分类容器（适配4个卡片，优化网格布局） */
.main-categories-container {
  display: grid;
  /* 适配4个卡片，自动换行，最小宽度200px，保持整齐 */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
  padding: 0 20px;
  justify-items: center; /* 分类卡片居中排列 */
}

/* 四大静态主分类卡片样式 - 提高透明度（关键修改） */
.main-category-card {
  /* 提高透明度：从 0.1 改为 0.05，未hover时更透明 */
  background: rgba(0, 192, 226, 0.05);
  border-radius: 16px;
  padding: 40px 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e8e8e8;
  text-align: center;
  width: 260px; /* 固定卡片宽度，保持整齐 */
}

.main-category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  border-color: #00c0e2;
  /* 提高hover透明度：从 0.2 改为 0.15，保持视觉协调 */
  background: rgba(0, 192, 226, 0.15);
}

/* 四大静态主分类标题样式 */
.main-category-title {
  font-size: 6rem;
  color: #13e0ee;
  font-weight: 700;
  margin: 0;
}

/* 弹窗遮罩层 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 弹窗内容区域 */
.modal-content {
  background: #00c0e2;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

/* 弹窗头部 */
.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 弹窗标题 */
.modal-title {
  font-size: 2rem;
  color: #2f5496;
  margin: 0;
}

/* 弹窗关闭按钮 */
.modal-close-btn {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #999;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.modal-close-btn:hover {
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
}

/* 弹窗主体内容 */
.modal-body {
  padding: 20px;
}

/* 分类卡片基础样式 - 同步提高透明度（关键修改） */
.category-card {
  /* 提高透明度：从 0.1 改为 0.05 */
  background: rgba(0, 192, 226, 0.5);
  border-radius: 16px; 
  padding: 40px 20px; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); 
  cursor: pointer; 
  transition: all 0.3s ease; 
  border: 1px solid #e8e8e8; 
  margin-bottom: 15px; 
  text-align: center;
}

/* 分类卡片悬停效果 - 同步提高透明度（关键修改） */
.category-card:hover {
  transform: translateY(-5px); 
  box-shadow: 0 8px 20px rgba(0,0,0,0.15); 
  border-color: #00c0e2; 
  /* 提高hover透明度：从 0.2 改为 0.15 */
  background: rgba(0, 192, 226, 0.15);
}

/* 可点击元素样式 */
.clickable {
  cursor: pointer; 
}

/* 分类标题样式 */
.category-title {
  font-size: 3rem; 
  margin-bottom: 15px; 
  color: #13e0ee; 
  font-weight: 700; 
}

/* 分类统计信息样式 */
.category-stats {
  margin: 10px 0; 
  font-size: 1.8rem; 
  color: #666; 
}

/* 节点预览区域样式 */
.nodes-preview {
  margin-top: 15px; 
  border-top: 1px solid #eee; 
  padding-top: 15px; 
}

/* 预览节点样式 */
.preview-node {
  display: flex; 
  justify-content: center;
  font-size: 2.1rem; 
}

/* 预览时间样式 */
.preview-time {
  color: #888; 
}

/* 加载状态提示样式 */
.loading-message {
  text-align: center; 
  color: #666; 
  padding: 20px; 
  font-size: 1rem; 
}

/* 空状态提示样式 */
.empty-message {
  text-align: center; 
  color: #999; 
  padding: 40px; 
  font-size: 1rem; 
}

/* 响应式适配（优化4个卡片在移动端的显示） */
@media (max-width: 768px) {
  .core-content-wrap {
    width: 95%;
    padding: 30px 20px; /* 移动端缩小内边距 */
    border-radius: 40px; /* 移动端缩小圆角，更协调 */
    background-color: rgba(179, 216, 255, 0.3); /* 移动端降低透明度，更柔和 */
  }

  .title {
    font-size: 36px; /* 移动端缩小标题 */
  }

  .main-categories-container {
    grid-template-columns: 1fr; /* 移动端纵向排列4个卡片 */
    gap: 20px;
  }

  .main-category-title {
    font-size: 2rem;
  }

  .main-category-card {
    width: 100%; /* 移动端卡片自适应宽度 */
    padding: 30px 10px;
    background: rgba(0, 192, 226, 0.05); /* 移动端同步高透明度 */
  }

  .main-category-card:hover {
    background: rgba(0, 192, 226, 0.15); /* 移动端hover同步 */
  }

  .category-card {
    padding: 15px; 
    background: rgba(0, 192, 226, 0.05); /* 移动端同步高透明度 */
  }

  .category-card:hover {
    background: rgba(0, 192, 226, 0.15); /* 移动端hover同步 */
  }

  .category-title {
    font-size: 1.2rem; 
  }

  .modal-title {
    font-size: 1.5rem;
  }
}
</style>