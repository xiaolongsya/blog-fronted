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

    <!-- 弹窗组件：添加轻量化过渡动画 -->
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
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
// 1. 引入你配置好的限流请求工具
import request from '@/utils/request'

const router = useRouter()

// 存储所有分类数据的响应式变量
const categories = ref([])
// 控制加载状态的响应式变量
const loading = ref(true)
// 弹窗相关响应式变量
const modalVisible = ref(false)
const currentMainCategory = ref('') // 记录当前点击的四大分类

/**
 * 获取分类列表数据 (已适配 request.js)
 */
const fetchCategories = async () => {
  loading.value = true
  try {
    // 使用 request 工具，路径由 baseURL 自动补全
    const res = await request.get('/growth/list')
    
    // 适配拦截器剥离后的数据结构 (res 直接就是后端返回的 {code, data, msg})
    if (res.code === 200) {
      const originalCategoryList = res.data || []
      
      const mappedList = originalCategoryList.map(category => ({
        id: category.id || '',
        name: category.name || '未命名分类',
        nodeCount: category.nodeCount || 0,
        lastNode: category.lastNode || '',
        createTime: category.createTime || '',
        type: category.type || ''
      }))
      
      // 核心逻辑：按创建时间降序排列
      mappedList.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      categories.value = mappedList
    }
  } catch (err) {
    console.error('加载分类失败：', err)
    // 注意：拦截器里已经写了 ElMessage.error，这里不需要再 alert，除非你想双重提示
  } finally {
    loading.value = false
  }
}

/**
 * 打开弹窗
 */
