# 部署到GitHub指南

## 步骤1: 安装Git

### Windows系统
1. 访问 https://git-scm.com/download/win
2. 下载并安装Git for Windows
3. 安装完成后，重启终端

### 验证安装
```bash
git --version
```

## 步骤2: 配置Git

```bash
# 设置用户名
git config --global user.name "SylvanWu819"

# 设置邮箱
git config --global user.email "sylvan.wu819@gmail.com"
```

## 步骤3: 初始化Git仓库

在Libra文件夹中执行：

```bash
# 进入项目目录
cd Libra-Blog

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 组件化重构完成"
```

## 步骤4: 在GitHub创建仓库

1. 访问 https://github.com/new
2. 仓库名称：`libra-blog` (或你喜欢的名字)
3. 描述：`一个优雅的个人博客应用`
4. 选择 Public 或 Private
5. **不要**勾选 "Add a README file"
6. 点击 "Create repository"

## 步骤5: 连接并推送到GitHub

GitHub会显示命令，执行以下命令：

```bash
# 添加远程仓库（替换成你的GitHub用户名）
git remote add origin https://github.com/你的用户名/libra-blog.git

# 推送到GitHub
git branch -M main
git push -u origin main
```

## 步骤6: 部署到GitHub Pages

### 方法1: 使用GitHub Pages (推荐)

1. 进入你的GitHub仓库
2. 点击 Settings
3. 左侧菜单找到 Pages
4. Source 选择 `main` 分支
5. 文件夹选择 `/ (root)`
6. 点击 Save

等待几分钟后，你的网站会发布到：
`https://你的用户名.github.io/libra-blog/`

### 方法2: 使用Vercel (更快)

1. 访问 https://vercel.com
2. 用GitHub账号登录
3. 点击 "New Project"
4. 导入你的GitHub仓库
5. 点击 Deploy

### 方法3: 使用Netlify

1. 访问 https://netlify.com
2. 用GitHub账号登录
3. 点击 "Add new site" > "Import an existing project"
4. 选择你的GitHub仓库
5. 点击 Deploy

## 注意事项

### 修改文件路径
如果部署到子目录（如GitHub Pages），需要修改 `index.html` 中的资源路径：

```html
<!-- 原来 -->
<link rel="stylesheet" href="styles.css">
<script type="module" src="app.js"></script>

<!-- 改为 -->
<link rel="stylesheet" href="./styles.css">
<script type="module" src="./app.js"></script>
```

### CORS问题
确保在Supabase中配置CORS：
1. 进入Supabase Dashboard
2. Settings > API
3. 在 "CORS" 部分添加你的域名

### 环境变量
考虑将Supabase密钥移到环境变量中，避免暴露在代码中。

## 后续更新

每次修改代码后：

```bash
# 查看修改
git status

# 添加修改的文件
git add .

# 提交
git commit -m "描述你的修改"

# 推送到GitHub
git push
```

## 常见问题

### 问题1: git push被拒绝
```bash
# 先拉取远程更新
git pull origin main --rebase

# 再推送
git push
```

### 问题2: 文件太大
GitHub单个文件限制100MB，如果有大文件：
```bash
# 添加到.gitignore
echo "大文件名" >> .gitignore
```

### 问题3: 忘记添加.gitignore
```bash
# 清除缓存
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```
