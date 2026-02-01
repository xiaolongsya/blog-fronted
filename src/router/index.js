import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import DragonDen from '../views/DragonDen.vue'
import DragonGrowth from '../views/DragonGrowth.vue'
import DragonTools from '../views/DragonTools.vue'

import CommentArea from '../views/CommentArea.vue'

import DragonDevelopment from '../views/DragonDevelopment.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/dragon-den', name: 'DragonDen', component: DragonDen },
  { path: '/dragon-growth', name: 'DragonGrowth', component: DragonGrowth },
  { path: '/dragon-tools', name: 'DragonTools', component: DragonTools },
  // 新增评论区路由（先占位，页面后续创建）
  { 
    path: '/comment-area', 
    name: 'CommentArea', 
    component: CommentArea 
  },
  // 新增龙岛发展路由（先占位，页面后续创建）
  { 
    path: '/dragon-development', 
    name: 'DragonDevelopment', 
    component: DragonDevelopment 
  }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router