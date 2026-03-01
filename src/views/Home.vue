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

    <!-- 手机端悬浮球：仅在移动端显示 -->
    <div class="ai-float-ball" @click="toggleAiPanel" v-if="isMobile">
      <span class="ball-icon">🤖</span>
    </div>

    <!-- AI 聊天面板：电脑端固定，移动端悬浮展开 -->
    <div 
      class="ai-wrapper unselectable"
      :class="{ 'mobile-open': showAiPanel && isMobile }"
    >
      <div class="tech-header">
        <h3 class="tech-title">龙岛AI助手</h3>
        <p class="tech-sub">阿里云百炼-强力驱动</p>
        <!-- 移动端关闭按钮（阻止事件冒泡） -->
        <button 
          class="ai-close-btn" 
          @click.stop="toggleAiPanel"
          v-if="isMobile"
        >
          ✕
        </button>
      </div>

      <div class="ai-chat-area" ref="chatScroll">
        <div v-for="(msg, i) in messages" :key="i" :class="['msg-row', msg.role]">
          <!-- 用户消息：纯文本 -->
          <div class="msg-bubble" v-if="msg.role === 'user' && msg.content">
            {{ msg.content }}
          </div>
          <!-- AI消息：支持[[关键词]]渲染可点击按钮 -->
          <div v-if="msg.role === 'assistant' && msg.displayContent" class="msg-bubble markdown-content">
            <span v-if="isAiTyping || typewriterTimer">{{ msg.displayContent }}</span>
            <span v-else v-html="renderClickableMarkdown(msg.displayContent)"></span>
          </div>
        </div>
        
        <!-- 打字动画：仅在AI正在输入时显示 -->
        <div v-if="isAiTyping" class="msg-row assistant">
          <div class="msg-bubble typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <div class="ai-input-area">
        <input 
          type="text" 
          v-model="aiQuery" 
          @keyup.enter="!isAiThinking && aiCooldown === 0 && handleAiChat()"
          placeholder="向龙岛助手提问 (限300字)..." 
          :disabled="isAiThinking"
          maxlength="300" 
        />
        <button 
          class="ai-send-btn" 
          @click="handleAiChat" 
          :disabled="isAiThinking || aiCooldown > 0"
          :class="{ 'in-cooldown': aiCooldown > 0 }"
        >
          <span v-if="!isAiThinking && aiCooldown === 0">🚀</span>
          <span v-else-if="aiCooldown > 0" class="cooldown-num">{{ aiCooldown }}s</span>
          <span v-else class="loading-spinner">↻</span>
        </button>
      </div>
      
      <div class="word-count-hint" :class="{ 'warning': aiQuery.length >= 280 }">
        {{ aiQuery.length }}/300
      </div>
    </div>

    <div class="tech-wrapper unselectable" v-if="techStackList.length > 0">
      <div class="tech-header">
        <h3 class="tech-title">小龙の技术栈</h3>
        <p class="tech-sub hover-scale" @click="router.push('/tech-categories')">点击查看具体分类</p>
      </div>

      <div 
        class="tech-scroll-area" 
        ref="scrollContainer"
        @mouseenter="isPaused = true" 
        @mouseleave="isPaused = false"
      >
        <div class="tech-scroll-track">
          <div class="tech-item" v-for="(item, index) in duplicatedList" :key="index">
            <img :src="item.imgUrl" class="tech-img" :alt="item.name" />
            <span class="tech-name">{{ item.name }}</span>
            <div class="tech-stars">
              <span v-for="n in item.starRating" :key="n" class="star">⭐</span>
            </div>
          </div>
        </div>
      </div>
      <div class="tech-footer">熟练度上限五颗星</div>
    </div>
  </div>
  <!-- 登录弹窗 -->
<transition name="modal-fast">
  <div class="login-modal-mask" v-if="showLoginModal" @click="closeLoginModal">
    <div class="login-modal" @click.stop>
      <!-- 登录成功提示层 -->
      <div class="success-overlay" v-if="loginSuccess">
        <div class="success-content">
          <div class="check-icon">✓</div>
          <h3>登录成功！</h3>
          <p>即将跳转到管理后台...</p>
        </div>
      </div>

      <!-- 登录表单层 -->
      <div v-else>
        <div class="modal-decoration"></div>
        <h2 class="modal-title">龙岛管理后台</h2>
        <input 
          v-model="loginForm.username" 
          type="text" 
          placeholder="请输入管理员账号" 
          class="modal-input"
        />
        <input 
          v-model="loginForm.password" 
          type="password" 
          placeholder="请输入管理员密码" 
          class="modal-input"
        />
        <button 
          class="modal-login-btn" 
          @click="handleLogin"
          :disabled="isLoginLoading"
        >
          <span v-if="!isLoginLoading">登录</span>
          <span v-else class="loading-spinner">↻</span>
        </button>
        <button class="modal-close-btn" @click="closeLoginModal">取消</button>
      </div>
    </div>
  </div>
</transition>

<!-- 文章详情弹窗 -->
<transition name="modal-fast">
  <div class="login-modal-mask" v-if="showDetailModal" @click="closeDetailModal">
    <div class="detail-modal" @click.stop>
      <div class="detail-header">
        <h2 class="detail-title">{{ currentArticle.title }}</h2>
        <p class="detail-meta">{{ formatTimeSimple(currentArticle.createTime) }}</p>
        <button 
          class="view-category-btn" 
          v-if="currentArticle.growthId"
          @click="goToCategory(currentArticle.growthId, currentArticle.categoryName)"
        >
          查看分类
        </button>
      </div>
      <div class="detail-content markdown-body">
        <div v-if="isRenderingDetail" class="loading-placeholder">
          <div class="skeleton-line" style="width: 80%;"></div>
          <div class="skeleton-line" style="width: 100%;"></div>
          <div class="skeleton-line" style="width: 90%;"></div>
        </div>
        <div v-else class="content-body" v-html="detailContentHtml"></div>
      </div>
    </div>
  </div>
