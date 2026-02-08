<template>
  <div class="home-page">
    <section class="title-avatar-wrap">
      <div class="side-nav">
        <button class="recent-btn unselectable" @click="router.push('/recent-activity')">
          <span class="btn-icon">🌊</span> 看看龙在做什么
        </button>
      </div>

      <div class="header-main">
        <h1 class="blog-main-title unselectable">小龙の分享站</h1>
      </div>

      <div class="side-profile">
        <div class="admin-entry">
          <button class="admin-btn unselectable" @click="showLoginModal = true">
            <span class="btn-icon">🔑</span> 龙岛后台
          </button>
        </div>
        <img 
          class="personal-avatar" 
          src="https://xiaolongya.cn/uploads/avatar.jpg" 
          alt="个人头像"   
          @click="router.push('/dragon-den')" 
        />
      </div>
    </section>

    <section class="main-content-wrap">
      <div class="content-header unselectable">
        <p class="content-tip-text">
          探索龙的 <span class="highlight">开源项目</span> · 
          寻获 <span class="highlight">实用工具</span> · 
          共鸣 <span class="highlight">成长感悟</span>
        </p>
        <div class="divider"></div>
      </div>
      
      <div class="circles-row">
        <div 
          class="circle-item" 
          v-for="(item, idx) in circleList" 
          :key="idx"  
          @click.prevent="handleCircleClick(item)"
        >
          <div class="circle-bg unselectable">
            <span class="circle-text">{{ item.content }}</span>
            <div class="glass-reflection"></div>
          </div>
        </div>
      </div>
    </section>

    <section class="beian-info-wrap">
      <a href="https://beian.miit.gov.cn/" target="_blank" class="beian-link">
        粤ICP备2026012519号-1
      </a>
    </section>

    <Transition name="modal-fast">
      <div class="login-modal-mask" v-if="showLoginModal" @click="closeLoginModal">
        <div class="login-modal" @click.stop>
          <Transition name="fade">
            <div class="success-overlay" v-if="loginSuccess">
              <div class="success-content">
                <div class="check-icon">✔</div>
                <p>身份核验通过，欢迎归岛</p>
              </div>
            </div>
          </Transition>

          <div class="modal-decoration"></div>
          <div class="modal-header unselectable">
            <div class="dragon-logo">🐲</div>
            <h2 class="modal-title">身份核验</h2>
          </div>
          
          <div class="modal-body">
            <div class="input-group">
              <input type="text" v-model="loginForm.username" placeholder="管理员账号" class="modal-input" :disabled="loginSuccess" />
            </div>
            <div class="input-group">
              <input type="password" v-model="loginForm.password" placeholder="通行密码" class="modal-input" :disabled="loginSuccess" />
            </div>
          </div>

          <div class="modal-btn-group">
            <button class="modal-login-btn unselectable" @click="handleLogin" :disabled="isLoginLoading || loginSuccess">
              {{ isLoginLoading ? '正在核验...' : '进入龙岛' }}
            </button>
            <button class="modal-close-btn unselectable" @click="closeLoginModal" v-if="!loginSuccess">暂不进入</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// 数据定义：使用 \n 明确换行位置
const circleList = [
  { content: "龙岛发展\n(开源项目)", path: '/dragon-development' },
  { content: "龙岛聚会\n(评论社区)", path: '/comment-area' },
  { content: "龙岛秘藏\n(更多分享)", path: '' } 
];

const handleCircleClick = async (item) => {
  if (item.path) {
    await nextTick()
    router.push(item.path)
  }
}

const showLoginModal = ref(false)
const loginForm = ref({ username: '', password: '' })
const isLoginLoading = ref(false)
const loginSuccess = ref(false)

const closeLoginModal = () => {
  if (loginSuccess.value) return
  showLoginModal.value = false
  loginForm.value = { username: '', password: '' }
}

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    alert('账号或密码为空！'); return
  }
  isLoginLoading.value = true
  try {
    const response = await axios.post('https://xiaolongya.cn/blog/user/login', loginForm.value)
    if (response.data === "登陆成功") {
      loginSuccess.value = true
      localStorage.setItem('isAdminLogin', 'true')
      setTimeout(() => { router.push('/admin') }, 1500)
    } else { alert('核验未通过'); }
  } catch (e) { console.error(e) } finally { isLoginLoading.value = false }
}
</script>

<style scoped>
.unselectable {
  user-select: none;
  -webkit-user-select: none;
  cursor: pointer !important;
}

.home-page {
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
}

.title-avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 0;
  gap: 30px;
}

@media (max-width: 1023px) {
  .side-profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .admin-entry {
    display: flex;
    justify-content: center;
    width: 100%;
  }
}

@media (min-width: 1024px) {
  .title-avatar-wrap { flex-direction: row; justify-content: space-between; height: 160px; }
  .side-nav, .side-profile { flex: 1; display: flex; align-items: center; }
  .side-profile { justify-content: flex-end; gap: 25px; }
  .header-main { flex: 1.5; text-align: center; }
}

