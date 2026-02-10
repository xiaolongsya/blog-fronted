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
    path: '/category-detail',
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

//全局路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // 从 sessionStorage 读取
    const isLogin = sessionStorage.getItem('isAdminLogin');
    if (isLogin === 'true') {
      next();
    } else {
      next('/');
      alert('身份核验失效，请重新登录！');
    }
  } else {
    next();
  }
});

export default router