</transition>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue' 
import { useRouter } from 'vue-router'
import request from '@/utils/request'
import { ElMessage } from 'element-plus'

// ========== 1. 引入 Markdown 渲染库 ==========
import MarkdownIt from 'markdown-it'
import 'github-markdown-css/github-markdown.css'

const router = useRouter()
// 核心：仅用 markdown-it 内置功能，不依赖任何插件
const md = new MarkdownIt({
  html: true,         // 支持 HTML 表单/按钮
  linkify: true,      // 自动识别链接
  breaks: true,       // 换行符转 <br>
  typographer: true,  // 优化排版
  gfm: true           // 开启 GFM，内置表格解析（关键）
})

// ========== 设备判断：区分手机/电脑端 ==========
const isMobile = ref(false)
const checkDevice = () => {
  isMobile.value = window.innerWidth < 1024
}

// ========== 手机端AI面板控制 ==========
const showAiPanel = ref(false)
const toggleAiPanel = () => {
  showAiPanel.value = !showAiPanel.value
  if (showAiPanel.value) {
    nextTick(() => scrollToBottomDebounced())
  }
}

// ========== 性能优化：防抖函数 ==========
const debounce = (fn, delay = 100) => {
  let timer = null
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// ========== Markdown 渲染函数（支持[[关键词]]可点击） ==========
const renderMarkdown = (content) => {
  if (!content) return ''
  // 1. 彻底还原所有转义字符，确保Markdown语法生效
  const formattedContent = content
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
  // 2. 简单渲染，避免复杂逻辑导致白屏
  return md.render(formattedContent)
}

// 新增：解析[[关键词]]并渲染成可点击搜索按钮
const renderClickableMarkdown = (content) => {
  if (!content) return '';
  
  // 步骤1：先渲染普通Markdown
  const rawHtml = renderMarkdown(content);
  
  // 步骤2：替换[[关键词]]为可点击按钮（核心逻辑）
  const clickableHtml = rawHtml.replace(
    /\[\[(.*?)\]\]/g, // 匹配[[关键词]]格式
    (match, keyword) => {
      // 生成可点击按钮，绑定全局搜索方法
      return `<button 
        class="search-trigger-btn" 
        onclick="window.triggerSearchFromAI('${keyword}')"
        title="点击搜索 ${keyword} 相关内容"
      >${keyword}</button>`;
    }
  );
  
  return clickableHtml;
};

// 新增：暴露全局搜索方法（供按钮调用）
window.triggerSearchFromAI = (searchKeyword) => {
  if (!searchKeyword || typeof searchKeyword !== 'string') return;
  
  // 1. 填入页面搜索框
  keyword.value = searchKeyword.trim();
  // 2. 自动触发搜索
  handleSearch();
  // 3. 优化体验：滚动到搜索结果区域
  nextTick(() => {
    const searchResultEl = document.querySelector('.search-results-list');
    if (searchResultEl) {
      searchResultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // 手机端自动关闭AI面板，显示搜索结果
    if (isMobile.value) {
      showAiPanel.value = false;
    }
  });
};

// ========== 🐲 AI 对话核心逻辑 ==========
const aiQuery = ref('') 
const isAiThinking = ref(false) 
const isAiTyping = ref(false) 
const chatScroll = ref(null) 
const aiCooldown = ref(0) 
let typewriterTimer = null

// 消息结构（初始化避免白屏）
const messages = ref([
  { role: 'assistant', content: '', displayContent: '你好！我是龙岛 AI，有什么可以帮你的吗？' }
])

// 自动滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatScroll.value) {
    chatScroll.value.scrollTo({ 
      top: chatScroll.value.scrollHeight, 
      behavior: 'smooth' 
    })
  }
}
const scrollToBottomDebounced = debounce(scrollToBottom, 80)

// 冷却倒计时
const startCooldown = (seconds) => {
  aiCooldown.value = seconds
  const timer = setInterval(() => {
    aiCooldown.value--
    if (aiCooldown.value <= 0) clearInterval(timer)
  }, 1000)
}

