<template>
  <div class="dragon-tools">
    <!-- 标题：独立显示，不被蓝色背景覆盖 -->
    <h1>龙的工具库</h1>
    
    <!-- 核心内容包裹层：添加纯浅蓝透明背景（无条纹） -->
    <div class="core-content-wrap">
      <div class="tools-grid">
        <div class="tool-card" v-for="(tool, idx) in toolsList" :key="idx">
          <!-- 判断 icon 是否为图片 URL -->
          <img 
            v-if="isImageUrl(tool.icon)" 
            :src="tool.icon" 
            :alt="tool.name" 
            class="tool-icon"
          />
          <!-- 如果不是图片，则显示图标字符 -->
          <div v-else class="tool-icon">{{ tool.icon }}</div>

          <h3>{{ tool.name }}</h3>
          <p>{{ tool.desc }}</p>
          <a :href="tool.link" target="_blank" class="tool-link">前往使用 →</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const toolsList = [
  {
    icon: "https://xiaolongya.cn/uploads/15a06548-6ba8-46cf-be8d-07c71eda0b11.png",
    name: "Watt Toolkit",
    desc: "可以对github和steam进行免费加速，加速情况尚可，免费就是正义哇小龙",
    link: "https://steampp.net/"
  },
  {
    icon: "https://xiaolongya.cn/uploads/a1c98814-2f7c-4632-ab81-dda276860cfc.ico",
    name: "Geek",
    desc: "卸载电脑软件担心残留？别怕，Geek不仅能卸载，还能去除残留！小龙评价五颗星(当然满分是五颗星)",
    link: "https://geekuninstaller.com/"
  },
  {
    icon: "https://xiaolongya.cn/uploads/a7b08592-7356-4a69-b53f-e476888e31e4.ico",
    name: "图吧工具箱",
    desc: "电脑发烧友？想要了解你的电脑详细？图吧工具箱可以满足你绝大多数的愿望！温度检测，硬盘情况等各项属性都可查看",
    link: "https://www.tbtool.cn/"
  }
];

// 判断是否为图片 URL 的辅助函数
const isImageUrl = (str) => {
  return typeof str === 'string' && (str.startsWith('http') || str.startsWith('/'));
};
</script>

<style scoped>
.dragon-tools {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center; /* 整体居中，保持风格统一 */
}

h1 {
  font-size: 100px;
  color: #00c0e2;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  text-align: center;
  margin-bottom: 30px; /* 与下方蓝色背景保持间距 */
}

/* 核心：纯浅蓝透明背景（无条纹），与其他页面风格统一 */
.core-content-wrap {
  width: 100%;
  background-color: rgba(179, 216, 255, 0.6); /* 统一浅蓝透明底色 */
  border-radius: 120px; /* 统一大圆角 */
  padding: 40px; /* 内边距，避免内容贴边 */
  box-sizing: border-box;
  margin-bottom: 20px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.tool-card {
  /* 提高卡片透明度：更柔和，与其他页面卡片统一 */
  background: rgba(255, 255, 255, 0.3); /* 从 0.6 改为 0.3，提高透明度 */
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease; /* 新增过渡，提升交互感 */
}

/* 卡片悬停效果：轻微上浮，增强交互 */
.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.tool-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 15px;
  object-fit: contain;
}

.tool-card h3 {
  font-size: 24px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  margin-bottom: 10px;
}

.tool-card p {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.tool-link {
  display: inline-block;
  padding: 8px 16px;
  background: #2f5496;
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  transition: background 0.3s;
}

.tool-link:hover {
  background: #1f3a6b;
}

/* 手机端适配（屏幕宽度 ≤ 768px） */
@media (max-width: 768px) {
  .dragon-tools {
    /* 减少手机端页面内边距，避免内容太靠边 */
    padding: 20px 15px;
  }

  h1 {
    /* 大幅缩小手机端标题字体，避免超出屏幕 */
    font-size: 3rem; /* 约 48px，可根据需求调整 */
    margin-bottom: 25px;
  }

  /* 手机端背景区块适配 */
  .core-content-wrap {
    padding: 20px 15px;
    border-radius: 40px; /* 移动端缩小圆角 */
    background-color: rgba(179, 216, 255, 0.3); /* 移动端降低透明度，更柔和 */
  }

  .tools-grid {
    /* 手机端改为单列布局，卡片全屏显示，更易阅读 */
    grid-template-columns: 1fr;
    /* 减少卡片之间的间距 */
    gap: 20px;
  }

  .tool-card {
    /* 减少手机端卡片内边距，节省屏幕空间 */
    padding: 20px 15px;
    background: rgba(255, 255, 255, 0.2); /* 移动端同步提高透明度 */
  }

  .tool-card h3 {
    /* 缩小卡片标题字体 */
    font-size: 20px;
  }

  .tool-card p {
    /* 缩小卡片描述字体，调整行高提升可读性 */
    font-size: 14px;
    line-height: 1.6;
  }

  .tool-link {
    /* 微调按钮内边距，适配手机端点击区域 */
    padding: 6px 12px;
    font-size: 14px;
  }

  .tool-icon {
    /* 适当缩小图标，保持比例协调 */
    width: 40px;
    height: 40px;
  }
}
</style>