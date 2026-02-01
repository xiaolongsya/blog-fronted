<template>
  <div class="dragon-growth">
    <h1>龙的成长历程</h1>
    <div class="growth-list">
      <div class="growth-item">
        <h3>🐉 幼龙阶段</h3>
        <p>初识前端，掌握 Vue 基础语法与组件化思想</p>
      </div>
      <div class="growth-item">
        <h3>🐉 成长期</h3>
        <p>熟练使用 Vue Router、Pinia，能独立开发业务页面</p>
      </div>
      <div class="growth-item">
        <h3>🐉 成熟期</h3>
        <p>精通工程化、性能优化，参与大型 Vue 项目开发</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dragon-growth {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 42px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  text-align: center;
  margin-bottom: 40px;
}

.growth-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.growth-item {
  background: #fff;
  padding: 25px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.growth-item h3 {
  font-size: 28px;
  color: #2f5496;
  font-family: "楷体", "KaiTi", "STKaiti", serif;
  margin-bottom: 10px;
}

.growth-item p {
  font-size: 18px;
  color: #666;
  line-height: 1.6;
}
</style>