// AI对话核心（优化版，支持完整解析[[关键词]]）
const handleAiChat = async () => {
  if (!aiQuery.value.trim() || isAiThinking.value || aiCooldown.value > 0) return;

  const userContent = aiQuery.value.trim();
  messages.value.push({ role: 'user', content: userContent, displayContent: userContent });
  aiQuery.value = '';
  isAiThinking.value = true;
  isAiTyping.value = true;
  await scrollToBottom();

  const aiMessageObj = { role: 'assistant', content: '', displayContent: '' };
  messages.value.push(aiMessageObj);
  let fullResponse = '';

  try {
    const response = await fetch('https://xiaolongya.cn/blog/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
      body: JSON.stringify({
        messages: messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.displayContent })),
        stream: true
      })
    });

    if (!response.ok) throw new Error(`HTTP 错误: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (let line of lines) {
        line = line.trim();
        if (!line || line === 'data: [DONE]') continue;

        // 优化：优先解析完整JSON，避免正则截断[[关键词]]
        try {
          let jsonStr = line.startsWith('data: ') ? line.slice(6).trim() : line;
          if (jsonStr && jsonStr !== '[DONE]') {
            const data = JSON.parse(jsonStr);
            const delta = data?.choices?.[0]?.delta?.content; // 移除 || ''，只取原始值
            if (delta && delta.trim() !== '') { // 增加非空+去空格判断
              isAiTyping.value = false;
              fullResponse += delta;
              // 实时更新，强制响应式
              setTimeout(() => {
                aiMessageObj.displayContent = fullResponse;
                messages.value = [...messages.value];
                scrollToBottomDebounced();
              }, 0);
            }
          }
        } catch (e) {
          // 兼容正则提取（兜底）
          const match = line.match(/"content"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
          if (match && match[1]) {
            const delta = match[1]
              .replace(/\\n/g, '\n')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
            if (delta && delta.trim() !== '') { // 增加非空+去空格判断
              isAiTyping.value = false;
              fullResponse += delta;
              setTimeout(() => {
                aiMessageObj.displayContent = fullResponse;
                messages.value = [...messages.value];
                scrollToBottomDebounced();
              }, 0);
            }
          }
        }
      }
    }

    if (!fullResponse) {
      setTimeout(() => {
        aiMessageObj.displayContent = "你可以问我关于小龙的开源项目、技术栈相关的问题～";
        messages.value = [...messages.value];
        scrollToBottomDebounced();
      }, 0);
    }

  } catch (e) {
    console.error('AI 失败:', e);
    setTimeout(() => {
      aiMessageObj.displayContent = `⚠️ 加载失败：${e.message}`;
      isAiTyping.value = false;
      messages.value = [...messages.value];
      scrollToBottomDebounced();
    }, 0);
  } finally {
    isAiThinking.value = false;
    isAiTyping.value = false;
    startCooldown(5);
  }
};

// ========== 其他辅助逻辑 ==========
const circleList = [
  { content: "龙岛发展\n(开源项目)", path: '/dragon-development' },
  { content: "龙岛聚会\n(评论社区)", path: '/comment-area' },
  { content: "龙岛秘藏\n(更多分享)", path: '' } 
];

const handleCircleClick = async (item) => {
  if (item.path) await router.push(item.path)
}

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
    const res = await request.get(`/node/listByKeyword`, { params: { keyword: keyword.value } })
    setTimeout(() => {
      if (res.code === 200) searchResult.value = res.data || []
      isSearching.value = false
    }, 300)
  } catch (error) { isSearching.value = false }
}

const clearSearch = () => {
  keyword.value = ''
  searchResult.value = []
  hasSearched.value = false
  isSearching.value = false
}

const showDetailModal = ref(false)
const currentArticle = ref({})
const isRenderingDetail = ref(true) 
const detailContentHtml = ref('')

watch(showDetailModal, (newVal) => {
  document.body.style.overflow = newVal ? 'hidden' : ''
})

const parseContentDetail = (content) => {
  if (!content) return ''
  const mdText = content.replace(/\[IMAGE:(.*?)\]/g, '![插图]($1)').replace(/\\n/g, '\n')
  return md.render(mdText)
}

const openDetailModal = (item) => {
  currentArticle.value = item
  isRenderingDetail.value = true
  detailContentHtml.value = '' 
  showDetailModal.value = true
  setTimeout(() => {
    detailContentHtml.value = parseContentDetail(item.content)
    isRenderingDetail.value = false
  }, 200)
}

const closeDetailModal = () => { showDetailModal.value = false }

const goToCategory = async (growthId, categoryName) => {
  if (!growthId) return
  closeDetailModal()
  await router.push({ path: '/category-detail', query: { id: growthId, name: categoryName || '关联分类' } })
}

const parseContentPreview = (content) => {
  if (!content) return ''
  let text = content.replace(/\[IMAGE:.*?\]/g, '').replace(/[#*`~>-]/g, '').replace(/\n/g, ' ')
  return text.length > 80 ? text.substring(0, 80) + '...' : text
}

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
    const res = await request.post('/user/login', loginForm.value)
    if (res === "登陆成功") {
      loginSuccess.value = true;
      sessionStorage.setItem('isAdminLogin', 'true'); 
      setTimeout(() => { router.push('/admin') }, 1500);
    } else { ElMessage.error('核验未通过'); }
  } catch (e) { console.error(e) }
  finally { isLoginLoading.value = false }
}

const techStackList = ref([])
const scrollContainer = ref(null)
let scrollTimer = null
const isPaused = ref(false)
let exactScrollPos = 0 

const duplicatedList = computed(() => {
  if (techStackList.value.length === 0) return []
  let baseList = [...techStackList.value]
  while (baseList.length < 10) baseList = baseList.concat(techStackList.value)
  return [...baseList, ...baseList]
})

const startAutoScroll = () => {
  const step = () => {
    const el = scrollContainer.value
    if (!el) return
    const isMobileDevice = window.innerWidth < 1024
    if (!isPaused.value) {
      exactScrollPos += 0.5 
      if (isMobileDevice) {
        const halfWidth = el.scrollWidth / 2
        if (exactScrollPos >= halfWidth) exactScrollPos -= halfWidth
        el.scrollLeft = exactScrollPos
      } else {
        const halfHeight = el.scrollHeight / 2
        if (exactScrollPos >= halfHeight) exactScrollPos -= halfHeight
        el.scrollTop = exactScrollPos
      }
    } else {
      exactScrollPos = isMobileDevice ? el.scrollLeft : el.scrollTop
    }
    scrollTimer = requestAnimationFrame(step)
  }
  scrollTimer = requestAnimationFrame(step)
}

