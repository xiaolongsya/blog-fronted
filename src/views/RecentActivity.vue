<template>
  <div class="recent-activity-page">
    <!-- 返回按钮 -->
    <div class="back-button-section">
      <button class="back-btn" @click="router.back()">
        ← 返回主页
      </button>
    </div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">龙最近在做什么 🐉</h1>
    </div>

    <!-- 活动列表 -->
    <div class="activity-list">
      <div 
        v-for="(item, index) in activityList" 
        :key="index"
        class="activity-item"
      >
        <!-- 标题按钮 -->
        <button 
          class="activity-title-btn" 
          @click="toggleExpand(index)"
        >
          {{ item.title }}
        </button>

        <!-- 详情内容（仅展开时显示） -->
        <div 
          class="activity-content" 
          v-if="expandedIndex === index"
        >
          {{ item.content || '🔒 内容保密，不可查看' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const expandedIndex = ref(-1)

// 活动数据，你以后直接在这里修改内容即可
const activityList = [
  { title: '后端考核三（保密不可查看）', content: '' },
  { title: '算法学习', content: '期末后就一直摸鱼岛寒假，为了不让比赛报名变商业捐款而奋斗' },
  { title: '个人博客', content: '这里没啥好看的，你看的不就是了吗' },
  { title: '文远凌云（保密不可查看）', content: '' },
  { title: '剩余的内容被藏进龙窝的缝隙里了', content: '' }
]

// 切换展开/收起
const toggleExpand = (index) => {
  expandedIndex.value = expandedIndex.value === index ? -1 : index
}
</script>

<style scoped>
.recent-activity-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  background-color: #e6f7ff;
  min-height: 100vh;
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

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2.2rem;
  color: #2f5496;
  margin: 0;
  font-weight: bold;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #e8e8e8;
}

.activity-title-btn {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: #2f5496;
  font-weight: bold;
  cursor: pointer;
  padding: 10px 0;
  border-bottom: 1px dashed #b3d8ff;
  transition: color 0.3s ease;
}

.activity-title-btn:hover {
  color: #1f3a6b;
}

.activity-content {
  margin-top: 12px;
  padding: 10px 0;
  font-size: 1rem;
  color: #333;
  line-height: 1.6;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .recent-activity-page {
    padding: 15px;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .activity-item {
    padding: 12px;
  }

  .activity-title-btn {
    font-size: 0.95rem;
  }

  .activity-content {
    font-size: 0.9rem;
  }
}
</style>