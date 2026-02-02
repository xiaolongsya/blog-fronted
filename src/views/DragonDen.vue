<template>
  <div class="dragon-den">
    <!-- 龙的概况标题 -->
    <h1 class="dragon-overview">龙的概况</h1>

    <!-- 头像区域 -->
    <div class="avatar-section">
      <img 
        src="https://xiaolongya.cn/uploads/avatar.jpg" 
        alt="头像" 
        class="dragon-avatar"
      />
    </div>

    <!-- 正文信息区域 -->
    <div class="info-section">
      <p class="info-item"><strong>昵称：</strong>小龙</p>
      <p class="info-item"><strong>龙的窝点：</strong>广东</p>
      <p class="info-item"><strong>龙蛋破壳日：</strong>2007-07-22</p>
      <p class="info-item"><strong>个性签名：</strong>适度编程益脑，过度编程伤身</p>
      <p class="info-item">
        <strong>Github：</strong>
        <a href="https://github.com/xiaolongsya" target="_blank" class="github-link">xiaolongsya</a>
      </p>
      <p class="info-item">
        <strong>标签：</strong>
        <span class="tag">①后端（Java）</span>
        <span class="tag">②算法（菜鸡）</span>
        <span class="tag">③00后</span>
        <span class="tag">④喜欢折腾</span>
        <span class="tag">⑤羽毛球</span>
        <span class="tag">⑥乒乓球</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.dragon-den {
  padding: 40px;
  text-align: center;
  background-color:rgba(255, 255, 255, 0.6);;
  min-height: 100vh;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
}

/* 龙的概况标题样式 */
.dragon-overview {
  font-size: 36px;
  font-weight: bold;
  color: #2f5496;
  margin-bottom: 30px;
  letter-spacing: 4px;
}

/* 头像区域样式 */
.avatar-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
}

/* 头像样式 */
.dragon-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 6px solid #2f5496;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

/* 正文信息区域样式 - 核心修改：添加白色透明背景（0.6） */
.info-section {
  text-align: left;
  max-width: 600px;
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 16px;
  padding: 30px;
  /* 新增：轻微阴影，提升层次感 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 每一行信息样式 */
.info-item {
  font-size: 30px;
  color: #333;
  margin: 15px 0;
  line-height: 1.6;
}

/* Github 链接样式 */
.github-link {
  color: #2f5496;
  text-decoration: none;
  font-weight: bold;
}

.github-link:hover {
  text-decoration: underline;
}

/* 标签样式 - 可选优化：标签背景也同步增加轻微透明度，保持风格统一 */
.tag {
  display: inline-block;
  background: rgba(179, 216, 255, 0.8); /* 原 #b3d8ff 增加 0.8 透明度 */
  color: #2f5496;
  padding: 4px 10px;
  border-radius: 12px;
  margin: 0 5px;
  font-size: 14px;
  font-weight: bold;
}
</style>