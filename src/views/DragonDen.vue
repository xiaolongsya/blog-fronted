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
            loading="lazy"
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
            <a href="https://github.com/xiaolongsya" target="_blank" class="github-link" rel="noopener noreferrer">xiaolongsya</a>
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
        <a :href="friendLink.link" target="_blank" class="friend-card" rel="noopener noreferrer">
          <img :src="friendLink.avatar" alt="友链头像" class="friend-avatar" loading="lazy" />
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
/* 全局容器：统一字体、背景，和全站风格对齐 */
.dragon-den {
  padding: 40px;
  text-align: center;
  background-color: rgba(179, 216, 255, 0.6); /* 全站统一浅蓝透明背景 */
  min-height: 100vh;
  font-family: "Ma Shan Zheng", "楷体", "KaiTi", "STKaiti", cursive, serif; /* 统一全站字体 */
  box-sizing: border-box;
}

/* 龙的概况标题样式：统一主色调，增强艺术感 */
.dragon-overview {
  font-size: 100px; /* 下调字体大小，避免溢出 */
  font-weight: bold; 
  background: linear-gradient(135deg, #00c0e2, #2f5496);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.05); 
  margin: 0;
}

/* 主内容容器：左右分栏，优化间距和对齐 */
.main-content-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  flex-wrap: wrap; /* 移动端自动换行 */
}

/* 左侧个人信息容器：优化弹性布局，适配不同屏幕 */
.info-container {
  flex: 1;
  min-width: 300px;
  max-width: 600px;
}

/* 右侧友链独立区块：统一背景样式，取消不合理顶部边距 */
.friend-link-container {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
  background-color: #2f5496; /* 全站主色调背景 */
  border-radius: 24px; /* 增大圆角，统一全站风格 */
  padding: 30px;
  box-shadow: 0 8px 24px rgba(47, 84, 150, 0.12); /* 柔和阴影，增强立体感 */
  margin-top: 0; /* 取消原不合理顶部边距，布局更协调 */
  border: 1px solid rgba(255, 255, 255, 0.5); /* 白色细描边，提升精致感 */
}

/* 头像区域样式：优化对齐，适配容器 */
.avatar-section {
  display: flex;
  justify-content: center; /* 改为居中对齐，更符合视觉习惯 */
  margin-bottom: 40px;
}

/* 头像样式：优化边框，增强视觉效果 */
.dragon-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 6px solid #fff; /* 白色边框，更柔和精致 */
  box-shadow: 0 8px 24px rgba(47, 84, 150, 0.2); /* 主色调阴影，统一风格 */
  object-fit: cover; /* 防止头像变形 */
  transition: transform 0.15s ease; /* 轻量化过渡 */
}

/* 头像悬停效果：轻微放大，增强交互 */
.dragon-avatar:hover {
  transform: scale(1.05);
}

/* 正文信息区域样式：统一背景、圆角，提升可读性 */
.info-section {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
  background-color: #2f5496; /* 全站主色调背景 */
  border-radius: 24px; /* 增大圆角，统一全站风格 */
  padding: 30px;
  box-shadow: 0 8px 24px rgba(47, 84, 150, 0.12); /* 柔和阴影，增强立体感 */
  border: 1px solid rgba(255, 255, 255, 0.5); /* 白色细描边，提升精致感 */
}

/* 每一行信息样式：修正文字颜色，提升对比度和可读性 */
.info-item {
  font-size: 30px;
  color: #f0f8ff; /* 替换原浅红，使用浅蓝白，与深色背景对比度更高 */
  margin: 15px 0;
  line-height: 1.6;
  font-weight: 500;
}

/* 强调文字样式：突出关键信息 */
.info-item strong {
  color: #b3d8ff; /* 浅蓝高亮，统一风格 */
}

/* Github 链接样式：优化配色，统一交互 */
.github-link {
  color: #b3d8ff; /* 浅蓝高亮，与背景对比度适中 */
  text-decoration: none;
  font-weight: bold;
  transition: all 0.15s ease; /* 轻量化过渡 */
}

.github-link:hover {
  text-decoration: underline;
  color: #fff; /* 悬停变白，增强反馈 */
}