const fetchTechStack = async () => {
  try {
    const res = await request.get('/stack/list')
    if (res.code === 200) {
      techStackList.value = res.data || []
      nextTick(() => { if (scrollContainer.value) startAutoScroll() })
    }
  } catch (err) { console.error(err) }
}

const formatTimeSimple = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  if (isNaN(date.getTime())) return timeStr
  return date.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  }).replace(/\//g, '-')
}

// ========== 生命周期 ==========
onMounted(() => {
  checkDevice()
  window.addEventListener('resize', checkDevice)
  fetchTechStack()
})

onBeforeUnmount(() => {
  if (typewriterTimer) clearInterval(typewriterTimer)
  if (scrollTimer) cancelAnimationFrame(scrollTimer)
  window.removeEventListener('resize', checkDevice)
})
</script>

<style scoped>
/* ================== 全局通用样式 ================== */
.unselectable { 
  user-select: none; 
  -webkit-user-select: none; 
  cursor: pointer !important; 
}
.hover-scale { 
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94); 
}
.hover-scale:active { 
  transform: scale(0.95); 
}
.gpu-layer { 
  will-change: transform, opacity; 
  transform: translateZ(0); 
}
.loading-spinner { 
  display: inline-block; 
  animation: spin 1s linear infinite; 
}
@keyframes spin { 
  0% { transform: rotate(0deg); } 
  100% { transform: rotate(360deg); } 
}

/* ================== 页面布局基础样式 ================== */
.home-page { 
  width: 95%; 
  max-width: 1200px; 
  margin: 0 auto; 
  position: relative; 
} 
.title-avatar-wrap { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  padding: 50px 0; 
  gap: 30px; 
  position: relative; 
}
.main-content-wrap {
  background: rgba(255, 255, 255, 0.85); 
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 80px; 
  padding: 80px 40px; 
  margin-bottom: 60px; 
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.02);
}
.beian-info-wrap {
  text-align: center;
  margin-bottom: 20px;
}
.beian-link { 
  font-size: 13px; 
  color: #cbd5e1; 
  text-decoration: none; 
  transition: color 0.3s; 
}
.beian-link:hover { 
  color: #2f5496; 
}

/* 大屏布局适配 (≥1024px) */
@media (min-width: 1024px) {
  .title-avatar-wrap { 
    flex-direction: row; 
    justify-content: space-between; 
    min-height: 160px; 
    align-items: flex-start; 
  }
  .side-nav, .side-profile { 
    flex: 1; 
    display: flex; 
    align-items: center; 
    margin-top: 20px; 
  }
  .side-profile { 
    justify-content: flex-end; 
    gap: 25px; 
  }
  .header-main { 
    flex: 1.5; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
  }
}

/* ================== 标题与导航样式 ================== */
.blog-main-title {
  font-family: "Ma Shan Zheng", cursive; 
  font-size: clamp(40px, 8vw, 75px);
  background: linear-gradient(135deg, #00c0e2, #2f5496); 
  -webkit-background-clip: text; 
  background-clip: text; 
  color: transparent;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.05)); 
  margin-bottom: 20px;
}
.recent-btn { 
  background: rgba(47, 84, 150, 0.05); 
  color: #d88e26; 
  border: 1.5px solid rgba(47, 84, 150, 0.2); 
  padding: 10px 24px; 
  border-radius: 12px; 
  font-weight: 600; 
  font-size: 25px; 
  backdrop-filter: blur(5px); 
}
.recent-btn:hover { 
  background: #2f5496; 
  color: white; 
  box-shadow: 0 5px 15px rgba(47, 84, 150, 0.2); 
}
.admin-btn { 
  background: transparent; 
  color: #d88e26; 
  border: 1.5px solid rgba(47, 84, 150, 0.1); 
  padding: 8px 18px; 
  border-radius: 12px; 
  font-size: 25px; 
  font-weight: 600; 
}
.admin-btn:hover { 
  border-color: #00c0e2; 
  background: rgba(0, 192, 226, 0.05); 
  color: #00c0e2; 
}
.personal-avatar { 
  width: 90px; 
  height: 90px; 
  border-radius: 50%; 
  border: 4px solid white; 
  box-shadow: 0 8px 25px rgba(0,0,0,0.08); 
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
}
.personal-avatar:hover { 
  transform: scale(1.1) rotate(5deg); 
}

