<template>
  <!-- 主页容器 -->
  <div class="home-page">
    <!-- 标题与头像区域 -->
    <section class="title-avatar-wrap">
      <!-- 博客主标题 -->
      <h1 class="blog-main-title">小龙の分享站</h1>
      <!-- 个人头像图片：Vue 3 中统一使用脚本内的 router 实例 -->
      <img 
        class="personal-avatar" 
        src="http://124.221.211.146/uploads/avatar.jpg" 
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
          <button class="modal-login-btn" @click="handleLogin">登录</button>
          <button class="modal-close-btn" @click="closeLoginModal">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Vue 3 中 useRouter 必须从 vue-router 导入
import { ref } from 'vue'
import { useRouter } from 'vue-router'

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
const handleCircleClick = (item) => {
  // 有有效path才执行跳转
  if (item.path) {
    router.push(item.path)
  }
}

// 登录弹窗相关变量
const showLoginModal = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

/**
 * 关闭登录弹窗并重置表单数据
 */
const closeLoginModal = () => {
  showLoginModal.value = false
  loginForm.value.username = ''
  loginForm.value.password = ''
}

/**
 * 处理管理员登录逻辑
 */
const handleLogin = () => {
  const ADMIN_USER = 'xiaolong'
  const ADMIN_PWD = 'mc8978603'

  // 验证输入
  if (!loginForm.value.username || !loginForm.value.password) {
    alert('用户名和密码不能为空！')
    return
  }

  // 验证账号密码
  if (loginForm.value.username === ADMIN_USER && loginForm.value.password === ADMIN_PWD) {
    alert('登录成功！即将跳转到后台管理页面～')
    closeLoginModal()
    // router.push('/admin') // 后续补充后台路由后解开
  } else {
    alert('用户名或密码错误！仅管理员可登录～')
    loginForm.value.password = ''
  }
}
</script>

<style scoped>
/* 标题与头像包裹区域样式 */
.title-avatar-wrap {
  width: 90%;
  max-width: 1200px;
  margin: 40px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* 博客主标题样式 */
.blog-main-title {
  font-size: 86px;
  font-weight: 900;
  color: #2f5496;
  font-family: "Ma Shan Zheng", "楷体", "STKaiti", cursive;
  letter-spacing: 14px;
  text-align: center;
}

/* 个人头像样式 */
.personal-avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 5px solid #b3d8ff;
  position: absolute;
  right: 0;
  cursor: pointer;
  transition: transform 0.3s ease;
}

/* 主要内容区域样式*/
.main-content-wrap {
  width: 100%;
  height: 520px;
  background-color: #b3d8ff;
  border-radius: 120px;
  display: flex;
  justify-content: space-between; /* 替换 space-around 为 space-between，间距更均匀可控 */
  align-items: center;
  padding: 0 180px; /* 大幅增加左右内边距，间接增大圆圈之间的间距（核心间距优化） */
  margin-bottom: 50px;
  box-sizing: border-box;
}

/* 圆形项目项样式（统一布局，无额外外边距干扰） */
.circle-item {
  width: 260px;
  height: 260px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 80px;
}

/* 圆形背景样式（完全统一，大小、边框、阴影一致） */
.circle-bg {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
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
}

/* 圆形背景悬浮 + 激活态样式：解决点击恢复原形问题，保持放大效果 */
.circle-bg:hover, .circle-bg:active {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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

/* 后台按钮样式 */
.admin-btn {
  padding: 10px 20px;
  background-color: #2f5496;
  color: #ffffff;
  border: none;
  border-radius: 24px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* 按钮悬浮效果 */
.admin-btn:hover {
  background-color: #1f3a6b;
}

/* 后台提示词样式 */
.admin-tip {
  font-size: 16px;
  color: #ff4d4f;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

/* 登录弹窗遮罩层样式 */
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
}

/* 登录弹窗容器样式 */
.login-modal {
  width: 380px;
  background-color: #ffffff;
  border-radius: 16px;
  padding: 30px;
  box-sizing: border-box;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

/* 弹窗标题样式 */
.modal-title {
  font-size: 24px;
  color: #2f5496;
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

/* 输入框样式 */
.modal-input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  font-size: 16px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  outline: none;
  transition: border-color 0.3s ease;
}

/* 输入框聚焦样式 */
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

/* 登录按钮样式 */
.modal-login-btn {
  padding: 10px 30px;
  background-color: #2f5496;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-login-btn:hover {
  background-color: #1f3a6b;
}

/* 关闭按钮样式 */
.modal-close-btn {
  padding: 10px 30px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 18px;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.modal-close-btn:hover {
  background-color: #e8e8e8;
}

/* 响应式适配：手机端（≤768px） */
@media (max-width: 768px) {
  .home-page {
    width: 100%;
    box-sizing: border-box;
  }

  .title-avatar-wrap {
    width: 95%;
    margin: 20px 0;
    flex-direction: column;
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
    position: static;
    margin: 10px auto 0;
    transform: none;
  }

  .admin-btn-group {
    display: none;
  }

  .main-content-wrap {
    height: auto;
    padding: 30px 20px; /* 手机端也适当增大内边距，保证圆圈间距 */
    border-radius: 40px;
    flex-direction: column;
    gap: 50px; /* 手机端垂直排列，增大上下间距（核心间距优化） */
    margin-bottom: 20px;
  }

  .circle-item {
    width: 150px;
    height: 150px;
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
}
</style>