/* 标签样式：优化配色，统一圆角和风格 */
.tag {
  display: inline-block;
  background: rgba(255, 255, 255, 0.8); /* 白色背景，更醒目 */
  color: #2f5496; /* 主色调文字，统一风格 */
  padding: 4px 10px;
  border-radius: 12px; /* 圆角，与全站风格对齐 */
  margin: 0 5px 8px 5px; /* 增加底部间距，防止换行拥挤 */
  font-size: 18px; /* 增大字体，提升可读性 */
  font-weight: bold;
  transition: all 0.15s ease; /* 轻量化过渡 */
}

/* 标签悬停效果：增强交互 */
.tag:hover {
  background: #b3d8ff;
  transform: translateY(-2px);
}

/* 友链标题：统一主色调，优化样式 */
.friend-link-title {
  font-size: 48px;
  font-weight: 900;
  color: #b3d8ff; /* 浅蓝高亮，与深色背景对比适中 */
  margin-bottom: 30px;
  letter-spacing: 8px; /* 增大字间距，提升美感 */
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

/* 友链卡片：优化布局，添加过渡 */
.friend-card {
  display: flex;
  align-items: center;
  gap: 20px;
  text-decoration: none;
  transition: all 0.15s ease; /* 缩短过渡时长，更流畅 */
  padding: 15px;
  border-radius: 16px; /* 圆角，提升精致感 */
}

/* 友链卡片悬停效果：优化阴影，增强反馈 */
.friend-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.1); /* 轻微背景高亮，增强反馈 */
}

/* 友链头像：优化边框，防止变形 */
.friend-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #b3d8ff; /* 浅蓝边框，统一风格 */
  box-shadow: 0 8px 24px rgba(47, 84, 150, 0.2); /* 主色调阴影，统一风格 */
  object-fit: cover; /* 防止头像变形 */
  transition: transform 0.15s ease; /* 轻量化过渡 */
}

/* 友链头像悬停效果：轻微放大 */
.friend-card:hover .friend-avatar {
  transform: scale(1.1);
}

/* 友联信息容器：优化对齐 */
.friend-info {
  flex: 1;
  text-align: left;
}

/* 友链名称：优化配色，提升可读性 */
.friend-name {
  font-size: 28px;
  color: #f0f8ff; /* 浅蓝白，与深色背景对比适中 */
  margin: 0 0 10px 0;
  font-weight: bold;
  letter-spacing: 2px; /* 轻微字间距，提升美感 */
}

/* 友链描述：优化配色，提升可读性 */
.friend-desc {
  font-size: 18px;
  color: #b3d8ff; /* 浅蓝，与深色背景对比适中 */
  margin: 0;
  line-height: 1.5;
  opacity: 0.9;
}

/* 响应式适配：精细化调整，保持风格统一 */
@media (max-width: 768px) {
  .dragon-den {
    padding: 20px 15px; /* 减少移动端内边距 */
  }

  .dragon-overview {
    font-size: 48px; /* 固定字体大小，更稳定 */
    letter-spacing: 6px; /* 移动端缩小字间距 */
    margin-bottom: 25px;
  }

  .main-content-wrap {
    gap: 20px;
    padding: 0 10px;
  }

  .friend-link-container {
    margin-top: 0; /* 移动端保持无顶部边距 */
    padding: 20px;
    border-radius: 16px; /* 移动端缩小圆角 */
  }

  .info-item {
    font-size: 20px; /* 缩小字体，适配移动端 */
    margin: 12px 0;
  }

  .tag {
    font-size: 14px; /* 缩小标签字体 */
    margin: 0 3px 6px 3px;
  }

  .dragon-avatar {
    width: 150px;
    height: 150px;
    border-width: 4px; /* 缩小边框，适配移动端 */
  }

  .friend-link-title {
    font-size: 30px; /* 缩小友链标题 */
    letter-spacing: 4px;
    margin-bottom: 20px;
  }

  .friend-card {
    padding: 15px;
    gap: 15px;
  }

  .friend-avatar {
    width: 60px;
    height: 60px;
    border-width: 2px; /* 缩小边框，适配移动端 */
  }

  .friend-name {
    font-size: 22px; /* 缩小友链名称 */
    letter-spacing: 1px;
  }

  .friend-desc {
    font-size: 16px; /* 缩小友链描述 */
  }

  .info-section {
    padding: 20px;
    border-radius: 16px; /* 移动端缩小圆角 */
  }
}
</style>