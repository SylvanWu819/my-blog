# Libra · 天秤书

极简个人博客，七个空间分类，支持 Markdown 写作。

## 技术栈

- 原生 JavaScript (ES6 Modules)
- Tailwind CSS · Marked.js · Supabase Auth/Database/Storage · Sentry

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

## 安全配置

- 在 Supabase Authentication 中创建登录账号并关闭公开注册
- 在 Supabase SQL Editor 执行 `supabase-security.sql`，启用 RLS 和 Storage Policy
- Supabase 需创建 private 的 `post-images` bucket；应用会为图片生成短期签名 URL
- Sentry DSN 在 `app.js` 中配置（可选）
