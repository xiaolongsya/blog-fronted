<template>
  <div class="global-wrapper" :class="{ 'dark-mode': isDarkMode }">
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
      
      <!-- 黑暗模式切换按钮 -->
      <div class="dark-mode-toggle" @click="toggleDarkMode">
        <div class="toggle-circle" :class="{ 'toggle-active': isDarkMode }"></div>
      </div>
    </nav>

    <!-- 路由出口 -->
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 1. 定义黑暗模式状态（响应式）
const isDarkMode = ref(false);

// 2. 切换黑暗模式的方法
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  // 保存到本地存储，刷新页面后保留用户选择
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value));
};

// 3. 页面挂载时，从本地存储读取之前的黑暗模式设置
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode) {
    isDarkMode.value = JSON.parse(savedDarkMode);
  }
});
</script>

<style scoped>
.global-wrapper {
  width: 100%;
  min-height: 100vh;
  /* 保留原有浅蓝背景作为兜底（图片加载失败/网络异常时显示） */
  background-color: #e6f7ff;
  /* 你的指定背景图片 URL（浅色模式） */
  background-image: url("https://xiaolongya.cn/uploads/c85b8424-adab-4edf-b6b0-59584178d49e.png");
  /* 强制宽高都铺满容器，无空隙 */
  background-size: 100% 100%;
  background-position: center; /* 背景图居中 */
  background-attachment: scroll; /* 随页面滚动，避免固定导致的显示不全 */
  background-repeat: no-repeat; /* 禁止重复平铺 */
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 过渡效果，切换时更丝滑 */
  transition: all 0.3s ease;
}

/* 黑暗模式下的全局样式 */
.global-wrapper.dark-mode {
  /* 黑暗模式兜底背景色 */
  background-color: #121826;
  /* 替换成你的深色冰龙背景图 URL */
  background-image: url("https://xiaolongya.cn/uploads/f9e23db9-6893-4067-b9ca-28cee82c2aff.png");
  /* 保持背景铺满的属性 */
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
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
  transition: all 0.3s ease;
}

/* 黑暗模式下的导航栏 */
.global-wrapper.dark-mode .nav-bar {
  background-color: rgba(18, 24, 38, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
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

/* 黑暗模式下的导航圆圈 */
.global-wrapper.dark-mode .nav-circle {
  background-color: #1e293b;
  color: #94a3b8;
  border: 2px solid #475569;
}

.nav-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
  background-color: #d7e8ff;
}

/* 黑暗模式下的导航圆圈hover效果 */
.global-wrapper.dark-mode .nav-circle:hover {
  background-color: #27374d;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
}

/* 黑暗模式切换按钮样式 */
.dark-mode-toggle {
  width: 80px;
  height: 40px;
  background-color: #b3d8ff;
  border-radius: 20px;
  margin-left: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 5px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

/* 黑暗模式下的切换按钮背景 */
.global-wrapper.dark-mode .dark-mode-toggle {
  background-color: #475569;
}

/* 切换按钮内部圆圈 */
.toggle-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #2f5496;
  transition: all 0.3s ease;
}

/* 切换按钮激活状态（黑暗模式下） */
.toggle-circle.toggle-active {
  transform: translateX(40px);
  background-color: #94a3b8;
}

/* 响应式适配（手机端） */
@media (max-width: 768px) {
  .nav-bar {
    gap: 30px; /* 手机端也增大间隔（原20px→30px） */
    height: 80px;
    /* 手机端同步保留透明度，保持样式统一 */
    background-color: rgba(255, 255, 255, 0.8);
  }
  
  /* 手机端黑暗模式导航栏 */
  .global-wrapper.dark-mode .nav-bar {
    background-color: rgba(18, 24, 38, 0.9);
  }
  
  .nav-circle {
    width: 60px;
    height: 60px;
    font-size: 19px;
  }
  
  /* 手机端切换按钮适配 */
  .dark-mode-toggle {
    width: 60px;
    height: 30px;
    margin-left: 20px;
  }
  
  .toggle-circle {
    width: 20px;
    height: 20px;
  }
  
  .toggle-circle.toggle-active {
    transform: translateX(30px);
  }
}
</style>