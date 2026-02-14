import axios from 'axios';
// 这里假设你用的是 Element Plus (如果是普通 Element UI，引用就是 'element-ui')
// 如果没用 UI 库，可以用原生的 alert() 临时替代测试
import { ElMessage } from 'element-plus'; 

// 1. 创建一个新的 axios 实例
const request = axios.create({
    // 如果你在 vite.config.js / vue.config.js 配置了代理，这里可以写统一的接口前缀
    baseURL: 'https://xiaolongya.cn/blog', 
    timeout: 5000 // 请求超时时间
});

// 2. 配置【响应拦截器】
request.interceptors.response.use(
    (response) => {
        // 请求成功，直接把数据剥离出来返回，页面里用起来更干净
        return response.data;
    },
    (error) => {
        // ========== 核心：在这里捕获后端的 429 报错 ==========
        if (error.response) {
            // 如果后端返回了 429 状态码（操作太频繁）
            if (error.response.status === 429) {
                // 提取后端返回的 {"code":429, "msg":"操作太频繁"} 中的 msg
                const errorMsg = error.response.data.msg || "操作太频繁，请稍后再试";
                
                // 弹出红色的错误提示框
                ElMessage.error(errorMsg); 
                
                return Promise.reject(error);
            }
            
            // 其他常见错误的统一处理（可选）
            if (error.response.status === 500) {
                ElMessage.error("服务器开小差了，请稍后再试");
            }
        } else {
            ElMessage.error("网络连接异常，请检查网络");
        }
        return Promise.reject(error);
    }
);

// 3. 导出这个配置好的实例
export default request;