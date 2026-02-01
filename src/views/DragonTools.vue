<template>
  <div class="dragon-tools">
    <h1>龙的工具库</h1>
    <div class="tools-grid">
      <div class="tool-card" v-for="(tool, idx) in toolsList" :key="idx">
        <div class="tool-icon">{{ tool.icon }}</div>
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
    icon: "⚙️",
    name: "Vue DevTools",
    desc: "Vue 官方调试工具，实时查看组件树、状态变化",
    link: "https://github.com/vuejs/devtools"
  },
  {
    icon: "🔧",
    name: "Vite",
    desc: "极速的前端构建工具，开发体验拉满",
    link: "https://vite.dev/"
  },
  {
    icon: "📦",
    name: "Pinia",
    desc: "Vue 新一代状态管理库，替代 Vuex",
    link: "https://pinia.vuejs.org/"
  },
  {
    icon: "🧪",
    name: "Vitest",
    desc: "基于 Vite 的单元测试框架，轻量高效",
    link: "https://vitest.dev/"
  }
];
</script>

<style scoped>
.dragon-tools {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 42px;
  color: #2f5496;
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
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.tool-icon {
  font-size: 48px;
  margin-bottom: 15px;
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