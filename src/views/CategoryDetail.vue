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
            <p v-if="group[0].type === 'text'" class="mix-text">
              {{ group.map(item => item.value).join('\n') }}
            </p>
            <div v-else-if="group[0].type === 'image'" class="mix-img-grid">
              <img 
                v-for="(item, idx) in group" 
                :key="idx"
                :src="item.value" 
                class="mix-img"
                loading="lazy"
                @click="showBigImage(item.value)"
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

    <div class="image-modal-mask" v-if="bigImageUrl" @click="bigImageUrl = ''">
      <img :src="bigImageUrl" class="image-modal-img" @click.stop />
      <div class="modal-close-btn">×</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const categoryName = ref(route.query.name || '详情')
const nodeList = ref([])
const pageNum = ref(1)
const hasMore = ref(true)
const loading = ref(false)
const bigImageUrl = ref('')

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
  // Append remaining images not in text
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

const showBigImage = (url) => bigImageUrl.value = url
const formatTime = (t) => t ? t.split(' ')[0] : ''

onMounted(() => { if (route.query.id) fetchNodes() })
</script>

<style scoped>
.category-detail-page { padding: 20px; font-family: "楷体", serif; min-height: 100vh; }
.nav-header { max-width: 800px; margin: 0 auto 20px; }
.back-link { background: white; border: none; padding: 8px 16px; border-radius: 20px; color: #2f5496; font-weight: bold; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
.page-header { text-align: center; margin-bottom: 40px; }
.category-title { font-size: 2.5rem; color: #00c0e2; text-shadow: 1px 1px 2px rgba(0,0,0,0.1); }

.nodes-container { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px; }
.node-card {
  background: #00c0e2; color: #fff;
  border-radius: 16px; padding: 25px;
  box-shadow: 0 10px 25px rgba(0, 192, 226, 0.3);
  position: relative; animation: slideUp 0.5s ease forwards; opacity: 0; transform: translateY(20px);
}
.node-time-badge {
  background: rgba(0,0,0,0.2); padding: 4px 12px; border-radius: 12px;
  position: absolute; top: 20px; right: 20px; font-size: 0.9rem;
}
.node-mix-content { margin-top: 10px; font-size: 1.1rem; line-height: 1.8; color: #fff; }
.mix-text { white-space: pre-wrap; margin-bottom: 15px; }
.mix-img-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.mix-img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid rgba(255,255,255,0.5); transition: 0.3s; }
.mix-img:hover { transform: scale(1.05); border-color: #fff; }

.load-more-section { text-align: center; margin-top: 30px; }
.load-more-btn { background: #2f5496; color: white; border: none; padding: 10px 30px; border-radius: 20px; cursor: pointer; font-size: 1rem; }
.no-more-tips { color: #fff; opacity: 0.8; }

.image-modal-mask { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 999; display: flex; justify-content: center; align-items: center; }
.image-modal-img { max-width: 90%; max-height: 90%; object-fit: contain; }
.modal-close-btn { position: absolute; top: 30px; right: 30px; color: white; font-size: 2rem; cursor: pointer; }

@keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
</style>