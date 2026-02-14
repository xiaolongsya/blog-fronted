<template>
  <div class="home-page">
    <section class="title-avatar-wrap">
      <div class="side-nav">
        <button class="recent-btn unselectable hover-scale" @click="router.push('/recent-activity')">
          <span class="btn-icon">🌊</span> 看看龙在做什么
        </button>
      </div>

      <div class="header-main">
        <h1 class="blog-main-title unselectable">小龙の分享站</h1>
        
        <div class="search-container">
          <div class="search-box">
            <input 
              type="text" 
              v-model="keyword" 
              @keyup.enter="handleSearch"
              placeholder="搜索龙的成长记录..." 
              class="search-input"
            />
            <button class="search-btn hover-scale" @click="handleSearch">
              <span v-if="!isSearching">🔍</span>
              <span v-else class="loading-spinner">↻</span>
            </button>
          </div>

          <transition name="fade-slide">
            <div class="search-results-list" v-show="searchResult.length > 0 || hasSearched || isSearching">
              
              <div v-if="isSearching" class="searching-state">
                <span class="loading-dots">正在全力搜索中</span>
              </div>

              <div v-else class="results-wrapper">
                <div class="results-header">
                  <span>找到 {{ searchResult.length }} 条相关记录</span>
                  <span class="close-results" @click="clearSearch">✕</span>
                </div>
                
                <div v-if="searchResult.length === 0 && hasSearched" class="no-result">
                  没有找到相关内容，换个关键词试试？
                </div>

                <div class="results-scroller">
                  <div 
                    v-for="(item, index) in searchResult" 
                    :key="item.id || index" 
                    class="result-card"
                    @click="openDetailModal(item)"
                  >
                    <span class="card-time-tag">{{ formatTimeSimple(item.createTime) }}</span>
                    <h3 class="card-title">{{ item.title }}</h3>
                    <p class="card-preview">{{ parseContentPreview(item.content) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="side-profile">
        <div class="admin-entry">
          <button class="admin-btn unselectable hover-scale" @click="showLoginModal = true">
            <span class="btn-icon">🔑</span> 龙岛后台
          </button>
        </div>
        <img 
          class="personal-avatar" 
          src="https://xiaolongya.cn/uploads/avatar.jpg" 
          alt="个人头像"   
          @click="router.push('/dragon-den')" 
        />
      </div>
    </section>

    <section class="main-content-wrap">
      <div class="content-header unselectable">
        <p class="content-tip-text">
          探索龙的 <span class="highlight">开源项目</span> · 
          寻获 <span class="highlight">实用工具</span> · 
          共鸣 <span class="highlight">成长感悟</span>
        </p>
        <div class="divider"></div>
      </div>
      
      <div class="circles-row">
        <div 
          class="circle-item" 
          v-for="(item, idx) in circleList" 
          :key="idx"  
          @click.prevent="handleCircleClick(item)"
        >
          <div class="circle-bg unselectable">
            <span class="circle-text">{{ item.content }}</span>
            <div class="glass-reflection"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="beian-info-wrap">
      <a href="https://beian.miit.gov.cn/" target="_blank" class="beian-link">
        粤ICP备2026012519号-1
      </a>
    </section>

    <Transition name="modal-fast">
      <div class="login-modal-mask" v-if="showLoginModal" @click="closeLoginModal">
        <div class="login-modal gpu-layer" @click.stop>
          <Transition name="fade">
            <div class="success-overlay" v-if="loginSuccess">
              <div class="success-content">
                <div class="check-icon">✔</div>
                <p>身份核验通过，欢迎归岛</p>
              </div>
            </div>
          </Transition>

          <div class="modal-decoration"></div>
          <div class="modal-header unselectable">
            <div class="dragon-logo">🐲</div>
            <h2 class="modal-title">身份核验</h2>
          </div>
          <div class="modal-body">
            <div class="input-group">
              <input type="text" v-model="loginForm.username" placeholder="管理员账号" class="modal-input" :disabled="loginSuccess" />
            </div>
            <div class="input-group">
              <input type="password" v-model="loginForm.password" placeholder="通行密码" class="modal-input" :disabled="loginSuccess" />
            </div>
          </div>
          <div class="modal-btn-group">
            <button class="modal-login-btn unselectable hover-scale" @click="handleLogin" :disabled="isLoginLoading || loginSuccess">
              {{ isLoginLoading ? '正在核验...' : '进入龙岛' }}
            </button>
            <button class="modal-close-btn unselectable" @click="closeLoginModal" v-if="!loginSuccess">暂不进入</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fast">
      <div class="login-modal-mask" v-if="showDetailModal" @click="closeDetailModal">
        <div class="detail-modal gpu-layer" @click.stop>
          <div class="modal-decoration"></div>
          
          <div class="detail-header">
            <button 
              v-if="currentArticle.growthId" 
              class="view-category-btn hover-scale"
              @click="goToCategory(currentArticle.growthId, currentArticle.title)"
            >
              📂 查看收录合集
            </button>

            <h2 class="detail-title">{{ currentArticle.title }}</h2>
            <div class="detail-meta">
              <span>📅 {{ currentArticle.createTime }}</span>
            </div>
          </div>
          
          <div class="detail-content scroll-content">
            <div v-if="isRenderingDetail" class="loading-placeholder">
              <div class="skeleton-line" style="width: 100%"></div>
              <div class="skeleton-line" style="width: 80%"></div>
              <div class="skeleton-line" style="width: 90%"></div>
              <div class="skeleton-line" style="width: 60%"></div>
            </div>
            <div v-else class="content-body" v-html="detailContentHtml"></div>
          </div>
          
          <button class="modal-close-btn" @click="closeDetailModal" style="margin-top: 10px;">关闭阅读</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
// 1. 引入统一的请求工具
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()

// --- 基础配置 ---
const circleList = [
  { content: "龙岛发展\n(开源项目)", path: '/dragon-development' },
  { content: "龙岛聚会\n(评论社区)", path: '/comment-area' },
  { content: "龙岛秘藏\n(更多分享)", path: '' } 
];

const handleCircleClick = async (item) => {
  if (item.path) {
    await nextTick()
    router.push(item.path)
  }
}

// --- 搜索逻辑 ---
const keyword = ref('')
const searchResult = ref([])
const isSearching = ref(false)
const hasSearched = ref(false) 

const handleSearch = async () => {
  if (!keyword.value.trim()) return
  
  searchResult.value = []
  isSearching.value = true
  hasSearched.value = true 
  
  try {
    // 2. 使用 request.get，并适配 res.code === 200
    const res = await request.get(`/node/listByKeyword`, {
      params: { keyword: keyword.value }
    })
    
    // 这里的延时是为了保留你原有的搜索动画体感
    setTimeout(() => {
      if (res.code === 200) {
        searchResult.value = res.data || []
      }
      isSearching.value = false
    }, 300)
  } catch (error) {
    console.error("搜索失败", error)
    isSearching.value = false
  }
}

const clearSearch = () => {
  keyword.value = ''
  searchResult.value = []
  hasSearched.value = false
  isSearching.value = false
}

// --- 详情弹窗逻辑 ---
const showDetailModal = ref(false)
const currentArticle = ref({})
const isRenderingDetail = ref(true) 
const detailContentHtml = ref('')

watch(showDetailModal, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const openDetailModal = (item) => {
  currentArticle.value = item
  isRenderingDetail.value = true
  detailContentHtml.value = '' 
  showDetailModal.value = true
  
  requestAnimationFrame(() => {
    setTimeout(() => {
      detailContentHtml.value = parseContentDetail(item.content)
      isRenderingDetail.value = false
    }, 200)
  })
}

const closeDetailModal = () => {
  showDetailModal.value = false
}

const goToCategory = async (growthId, categoryName) => {
  if (!growthId) return
  closeDetailModal()
  await nextTick()
  router.push({
    path: '/category-detail',
    query: { 
      id: growthId,
      name: categoryName || '关联分类' 
    }
  })
}

// --- 内容解析工具 ---
const formatTimeSimple = (timeStr) => timeStr ? timeStr.split(' ')[0] : ''

const parseContentPreview = (content) => {
  if (!content) return ''
  let text = content.replace(/\[IMAGE:.*?\]/g, '')
  text = text.replace(/\n/g, ' ')
  return text.length > 80 ? text.substring(0, 80) + '...' : text
}

const parseContentDetail = (content) => {
  if (!content) return ''
  let html = content.replace(/</g, "&lt;").replace(/>/g, "&gt;")
  html = html.replace(/\[IMAGE:(.*?)\]/g, (match, url) => {
    return `<img src="${url}" class="detail-img" alt="插图" loading="lazy" />`
  })
  html = html.replace(/\n/g, '<br/>')
  return html
}

// --- 登录逻辑 ---
const showLoginModal = ref(false)
const loginForm = ref({ username: '', password: '' })
const isLoginLoading = ref(false)
const loginSuccess = ref(false)

const closeLoginModal = () => {
  if (loginSuccess.value) return
  showLoginModal.value = false
  loginForm.value = { username: '', password: '' }
}

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('账号或密码为空！')
    return
  }
  isLoginLoading.value = true
  try {
    // 3. 使用 request.post，注意：后端返回的是纯字符串 "登陆成功"
    // request.js 里的拦截器会直接返回 res.data
    const res = await request.post('/user/login', loginForm.value)
    
    if (res === "登陆成功") {
      loginSuccess.value = true;
      sessionStorage.setItem('isAdminLogin', 'true'); 
      setTimeout(() => { router.push('/admin') }, 1500);
    } else { 
      ElMessage.error('核验未通过'); 
    }
  } catch (e) { 
    console.error(e) 
  } finally { 
    isLoginLoading.value = false 
  }
}
</script>

<style scoped>
.unselectable { user-select: none; -webkit-user-select: none; cursor: pointer !important; }
.hover-scale { transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
.hover-scale:active { transform: scale(0.95); }
.gpu-layer { will-change: transform, opacity; transform: translateZ(0); }

.home-page { width: 95%; max-width: 1200px; margin: 0 auto; }
.title-avatar-wrap { display: flex; flex-direction: column; align-items: center; padding: 50px 0; gap: 30px; position: relative; }

@media (max-width: 1023px) {
  .side-profile { display: flex; flex-direction: column; align-items: center; gap: 20px; }
  .admin-entry { display: flex; justify-content: center; width: 100%; }
}
@media (min-width: 1024px) {
  .title-avatar-wrap { flex-direction: row; justify-content: space-between; min-height: 160px; align-items: flex-start; }
  .side-nav, .side-profile { flex: 1; display: flex; align-items: center; margin-top: 20px; }
  .side-profile { justify-content: flex-end; gap: 25px; }
  .header-main { flex: 1.5; display: flex; flex-direction: column; align-items: center; }
}

.blog-main-title {
  font-family: "Ma Shan Zheng", cursive; font-size: clamp(40px, 8vw, 75px);
  background: linear-gradient(135deg, #00c0e2, #2f5496); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.05)); margin-bottom: 20px;
}

/* --- 搜索组件 --- */
.search-container { width: 100%; max-width: 550px; position: relative; z-index: 100; }
.search-box {
  display: flex; background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.9); border-radius: 30px; padding: 5px 5px 5px 20px;
  box-shadow: 0 8px 20px rgba(47, 84, 150, 0.08); transition: all 0.3s ease;
}
.search-box:focus-within { background: #fff; box-shadow: 0 8px 25px rgba(0, 192, 226, 0.2); border-color: #00c0e2; transform: translateY(-2px); }
.search-input { flex: 1; border: none; background: transparent; font-size: 16px; color: #2f5496; outline: none; }
.search-btn { background: linear-gradient(135deg, #00c0e2, #2f5496); color: white; border: none; width: 42px; height: 42px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; }

/* 搜索结果框外层：设置 max-height 限制高度 */
.search-results-list {
  position: absolute; top: 60px; left: 0; width: 100%; 
  max-height: 60vh; /* 限制为屏幕高度的 60% */
  background: rgba(255, 255, 255, 0.98); border-radius: 20px; box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  padding: 10px; border: 1px solid rgba(255, 255, 255, 0.8); 
  display: flex; flex-direction: column; 
}

/* 【新增】内部包裹层：确保 Flex 布局生效，这是滚动的关键 */
.results-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%; /* 占满父容器 */
  overflow: hidden; /* 防止自身溢出 */
}

.searching-state { padding: 30px; text-align: center; color: #00c0e2; font-weight: bold; }
.loading-dots::after { content: '...'; animation: dots 1.5s steps(5, end) infinite; }
@keyframes dots { 0%, 20% { content: ''; } 40% { content: '.'; } 60% { content: '..'; } 80%, 100% { content: '...'; } }

/* 滚动区域：flex: 1 自动填充剩余空间，overflow-y: auto 允许滚动 */
.results-scroller { 
  overflow-y: auto; 
  flex: 1; 
  padding-right: 5px; 
  scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; content-visibility: auto; 
}
.results-scroller::-webkit-scrollbar { width: 5px; }
.results-scroller::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

.results-header { display: flex; justify-content: space-between; padding: 5px 15px 10px; border-bottom: 1px solid #eee; color: #8fa0b5; font-size: 13px; flex-shrink: 0; }
.close-results:hover { color: #ff4d4f; }
.no-result { padding: 30px; text-align: center; color: #8fa0b5; }

.result-card {
  padding: 15px; margin: 8px 0; border-radius: 12px; background: rgba(240, 245, 255, 0.4);
  cursor: pointer; transition: transform 0.1s ease, background 0.2s ease;
  position: relative; border: 1px solid transparent; text-align: left;
}
.result-card:active { transform: scale(0.98); background: rgba(240, 245, 255, 0.8); }
.result-card:hover { background: white; transform: translateX(5px); box-shadow: 0 4px 12px rgba(47, 84, 150, 0.1); border-color: #00c0e2; }

.card-time-tag { position: absolute; top: 15px; right: 15px; font-size: 12px; color: #00c0e2; font-weight: 600; background: rgba(0, 192, 226, 0.1); padding: 2px 8px; border-radius: 6px; }
.card-title { margin: 0 0 6px 0; font-size: 16px; color: #2f5496; font-weight: bold; padding-right: 80px; }
.card-preview { margin: 0; font-size: 13px; color: #666; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* 详情模态框 */
.detail-modal {
  background: white; width: 90%; max-width: 650px; max-height: 85vh;
  display: flex; flex-direction: column; padding: 30px; border-radius: 25px; 
  box-shadow: 0 25px 80px rgba(0,0,0,0.2); position: relative; overflow: hidden;
}
.detail-header { 
  border-bottom: 2px solid #f0f5ff; padding-bottom: 15px; margin-bottom: 15px; text-align: left; 
  position: relative; padding-right: 140px; 
}
.detail-title { color: #2f5496; margin: 0 0 10px 0; font-size: 24px; }
.detail-meta { font-size: 14px; color: #8fa0b5; }

.view-category-btn {
  position: absolute; top: 0; right: 0;
  background: white; border: 1.5px solid #00c0e2; color: #00c0e2;
  padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: bold;
  cursor: pointer; display: flex; align-items: center; gap: 5px; transition: all 0.3s ease; z-index: 10;
}
.view-category-btn:hover { background: #00c0e2; color: white; box-shadow: 0 4px 10px rgba(0, 192, 226, 0.2); }

.detail-content { flex: 1; overflow-y: auto; text-align: left; line-height: 1.8; color: #333; font-size: 16px; padding-right: 5px; }

/* 骨架屏 */
.loading-placeholder { padding: 20px 0; }
.skeleton-line { height: 16px; background: #f0f2f5; margin-bottom: 15px; border-radius: 4px; animation: pulse 1.5s infinite ease-in-out; }
@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
.content-body { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* 主内容区域 */
.main-content-wrap {
  background: rgba(255, 255, 255, 0.85); border: 1px solid rgba(255,255,255,0.6);
  border-radius: 80px; padding: 80px 40px; margin-bottom: 60px; text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
}

/* 其他样式保持不变 */
.content-header { margin-bottom: 70px; }
.content-tip-text { font-size: clamp(18px, 4vw, 26px); color: #3d5a80; font-weight: 500; }
.highlight { color: #2f5496; font-weight: 800; border-bottom: 2px solid #00c0e2; margin: 0 4px; }
.divider { width: 80px; height: 3px; background: linear-gradient(90deg, transparent, #00c0e2, #2f5496, transparent); margin: 25px auto; }
.circles-row { display: flex; justify-content: center; gap: 50px; flex-wrap: wrap; }
.circle-bg { width: 200px; height: 200px; background: rgba(255, 255, 255, 0.6); border-radius: 50px; display: flex; justify-content: center; align-items: center; border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 15px 35px rgba(47, 84, 150, 0.08); position: relative; overflow: hidden; transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1); }
.circle-bg:hover { transform: translateY(-15px); background: white; box-shadow: 0 30px 60px rgba(47, 84, 150, 0.15); }
.circle-text { font-size: 22px; font-weight: 800; color: #2f5496; line-height: 1.4; z-index: 2; pointer-events: none; white-space: pre-line; text-align: center; }
@media (min-width: 1024px) { .circle-bg { width: 260px; height: 260px; border-radius: 70px; } .circle-text { font-size: 30px; } }
.glass-reflection { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent); transform: rotate(45deg); transition: all 0.7s; }
.circle-bg:hover .glass-reflection { transform: rotate(45deg) translate(25%, 25%); }

.login-modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 32, 55, 0.3); z-index: 2000; display: flex; justify-content: center; align-items: center; will-change: opacity; }
.login-modal { background: white; width: 90%; max-width: 400px; padding: 45px; border-radius: 35px; box-shadow: 0 25px 70px rgba(0,0,0,0.15); position: relative; overflow: hidden; }
.success-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 10; display: flex; justify-content: center; align-items: center; }
.check-icon { width: 65px; height: 65px; background: #52c41a; color: white; border-radius: 50%; font-size: 32px; line-height: 65px; margin: 0 auto 20px; text-align: center; }
.modal-decoration { position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: linear-gradient(90deg, #00c0e2, #2f5496); }
.modal-title { font-family: "Ma Shan Zheng", cursive; font-size: 30px; margin-bottom: 35px; color: #2f5496; text-align: center; }
.modal-input { width: 100%; padding: 16px; margin-bottom: 18px; border-radius: 15px; border: 1.5px solid #f0f0f0; background: #f9fbff; transition: all 0.3s; }
.modal-input:focus { border-color: #00c0e2; background: white; outline: none; }
.modal-login-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #2f5496, #1a3a6d); color: white; border: none; border-radius: 15px; font-weight: 700; font-size: 17px; cursor: pointer; }
.modal-close-btn { background: none; border: none; color: #b0bfc6; cursor: pointer; margin-top: 20px; width: 100%; }

.modal-fast-enter-active { transition: opacity 0.3s ease; }
.modal-fast-leave-active { transition: opacity 0.2s ease; }
.modal-fast-enter-active .login-modal, .modal-fast-enter-active .detail-modal { transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.modal-fast-enter-from .login-modal, .modal-fast-enter-from .detail-modal { transform: scale(0.9) translateY(20px); }

.recent-btn { background: rgba(47, 84, 150, 0.05); color: #d88e26; border: 1.5px solid rgba(47, 84, 150, 0.2); padding: 10px 24px; border-radius: 12px; font-weight: 600; font-size: 25px; backdrop-filter: blur(5px); }
.recent-btn:hover { background: #2f5496; color: white; box-shadow: 0 5px 15px rgba(47, 84, 150, 0.2); }
.admin-btn { background: transparent; color: #d88e26; border: 1.5px solid rgba(47, 84, 150, 0.1); padding: 8px 18px; border-radius: 12px; font-size: 25px; font-weight: 600; }
.admin-btn:hover { border-color: #00c0e2; background: rgba(0, 192, 226, 0.05); color: #00c0e2; }
.personal-avatar { width: 90px; height: 90px; border-radius: 50%; border: 4px solid white; box-shadow: 0 8px 25px rgba(0,0,0,0.08); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.personal-avatar:hover { transform: scale(1.1) rotate(5deg); }
.beian-link { font-size: 13px; color: #cbd5e1; text-decoration: none; transition: color 0.3s; }
.beian-link:hover { color: #2f5496; }
:deep(.detail-img) { max-width: 100%; border-radius: 10px; margin: 15px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.1); display: block; }
.loading-spinner { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>