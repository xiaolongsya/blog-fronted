<template>
  <div class="tech-page-container">
    
    <header class="page-header">
      <button class="back-btn unselectable" @click="router.push('/')">
        <span class="btn-icon">⬅️</span> 返回龙岛
      </button>
      <h1 class="page-title unselectable">小龙的武器库</h1>
      <p class="page-subtitle">Tech Stack & Skill Proficiency</p>
    </header>

    <main class="tech-main" v-if="!isLoading">
      
      <section class="tech-section" v-if="frontendList.length > 0">
        <div class="section-header unselectable">
          <h2><span class="emoji-icon">🎨</span> 前端开发 / Frontend</h2>
          <div class="section-divider"></div>
        </div>
        <div class="tech-grid">
          <div class="tech-card" v-for="item in frontendList" :key="item.id">
            <img :src="item.imgUrl" class="tech-img" :alt="item.name" loading="lazy" />
            <span class="tech-name">{{ item.name }}</span>
            <div class="tech-stars">
              <span v-for="n in item.starRating" :key="'star-' + item.id + '-' + n" class="star">⭐</span>
            </div>
          </div>
        </div>
      </section>

      <section class="tech-section" v-if="backendList.length > 0">
        <div class="section-header unselectable">
          <h2><span class="emoji-icon">⚙️</span> 后端开发 / Backend</h2>
          <div class="section-divider"></div>
        </div>
        <div class="tech-grid">
          <div class="tech-card" v-for="item in backendList" :key="item.id">
            <img :src="item.imgUrl" class="tech-img" :alt="item.name" loading="lazy" />
            <span class="tech-name">{{ item.name }}</span>
            <div class="tech-stars">
              <span v-for="n in item.starRating" :key="'star-' + item.id + '-' + n" class="star">⭐</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 新增：计算机基础板块 -->
      <section class="tech-section" v-if="basicsList.length > 0">
        <div class="section-header unselectable">
          <h2><span class="emoji-icon">📚</span> 计算机基础 / CS Basics</h2>
          <div class="section-divider"></div>
        </div>
        <div class="tech-grid">
          <div class="tech-card" v-for="item in basicsList" :key="item.id">
            <img :src="item.imgUrl" class="tech-img" :alt="item.name" loading="lazy" />
            <span class="tech-name">{{ item.name }}</span>
            <div class="tech-stars">
              <span v-for="n in item.starRating" :key="'star-' + item.id + '-' + n" class="star">⭐</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 新增：部署与运维板块 -->
      <section class="tech-section" v-if="devopsList.length > 0">
        <div class="section-header unselectable">
          <h2><span class="emoji-icon">🚀</span> 部署与运维 / DevOps</h2>
          <div class="section-divider"></div>
        </div>
        <div class="tech-grid">
          <div class="tech-card" v-for="item in devopsList" :key="item.id">
            <img :src="item.imgUrl" class="tech-img" :alt="item.name" loading="lazy" />
            <span class="tech-name">{{ item.name }}</span>
            <div class="tech-stars">
              <span v-for="n in item.starRating" :key="'star-' + item.id + '-' + n" class="star">⭐</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 新增：AI 集成板块 -->
      <section class="tech-section" v-if="aiList.length > 0">
        <div class="section-header unselectable">
          <h2><span class="emoji-icon">🤖</span> AI 集成 / AI Integration</h2>
          <div class="section-divider"></div>
        </div>
        <div class="tech-grid">
          <div class="tech-card" v-for="item in aiList" :key="item.id">
            <img :src="item.imgUrl" class="tech-img" :alt="item.name" loading="lazy" />
            <span class="tech-name">{{ item.name }}</span>
            <div class="tech-stars">
              <span v-for="n in item.starRating" :key="'star-' + item.id + '-' + n" class="star">⭐</span>
            </div>
          </div>
        </div>
      </section>

      <div v-if="frontendList.length === 0 && backendList.length === 0 && basicsList.length === 0 && devopsList.length === 0 && aiList.length === 0" class="empty-state">
        <span class="loading-spinner">↻</span> 正在唤醒龙的记忆...
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import request from '@/utils/request'

const router = useRouter()
const isLoading = ref(true)

// 原始数据列表
const fullTechList = ref([])

