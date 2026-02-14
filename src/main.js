import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 1. 引入 Element Plus 库和样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 2. 依然保持链式调用，在中间插入 .use(ElementPlus)
createApp(App)
    .use(router)
    .use(ElementPlus)
    .mount('#app')