<template>
  <!-- 主页容器 -->
  <div class="home-page">
    <!-- 标题与头像区域 -->
    <section class="title-avatar-wrap">
      <button class="recent-btn" @click="router.push('/recent-activity')">看看龙最近在做什么</button>
      <!-- 博客主标题 -->
      <h1 class="blog-main-title">小龙の分享站</h1>
      <!-- 个人头像图片：Vue 3 中统一使用脚本内的 router 实例 -->
      <img 
        class="personal-avatar" 
        src="https://xiaolongya.cn/uploads/avatar.jpg" 
        alt="个人头像"   
        @click="router.push('/dragon-den')" 
      />
      <!-- 控制台跳转区域 -->
      <div class="admin-btn-group">
        <button class="admin-btn" @click="showLoginModal = true">龙岛的后台</button>
        <span class="admin-tip">只有龙才能进</span>
      </div>
    </section>

    <!-- 主要内容区域 -->
    <section class="main-content-wrap">
      <!-- 新增：蓝色区块内圆圈上方的提示文字 -->
      <div class="content-tip-text">在这里你可以看到龙的开源项目，实用工具，成长感悟与其他分享！</div>
      
      <!-- 循环渲染圆形项目列表：增加 .prevent 阻止默认行为，解决点击恢复原形 -->
      <div 
        class="circle-item" 
        v-for="(item, idx) in circleList" 
        :key="idx"  
        @click.prevent="handleCircleClick(item)"
      >
        <!-- 圆形背景容器 -->
        <div class="circle-bg">
          <!-- 圆形内显示的文字内容 -->
          <span class="circle-text">{{ item.content }}</span>
        </div>
      </div>
    </section>

    <!-- 新增：备案信息区域（放在页面底部，合规且不影响原有布局） -->
    <section class="beian-info-wrap">
      <a href="https://beian.miit.gov.cn/" target="_blank" class="beian-link">
        粤ICP备2026012519号-1
      </a>
    </section>

    <!-- 管理员登录弹窗（默认隐藏） -->
    <div class="login-modal-mask" v-if="showLoginModal" @click="closeLoginModal">
      <div class="login-modal" @click.stop>
        <!-- 弹窗标题 -->
        <div class="modal-title">龙岛后台登录</div>
        <!-- 用户名输入框 -->
        <div class="modal-input-item">
          <label>用户名：</label>
          <input 
            type="text" 
            v-model="loginForm.username" 
            placeholder="请输入管理员用户名"
            class="modal-input"
          />
        </div>
        <!-- 密码输入框 -->
        <div class="modal-input-item">
          <label>密&nbsp;&nbsp;&nbsp;码：</label>
          <input 
            type="password" 
            v-model="loginForm.password" 
            placeholder="请输入管理员密码"
            class="modal-input"
          />
        </div>
        <!-- 登录/关闭按钮 -->
        <div class="modal-btn-group">
          <button class="modal-login-btn" @click="handleLogin" :disabled="isLoginLoading">
            <span v-if="isLoginLoading" class="loading-icon">🔄</span>
            {{ isLoginLoading ? '登录中...' : '登录' }}
          </button>
          <button class="modal-close-btn" @click="closeLoginModal" :disabled="isLoginLoading">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue 3 中 useRouter 必须从 vue-router 导入
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
// 引入 axios 用于发送接口请求
import axios from 'axios'

// 创建 Vue 3 路由实例
const router = useRouter()

/**
 * 定义圆形项目的列表数据（带路由路径）
 */
const circleList = [
  { content: "龙岛的发展\n(开源)", path: '/dragon-development' },
  { content: "龙岛聚会\n(评论区)", path: '/comment-area' },
  { content: "其他", path: '' } // 其他暂时无跳转，留空
];

/**
 * 处理圆形项目点击事件（直接读取path跳转，简洁健壮）
 */
const handleCircleClick = async (item) => {
  // 有有效path才执行跳转，加nextTick保证交互流畅
  if (item.path) {
    await nextTick()
    router.push(item.path)
  }
}

// 登录弹窗相关变量
const showLoginModal = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})
// 可选：登录请求加载状态（防止重复点击）
const isLoginLoading = ref(false)

/**
 * 关闭登录弹窗并重置表单数据
 */
const closeLoginModal = async () => {
  await nextTick()
  showLoginModal.value = false
  loginForm.value.username = ''
  loginForm.value.password = ''
  isLoginLoading.value = false // 关闭弹窗时重置加载状态
}

/**
 * 处理管理员登录逻辑（POST 请求 + 标准 JSON 格式传参）
 */