/* ================== 搜索功能样式 ================== */
.search-container { 
  width: 100%; 
  max-width: 550px; 
  position: relative; 
  z-index: 100; 
}
.search-box {
  display: flex; 
  background: rgba(255, 255, 255, 0.8); 
  backdrop-filter: blur(5px); 
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.9); 
  border-radius: 30px; 
  padding: 5px 5px 5px 20px;
  box-shadow: 0 8px 20px rgba(47, 84, 150, 0.08); 
  transition: all 0.3s ease;
}
.search-box:focus-within { 
  background: #fff; 
  box-shadow: 0 8px 25px rgba(0, 192, 226, 0.2); 
  border-color: #00c0e2; 
  transform: translateY(-2px); 
}
.search-input { 
  flex: 1; 
  border: none; 
  background: transparent; 
  font-size: 16px; 
  color: #2f5496; 
  outline: none; 
}
.search-btn { 
  background: linear-gradient(135deg, #00c0e2, #2f5496); 
  color: white; 
  border: none; 
  width: 42px; 
  height: 42px; 
  border-radius: 50%; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 18px; 
}

/* 搜索结果列表 */
.search-results-list {
  position: absolute; 
  top: 60px; 
  left: 0; 
  width: 100%; 
  max-height: 60vh; 
  background: rgba(255, 255, 255, 0.98); 
  border-radius: 20px; 
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  padding: 10px; 
  border: 1px solid rgba(255, 255, 255, 0.8); 
  display: flex; 
  flex-direction: column; 
}
.results-wrapper { 
  display: flex; 
  flex-direction: column; 
  height: 100%; 
  overflow: hidden; 
}
.searching-state { 
  padding: 30px; 
  text-align: center; 
  color: #00c0e2; 
  font-weight: bold; 
}
.loading-dots::after { 
  content: '...'; 
  animation: dots 1.5s steps(5, end) infinite; 
}
@keyframes dots { 
  0%, 20% { content: ''; } 
  40% { content: '.'; } 
  60% { content: '..'; } 
  80%, 100% { content: '...'; } 
}
.results-scroller { 
  overflow-y: auto; 
  flex: 1; 
  padding-right: 5px; 
  scrollbar-width: thin; 
  scrollbar-color: #cbd5e1 transparent; 
  content-visibility: auto; 
}
.results-scroller::-webkit-scrollbar { width: 5px; }
.results-scroller::-webkit-scrollbar-thumb { 
  background: #cbd5e1; 
  border-radius: 10px; 
}
.results-header { 
  display: flex; 
  justify-content: space-between; 
  padding: 5px 15px 10px; 
  border-bottom: 1px solid #eee; 
  color: #8fa0b5; 
  font-size: 13px; 
  flex-shrink: 0; 
}
.close-results:hover { color: #ff4d4f; }
.no-result { 
  padding: 30px; 
  text-align: center; 
  color: #8fa0b5; 
}

/* 搜索结果卡片 */
.result-card {
  padding: 15px; 
  margin: 8px 0; 
  border-radius: 12px; 
  background: rgba(240, 245, 255, 0.4);
  cursor: pointer; 
  transition: transform 0.1s ease, background 0.2s ease; 
  position: relative; 
  border: 1px solid transparent; 
  text-align: left;
}
.result-card:active { 
  transform: scale(0.98); 
  background: rgba(240, 245, 255, 0.8); 
}
.result-card:hover { 
  background: white; 
  transform: translateX(5px); 
  box-shadow: 0 4px 12px rgba(47, 84, 150, 0.1); 
  border-color: #00c0e2; 
}
.card-time-tag {
  font-size: 12px;
  color: #8fa0b5;
  background: rgba(240, 245, 255, 0.8);
  padding: 2px 8px;
  border-radius: 6px;
}
.card-title {
  font-size: 16px;
  color: #2f5496;
  margin: 0 0 8px 0;
  font-weight: 600;
}
.card-preview { 
  margin: 0; 
  font-size: 13px; 
  color: #666; 
  line-height: 1.5; 
  display: -webkit-box; 
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical; 
  overflow: hidden; 
}

/* 移动端搜索卡片适配 (<=1023px) */
@media (max-width: 1023px) {
  .card-time-tag {
    position: relative; 
    top: auto; 
    right: auto;
    display: inline-block; 
    margin: 0 0 6px 0; 
    padding: 1px 6px; 
    font-size: 11px; 
  }
  .card-title {
    padding-right: 0; 
    margin-bottom: 2px; 
    font-size: 15px; 
  }
  .card-preview {
    font-size: 12px; 
    line-height: 1.4; 
  }
}

/* 大屏搜索卡片适配 (≥1024px) */
@media (min-width: 1024px) {
  .card-time-tag {
    position: absolute;
    top: 15px;
    right: 15px;
  }
  .card-title {
    padding-right: 80px;
    font-size: 16px;
  }
}

/* ================== 核心内容区样式 ================== */
.content-header { margin-bottom: 70px; }
.content-tip-text { 
  font-size: clamp(18px, 4vw, 26px); 
  color: #3d5a80; 
  font-weight: 500; 
}
.highlight { 
  color: #2f5496; 
  font-weight: 800; 
  border-bottom: 2px solid #00c0e2; 
  margin: 0 4px; 
}
.divider { 
  width: 80px; 
  height: 3px; 
  background: linear-gradient(90deg, transparent, #00c0e2, #2f5496, transparent); 
  margin: 25px auto; 
}
.circles-row { 
  display: flex; 
  justify-content: center; 
  gap: 50px; 
  flex-wrap: wrap; 
}
.circle-bg { 
  width: 200px; 
  height: 200px; 
  background: rgba(255, 255, 255, 0.6); 
  border-radius: 50px; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  border: 1px solid rgba(255,255,255,0.8); 
  box-shadow: 0 15px 35px rgba(47, 84, 150, 0.08); 
  position: relative; 
  overflow: hidden; 
  transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1); 
}
.circle-bg:hover { 
  transform: translateY(-15px); 
  background: white; 
  box-shadow: 0 30px 60px rgba(47, 84, 150, 0.15); 
}
.circle-text { 
  font-size: 22px; 
  font-weight: 800; 
  color: #2f5496; 
  line-height: 1.4; 
  z-index: 2; 
  pointer-events: none; 
  white-space: pre-line; 
  text-align: center; 
}
.glass-reflection { 
  position: absolute; 
  top: -50%; 
  left: -50%; 
  width: 200%; 
  height: 200%; 
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent); 
  transform: rotate(45deg); 
  transition: all 0.7s; 
}
.circle-bg:hover .glass-reflection { 
  transform: rotate(45deg) translate(25%, 25%); 
}

/* 大屏圆形按钮适配 (≥1024px) */
@media (min-width: 1024px) { 
  .circle-bg { 
    width: 260px; 
    height: 260px; 
    border-radius: 70px; 
  } 
  .circle-text { font-size: 30px; } 
}

/* ================== 弹窗相关样式 ================== */
/* 弹窗过渡动画 */
.modal-fast-enter-active { transition: opacity 0.3s ease; }
.modal-fast-leave-active { transition: opacity 0.2s ease; }
.modal-fast-enter-active .login-modal, 
.modal-fast-enter-active .detail-modal { 
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
}
.modal-fast-enter-from .login-modal, 
.modal-fast-enter-from .detail-modal { 
  transform: scale(0.9) translateY(20px); 
}

/* 登录弹窗（修复压缩问题） */
.login-modal-mask { 
  position: fixed; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: rgba(15, 32, 55, 0.3); 
  z-index: 2000; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  will-change: opacity; 
}
.login-modal { 
  background: white; 
  width: 90%; 
  max-width: 400px; 
  min-height: 300px; /* 核心修复：最小高度 */
  padding: 45px; 
  border-radius: 35px; 
  box-shadow: 0 25px 70px rgba(0,0,0,0.15); 
  position: relative; 
  overflow: hidden;
  /* 核心修复：Flex布局垂直居中 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
/* 登录成功提示层（核心修复） */
.success-overlay { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%; 
  background: white; 
  z-index: 10; 
  display: flex; 
  flex-direction: column;
  justify-content: center; 
  align-items: center;
  padding: 40px 20px;
  box-sizing: border-box;
}
.success-content {
  text-align: center;
  width: 100%;
  max-width: 280px;
}
.check-icon { 
  width: 65px; 
  height: 65px; 
  background: #52c41a; 
  color: white; 
  border-radius: 50%; 
  font-size: 32px; 
  line-height: 65px; 
  margin: 0 auto 20px; 
  text-align: center; 
}
.success-content h3 {
  font-size: 22px;
  color: #2f5496;
  margin: 0 0 10px 0;
  font-weight: 700;
}
.success-content p {
  font-size: 14px;
  color: #8fa0b5;
  margin: 0;
  line-height: 1.5;
}
.modal-decoration { 
  position: absolute; 
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 8px; 
  background: linear-gradient(90deg, #00c0e2, #2f5496); 
}
.modal-title { 
  font-family: "Ma Shan Zheng", cursive; 
  font-size: 30px; 
  margin-bottom: 35px; 
  color: #2f5496; 
  text-align: center; 
}
.modal-input { 
  width: 100%; 
  padding: 16px; 
  margin-bottom: 18px; 
  border-radius: 15px; 
  border: 1.5px solid #f0f0f0; 
  background: #f9fbff; 
  transition: all 0.3s; 
}
.modal-input:focus { 
  border-color: #00c0e2; 
  background: white; 
  outline: none; 
}
.modal-login-btn { 
  width: 100%; 
  padding: 16px; 
  background: linear-gradient(135deg, #2f5496, #1a3a6d); 
  color: white; 
  border: none; 
  border-radius: 15px; 
  font-weight: 700; 
  font-size: 17px; 
  cursor: pointer; 
}
.modal-close-btn { 
  background: none; 
  border: none; 
  color: #b0bfc6; 
  cursor: pointer; 
  margin-top: 20px; 
  width: 100%; 
}

/* 文章详情弹窗 */
.detail-modal {
  background: white; 
  width: 90%; 
  max-width: 650px; 
  max-height: 85vh; 
  display: flex; 
  flex-direction: column; 
  padding: 30px; 
  border-radius: 25px; 
  box-shadow: 0 25px 80px rgba(0,0,0,0.2); 
  position: relative; 
  overflow: hidden;
}
.detail-header { 
  border-bottom: 2px solid #f0f5ff; 
  padding-bottom: 15px; 
  margin-bottom: 15px; 
  text-align: left; 
  position: relative; 
  padding-right: 140px; 
}
.detail-title { 
  color: #2f5496; 
  margin: 0 0 10px 0; 
  font-size: 24px; 
}
.detail-meta { 
  font-size: 14px; 
  color: #8fa0b5; 
}
.view-category-btn {
  position: absolute; 
  top: 0; 
  right: 0; 
  background: white; 
  border: 1.5px solid #00c0e2; 
  color: #00c0e2;
  padding: 6px 14px; 
  border-radius: 20px; 
  font-size: 13px; 
  font-weight: bold;
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 5px; 
  transition: all 0.3s ease; 
  z-index: 10;
}
.view-category-btn:hover { 
  background: #00c0e2; 
  color: white; 
  box-shadow: 0 4px 10px rgba(0, 192, 226, 0.2); 
}
.detail-content { 
  flex: 1; 
  overflow-y: auto; 
  text-align: left; 
  padding-right: 5px; 
}
.loading-placeholder { padding: 20px 0; }
.skeleton-line { 
  height: 16px; 
  background: #f0f2f5; 
  margin-bottom: 15px; 
  border-radius: 4px; 
  animation: pulse 1.5s infinite ease-in-out; 
}
@keyframes pulse { 
  0% { opacity: 0.6; } 
  50% { opacity: 1; } 
  100% { opacity: 0.6; } 
}
.content-body { animation: fadeIn 0.3s ease; }
@keyframes fadeIn { 
  from { opacity: 0; transform: translateY(5px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* ================== Markdown渲染样式 ================== */
/* AI消息Markdown */
.markdown-content {
  line-height: 1.6;
  font-size: 14px;
  padding: 8px;
  color: #333;
}
.markdown-content :deep(p) {
  margin: 0 0 8px 0;
}
.markdown-content :deep(strong) {
  font-weight: 600;
  color: #222;
}
.markdown-content :deep(em) {
  color: #555;
}
.markdown-content :deep(ul), 
.markdown-content :deep(ol) {
  margin: 8px 0;
  padding-left: 20px;
}
.markdown-content :deep(li) {
  margin: 4px 0;
}
.markdown-content :deep(a) {
  color: #0366d6;
  text-decoration: none;
}
.markdown-content :deep(a:hover) {
  text-decoration: underline;
}
.markdown-content :deep(code) {
  padding: 2px 4px;
  background-color: #f6f8fa;
  border-radius: 3px;
  font-size: 0.9em;
}
.markdown-content :deep(pre) {
  padding: 16px;
  background-color: #f6f8fa;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin: 16px 0 8px 0;
  font-weight: 600;
}
.markdown-content :deep(h1) {
  font-size: 1.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}
.markdown-content :deep(h2) {
  font-size: 1.3em;
  border-bottom: 1px solid #eee;
  padding-bottom: 4px;
}
.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 4px;
  margin: 8px 0;
}

/* 表格样式 */
.markdown-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
}
.markdown-content th,
.markdown-content td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: left;
}
.markdown-content th {
  background-color: #f5f5f5;
  font-weight: 600;
}
.markdown-content tr:nth-child(even) {
  background-color: #f9f9f9;
}

/* HTML表单样式 */
.markdown-content input,
.markdown-content button {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 2px;
}
.markdown-content button {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
  cursor: pointer;
}

/* 详情页Markdown */
.markdown-body {
  background-color: transparent !important;
  font-family: inherit !important;
  font-size: 16px;
  line-height: 1.8;
  color: #333 !important;
}
:deep(.markdown-body img) { 
  max-width: 100%; 
  border-radius: 10px; 
  margin: 15px 0; 
  box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
  display: block; 
}
:deep(.markdown-body a) { 
  color: #00c0e2 !important; 
  text-decoration: none; 
  font-weight: bold; 
}
:deep(.markdown-body a:hover) { 
  text-decoration: underline; 
}
:deep(.markdown-body p) { margin-bottom: 1em; }
:deep(.markdown-body h1), 
:deep(.markdown-body h2), 
:deep(.markdown-body h3) { 
  color: #2f5496 !important; 
  border-bottom: 1px solid rgba(47, 84, 150, 0.1) !important; 
  padding-bottom: 0.3em; 
}
:deep(.markdown-body blockquote) {
  border-left: 4px solid #00c0e2 !important;
  background: rgba(0, 192, 226, 0.05) !important;
  padding: 10px 15px !important;
  color: #555 !important;
  margin: 15px 0 !important;
  border-radius: 0 8px 8px 0;
}
:deep(.markdown-body pre) { 
  background-color: #f6f8fa; 
  border-radius: 8px; 
  padding: 16px; 
  overflow-x: auto; 
}
:deep(.markdown-body code) { 
  color: #d63384 !important; 
  background-color: rgba(214, 51, 132, 0.1); 
  padding: 2px 5px; 
  border-radius: 4px; 
}
:deep(.markdown-body pre code) { 
  color: #333 !important; 
  background-color: transparent; 
}

/* 可点击关键词按钮 */
:deep(.search-trigger-btn) {
  display: inline-block;
  padding: 2px 8px;
  margin: 0 2px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1.4;
}
:deep(.search-trigger-btn:hover) {
  background: #2f5496;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* ================== 技术栈样式 ================== */
.tech-wrapper {
  position: fixed;
  right: 20px;     
  top: 50%;
  transform: translateY(-50%); 
  width: 150px; 
  height: 70vh;    
  background: rgba(255, 255, 255, 0.5); 
  backdrop-filter: blur(15px); 
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 35px; 
  box-shadow: 0 10px 40px rgba(47, 84, 150, 0.15);
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  transition: all 0.3s ease;
}
.tech-header { 
  text-align: center; 
  margin-bottom: 15px; 
  padding: 0 10px; 
  flex-shrink: 0; 
}
.tech-title { 
  font-size: 18px; 
  font-weight: 900; 
  margin: 0 0 6px 0; 
  background: linear-gradient(135deg, #00c0e2, #2f5496); 
  -webkit-background-clip: text; 
  background-clip: text; 
  color: transparent; 
}
.tech-sub { 
  font-size: 13px; 
  color: #00c0e2; 
  margin: 0; 
  font-weight: bold; 
}
.tech-sub:hover { text-decoration: underline; }
.tech-scroll-area {
  flex: 1; 
  width: 100%; 
  overflow-y: auto; 
  overflow-x: hidden;
  scrollbar-width: none; 
  -ms-overflow-style: none; 
  overscroll-behavior: none; 
  will-change: scroll-position;
}
.tech-scroll-area::-webkit-scrollbar { display: none; }
.tech-scroll-track { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  padding-bottom: 20px; 
  will-change: transform; 
}
.tech-item { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  margin-bottom: 25px; 
  flex-shrink: 0; 
}
.tech-img { 
  width: 55px; 
  height: 55px; 
  border-radius: 12px; 
  object-fit: contain; 
  background: rgba(255, 255, 255, 0.9); 
  padding: 6px; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
  transition: transform 0.2s; 
}
.tech-item:hover .tech-img { transform: scale(1.1); }
.tech-name { 
  font-size: 15px; 
  color: #2f5496; 
  font-weight: 700; 
  margin-top: 8px; 
  text-align: center; 
}
.tech-stars { 
  display: flex; 
  justify-content: center; 
  margin-top: 4px; 
}
.star { 
  font-size: 12px; 
  color: #FFD700; 
  margin: 0 1px; 
  line-height: 1; 
}
.tech-footer { 
  flex-shrink: 0; 
  font-size: 12px; 
  color: #8fa0b5; 
  margin-top: 15px; 
  font-weight: 600; 
  text-align: center; 
  padding: 0 10px; 
}

/* 大屏技术栈适配 (≥1024px) */
@media (min-width: 1024px) {
  .tech-wrapper { width: 180px; right: 30px; }
  .tech-img { width: 65px !important; height: 65px !important; }
  .tech-name { font-size: 17px !important; }
  .tech-title { font-size: 20px !important; }
  .tech-sub { font-size: 14px !important; }
  .star { font-size: 14px !important; }
}

/* 移动端技术栈适配 (<=1023px) */
@media (max-width: 1023px) {
  .side-profile { 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    gap: 20px; 
  }
  .admin-entry { 
    display: flex; 
    justify-content: center; 
    width: 100%; 
  }
  .home-page { display: flex; flex-direction: column; }
  .tech-wrapper {
    position: static;          
    transform: none;           
    width: 100%;               
    height: auto;
    flex-direction: row;       
    align-items: center;
    order: -1;                 
    margin: 10px 0 20px 0;
    padding: 10px 15px;
    box-sizing: border-box;
  }
  .tech-header {
    margin-bottom: 0;
    margin-right: 15px;
    text-align: left;
    flex-shrink: 0;
  }
  .tech-scroll-area {
    overflow-y: hidden;
    overflow-x: auto;
    display: flex;
    align-items: center;
  }
  .tech-scroll-track {
    flex-direction: row;
    padding-bottom: 0;
    padding-right: 20px;
    align-items: center;
  }
  .tech-item { margin-bottom: 0; margin-right: 25px; }
  .tech-footer { display: none; }
}

/* ================== AI助手样式 ================== */
/* AI面板基础样式（电脑端） */
.ai-wrapper {
  position: fixed !important; 
  left: 20px !important;     
  top: 50% !important;       
  transform: translateY(-50%) !important; 
  width: 280px;
  height: 70vh;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 25px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  z-index: 9999 !important; 
  margin: 0 !important;      
  float: none !important;    
  clear: both !important;    
  box-sizing: border-box !important; 
}

/* 移动端AI面板适配 */
@media (max-width: 1023px) {
  .ai-wrapper {
    position: fixed !important;
    right: -100% !important; 
    top: 0 !important;
    left: auto !important; 
    transform: none !important; 
    width: 85% !important;
    height: 100vh !important;
    z-index: 1000 !important;
    transition: right 0.3s ease !important;
    will-change: transform !important; 
    contain: layout style paint !important; 
    -webkit-overflow-scrolling: touch !important; 
  }
  .ai-wrapper.mobile-open {
    right: 0 !important; 
  }
  .ai-chat-area {
    overflow-anchor: auto !important; 
    -webkit-overflow-scrolling: touch !important;
  }
}

/* 移动端AI悬浮球 */
.ai-float-ball {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #00c0e2, #2f5496);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 20px rgba(0, 192, 226, 0.3);
  z-index: 999;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translateZ(0);
}
.ai-float-ball:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(0, 192, 226, 0.4);
}
.ball-icon {
  font-size: 24px;
}

/* 移动端AI面板关闭按钮 */
.ai-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  font-size: 18px;
  color: #8fa0b5;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 101;
}
.ai-close-btn:hover {
  color: #ff4d4f;
}

/* AI聊天区域 */
.ai-chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: none;
  contain: layout paint;
}
.ai-chat-area::-webkit-scrollbar { display: none; }

/* 消息气泡 */
.msg-row { 
  display: flex; 
  width: 100%; 
  margin: 2px 0; 
}
.msg-row.user { justify-content: flex-end; }
.msg-row.assistant { justify-content: flex-start; }
.msg-bubble {
  max-width: 85%;
  padding: 8px 12px;
  border-radius: 15px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
  box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  will-change: contents;
}
.user .msg-bubble { 
  background: #00c0e2; 
  color: white; 
  border-bottom-right-radius: 2px; 
}
.assistant .msg-bubble { 
  background: white; 
  color: #333; 
  border: 1px solid #eee; 
  border-bottom-left-radius: 2px;
  white-space: pre-wrap;
}

/* 打字动画 */
.typing-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 15px;
}
.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #8fa0b5;
  animation: typing 1.4s infinite ease-in-out both;
}
.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* AI输入区 */
.ai-input-area {
  padding: 10px;
  display: flex;
  gap: 8px;
  border-top: 1px solid rgba(0,0,0,0.05);
}
.ai-input-area input {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
}
.ai-send-btn {
  background: #00c0e2;
  color: white;
  border: none;
  border-radius: 10px;
  width: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.ai-send-btn:hover:not(.in-cooldown) { background: #2f5496; }
.ai-send-btn.in-cooldown { 
  background: #cbd5e1; 
  cursor: not-allowed; 
}

/* 字数提示 */
.word-count-hint {
  font-size: 12px;
  color: #8fa0b5;
  padding: 0 10px 8px;
  text-align: right;
}
.word-count-hint.warning {
  color: #ff4d4f;
  font-weight: bold;
}
</style>