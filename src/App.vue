<template>
  <div class="global-wrapper">
    <!-- 导航栏（增大圆圈间隔） -->
    <nav class="nav-bar">
      <router-link to="/" class="nav-option">
        <div class="nav-circle">龙岛</div>
      </router-link>
      <router-link to="/dragon-growth" class="nav-option">
        <div class="nav-circle">龙的成长</div>
      </router-link>
      <router-link to="/dragon-tools" class="nav-option">
        <div class="nav-circle">龙的工具</div>
      </router-link>
      <router-link to="/dragon-den" class="nav-option">
        <div class="nav-circle">龙窝</div>
      </router-link>
    </nav>

    <!-- 路由出口 -->
    <router-view />
  </div>
</template>

<script setup>
// 路由自动处理组件
</script>

<style scoped>
.global-wrapper {
  width: 100%;
  min-height: 100vh;
  /* 保留原有浅蓝背景作为兜底（图片加载失败/网络异常时显示） */
  background-color: #e6f7ff;
  /* 你的指定背景图片 URL */
  background-image: url("http://xiaolongya.cn/uploads/c85b8424-adab-4edf-b6b0-59584178d49e.png");
  /* 强制宽高都铺满容器，无空隙 */
  background-size: 100% 100%;
  background-position: center; /* 背景图居中 */
  background-attachment: scroll; /* 随页面滚动，避免固定导致的显示不全 */
  background-repeat: no-repeat; /* 禁止重复平铺 */
  display: flex;
  flex-direction: column;
  align-items: center;
  
}

.nav-bar {
  width: 100%;
  height: 90px;
  /* 核心修改：RGBA 格式设置白色背景 + 0.8 透明度（可调整最后一个参数） */
  background-color: rgba(255, 255, 255, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 200px; /* 增大导航圆圈间隔（原40px→60px） */
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-option {
  text-decoration: none;
}

.nav-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #b3d8ff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 25px;
  font-weight: 700;
  color: #2f5496;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #2f5496;
  text-align: center;
  padding: 5px;
  box-sizing: border-box;
}

.nav-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  background-color: #d7e8ff;
}

/* 响应式适配（手机端） */
@media (max-width: 768px) {
  .nav-bar {
    gap: 30px; /* 手机端也增大间隔（原20px→30px） */
    height: 80px;
    /* 手机端同步保留透明度，保持样式统一 */
    background-color: rgba(255, 255, 255, 0.8);
  }
  .nav-circle {
    width: 60px;
    height: 60px;
    font-size: 19px;
  }
}
</style>