<template>
  <div class="dragon-den">
    <!-- 龙的概况标题 -->
    <h1 class="dragon-overview">龙的概况</h1>

    <!-- 主内容容器：个人信息 + 友链 左右分栏 -->
    <div class="main-content-wrap">
      <!-- 左侧：个人信息区域 -->
      <div class="info-container">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <img 
            src="https://xiaolongya.cn/uploads/avatar.jpg" 
            alt="头像" 
            class="dragon-avatar"
          />
        </div>

        <!-- 正文信息区域 -->
        <div class="info-section">
          <p class="info-item"><strong>昵称：</strong>小龙</p>
          <p class="info-item"><strong>龙的窝点：</strong>广东</p>
          <p class="info-item"><strong>龙蛋破壳日：</strong>2007-07-22</p>
          <p class="info-item"><strong>个性签名：</strong>适度编程益脑，过度编程伤身</p>
          <p class="info-item">
            <strong>Github：</strong>
            <a href="https://github.com/xiaolongsya" target="_blank" class="github-link">xiaolongsya</a>
          </p>
          <p class="info-item">
            <strong>标签：</strong>
            <span class="tag">①后端（Java）</span>
            <span class="tag">②算法（菜鸡）</span>
            <span class="tag">③00后</span>
            <span class="tag">④喜欢折腾</span>
            <span class="tag">⑤羽毛球</span>
            <span class="tag">⑥乒乓球</span>
          </p>
        </div>
      </div>

      <!-- 右侧：独立友链区块（与个人信息同背景） -->
      <div class="friend-link-container">
        <!-- 友链标题 -->
        <h2 class="friend-link-title">博客友链</h2>
        <!-- 友链卡片 -->
        <a :href="friendLink.link" target="_blank" class="friend-card">
          <img :src="friendLink.avatar" alt="友链头像" class="friend-avatar" />
          <div class="friend-info">
            <h3 class="friend-name">{{ friendLink.name }}</h3>
            <p class="friend-desc">{{ friendLink.descr }}</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// 友链数据
const friendLink = {
  name: "阿叶Ayeez的小站",
  link: "https://Ayeez.cn",
  avatar: "https://blog.ayeez.cn/imgs/photo.jpg",
  descr: "记录学习历程，记录美好生活"
};
</script>

<style scoped>
.dragon-den {
  padding: 40px;
  text-align: center;
  background-color:rgba(179, 216, 255, 0.6);
  min-height: 100vh;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  box-sizing: border-box;
}

/* 龙的概况标题样式 */
.dragon-overview {
  font-size: 100px;
  font-weight: bold;
  color: #00c0e2;
  margin-bottom: 30px;
  letter-spacing: 4px;
}

/* 主内容容器：左右分栏 */
.main-content-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap; /* 移动端自动换行 */
}

/* 左侧个人信息容器 */
.info-container {
  flex: 1;
  min-width: 300px;
  max-width: 600px;
}

/* 右侧友链独立区块（核心：与个人信息同背景） */
.friend-link-container {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  /* 与个人信息区域完全一致的背景样式 */
  background-color: #2f5496;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(109, 67, 67, 0.08);
  margin-top: 204px; /* 与左侧头像+信息的顶部对齐 */
}

/* 头像区域样式 */
.avatar-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
}

/* 头像样式 */
.dragon-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 6px solid #2f5496;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 正文信息区域样式 */
.info-section {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
  background-color: #2f5496;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(109, 67, 67, 0.08);
}

/* 每一行信息样式 */
.info-item {
  font-size: 30px;
  color: #caa2a2;
  margin: 15px 0;
  line-height: 1.6;
}

/* Github 链接样式 */
.github-link {
  color: rgb(220, 132, 132);
  text-decoration: none;
  font-weight: bold;
}

.github-link:hover {
  text-decoration: underline;
}

/* 标签样式 */
.tag {
  display: inline-block;
  background: rgba(179, 216, 255, 0.8);
  color: #2f5496;
  padding: 4px 10px;
  border-radius: 12px;
  margin: 0 5px;
  font-size: 14px;
  font-weight: bold;
}

/* 友链标题 */
.friend-link-title {
  font-size: 48px;
  font-weight: bold;
  color: #00c0e2;
  margin-bottom: 30px;
  letter-spacing: 2px;
  text-align: center;
}

/* 友链卡片 */
.friend-card {
  display: flex;
  align-items: center;
  gap: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
}

/* 友链卡片悬停效果 */
.friend-card:hover {
  transform: translateY(-5px);
}

/* 友链头像 */
.friend-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #b3d8ff;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

/* 友联信息容器 */
.friend-info {
  flex: 1;
  text-align: left;
}

/* 友链名称 */
.friend-name {
  font-size: 28px;
  color: #caa2a2;
  margin: 0 0 10px 0;
  font-weight: bold;
}

/* 友链描述 */
.friend-desc {
  font-size: 18px;
  color: #caa2a2;
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .dragon-overview {
    font-size: 36px;
  }

  .main-content-wrap {
    gap: 20px;
    padding: 0 10px;
  }

  .friend-link-container {
    margin-top: 20px; /* 移动端取消顶部对齐，避免间距过大 */
  }

  .info-item {
    font-size: 20px;
  }

  .dragon-avatar {
    width: 150px;
    height: 150px;
  }

  .friend-link-title {
    font-size: 30px;
  }

  .friend-card {
    padding: 15px 0;
    gap: 15px;
  }

  .friend-avatar {
    width: 60px;
    height: 60px;
  }

  .friend-name {
    font-size: 22px;
  }

  .friend-desc {
    font-size: 16px;
  }
}
</style>