<template>
  <div class="category-detail-page">
    <div class="nav-header">
      <button class="back-link" @click="router.back()">
        <span>← 返回成长历程</span>
      </button>
    </div>

    <div class="page-header">
      <h1 class="category-title">{{ categoryName }}</h1>
    </div>

    <div class="nodes-container">
      <div 
        v-for="(node, index) in nodeList" 
        :key="node.id"
        class="node-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="node-time-badge">{{ formatTime(node.createTime) }}</div>
        
        <div class="node-mix-content">
          <div 
            v-for="(group, groupIdx) in getContentGroups(node.mixContent)" 
            :key="groupIdx"
            :class="['content-group', `group-${group[0].type}`]"
          >
            <div 
              v-if="group[0].type === 'text'" 
              class="mix-text markdown-body"
              v-html="renderMarkdown(group)"
            ></div>
            
            <div v-else-if="group[0].type === 'image'" class="mix-img-grid">
              <img 
                v-for="(item, idx) in group" 
                :key="idx"
                :src="item.value" 
                class="mix-img"
                loading="lazy"
                @click="openModal(item.value)"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="load-more-section">
        <button v-if="hasMore" class="load-more-btn" :disabled="loading" @click="fetchNodes">
          {{ loading ? '加载中...' : '查看更多' }}
        </button>
        <div v-else class="no-more-tips">🌸 到底啦 🌸</div>
      </div>
    </div>

    <Transition name="fade">
      <div 
        class="image-modal-mask" 
        v-if="bigImageUrl" 
        @click="closeModal"
        @wheel.prevent="handleWheel"
      >
        <div class="modal-info">
          <span>缩放: {{ Math.round(scale * 100) }}%</span>
        </div>

        <img 
          :src="bigImageUrl" 
          class="image-modal-img" 
          :style="imgStyle"
          @mousedown.prevent="startDrag"
          @dblclick="resetTransform"
          @click.stop 
        />
        
        <div class="modal-close-btn" @click="closeModal">×</div>
        <div class="zoom-tips">滚轮缩放 | 左键拖动 | 双击重置</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import MarkdownIt from 'markdown-it'
import 'github-markdown-css/github-markdown.css'

const route = useRoute()
const router = useRouter()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  typographer: true
})

const categoryName = ref(route.query.name || '详情')
const nodeList = ref([])
const pageNum = ref(1)
const hasMore = ref(true)
const loading = ref(false)

// 缩放与拖拽状态
const bigImageUrl = ref('')
const scale = ref(1)
const offset = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })

const imgStyle = computed(() => ({
  transform: `translate(${offset.value.x}px, ${offset.value.y}px) scale(${scale.value})`,
  transition: isDragging.value ? 'none' : 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)',
  cursor: isDragging.value ? 'grabbing' : 'grab'
}))

const renderMarkdown = (groupItems) => {
  if (!groupItems || groupItems.length === 0) return ''
  const rawText = groupItems.map(item => item.value).join('\n')
  return md.render(rawText)
}

const handleWheel = (e) => {
  const zoomFactor = 1.15
  const prevScale = scale.value
  let newScale = e.deltaY > 0 ? prevScale / zoomFactor : prevScale * zoomFactor
  newScale = Math.max(0.2, Math.min(newScale, 15))
  
  if (newScale !== prevScale) {
    const ratio = newScale / prevScale
    offset.value = { x: offset.value.x * ratio, y: offset.value.y * ratio }
    scale.value = newScale
  }
}

const startDrag = (e) => {
  isDragging.value = true
  startPos.value = { x: e.clientX - offset.value.x, y: e.clientY - offset.value.y }
  window.addEventListener('mousemove', onDragging)
  window.addEventListener('mouseup', stopDrag)
}

const onDragging = (e) => {
  if (!isDragging.value) return
  offset.value = { x: e.clientX - startPos.value.x, y: e.clientY - startPos.value.y }
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDragging)
  window.removeEventListener('mouseup', stopDrag)
}

const openModal = (url) => { bigImageUrl.value = url; resetTransform() }
const closeModal = () => { bigImageUrl.value = '' }
const resetTransform = () => { scale.value = 1; offset.value = { x: 0, y: 0 } }

const fetchNodes = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await axios.get(`https://xiaolongya.cn/blog/node/listPage`, {
      params: { pageNum: pageNum.value, pageSize: 5, growthId: route.query.id }
    })
    if (res.data.code === 200) {
      const newData = (res.data.data || []).map(node => ({
        ...node,
        mixContent: parseMixContent(node.content, node.imgUrls)
      }))
      nodeList.value = [...nodeList.value, ...newData]
      if (newData.length < 5) hasMore.value = false
      else pageNum.value++
    }
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

const parseMixContent = (content, imgUrls) => {
  let images = Array.isArray(imgUrls) ? [...imgUrls] : (imgUrls ? imgUrls.split(',') : [])
  const result = []
  const regex = /\[IMAGE:(.+?)\]/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(content)) !== null) {
    const text = content.substring(lastIndex, match.index)
    if (text.trim()) result.push({ type: 'text', value: text.trim() })
    result.push({ type: 'image', value: match[1] })
    lastIndex = regex.lastIndex
  }
  const remaining = content.substring(lastIndex)
  if (remaining.trim()) result.push({ type: 'text', value: remaining.trim() })
  images.forEach(url => {
    if (!result.find(i => i.value === url)) result.push({ type: 'image', value: url })
  })
  return result
}

