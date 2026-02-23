<template>
  <div class="dragon-tools">
    <!-- 标题：独立显示，不被蓝色背景覆盖 -->
    <h1>龙的工具库</h1>
    
    <!-- 核心内容包裹层：添加纯浅蓝透明背景（无条纹） -->
    <div class="core-content-wrap">
      <div class="tools-grid">
        <div class="tool-card" v-for="(tool, idx) in toolsList" :key="idx">
          <!-- 判断 icon 是否为图片 URL -->
          <img 
            v-if="isImageUrl(tool.icon)" 
            :src="tool.icon" 
            :alt="tool.name" 
            class="tool-icon"
            loading="lazy"
          />
          <!-- 如果不是图片，则显示图标字符 -->
          <div v-else class="tool-icon tool-icon-text">{{ tool.icon }}</div>

          <h3>{{ tool.name }}</h3>
          <p>{{ tool.desc }}</p>
          <a :href="tool.link" target="_blank" class="tool-link" rel="noopener noreferrer">前往使用 →</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const toolsList = [
  {
    icon: "https://xiaolongya.cn/uploads/15a06548-6ba8-46cf-be8d-07c71eda0b11.png",
    name: "Watt Toolkit",
    desc: "可以对github和steam进行免费加速，加速情况尚可，免费就是正义哇小龙",
    link: "https://steampp.net/"
  },
  {
    icon: "https://xiaolongya.cn/uploads/a1c98814-2f7c-4632-ab81-dda276860cfc.ico",
    name: "Geek",
    desc: "卸载电脑软件担心残留？别怕，Geek不仅能卸载，还能去除残留！小龙评价五颗星(当然满分是五颗星)",
    link: "https://geekuninstaller.com/"
  },
  {
    icon: "https://xiaolongya.cn/uploads/a7b08592-7356-4a69-b53f-e476888e31e4.ico",
    name: "图吧工具箱",
    desc: "电脑发烧友？想要了解你的电脑详细？图吧工具箱可以满足你绝大多数的愿望！温度检测，硬盘情况等各项属性都可查看",
    link: "https://www.tbtool.cn/"
  },
    {
    icon: "https://xiaolongya.cn/uploads/f2327352-f1cf-46ab-af83-b0741bd2318f.jpg",
    name: "Deskpins",
    desc: "窗口置顶软件，ctrl + f11热键并鼠标点击指定窗口即可置顶窗口",
    link: "https://efotinis.neocities.org/deskpins/"
  }
];

// 判断是否为图片 URL 的辅助函数
const isImageUrl = (str) => {
  return typeof str === 'string' && (str.startsWith('http') || str.startsWith('/'));
};
</script>

<style scoped>
/* 全局容器：统一字体、布局，和主页风格对齐 */
.dragon-tools {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center; /* 整体居中，保持风格统一 */
  font-family: "Ma Shan Zheng", "楷体", "KaiTi", "STKaiti", cursive, serif; /* 统一全站字体 */
}

/* 页面标题：优化样式，和主页标题视觉一致 */
h1 {
  font-size: 100px; /* 下调字体大小，避免溢出 */
  font-weight: bold; 
  background: linear-gradient(135deg, #00c0e2, #2f5496);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.05); 
  margin: 0;
}

/* 核心：纯浅蓝透明背景（无条纹），与其他页面风格统一 */
.core-content-wrap {
  width: 100%;
  background-color: rgba(179, 216, 255, 0.6); /* 统一浅蓝透明底色 */
  border-radius: 120px; /* 统一大圆角 */
  padding: 40px; /* 内边距，避免内容贴边 */
  box-sizing: border-box;
  margin-bottom: 20px;
  border: 2px solid rgba(255, 255, 255, 0.8); /* 新增：白色描边，提升精致感 */
  box-shadow: 0 8px 24px rgba(47, 84, 150, 0.08); /* 新增：柔和阴影，增强立体感 */
}

/* 工具网格布局：保持响应式，优化间距 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

/* 工具卡片：优化透明度、阴影，统一全站卡片风格 */
.tool-card {
  background: rgba(255, 255, 255, 0.3); /* 高透明度，柔和贴合背景 */
  padding: 30px;
  border-radius: 24px; /* 增大圆角，与全站大圆角风格对齐 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.15s ease; /* 缩短过渡时长，更轻量化流畅 */
  border: 1px solid rgba(255, 255, 255, 0.5); /* 新增：白色细描边，提升精致度 */
}

/* 卡片悬停效果：轻微上浮，增强交互，与评论区卡片风格统一 */
.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(47, 84, 150, 0.12); /* 主色调阴影，增强品牌感 */
  background: rgba(255, 255, 255, 0.4); /* 悬停提高透明度，增强反馈 */
}

