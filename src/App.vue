<template>
  <div class="global-wrapper">
    <!-- 导航栏 -->
    <nav class="nav-bar">
      <router-link to="/" class="nav-option">龙岛</router-link>
      <router-link to="/dragon-growth" class="nav-option">龙的成长</router-link>
      <router-link to="/dragon-tools" class="nav-option">龙的工具</router-link>
      <router-link to="/dragon-den" class="nav-option">龙窝</router-link>
    </nav>

    <!-- 路由出口：点击导航后，对应的页面会渲染在这里 -->
    <router-view />
  </div>
</template>

<script setup>
// 这里不需要导入页面组件了，路由会自动处理
</script>

<style scoped>

/* 保留你的全局样式，只删除原来的首页内容 */
.global-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #e6f7ff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav-bar {
  width: 100%;
  height: 70px;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 80px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  font-size: 26px;
  font-weight: 700;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-option {
  cursor: pointer;
  transition: color 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.nav-option:hover {
  color: #1890ff;
}
</style>