const handleLogin = async () => {
  // 1. 前置输入验证
  if (!loginForm.value.username || !loginForm.value.password) {
    alert('用户名和密码不能为空！')
    return
  }

  // 2. 防止重复提交
  if (isLoginLoading.value) return
  isLoginLoading.value = true

  try {
    // 3. 发送 POST 登录请求（标准 JSON 格式传参）
    const response = await axios.post(
      'https://xiaolongya.cn/blog/user/login',
      {
        username: loginForm.value.username,
        password: loginForm.value.password
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    // 4. 处理接口返回结果（后端成功返回 "登陆成功"）
    const result = response.data
    if (result === "登陆成功") {
      alert('登录成功！即将跳转到后台管理页面～')
      // 新增：存入登录标识，供页面加载时拦截判断
      localStorage.setItem('isAdminLogin', 'true')
      closeLoginModal()
      router.push('/admin') // 跳转管理员界面
    } else {
      alert('用户名或密码错误！仅管理员可登录～')
      loginForm.value.password = '' // 清空密码框，保护隐私
    }
  } catch (error) {
    // 5. 处理接口请求异常（网络错误、接口报错等）
    console.error('登录请求失败：', error)
    alert('登录请求异常，请稍后再试！')
  } finally {
    // 6. 无论成功还是失败，都重置加载状态
    isLoginLoading.value = false
  }
}
</script>

<style scoped>
/* 页面全局样式优化 */
.home-page {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  font-family: "Microsoft YaHei", "楷体", "KaiTi", "STKaiti", serif;
}

/* 标题与头像包裹区域样式 */
.title-avatar-wrap {
  width: 100%;
  margin: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  gap: 20px;
}

/* 博客主标题样式 - 美化：渐变文字 */
.blog-main-title {
  font-size: 86px;
  font-weight: 900;
  background: linear-gradient(135deg, #00c0e2, #2f5496);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-family: "Ma Shan Zheng", "楷体", "STKaiti", cursive;
  letter-spacing: 14px;
  text-align: center;
  margin: 0;
  transition: all 0.2s ease;
}

/* 个人头像样式 - 优化：轻量化过渡 */
.personal-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 5px solid #b3d8ff;
  position: absolute;
  right: 0;
  cursor: pointer;
  transition: all 0.15s ease; /* 缩短过渡时长，更丝滑 */
  box-shadow: 0 4px 12px rgba(47, 84, 150, 0.15);
}

.personal-avatar:hover {
  transform: scale(1.05); /* 轻微缩放，无冗余动画 */
  border-color: #2f5496;
  box-shadow: 0 6px 16px rgba(47, 84, 150, 0.2);
}

.personal-avatar:active {
  transform: scale(0.98); /* 按压反馈，更真实 */
}

/* 最近动态按钮 - 优化：轻量化过渡 */
.recent-btn {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 12px 24px;
  background-color: #2f5496;
  color: white;
  border: none;
  border-radius: 24px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.1s ease; /* 轻量化过渡 */
  box-shadow: 0 3px 8px rgba(47, 84, 150, 0.2);
  user-select: none;
}

.recent-btn:hover {
  background-color: #3a66b8;
  box-shadow: 0 4px 12px rgba(47, 84, 150, 0.3);
}

.recent-btn:active {
  transform: translateY(-50%) translateY(1px);
  box-shadow: none;
}

/* 主要内容区域样式 - 优化：背景美化+轻量化 */
.main-content-wrap {
  width: 100%;
  /* 修改：固定高度改为最小高度，自适应新增文字 */
  min-height: 520px;
  /* 核心修改：将纯色背景改为 RGBA 格式，透明度 0.6 + 轻微渐变 */
  background: linear-gradient(rgba(179, 216, 255, 0.5), rgba(179, 216, 255, 0.7));
  border-radius: 120px;
  /* 修改：改为垂直排列，保证文字在上、圆圈在下 */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 180px; /* 修改：增加上下内边距，避免文字贴顶 */
  margin-bottom: 50px;
  box-sizing: border-box;
  display: flex;
  box-shadow: 0 10px 30px rgba(47, 84, 150, 0.1); /* 轻微阴影，美化视觉 */
}

/* 新增：蓝色区块内圆圈上方的提示文字样式（复用圆圈字体样式） */
.content-tip-text {
  /* 复用圆圈内文字的字体样式，保证统一 */
  font-size: 38px;
  font-weight: 700;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  text-align: center;
  line-height: 1.5;
  
  /* 布局调整：与下方圆圈保持间距，占据整行宽度 */
  width: 100%;
  margin-bottom: 40px; /* 与下方圆圈拉开距离，可按需调整 */
  transition: color 0.2s ease;
}

/* 圆形项目项样式（统一布局，无额外外边距干扰） */
.circle-item {
  width: 260px;
  height: 260px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 80px;
  user-select: none;
}

/* 圆形背景样式（完全统一，大小、边框、阴影一致）- 优化：轻量化过渡 */
.circle-bg {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00c0e2, #4fc3f7); /* 渐变背景，美化 */
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.15s ease; /* 缩短过渡，更丝滑 */
  border: 2px solid #2f5496;
  padding: 20px;
  box-sizing: border-box;
}

/* 圆形内文字样式（统一字体、大小、行高） */
.circle-text {
  font-size: 38px;
  font-weight: 700;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  text-align: center;
  white-space: pre-line;
  line-height: 1.5;
  transition: color 0.15s ease;
}

/* 圆形背景悬浮 + 激活态样式：解决点击恢复原形问题，保持放大效果 */
.circle-bg:hover {
  transform: scale(1.03); /* 缩小缩放比例，减少渲染开销 */
  box-shadow: 0 8px 20px rgba(47, 84, 150, 0.25);
  border-color: #3a66b8;
  background: linear-gradient(135deg, #4fc3f7, #00c0e2);
}

.circle-bg:hover .circle-text {
  color: #1f3a6b;
}

.circle-bg:active {
  transform: scale(0.98); /* 按压反馈，无卡顿 */
  box-shadow: 0 2px 8px rgba(47, 84, 150, 0.2);
}

/* 后台按钮组样式 */
.admin-btn-group {
  position: absolute;
  left: calc(100% + 25px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 后台按钮样式 - 优化：轻量化过渡 */
.admin-btn {
  padding: 10px 20px;
  background-color: #2f5496;
  color: #ffffff;
  border: none;
  border-radius: 24px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.1s ease; /* 轻量化过渡 */
  box-shadow: 0 3px 8px rgba(47, 84, 150, 0.2);
  user-select: none;
}

/* 按钮悬浮 + 激活效果 */
.admin-btn:hover {
  background-color: #3a66b8;
  box-shadow: 0 4px 12px rgba(47, 84, 150, 0.3);
}

.admin-btn:active {
  transform: translateY(1px);
  box-shadow: none;
}

/* 后台提示词样式 */
.admin-tip {
  font-size: 16px;
  color: #ff4d4f;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

/* 登录弹窗遮罩层样式 - 优化：秒开淡入动画，无模糊 */
.login-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: modalFadeIn 0.1s ease forwards; /* 轻量化淡入 */
  opacity: 0;
}

/* 登录弹窗容器样式 - 优化：淡入动画，美化视觉 */
.login-modal {
  width: 380px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-sizing: border-box;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  animation: modalFadeIn 0.12s ease forwards; /* 轻微延迟，更流畅 */
  opacity: 0;
  overflow: hidden;
}

/* 通用淡入动画：轻量化，无冗余变换 */
@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 弹窗标题样式 - 美化：渐变文字 */
.modal-title {
  font-size: 24px;
  background: linear-gradient(135deg, #2f5496, #00c0e2);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-align: center;
  margin-bottom: 20px;
  font-weight: 700;
}

/* 输入项容器样式 */
.modal-input-item {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

/* 输入框标签样式 */
.modal-input-item label {
  font-size: 18px;
  color: #333;
  width: 80px;
  text-align: right;
  margin-right: 10px;
}

/* 输入框样式 - 优化：轻量化过渡 */
.modal-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  font-size: 16px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  outline: none;
  transition: border-color 0.1s ease; /* 仅边框过渡，减少渲染 */
  box-sizing: border-box;
}

/* 输入框聚焦样式 - 简化：仅变边框色 */
.modal-input:focus {
  border-color: #2f5496;
}

/* 按钮组样式 */
.modal-btn-group {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 25px;
}

/* 登录按钮样式 - 优化：轻量化过渡 */
.modal-login-btn {
  padding: 10px 30px;
  background-color: #2f5496;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  cursor: pointer;
  transition: all 0.1s ease; /* 轻量化过渡 */
  box-shadow: 0 3px 8px rgba(47, 84, 150, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.modal-login-btn:hover:not(:disabled) {
  background-color: #3a66b8;
  box-shadow: 0 4px 12px rgba(47, 84, 150, 0.3);
}

.modal-login-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: none;
}

.modal-login-btn:disabled {
  background-color: #b3d8ff;
  cursor: not-allowed;
  box-shadow: none;
}

/* 关闭按钮样式 - 优化：轻量化过渡 */
.modal-close-btn {
  padding: 10px 30px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  cursor: pointer;
  transition: all 0.1s ease; /* 轻量化过渡 */
  user-select: none;
}

.modal-close-btn:hover:not(:disabled) {
  background-color: #f0f0f0;
  border-color: #ccc;
}

.modal-close-btn:active:not(:disabled) {
  transform: translateY(1px);
}

.modal-close-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 加载图标动画 */
.loading-icon {
  animation: rotate 1.5s linear infinite;
  font-size: 16px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 新增：备案信息样式（合规且美观，与页面风格统一） */
.beian-info-wrap {
  text-align: center;
  margin: 30px 0 20px; /* 上下间距，不拥挤 */
}

.beian-link {
  font-size: 12px;
  color: #666; /* 浅灰色，不突兀 */
  text-decoration: none; /* 去掉默认下划线，更美观 */
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  transition: color 0.2s ease;
}

.beian-link:hover {
  color: #2f5496; /* 悬浮时变主色调，提升交互体验 */
  text-decoration: underline; /* 悬浮显示下划线，提示可点击 */
}

/* 响应式适配：手机端（≤768px） */
@media (max-width: 768px) {
  .home-page {
    width: 100%;
    box-sizing: border-box;
    padding: 0 10px;
  }

  .title-avatar-wrap {
    width: 95%;
    margin: 20px 0;
    flex-direction: column; /* 垂直排列，适配手机端 */
    gap: 15px; /* 增加内部间距，避免拥挤 */
    position: relative;
  }

  .blog-main-title {
    font-size: 36px;
    letter-spacing: 8px;
    margin: 0 auto;
  }

  .personal-avatar {
    width: 60px;
    height: 60px;
    border-width: 3px;
    position: static; /* 取消绝对定位，跟随垂直排列 */
    margin: 10px auto 0;
    transform: none;
  }

  /* 关键修改：移除 display: none; 并适配手机端布局 */
  .admin-btn-group {
    position: static; /* 取消绝对定位，跟随垂直排列 */
    transform: none; /* 取消垂直居中偏移 */
    justify-content: center; /* 水平居中 */
    margin: 10px 0 0; /* 增加顶部间距，避免和头像重叠 */
    gap: 8px; /* 适当缩小间距，适配手机屏幕 */
  }

  /* 手机端控制台按钮适配，缩小尺寸 */
  .admin-btn {
    padding: 8px 15px;
    font-size: 14px;
    border-radius: 20px;
  }

  /* 手机端控制台提示文字适配，缩小尺寸 */
  .admin-tip {
    font-size: 12px;
  }

  .main-content-wrap {
    height: auto;
    padding: 30px 20px; /* 手机端也适当增大内边距，保证圆圈间距 */
    border-radius: 40px;
    flex-direction: column;
    gap: 50px; /* 手机端垂直排列，增大上下间距（核心间距优化） */
    margin-bottom: 20px;
    /* 手机端同步设置相同透明度 + 渐变 */
    background: linear-gradient(rgba(179, 216, 255, 0.2), rgba(179, 216, 255, 0.4));
    box-shadow: 0 5px 15px rgba(47, 84, 150, 0.08);
  }

  /* 新增：手机端提示文字适配 */
  .content-tip-text {
    font-size: 20px; /* 与手机端圆圈文字大小一致 */
    margin-bottom: 20px; /* 手机端缩小上下间距 */
    padding: 0 10px; /* 防止文字超出屏幕两侧 */
  }

  .circle-item {
    width: 150px;
    height: 150px;
    margin: 40px;
  }

  .circle-bg {
    width: 150px;
    height: 150px;
    padding: 10px;
    border-width: 1px;
  }

  .circle-text {
    font-size: 20px;
    line-height: 1.4;
  }

  /* 最近动态按钮手机端适配 */
  .recent-btn {
    position: static;
    transform: none;
    margin-bottom: 15px;
    padding: 8px 18px;
    font-size: 14px;
  }

  /* 手机端弹窗适配 */
  .login-modal {
    width: 90%;
    padding: 20px;
  }

  .modal-title {
    font-size: 20px;
  }

  .modal-input-item label {
    font-size: 16px;
    width: 70px;
  }

  .modal-input {
    height: 36px;
    font-size: 14px;
  }

  .modal-login-btn, .modal-close-btn {
    padding: 8px 20px;
    font-size: 16px;
  }

  /* 新增：手机端备案信息适配 */
  .beian-info-wrap {
    margin: 20px 0 15px;
  }

  .beian-link {
    font-size: 10px;
  }
}
</style>