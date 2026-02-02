import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import DragonDen from '../views/DragonDen.vue'
import DragonGrowth from '../views/DragonGrowth.vue'
import DragonTools from '../views/DragonTools.vue'
import CommentArea from '../views/CommentArea.vue'
import DragonDevelopment from '../views/DragonDevelopment.vue'
import Admin from '../views/Admin.vue'
import CategoryDetail from '../views/CategoryDetail.vue'
import RecentActivity from '../views/RecentActivity.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/dragon-den', name: 'DragonDen', component: DragonDen },
  { path: '/dragon-growth', name: 'DragonGrowth', component: DragonGrowth },
  { path: '/dragon-tools', name: 'DragonTools', component: DragonTools },
  // 新增评论区路由
  { 
    path: '/comment-area', 
    name: 'CommentArea', 
    component: CommentArea 
  },
  // 新增龙岛发展路由
  { 
    path: '/dragon-development', 
    name: 'DragonDevelopment', 
    component: DragonDevelopment
  },
  // 新增管理员界面：添加 meta.requiresAuth = true （关键修改，就这1行）
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true } // 👉 新增这行！标记该路由需要登录验证
  },
  //龙的成长详细页
  {
    path: '/category/:id',
    name: 'CategoryDetail',
    component: CategoryDetail,
    props: true
  },
  // 新增最近活动路由
  {
    path: '/recent-activity',
    name: 'RecentActivity',
    component: RecentActivity
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置路由守卫：拦截未登录访问/admin
router.beforeEach((to, from, next) => {
  // 判断目标路由是否需要登录
  if (to.meta.requiresAuth) {
    // 简单判断：是否有登录标识（你可以根据后端返回的Token优化）
    const isLogin = localStorage.getItem('isAdminLogin') // 后续登录成功后存入该标识
    if (isLogin) {
      next() // 已登录，正常跳转
    } else {
      next('/') // 未登录，跳回主页（让用户通过弹窗登录）
      alert('请先通过管理员登录弹窗进入后台！')
    }
  } else {
    next() // 不需要登录的路由，直接放行
  }
})

export default router