// 🌟 核心逻辑：利用 computed 根据 type 自动对数据进行分组
const frontendList = computed(() => fullTechList.value.filter(item => item.type === '前端'))
const backendList = computed(() => fullTechList.value.filter(item => item.type === '后端'))
const basicsList = computed(() => fullTechList.value.filter(item => item.type === '计算机基础' || item.type === '基础'))
// 新增：部署与运维分组
const devopsList = computed(() => fullTechList.value.filter(item => item.type === '部署与运维'))
// 新增：其他分组
const aiList = computed(() => fullTechList.value.filter(item => item.type === '其他'))

// 获取技术栈数据
const fetchTechData = async () => {
  isLoading.value = true
  try {
    const res = await request.get('/stack/list')
    if (res.code === 200) {
      fullTechList.value = res.data || []
    }
  } catch (err) {
    console.error('获取技术栈数据失败:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchTechData()
})
</script>

<style scoped>
/* 基础复用类 */
.unselectable { user-select: none; -webkit-user-select: none; }

/* 全局容器 */
.tech-page-container {
  width: 95%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 0 80px 0;
  min-height: 100vh;
}

/* ================= 头部区域 ================= */
.page-header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}
.back-btn {
  position: absolute;
  left: 0;
  top: 0;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 192, 226, 0.3);
  color: #2f5496;
  padding: 8px 18px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 15px;
  transition: all 0.2s ease;
  cursor: pointer;
}
.back-btn:hover {
  background: white;
  box-shadow: 0 4px 15px rgba(0, 192, 226, 0.15);
  transform: translateY(-2px);
}
.page-title {
  font-family: "Ma Shan Zheng", cursive;
  font-size: clamp(35px, 6vw, 55px);
  background: linear-gradient(135deg, #00c0e2, #2f5496);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin: 0 0 10px 0;
}
.page-subtitle {
  color: #8fa0b5;
  font-size: 16px;
  letter-spacing: 2px;
  margin: 0;
}

/* ================= 分类版块 (完全对齐 Home.vue 的 main-content-wrap) ================= */
.tech-section {
  /* 🚀 核心优化：彻底移除 backdrop-filter，改用 Home 页同款透明背景！ */
  background: rgba(255, 255, 255, 0.85); 
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 40px; 
  padding: 40px; 
  margin-bottom: 50px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
}

.section-header { margin-bottom: 30px; }
.section-header h2 {
  font-size: 24px;
  color: #2f5496;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}
.emoji-icon { font-size: 28px; }
.section-divider {
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #00c0e2, transparent);
  border-radius: 2px;
}

/* ================= 核心：响应式网格与卡片 (对齐 Home 页搜索结果卡片) ================= */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 25px;
}

.tech-card {
  /* 🚀 核心优化：复刻 Home.vue 的 .result-card 样式，轻量且流畅 */
  background: rgba(240, 245, 255, 0.4);
  border: 1px solid transparent;
  border-radius: 20px;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
}

.tech-card:hover {
  background: white; 
  transform: translateY(-5px); 
  box-shadow: 0 4px 12px rgba(47, 84, 150, 0.1); 
  border-color: #00c0e2;
}

/* 图片对齐 Home 页技术栈图片样式 */
.tech-img {
  width: 55px; 
  height: 55px;
  border-radius: 12px;
  object-fit: contain; 
  background: rgba(255, 255, 255, 0.9); 
  padding: 5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 12px;
}

.tech-name {
  font-size: 15px;
  color: #2f5496;
  font-weight: 800;
  text-align: center;
  margin-bottom: 6px;
}

.tech-stars {
  display: flex;
  justify-content: center;
}
.star {
  font-size: 13px;
  color: #FFD700;
  margin: 0 1px;
}

/* 空状态加载 */
.empty-state {
  text-align: center;
  padding: 100px 0;
  color: #2f5496;
  font-size: 18px;
  font-weight: bold;
}
.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* ================= 移动端适配 ================= */
@media (max-width: 768px) {
  .tech-section { padding: 25px; border-radius: 30px; }
  .tech-grid { grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 15px; }
  .tech-card { padding: 15px 10px; border-radius: 20px; }
  .tech-img { width: 50px; height: 50px; }
  .tech-name { font-size: 14px; }
  .star { font-size: 12px; }
  
  .back-btn { position: relative; display: inline-block; margin-bottom: 20px; }
}
</style>