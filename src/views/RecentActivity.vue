<template>
  <div class="recent-page">
    <h1 class="page-title">龙最近在做什么 🐉</h1>

    <div class="nav-links">
      <button class="nav-btn" @click="router.back()">
        <span class="arrow-icon">←</span> 返回主页
      </button>
    </div>

    <div v-if="loading" class="loading-text">
      正在打探龙的消息...
    </div>

    <div v-else class="list-container">
      <div 
        v-for="(item, index) in activityList" 
        :key="item.id || index"
        class="update-item"
        @click="toggleExpand(index)"
      >
        <div class="item-header">
          <span class="item-time">{{ formatTime(item.createTime) }}</span>
          <span class="expand-icon">{{ expandedIndex === index ? '−' : '+' }}</span>
        </div>

        <div class="item-title-text">
          {{ item.title }}
        </div>

        <div 
          class="item-content-wrapper" 
          :class="{ 'is-expanded': expandedIndex === index }"
        >
          <div class="item-content">
            <div class="divider"></div>
            {{ item.content || '🔒 内容保密，不可查看' }}
          </div>
        </div>
      </div>
    </div>
    
    <p class="no-more-text">—— 龙的行程都在这里啦 ——</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activityList = ref([])
const loading = ref(false)
const expandedIndex = ref(-1)

// 获取数据
const fetchActivities = async () => {
  loading.value = true
  try {
    const response = await fetch('https://xiaolongya.cn/blog/recent/list')
    const res = await response.json()

    if (res.code === 200) {
      activityList.value = res.data
    } else {
      console.error('获取失败:', res.msg)
    }
  } catch (error) {
    console.error('网络请求错误:', error)
  } finally {
    loading.value = false
  }
}

// 格式化时间 (保留日期部分)
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr.split(' ')[0]
}

// 切换展开/收起
const toggleExpand = (index) => {
  expandedIndex.value = expandedIndex.value === index ? -1 : index
}

onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
/* 全局容器，保持宽度和字体一致 */
.recent-page {
  width: 90%;
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  min-height: 100vh;
}

/* 标题样式 - 复用 reference .page-title */
.page-title {
  font-size: 64px;
  color: #00c0e2;
  text-align: center;
  margin-bottom: 20px;
  letter-spacing: 10px;
}

/* 导航区样式 - 模仿 reference .repo-links */
.nav-links {
  text-align: center;
  margin-bottom: 40px;
  padding: 15px;
  background: #00c0e2; /* 青色背景 */
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

/* 按钮样式 - 复用 reference .repo-link */
.nav-btn {
  display: inline-block;
  padding: 10px 25px;
  background: #2f5496; /* 深蓝背景 */
  color: rgb(220, 132, 132); /* 参考代码中的粉红字 */
  border: none;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  font-family: inherit;
  font-weight: bold;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: #1d3b6f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(47, 84, 150, 0.3);
  color: #fff;
}

.arrow-icon {
  margin-right: 8px;
  font-weight: bold;
}

/* 列表项卡片 - 复用 reference .update-item */
.update-item {
  background: #00c0e2; /* 青色卡片背景 */
  padding: 20px 25px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden; /* 为了包含内部元素 */
}

.update-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 192, 226, 0.3);
}

/* 头部布局 */
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

/* 时间样式 - 复用 reference .item-time */
.item-time {
  font-size: 24px; /* 稍微调小一点以适应列表 */
  font-weight: 900;
  color: #2f5496; /* 深蓝 */
}

.expand-icon {
  font-size: 28px;
  color: #2f5496;
  font-weight: bold;
}

/* 标题样式 - 类似 reference .item-content 但作为标题显示 */
.item-title-text {
  font-size: 22px;
  color: #fff; /* 在青色背景上用白色或深色，这里选白色增加对比度，或参考原设计的深色 */
  font-weight: bold;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* 展开的内容区域 */
.item-content-wrapper {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease-in-out, opacity 0.4s ease;
  opacity: 0;
}

.item-content-wrapper.is-expanded {
  max-height: 500px; /* 足够展示内容的预设高度 */
  opacity: 1;
}

.item-content {
  margin-top: 15px;
  font-size: 20px;
  color: #333; /* 深灰内容字 */
  line-height: 1.8;
  background: rgba(255, 255, 255, 0.3); /* 半透明白色背景衬托文字 */
  padding: 15px;
  border-radius: 8px;
}

.divider {
  height: 1px;
  background: #2f5496;
  opacity: 0.3;
  margin-bottom: 10px;
}

/* 加载和底部文字 */
.loading-text, .no-more-text {
  text-align: center;
  color: #999;
  font-size: 18px;
  margin-top: 30px;
}

/* 响应式适配 - 复用 reference @media */
@media (max-width: 768px) {
  .page-title {
    font-size: 40px;
    letter-spacing: 6px;
  }
  
  .update-item {
    padding: 15px;
  }

  .item-time {
    font-size: 20px;
  }

  .item-title-text {
    font-size: 18px;
  }
  
  .item-content {
    font-size: 16px;
  }
}
</style>