/* 工具图标：统一样式，优化对齐 */
.tool-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 15px; /* 水平居中，优化间距 */
  object-fit: contain;
  border-radius: 8px; /* 新增：图标圆角，避免生硬 */
}

/* 文字图标样式兜底：统一居中、字体大小 */
.tool-icon-text {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #2f5496;
}

/* 卡片标题：统一字体、色值，和全站对齐 */
.tool-card h3 {
  font-size: 24px;
  color: #2f5496; /* 全站主色调 */
  margin-bottom: 10px;
  font-weight: 700; /* 加粗，提升可读性 */
  letter-spacing: 2px; /* 新增：轻微字间距，提升美感 */
}

/* 卡片描述：优化字体、行高，提升可读性 */
.tool-card p {
  font-size: 16px;
  color: #555; /* 加深描述色，提升可读性 */
  margin-bottom: 20px;
  line-height: 1.6; /* 优化行高，更易阅读 */
  font-family: "楷体", "KaiTi", "STKaiti", serif; /* 描述用标准楷体，提升可读性 */
}

/* 工具链接按钮：统一样式，和评论区提交按钮风格对齐 */
.tool-link {
  display: inline-block;
  padding: 10px 20px; /* 优化内边距，提升点击区域 */
  background: #2f5496; /* 全站主色调 */
  color: #fff;
  border-radius: 16px; /* 增大圆角，统一风格 */
  text-decoration: none;
  font-size: 18px; /* 增大字体，提升视觉效果 */
  transition: all 0.15s ease; /* 轻量化过渡 */
  font-weight: 500;
}

/* 按钮悬停效果：统一深色系，增强反馈 */
.tool-link:hover {
  background: #1f3a6b; /* 主色调加深，和全站按钮风格一致 */
  transform: translateY(-2px); /* 轻微上浮，增强交互 */
  box-shadow: 0 4px 8px rgba(47, 84, 150, 0.2); /* 新增：按钮阴影，提升立体感 */
}

/* 按钮:active 效果：还原位置，增强点击反馈 */
.tool-link:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(47, 84, 150, 0.2);
}

/* 手机端适配（屏幕宽度 ≤ 768px）：精细化调整，保持风格统一 */
@media (max-width: 768px) {
  .dragon-tools {
    /* 减少手机端页面内边距，避免内容太靠边 */
    padding: 20px 15px;
  }

  h1 {
    /* 大幅缩小手机端标题字体，避免超出屏幕 */
    font-size: 48px; /* 固定字体大小，比 rem 更稳定 */
    letter-spacing: 6px; /* 移动端缩小字间距 */
    margin-bottom: 25px;
    text-shadow: 1px 1px 2px rgba(47, 84, 150, 0.1);
  }

  /* 手机端背景区块适配 */
  .core-content-wrap {
    padding: 20px 15px;
    border-radius: 40px; /* 移动端缩小圆角 */
    background-color: rgba(179, 216, 255, 0.3); /* 移动端降低透明度，更柔和 */
    border-width: 1px; /* 移动端缩窄描边 */
    box-shadow: 0 4px 12px rgba(47, 84, 150, 0.08);
  }

  .tools-grid {
    /* 手机端改为单列布局，卡片全屏显示，更易阅读 */
    grid-template-columns: 1fr;
    /* 减少卡片之间的间距 */
    gap: 20px;
  }

  .tool-card {
    /* 减少手机端卡片内边距，节省屏幕空间 */
    padding: 20px 15px;
    background: rgba(255, 255, 255, 0.2); /* 移动端同步提高透明度 */
    border-radius: 16px; /* 移动端缩小卡片圆角 */
  }

  .tool-card h3 {
    /* 缩小卡片标题字体 */
    font-size: 20px;
    letter-spacing: 1px;
  }

  .tool-card p {
    /* 缩小卡片描述字体，调整行高提升可读性 */
    font-size: 14px;
    line-height: 1.6;
  }

  .tool-link {
    /* 微调按钮内边距，适配手机端点击区域 */
    padding: 8px 16px;
    font-size: 16px;
    border-radius: 12px;
  }

  .tool-icon {
    /* 适当缩小图标，保持比例协调 */
    width: 40px;
    height: 40px;
  }
}
</style>