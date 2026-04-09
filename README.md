# Libra 博客应用 - 组件化重构

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
    ├── ThemeService.js     # 主题管理
    └── ReactionService.js  # 点赞功能
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

2. **ThemeService.js** - 主题管理
   - loadTheme() - 加载保存的主题
   - toggleTheme() - 切换明暗主题
   - localStorage持久化

3. **ReactionService.js** - 点赞功能
   - toggleReaction() - 切换点赞状态
   - getUserReaction() - 获取用户点赞
   - localStorage记录用户行为

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

1. **模块化** - 每个组件独立文件，职责清晰
2. **可维护性** - 代码分离，易于修改和扩展
3. **可复用性** - 组件可以在其他项目中复用
4. **可测试性** - 独立的服务层便于单元测试
5. **关注点分离** - UI、业务逻辑、数据访问分层

## 技术栈

- 原生JavaScript (ES6 Modules)
- Tailwind CSS (CDN)
- Marked.js (Markdown解析)
- Supabase (后端数据库)
- Font Awesome (图标)

## 注意事项

- 需要配置Supabase的CORS设置
- 图片上传需要创建`post-images` bucket
- 数据库表需要包含reactions字段(JSONB类型)