const getContentGroups = (mixContent) => {
  if (!mixContent) return []
  const groups = []
  let currentGroup = []
  mixContent.forEach((item, index) => {
    if (index === 0) currentGroup.push(item)
    else {
      if (item.type === mixContent[index - 1].type) currentGroup.push(item)
      else { groups.push([...currentGroup]); currentGroup = [item] }
    }
  })
  if (currentGroup.length) groups.push(currentGroup)
  return groups
}

const formatTime = (t) => t ? t.split(' ')[0] : ''
onMounted(() => { if (route.query.id) fetchNodes() })
</script>

<style scoped>
.category-detail-page { 
  padding: 20px 0;
  font-family: "楷体", serif; 
  min-height: 100vh; 
  background: transparent; 
  overflow-x: hidden;
}

.page-header { text-align: center; margin-bottom: 40px; }
.category-title { 
  font-size: 2.8rem; 
  color: #333; 
  text-shadow: none; 
}

/* ================== 布局控制 ================== */

/* 默认（手机端）：100% 宽度 */
.nav-header,
.nodes-container {
  width: 100%;
  padding: 0 15px; 
  margin: 0 auto;
  box-sizing: border-box;
}

.nodes-container {
  display: flex;
  flex-direction: column;
  gap: 35px;
}

.node-card {
  width: 100%; 
  box-sizing: border-box;
  background: #00c0e2; 
  color: #000000;
  border-radius: 16px; 
  padding: 20px;
  position: relative; 
  animation: slideUp 0.5s ease forwards; 
  opacity: 0; 
  transform: translateY(20px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.15);
}

/* 电脑端：强制固定 800px */
@media (min-width: 820px) {
  .nav-header,
  .nodes-container {
    width: 800px;  
    padding: 0;
  }
  .node-card {
    padding: 30px;
  }
}

/* ======================================================= */

.back-link { 
  background: white; 
  border: 1px solid #ccc; 
  padding: 10px 20px; 
  border-radius: 20px; 
  color: #333; 
  font-weight: bold; 
  cursor: pointer; 
  font-size: 1.1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
  margin-bottom: 20px;
  display: inline-block;
}

.node-time-badge {
  background: rgba(255, 255, 255, 0.4); 
  color: #000;
  padding: 6px 16px; 
  border-radius: 12px;
  position: absolute; 
  top: -15px; 
  right: 25px; 
  font-size: 1.1rem; 
  font-weight: bold;
  border: 1px solid rgba(255,255,255,0.3);
}

.mix-text {
  font-size: 1.1rem;
  margin: 10px 0;
}

/* ================== Markdown 样式修复版 ================== */
.markdown-body {
  background-color: transparent !important;
  font-family: inherit !important;
  font-size: 1.1rem;
  line-height: 1.8;
  color: #000000 !important;
  width: 100%;
}

:deep(.markdown-body h1), 
:deep(.markdown-body h2), 
:deep(.markdown-body h3) {
  color: #000000 !important;
  border-bottom: 1px solid rgba(0,0,0,0.2) !important;
}

:deep(.markdown-body a) {
  color: #2f5496 !important;
  text-decoration: underline;
  font-weight: bold;
}

/* --- 核心修复：引用块 (Blockquote) --- */
:deep(.markdown-body blockquote) {
  color: #000000 !important;           /* 强制黑色字体 */
  border-left: 0.25em solid #ffffff !important; /* 左侧竖线改为白色，在青色背景上更清晰 */
  background: rgba(255, 255, 255, 0.2); /* 微微的白色半透明背景，提升对比度 */
  padding: 0 1em !important;
  margin: 1em 0 !important;
  opacity: 1 !important;
}
/* 确保引用里的段落也是黑色的 */
:deep(.markdown-body blockquote p) {
  color: #000000 !important;
}
/* ------------------------------------- */

:deep(.markdown-body code) {
  background-color: rgba(255,255,255,0.5);
  color: #d63384 !important;
  border-radius: 4px;
  padding: 2px 5px;
}

:deep(.markdown-body pre) {
  background-color: rgba(255,255,255,0.3);
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  color: #000 !important;
}
:deep(.markdown-body pre code) {
  background-color: transparent;
  color: inherit !important;
}

.mix-img-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 15px; }
.mix-img { 
  width: 120px; height: 120px; 
  object-fit: cover; 
  border-radius: 8px; 
  cursor: pointer; 
  border: 3px solid rgba(255,255,255,0.8); 
  transition: transform 0.2s;
}
.mix-img:hover { transform: scale(1.05); }

.load-more-btn {
  display: block; width: 100%; padding: 15px; background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px; color: #00c0e2; font-size: 1.2rem;
  font-weight: bold; cursor: pointer; transition: 0.3s;
}
.load-more-btn:hover { background: #f0f0f0; }

.no-more-tips { text-align: center; color: #c63131; padding: 20px; font-size: 1.5rem; }

/* Modal */
.image-modal-mask { 
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
  background: rgba(0, 0, 0, 0.9); z-index: 999; 
  display: flex; justify-content: center; align-items: center; 
  overflow: hidden; touch-action: none;
}
.image-modal-img { 
  max-width: 90%; max-height: 90%; 
  object-fit: contain; 
  will-change: transform;
}
.modal-close-btn { 
  position: absolute; top: 30px; right: 30px; color: white; 
  font-size: 2.5rem; cursor: pointer; z-index: 1001;
}
.modal-info {
  position: absolute; top: 30px; left: 30px; color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 15px;
}
.zoom-tips { 
  position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); 
  color: rgba(255,255,255,0.5); font-size: 0.9rem; pointer-events: none;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
</style>