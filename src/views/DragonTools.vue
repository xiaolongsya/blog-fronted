<template>
  <div class="dragon-tools">
    <h1>龙的工具库</h1>
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
</template>

<script setup>
const toolsList = [
  {
    icon: "http://xiaolongya.cn/uploads/15a06548-6ba8-46cf-be8d-07c71eda0b11.png",
    name: "Watt Toolkit",
    desc: "可以对github和steam进行免费加速，加速情况尚可，免费就是正义哇小龙",
    link: "https://steampp.net/"
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
}

h1 {
  font-size: 100px;
  color: #00c0e2;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  text-align: center;
  margin-bottom: 40px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.tool-card {
  /* 核心修改：将白色背景改为 rgba 格式，设置透明度 0.6 */
  background: rgba(255, 255, 255, 0.6);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
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

/* 新增：手机端适配（屏幕宽度 ≤ 768px） */
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

  .tools-grid {
    /* 手机端改为单列布局，卡片全屏显示，更易阅读 */
    grid-template-columns: 1fr;
    /* 减少卡片之间的间距 */
    gap: 20px;
  }

  .tool-card {
    /* 减少手机端卡片内边距，节省屏幕空间 */
    padding: 20px 15px;
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