const openModal = async (type) => {
  currentMainCategory.value = type
  await nextTick()
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
 * 筛选对应type的分类
 */
const filteredCategories = computed(() => {
  if (!currentMainCategory.value) return []
  return categories.value.filter(category => category.type === currentMainCategory.value)
})

/**
 * 跳转到分类详情
 */
const goToCategory = async (growthId) => {
  if (!growthId) return
  closeModal()
  await nextTick()
  router.push({
    path: '/category-detail',
    query: { id: growthId }
  })
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
/* 页面整体样式：统一布局，轻量化 */
.growth-journey-page {
  padding: 20px; 
  font-family: "楷体", "KaiTi", "STKaiti", serif; 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center; /* 让核心内容居中 */
  box-sizing: border-box;
}

/* 顶部标题区域样式：优化间距，美化标题 */
.page-header {
  text-align: center; 
  margin-bottom: 30px; /* 与下方蓝色背景保持间距 */
}

/* 主标题样式：渐变文字，更美观，移除过大阴影 */
.title {
  font-size: 100px; /* 下调字体大小，避免溢出 */
  font-weight: bold; 
  background: linear-gradient(135deg, #00c0e2, #2f5496);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.05); 
  margin: 0;
}

/* 核心：蓝色背景区块（无条纹纹理）- 轻量化优化 */
.core-content-wrap {
  width: 90%;
  max-width: 1200px; 
  background-color: rgba(179, 216, 255, 0.6); /* 保留浅蓝透明，移除条纹 */
  border-radius: 120px; 
  padding: 40px 60px; /* 下调左右内边距，避免移动端拥挤 */
  box-sizing: border-box;
  margin-bottom: 50px; 
  box-shadow: 0 10px 30px rgba(47, 84, 150, 0.1); /* 轻微阴影，提升层次感 */
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

/* 四大静态主分类卡片样式 - 轻量化过渡，协调配色 */
.main-category-card {
  background: rgba(255, 255, 255, 0.9); /* 白色背景，更清爽 */
  border-radius: 16px;
  padding: 40px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 降低阴影浓度，更柔和 */
  cursor: pointer;
  transition: all 0.15s ease; /* 缩短过渡时长，更流畅 */
  border: 2px solid #b3d8ff;
  text-align: center;
  width: 260px; /* 固定卡片宽度，保持整齐 */
  user-select: none;
}

.main-category-card:hover {
  transform: translateY(-3px) scale(1.02); /* 轻微位移+缩放，反馈更细腻 */
  box-shadow: 0 8px 20px rgba(47, 84, 150, 0.15); /* 主色调阴影，更协调 */
  border-color: #2f5496; /* 主色调边框，统一风格 */
  background: rgba(255, 255, 255, 1);
}

.main-category-card:active {
  transform: translateY(1px); /* 按压反馈，更真实 */
  box-shadow: 0 2px 8px rgba(47, 84, 150, 0.1);
}

/* 四大静态主分类标题样式：统一字体大小，协调配色 */
.main-category-title {
  font-size: 3rem; /* 下调字体大小，避免溢出 */
  color: #2f5496; /* 主色调，统一风格 */
  font-weight: 700;
  margin: 0;
  transition: color 0.15s ease;
}

.main-category-card:hover .main-category-title {
  color: #00c0e2; /* 悬浮变色，反馈更明显 */
}

/* 弹窗遮罩层：轻量化淡入动画，无模糊效果 */
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
  animation: modalFadeIn 0.1s ease forwards; /* 超短时长长淡入 */
  opacity: 0;
}

/* 弹窗内容区域：轻量化淡入，优化背景和阴影 */
.modal-content {
  background: #ffffff; /* 白色背景，更清爽 */
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.12s ease forwards; /* 略晚于遮罩，更有层次 */
  opacity: 0;
  margin: 0 20px; /* 避免移动端贴边 */
}

/* 通用淡入动画：轻量化，无其他变换 */
@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 弹窗头部：优化间距，统一配色 */
.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 弹窗标题：统一字体大小和配色 */
.modal-title {
  font-size: 1.8rem; /* 下调字体大小，更协调 */
  color: #2f5496; /* 主色调，统一风格 */
  margin: 0;
  font-weight: 700;
}

/* 弹窗关闭按钮：轻量化过渡，优化反馈 */
.modal-close-btn {
  background: transparent;
  border: none;
  font-size: 1.8rem;
  color: #999;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.1s ease; /* 缩短过渡时长 */
  user-select: none;
}

.modal-close-btn:hover {
  color: #ff4d4f; /* 危险色，统一风格 */
  background: rgba(255, 77, 79, 0.1);
  transform: scale(1.1);
}

.modal-close-btn:active {
  transform: scale(0.95);
}

/* 弹窗主体内容：优化内边距 */
.modal-body {
  padding: 20px;
}

/* 分类卡片基础样式 - 轻量化过渡，协调配色 */
.category-card {
  background: rgba(255, 255, 255, 0.9); /* 白色背景，更清爽 */
  border-radius: 16px; 
  padding: 25px 20px; /* 下调内边距，更紧凑 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
  cursor: pointer; 
  transition: all 0.15s ease; /* 缩短过渡时长 */
  border: 2px solid #b3d8ff; 
  margin-bottom: 15px; 
  text-align: center;
  user-select: none;
}

/* 分类卡片悬停效果 - 轻量化反馈，统一风格 */
.category-card:hover {
  transform: translateY(-3px) scale(1.01); /* 轻微位移+缩放 */
  box-shadow: 0 8px 20px rgba(47, 84, 150, 0.15); 
  border-color: #2f5496; 
  background: rgba(255, 255, 255, 1);
}

.category-card:active {
  transform: translateY(1px);
  box-shadow: 0 2px 8px rgba(47, 84, 150, 0.1);
}

/* 可点击元素样式 */
.clickable {
  cursor: pointer; 
}

/* 分类标题样式：统一字体大小和配色 */
.category-title {
  font-size: 1.8rem; /* 下调字体大小，更协调 */
  margin-bottom: 15px; 
  color: #2f5496; /* 主色调，统一风格 */
  font-weight: 700; 
  transition: color 0.15s ease;
}

.category-card:hover .category-title {
  color: #00c0e2; /* 悬浮变色，反馈更明显 */
}

/* 分类统计信息样式：优化字体大小和配色 */
.category-stats {
  margin: 10px 0; 
  font-size: 1.2rem; /* 下调字体大小，更协调 */
  color: #666; 
}

/* 节点预览区域样式：优化间距 */
.nodes-preview {
  margin-top: 15px; 
  border-top: 1px solid #eee; 
  padding-top: 15px; 
}

/* 预览节点样式：优化字体大小 */
.preview-node {
  display: flex; 
  justify-content: center;
  font-size: 1rem; /* 下调字体大小，更协调 */
}

/* 预览时间样式：统一配色 */
.preview-time {
  color: #888; 
}

/* 加载状态提示样式：优化字体和配色 */
.loading-message {
  text-align: center; 
  color: #2f5496; /* 主色调，统一风格 */
  padding: 20px; 
  font-size: 1rem; 
  font-weight: 500;
}

/* 空状态提示样式：优化字体和配色 */
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
    box-shadow: 0 5px 15px rgba(47, 84, 150, 0.08);
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
    border: 1px solid #b3d8ff;
  }

  .category-card {
    padding: 15px; 
    border: 1px solid #b3d8ff;
  }

  .category-title {
    font-size: 1.2rem; 
  }

  .modal-title {
    font-size: 1.5rem;
  }
}
</style>