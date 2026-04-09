@echo off
chcp 65001 >nul
cls
echo ========================================
echo    Libra 上传到 GitHub 助手
echo    目标仓库: SylvanWu819/my-blog
echo ========================================
echo.

REM 检查Git是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：Git未安装
    echo.
    echo 请先安装Git：
    echo 1. 访问 https://git-scm.com/download/win
    echo 2. 下载并安装
    echo 3. 重启此脚本
    echo.
    pause
    exit /b 1
)

echo ✅ Git已安装
echo.

REM 检查是否已初始化
if not exist .git (
    echo 📦 初始化Git仓库...
    git init
    if errorlevel 1 (
        echo ❌ 初始化失败
        pause
        exit /b 1
    )
    echo ✅ 初始化完成
    echo.
)

REM 添加所有文件
echo 📝 添加文件到Git...
git add .
if errorlevel 1 (
    echo ❌ 添加文件失败
    pause
    exit /b 1
)
echo ✅ 文件已添加
echo.

REM 提交
echo 💾 提交更改...
set /p commit_msg="请输入提交信息 (直接回车使用默认): "
if "%commit_msg%"=="" set commit_msg=组件化重构完成
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo ⚠️  没有新的更改需要提交
)
echo.

REM 检查是否已添加远程仓库
git remote | findstr "origin" >nul
if errorlevel 1 (
    echo 🔗 添加远程仓库...
    git remote add origin https://github.com/SylvanWu819/my-blog.git
    echo ✅ 远程仓库已添加
    echo.
)

REM 询问是否强制推送
echo ⚠️  重要选择：
echo.
echo [1] 覆盖远程仓库（删除原有内容，只保留新的组件化版本）
echo [2] 保留原有内容（将Libra作为子文件夹添加）
echo [3] 取消操作
echo.
set /p choice="请选择 (1/2/3): "

if "%choice%"=="1" (
    echo.
    echo 🚀 准备覆盖远程仓库...
    echo ⚠️  这将删除远程仓库的所有内容！
    set /p confirm="确认继续？(输入 YES 继续): "
    if /i "%confirm%"=="YES" (
        git branch -M main
        git push -f origin main
        if errorlevel 1 (
            echo ❌ 推送失败，可能需要登录GitHub
            pause
            exit /b 1
        )
        echo.
        echo ✨ 上传成功！
        echo 📱 访问: https://github.com/SylvanWu819/my-blog
        echo 🌐 部署: https://sylvanwu819.github.io/my-blog/
    ) else (
        echo 操作已取消
    )
) else if "%choice%"=="2" (
    echo.
    echo ℹ️  保留原有内容模式
    echo.
    echo 请手动执行以下步骤：
    echo 1. git clone https://github.com/SylvanWu819/my-blog.git
    echo 2. 将Libra文件夹复制到克隆的仓库中
    echo 3. cd my-blog
    echo 4. git add Libra/
    echo 5. git commit -m "添加组件化版本"
    echo 6. git push
) else (
    echo 操作已取消
)

echo.
echo ========================================
echo 完成！按任意键退出...
pause >nul
