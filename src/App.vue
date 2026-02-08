<template>
  <div class="global-wrapper" :class="{ 'dark-mode': isDarkMode }">
    <nav class="nav-bar">
      <router-link to="/" class="nav-option">
        <div class="nav-circle">龙岛</div>
      </router-link>
      <router-link to="/dragon-growth" class="nav-option">
        <div class="nav-circle">成长</div>
      </router-link>
      <router-link to="/dragon-tools" class="nav-option">
        <div class="nav-circle">工具</div>
      </router-link>
      <router-link to="/dragon-den" class="nav-option">
        <div class="nav-circle">龙窝</div>
      </router-link>
      
      <div class="dark-mode-toggle" @click="toggleDarkMode">
        <div class="toggle-circle" :class="{ 'toggle-active': isDarkMode }"></div>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isDarkMode = ref(false);

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value));
};

onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode) {
    isDarkMode.value = JSON.parse(savedDarkMode);
  }
});
</script>

<style scoped>
/* --- 全局容器 --- */
.global-wrapper {
  width: 100%;
  min-height: 100vh;
  background-color: #e6f7ff;
  /* 更新后的白色模式背景 */
  background-image: url("https://xiaolongya.cn/uploads/5d39b42b-39d8-48dd-a2ea-713fb04c2556.webp");
  background-size: cover; /* 覆盖整个屏幕，保持比例 */
  background-position: center;
  background-attachment: fixed; /* 背景固定，滚动更流畅 */
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background 0.5s ease; /* 让背景切换更丝滑 */
}

/* --- 黑暗模式 --- */
.global-wrapper.dark-mode {
  background-color: #121826;
  /* 更新后的黑夜模式背景 */
  background-image: url("https://xiaolongya.cn/uploads/1b8a8ded-350e-4b22-b322-86ffb1ddb338.webp");
}

/* --- 导航栏基础样式 --- */
.nav-bar {
  width: 100%;
  height: 90px;
  background-color: rgba(255, 255, 255, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 200px; 
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

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

.global-wrapper.dark-mode .nav-circle:hover {
  background-color: #27374d;
}

/* --- 黑暗模式切换按钮 --- */
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

.global-wrapper.dark-mode .dark-mode-toggle {
  background-color: #475569;
}

.toggle-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #2f5496;
  transition: all 0.3s ease;
}

.toggle-circle.toggle-active {
  transform: translateX(40px);
  background-color: #94a3b8;
}

/* --- 响应式适配（手机端） --- */
@media (max-width: 768px) {
  .nav-bar {
    gap: 0;
    justify-content: space-around; 
    height: 70px;
    padding: 0 10px;
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  .global-wrapper.dark-mode .nav-bar {
    background-color: rgba(18, 24, 38, 0.9);
  }
  
  .nav-circle {
    width: 55px;
    height: 55px;
    font-size: 15px; 
    border-width: 1.5px;
    padding: 2px;
  }
  
  .dark-mode-toggle {
    width: 50px;
    height: 26px;
    margin-left: 0;
    flex-shrink: 0;
  }
  
  .toggle-circle {
    width: 18px;
    height: 18px;
  }
  
  .toggle-circle.toggle-active {
    transform: translateX(24px);
  }
}
</style>