# Libra 博客

一个极简优雅的个人博客系统，支持多空间分类、三档位主题切换、动态光影效果。

## ✨ 特性

- 🎨 三档位主题系统（亮/中/暗）+ 光束过渡动画
- 📚 七个独立空间分类（此间、观市、碎语、札记、长文、途中、一隅）
- 🎭 心情标签系统（30+ emoji）
- 💫 优雅的动画效果（呼吸卡片、诗句轮播、空间切换）
- 📝 Markdown 写作支持
- 🖼️ 图片上传功能
- 💝 文章点赞反应
- 🌙 淡淡纸黄背景，护眼舒适
- 🎯 左侧空间导航提示

## 项目结构

```
Libra/
├── index.html              # 主HTML文件
├── styles.css              # 全局样式
├── app.js                  # 应用主入口
├── components/             # UI组件
│   ├── Navigation.js       # 顶部导航栏
│   ├── SpaceNav.js         # 左侧空间导航
│   ├── HomePage.js         # 首页列表
│   ├── WritePage.js        # 写作页面
│   ├── DetailPage.js       # 文章详情页
│   ├── Loader.js           # 加载动画
│   └── SpacePoemOverlay.js # 空间切换提示
└── services/               # 业务服务
    ├── SupabaseService.js  # 数据库服务
    ├── ThemeService.js     # 主题管理（三档位）
    ├── ReactionService.js  # 点赞功能
    └── ErrorMonitorService.js # 错误监控
```

## 组件说明

### UI组件 (components/)

1. **Navigation.js** - 顶部导航栏
   - 显示Logo和当前空间
   - 提供Archives、Write按钮
   - 主题切换按钮

2. **SpaceNav.js** - 左侧空间导航
   - 7个空间分类（此间、观市、碎语等）
   - 鼠标悬停显示
   - 高亮当前空间

3. **HomePage.js** - 首页文章列表
   - 网格布局展示文章卡片
   - 诗句轮播
   - 呼吸动画效果

4. **WritePage.js** - 写作页面
   - 标题、作者、内容输入
   - 空间选择
   - 心情选择器
   - 图片上传

5. **DetailPage.js** - 文章详情
   - Markdown渲染
   - 点赞反应功能
   - 返回按钮

6. **Loader.js** - 加载动画
   - 天平摆动动画
   - Skip按钮
   - 淡出效果

7. **SpacePoemOverlay.js** - 空间切换提示
   - 全屏诗句显示
   - 淡入淡出动画

### 服务层 (services/)

1. **SupabaseService.js** - 数据库操作
   - fetchPosts() - 获取文章列表
   - insertPost() - 发布新文章
   - updateReaction() - 更新点赞
   - uploadImage() - 上传图片

2. **ThemeService.js** - 三档位主题管理
   - 亮模式（#fafaf8）- 月亮图标
   - 中模式（#d5d5d0）- 半月图标
   - 暗模式（#1a1a18）- 太阳图标
   - 亮暗切换：光束动画（1秒）
   - 中间态切换：简单渐变（0.3秒）
   - localStorage持久化

3. **ReactionService.js** - 点赞功能
   - toggleReaction() - 切换点赞状态
   - getUserReaction() - 获取用户点赞
   - localStorage记录用户行为

4. **ErrorMonitorService.js** - 错误监控
   - Sentry 集成
   - 全局错误捕获
   - 用户行为追踪

## 🎨 设计亮点

### 三档位主题系统
- 点击月亮图标循环切换：亮 → 中 → 暗 → 亮
- 亮暗直接切换时触发光束动画（像光打进黑暗空间）
- 中间态切换使用流畅渐变
- GPU 加速优化，流畅不卡顿

### 空间导航
- 左侧边缘悬停显示导航菜单
- 竖向 "SPACES" 提示标志
- 切换空间时显示诗句过渡

### 视觉效果
- 淡淡纸黄背景（#fafaf8），护眼舒适
- 卡片呼吸动画
- 诗句轮播
- 天平加载动画

## 使用方法

### 开发环境

由于使用了ES6模块，需要通过HTTP服务器运行：

```bash
# 使用Python
python -m http.server 8000

# 或使用Node.js
npx serve

# 或使用VS Code Live Server插件
```

然后访问 `http://localhost:8000/index.html`

### 原始文件

原始的单文件版本保存在 `Libra.html`，可以作为参考。

## 主要改进

1. **模块化架构** - 每个组件独立文件，职责清晰
2. **三档位主题** - 亮/中/暗三档，光束动画过渡
3. **性能优化** - GPU 加速、will-change 优化、动画流畅
4. **用户体验** - 左侧提示、诗句过渡、呼吸动画
5. **可维护性** - 代码分离，易于修改和扩展
6. **错误监控** - Sentry 集成，实时追踪问题

## 技术栈

- 原生JavaScript (ES6 Modules)
- Tailwind CSS (CDN)
- Marked.js (Markdown解析)
- Supabase (后端数据库)
- Font Awesome (图标)
- Sentry (错误监控)

## 部署

项目使用 GitHub Pages 部署，访问：[你的域名]

自动部署脚本：
- Windows: `deploy.bat`
- Linux/Mac: `deploy.sh`

## 注意事项

- 需要配置 Supabase 的 CORS 设置
- 图片上传需要创建 `post-images` bucket
- 数据库表需要包含 reactions 字段（JSONB 类型）
- 需要配置 Sentry DSN（可选）