.blog-main-title {
  font-family: "Ma Shan Zheng", cursive;
  font-size: clamp(40px, 8vw, 75px);
  background: linear-gradient(135deg, #00c0e2, #2f5496);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.05));
}

.recent-btn {
  background: rgba(47, 84, 150, 0.05);
  color: #d88e26;
  border: 1.5px solid rgba(47, 84, 150, 0.2);
  padding: 10px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 25px;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}
.recent-btn:hover {
  background: #2f5496;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(47, 84, 150, 0.2);
}

.admin-btn {
  background: transparent;
  color: #d88e26;
  border: 1.5px solid rgba(47, 84, 150, 0.1);
  padding: 8px 18px;
  border-radius: 12px;
  font-size: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
}
.admin-btn:hover {
  border-color: #00c0e2;
  background: rgba(0, 192, 226, 0.05);
  color: #00c0e2;
}

.personal-avatar {
  width: 90px; height: 90px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 8px 25px rgba(0,0,0,0.08);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.personal-avatar:hover { transform: scale(1.1) rotate(5deg); }

.main-content-wrap {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 80px;
  padding: 80px 40px;
  margin-bottom: 60px;
  text-align: center;
}

.content-header { margin-bottom: 70px; }
.content-tip-text { font-size: clamp(18px, 4vw, 26px); color: #3d5a80; font-weight: 500; }
.highlight { color: #2f5496; font-weight: 800; border-bottom: 2px solid #00c0e2; margin: 0 4px; }
.divider { width: 80px; height: 3px; background: linear-gradient(90deg, transparent, #00c0e2, #2f5496, transparent); margin: 25px auto; }

.circles-row { display: flex; justify-content: center; gap: 50px; flex-wrap: wrap; }
.circle-bg {
  width: 200px; height: 200px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50px;
  display: flex; justify-content: center; align-items: center;
  border: 1px solid rgba(255,255,255,0.8);
  box-shadow: 0 15px 35px rgba(47, 84, 150, 0.08);
  position: relative; overflow: hidden;
  transition: all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.circle-bg:hover { transform: translateY(-15px); background: white; box-shadow: 0 30px 60px rgba(47, 84, 150, 0.15); }

/* --- 核心修改部分 --- */
.circle-text { 
  font-size: 22px; 
  font-weight: 800; 
  color: #2f5496; 
  line-height: 1.4; 
  z-index: 2; 
  pointer-events: none;
  white-space: pre-line; /* 识别 \n 进行换行 */
  text-align: center;    /* 换行后文字居中 */
}

@media (min-width: 1024px) {
  .circle-bg { width: 260px; height: 260px; border-radius: 70px; }
  .circle-text { font-size: 30px; }
}

.glass-reflection {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.4), transparent);
  transform: rotate(45deg); transition: all 0.7s;
}
.circle-bg:hover .glass-reflection { transform: rotate(45deg) translate(25%, 25%); }

.login-modal-mask {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 32, 55, 0.3); z-index: 2000;
  display: flex; justify-content: center; align-items: center;
}
.login-modal {
  background: white; width: 90%; max-width: 400px;
  padding: 45px; border-radius: 35px; box-shadow: 0 25px 70px rgba(0,0,0,0.15);
  position: relative; overflow: hidden;
}
.success-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: white; z-index: 10; display: flex; justify-content: center; align-items: center; }
.check-icon { width: 65px; height: 65px; background: #52c41a; color: white; border-radius: 50%; font-size: 32px; line-height: 65px; margin: 0 auto 20px; text-align: center; }
.modal-decoration { position: absolute; top: 0; left: 0; width: 100%; height: 8px; background: linear-gradient(90deg, #00c0e2, #2f5496); }
.modal-title { font-family: "Ma Shan Zheng", cursive; font-size: 30px; margin-bottom: 35px; color: #2f5496; text-align: center; }
.modal-input { width: 100%; padding: 16px; margin-bottom: 18px; border-radius: 15px; border: 1.5px solid #f0f0f0; background: #f9fbff; transition: all 0.3s; }
.modal-input:focus { border-color: #00c0e2; background: white; outline: none; }
.modal-login-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, #2f5496, #1a3a6d); color: white; border: none; border-radius: 15px; font-weight: 700; font-size: 17px; cursor: pointer; }
.modal-close-btn { background: none; border: none; color: #b0bfc6; cursor: pointer; margin-top: 20px; width: 100%; }

.modal-fast-enter-active { transition: opacity 0.3s ease; }
.modal-fast-leave-active { transition: opacity 0.2s ease; }
.modal-fast-enter-active .login-modal { transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1); }
.modal-fast-enter-from .login-modal { transform: scale(0.85) translateY(30px); }

.beian-link { font-size: 13px; color: #cbd5e1; text-decoration: none; transition: color 0.3s; }
.beian-link:hover { color: #2f5496; }
</style>