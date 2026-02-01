<template>
  <div class="development-page">
    <!-- 页面顶部标题 -->
    <h1 class="page-title">龙岛的发展</h1>

    <!-- 多个更新节点 -->
    <div class="update-item" v-for="(item, idx) in updateList" :key="idx">
      <!-- 节点左上角的时间（放大加粗） -->
      <div class="item-time">{{ item.time }}</div>
      <!-- 文字内容 -->
      <div class="item-content">{{ item.content }}</div>
      <!-- 可选图片（缩小排列，点击放大） -->
      <div class="item-image-wrap" v-if="item.images.length">
        <img 
          v-for="(img, imgIdx) in item.images" 
          :key="imgIdx" 
          :src="img" 
          class="item-image"
          @click="showBigImage(img)"
        >
      </div>
    </div>

    <!-- 图片放大弹窗（默认隐藏） -->
    <div class="image-modal-mask" v-if="bigImageUrl" @click="closeBigImage">
      <img :src="bigImageUrl" class="image-modal-img" @click.stop>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 定义数据
const updateList = ref([])
const bigImageUrl = ref('')

// 获取更新记录接口
const fetchUpdateList = async () => {
  try {
    const res = await fetch('http://124.221.211.146:8083/development/list')
    // 先判断 HTTP 状态码是否成功
    if (!res.ok) throw new Error('网络请求失败')
    const data = await res.json()
    
    // 兼容接口是否返回 code 字段
    if (data.code === 200 || !data.code) {
      updateList.value = (data.data || []).map(item => ({
        time: item.createTime ? item.createTime.split(' ')[0] : '',
        content: item.content || '',
        // 兼容 imgUrls 是数组或字符串两种情况
        images: Array.isArray(item.imgUrls) 
          ? item.imgUrls 
          : (item.imgUrls ? item.imgUrls.split(',') : [])
      }))
    }
  } catch (err) {
    console.error('获取更新记录失败：', err)
  }
}

// 页面加载时调用接口
onMounted(() => {
  fetchUpdateList()
})

// 图片放大相关
const showBigImage = (url) => {
  bigImageUrl.value = url
}
const closeBigImage = () => {
  bigImageUrl.value = ''
}
</script>

<style scoped>
.development-page {
  width: 90%;
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

.page-title {
  font-size: 56px;
  color: #2f5496;
  text-align: center;
  margin-bottom: 40px;
  letter-spacing: 8px;
}

.update-item {
  background: #fff;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 30px;
  position: relative;
}

/* 节点左上角的时间（放大加粗） */
.item-time {
  position: absolute;
  top: 15px;
  left: 20px;
  font-size: 24px;
  font-weight: 900;
  color: #2f5496;
}

.item-content {
  margin-top: 40px; /* 给时间留出位置 */
  font-size: 18px;
  color: #333;
  line-height: 1.6;
}

/* 图片区域（缩小排列） */
.item-image-wrap {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.item-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}
.item-image:hover {
  transform: scale(1.05);
}

/* 图片放大弹窗 */
.image-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.image-modal-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .page-title {
    font-size: 32px;
    letter-spacing: 4px;
  }
  .item-time {
    font-size: 20px;
  }
  .item-content {
    font-size: 16px;
  }
  .item-image {
    width: 100px;
    height: 100px;
  }
}
</style>