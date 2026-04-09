# 上传Libra文件夹到你的GitHub仓库

## 你的情况
- 已有仓库：`SylvanWu819/my-blog`
- 之前只上传了单个HTML文件
- 现在要上传整个Libra文件夹

## 步骤1: 安装Git（如果还没安装）

1. 访问：https://git-scm.com/download/win
2. 下载并安装Git for Windows
3. 安装时全部选择默认选项即可
4. 安装完成后，**重启你的终端或命令提示符**

验证安装：
```bash
git --version
```
应该显示类似：`git version 2.x.x`

## 步骤2: 配置Git（首次使用需要）

打开命令提示符或PowerShell，输入：

```bash
git config --global user.name "SylvanWu819"
git config --global user.email "你的GitHub邮箱"
```

## 步骤3: 上传Libra文件夹

### 方法A: 替换整个仓库内容（推荐）

在Libra文件夹中执行以下命令：

```bash
# 1. 进入Libra文件夹
cd C:\LibraFuture\Libra

# 2. 初始化Git
git init

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "重构：组件化架构"

# 5. 连接到你的GitHub仓库
git remote add origin https://github.com/SylvanWu819/my-blog.git

# 6. 强制推送（会覆盖原有内容）
git push -f origin main
```

如果提示分支名是master而不是main，使用：
```bash
git branch -M main
git push -f origin main
```

### 方法B: 保留原文件，添加Libra文件夹

如果你想保留原来的文件：

```bash
# 1. 克隆你的仓库到本地
git clone https://github.com/SylvanWu819/my-blog.git

# 2. 将Libra文件夹复制到克隆的仓库中
# 手动复制 C:\LibraFuture\Libra 文件夹到 my-blog 文件夹内

# 3. 进入仓库
cd my-blog

# 4. 添加新文件
git add Libra/

# 5. 提交
git commit -m "添加组件化版本"

# 6. 推送
git push origin main
```

## 步骤4: 部署到GitHub Pages

上传成功后：

1. 访问：https://github.com/SylvanWu819/my-blog
2. 点击 **Settings**
3. 左侧菜单找到 **Pages**
4. Source 选择 `main` 分支
5. 文件夹选择：
   - 如果用方法A：选择 `/ (root)`
   - 如果用方法B：选择 `/Libra`
6. 点击 **Save**

等待1-2分钟，你的网站会发布到：
- 方法A：`https://sylvanwu819.github.io/my-blog/`
- 方法B：`https://sylvanwu819.github.io/my-blog/Libra/`

## 步骤5: 修复路径问题（如果需要）

如果部署后页面无法正常显示，需要修改 `index.html`：

找到这些行：
```html
<link rel="stylesheet" href="styles.css">
<script type="module" src="app.js"></script>
```

改为：
```html
<link rel="stylesheet" href="./styles.css">
<script type="module" src="./app.js"></script>
```

然后重新提交：
```bash
git add index.html
git commit -m "修复资源路径"
git push
```

## 常见问题

### Q1: 提示需要登录
第一次推送时会弹出登录窗口，使用你的GitHub账号登录即可。

### Q2: 推送被拒绝
```bash
# 先拉取远程内容
git pull origin main --allow-unrelated-histories

# 解决冲突后再推送
git push origin main
```

### Q3: 想要重新开始
```bash
# 删除.git文件夹
rm -rf .git

# 重新初始化
git init
```

## 推荐：使用GitHub Desktop（图形界面）

如果不习惯命令行，可以使用GitHub Desktop：

1. 下载：https://desktop.github.com/
2. 安装并登录GitHub账号
3. File → Add Local Repository → 选择Libra文件夹
4. 点击 "Publish repository"
5. 选择 `SylvanWu819/my-blog`
6. 点击推送

## 后续更新

每次修改代码后：

```bash
cd C:\LibraFuture\Libra
git add .
git commit -m "描述你的修改"
git push
```

## 需要帮助？

如果遇到问题，可以：
1. 查看错误信息截图
2. 检查Git是否正确安装
3. 确认GitHub账号权限
