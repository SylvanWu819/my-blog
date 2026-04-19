# Libra · 天秤书

极简个人博客，七个空间分类，支持 Markdown 写作。

## 技术栈

- 原生 JavaScript (ES6 Modules)
- Tailwind CSS · Marked.js · Supabase · Sentry

## 本地运行

需要通过 HTTP 服务器启动（ES6 模块限制）：

```bash
python -m http.server 8000
# 或
npx serve
```

## 部署

```bash
# Windows
deploy.bat

# Linux / Mac
./deploy.sh
```

## 目录结构

```
├── index.html
├── styles.css
├── app.js
├── components/        # Navigation · SpaceNav · HomePage · WritePage · DetailPage · Loader
└── services/          # SupabaseService · ThemeService · ErrorMonitorService
```

## 配置

- Supabase 需开启 CORS，创建 `post-images` bucket
- Sentry DSN 在 `app.js` 中配置（可选）
