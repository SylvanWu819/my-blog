@echo off
chcp 65001 >nul
echo 🚀 Libra 部署助手
echo ==================

REM 检查Git是否安装
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git未安装，请先安装Git
    echo 访问: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo ✅ Git已安装

REM 检查是否已初始化
if not exist .git (
    echo 📦 初始化Git仓库...
    git init
    echo ✅ Git仓库初始化完成
)

REM 添加所有文件
echo 📝 添加文件...
git add .

REM 提交
echo 💾 提交更改...
set /p commit_msg="请输入提交信息 (默认: Update): "
if "%commit_msg%"=="" set commit_msg=Update
git commit -m "%commit_msg%"

REM 检查是否已添加远程仓库
git remote | findstr "origin" >nul
if errorlevel 1 (
    echo.
    echo 🔗 请输入GitHub仓库地址
    echo 格式: https://github.com/用户名/仓库名.git
    set /p repo_url="仓库地址: "
    git remote add origin "!repo_url!"
    echo ✅ 远程仓库已添加
)

REM 推送
echo 🚀 推送到GitHub...
git branch -M main
git push -u origin main

echo.
echo ✨ 部署完成！
echo 📱 访问你的GitHub仓库查看
echo 🌐 如需部署到网站，请查看 DEPLOY.md
pause
