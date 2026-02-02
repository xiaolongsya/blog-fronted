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
</style>