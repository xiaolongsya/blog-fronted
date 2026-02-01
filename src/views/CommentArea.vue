<template>
  <div class="comment-area">
    <!-- 页面标题 -->
    <h1 class="comment-title">🐉 龙岛聚会 · 评论区</h1>

    <!-- 评论表单 -->
    <div class="comment-form-wrap">
      <h3 class="form-title">留下你的足迹</h3>
      <form @submit.prevent="submitComment" class="comment-form">
        <!-- 原有昵称输入项 -->
<div class="form-item">
  <label class="form-label">昵称：</label>
  <input 
    v-model="username" 
    type="text" 
    placeholder="请输入你的昵称" 
    required
    class="form-input"
  >
</div>

<!-- 新增：联系方式输入框 -->
<div class="form-item">
  <label class="form-label">联系方式：</label>
  <input 
    v-model="contact"  
    type="text" 
    placeholder="微信/QQ/手机号等（可选，仅用于后台联系）" 
    class="form-input"
  >
  <small class="contact-tip">（评论区不显示）</small> <!-- 标注提示 -->
</div>

<!-- 原有留言输入项 -->
<div class="form-item">
  <label class="form-label">留言：</label>
  <textarea 
    v-model="content" 
    rows="4" 
    placeholder="想说点什么？和小龙聊聊～" 
    required
    class="form-textarea"
  ></textarea>
</div>
        <button type="submit" class="submit-btn">提交留言</button>
      </form>
    </div>

    <!-- 评论列表 -->
    <div class="comment-list-wrap">
      <h3 class="list-title">大家的留言 ({{ commentList.length }})</h3>
      <!-- 评论项 -->
      <div class="comment-item" v-for="(item, idx) in commentList" :key="idx">
        <div class="item-header">
          <span class="item-username">{{ item.username }}</span>
          <span class="item-time">{{ item.time }}</span>
        </div>
        <div class="item-content">{{ item.content }}</div>
      </div>
      <!-- 空评论提示 -->
      <div class="empty-tip" v-if="commentList.length === 0">
        暂无留言，快来抢沙发～
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

axios.defaults.baseURL = 'http://124.221.211.146:8083'

// 表单数据：新增contact变量
const username = ref('')
const contact = ref('')  // 新增：联系方式
const content = ref('')
const commentList = ref([])

// 页面加载逻辑不变（无需修改）
onMounted(async () => {
  const savedName = localStorage.getItem('dragonCommentName')
  if (savedName) {
    username.value = savedName
  }

  try {
    const res = await axios.get('/comment/list', {
      params: { articleId: 1 }
    })
    if (res.data.code === 200) {
      commentList.value = res.data.data.map(item => ({
        id: item.id,
        username: item.name,
        content: item.content,
        time: item.createTime
        // 不处理contact，评论区自然不显示
      }))
    } else {
      alert('获取评论失败：' + res.data.msg)
    }
  } catch (error) {
    console.error('获取评论列表失败：', error)
    alert('网络异常，无法加载评论～')
  }
})

// 提交评论：新增contact参数传给后端
const submitComment = async () => {
  if (!username.value.trim() || !content.value.trim()) {
    alert('昵称和留言不能为空哦～')
    return
  }

  // 构造请求参数：新增contact字段
  const commentData = {
    name: username.value.trim(),
    contact: contact.value.trim(),  // 新增：传给后端的contact字段
    content: content.value.trim(),
    articleId: 1
  }

  try {
    const res = await axios.post('/comment/upload', commentData)
    if (res.data.code === 200) {
      alert('留言成功！🎉')
      localStorage.setItem('dragonCommentName', username.value.trim())
      // 清空联系方式输入框
      contact.value = ''
      content.value = ''
      // 重新获取评论列表（仍不显示contact）
      const listRes = await axios.get('/comment/list', { params: { articleId: 1 } })
      commentList.value = listRes.data.data.map(item => ({
        id: item.id,
        username: item.name,
        content: item.content,
        time: item.createTime
      }))
    } else {
      alert('提交失败：' + res.data.msg)
    }
  } catch (error) {
    console.error('提交评论失败：', error)
    alert('网络异常，留言提交失败～')
  }
}
</script>

<style scoped>
/* 全局容器 */
.comment-area {
  width: 90%;
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 标题样式（和主页风格统一） */
.comment-title {
  font-size: 56px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  text-align: center;
  margin-bottom: 40px;
  letter-spacing: 8px;
}

/* 表单区域 */
.comment-form-wrap {
  background-color: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
  margin-bottom: 40px;
}

.form-title {
  font-size: 32px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 20px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  margin-bottom: 8px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #b3d8ff;
  border-radius: 12px;
  font-size: 16px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  box-sizing: border-box;
}

.form-textarea {
  resize: none;
}

.submit-btn {
  padding: 12px 30px;
  background-color: #2f5496;
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 20px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #1f3a6b;
}

/* 评论列表 */
.comment-list-wrap {
  background-color: #fff;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
}

.list-title {
  font-size: 32px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  margin-bottom: 20px;
}

.comment-item {
  padding: 20px 0;
  border-bottom: 1px dashed #b3d8ff;
}

.comment-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.item-username {
  font-size: 20px;
  font-weight: bold;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

.item-time {
  font-size: 14px;
  color: #999;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

.item-content {
  font-size: 18px;
  color: #333;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  line-height: 1.6;
}

.empty-tip {
  text-align: center;
  font-size: 20px;
  color: #999;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  padding: 20px 0;
}

/* 移动端适配（和主页统一） */
@media (max-width: 768px) {
  .comment-title {
    font-size: 32px;
    letter-spacing: 4px;
    margin-bottom: 20px;
  }

  .comment-form-wrap, .comment-list-wrap {
    padding: 20px;
    border-radius: 16px;
  }

  .form-title, .list-title {
    font-size: 24px;
  }

  .form-label {
    font-size: 18px;
  }

  .form-input, .form-textarea {
    padding: 10px 12px;
    font-size: 14px;
  }

  .submit-btn {
    padding: 10px 20px;
    font-size: 18px;
  }

  .item-username {
    font-size: 18px;
  }

  .item-content {
    font-size: 16px;
  }
}
/* 新增：联系方式提示文字样式（标注“可选，评论区不显示”） */
.contact-tip {
  display: inline-block; /* 独占一行，避免和输入框挤在一起 */
  margin-top: 5px; /* 和输入框保持小间距 */
  font-size: 14px; /* 字体比标签小，不抢眼 */
  color: #999; /* 灰色，提示性文字风格 */
  font-family: "楷体", "KaiTi", "STKaiti", serif; /* 和整体字体统一 */
}

/* 移动端适配：同步缩小提示文字（已有媒体查询中补充） */
@media (max-width: 768px) {
  .contact-tip {
    font-size: 12px; /* 手机端字体更小，节省空间 */
  }
  /* 其他原有移动端样式不变，只加上面这行 */
}
</style>