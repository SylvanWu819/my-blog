#!/bin/bash

# Libra 快速部署脚本

echo "🚀 Libra 部署助手"
echo "=================="

# 检查Git是否安装
if ! command -v git &> /dev/null
then
    echo "❌ Git未安装，请先安装Git"
    echo "访问: https://git-scm.com/download"
    exit 1
fi

echo "✅ Git已安装"

# 检查是否已初始化
if [ ! -d .git ]; then
    echo "📦 初始化Git仓库..."
    git init
    echo "✅ Git仓库初始化完成"
fi

# 添加所有文件
echo "📝 添加文件..."
git add .

# 提交
echo "💾 提交更改..."
read -p "请输入提交信息 (默认: Update): " commit_msg
commit_msg=${commit_msg:-"Update"}
git commit -m "$commit_msg"

# 检查是否已添加远程仓库
if ! git remote | grep -q origin; then
    echo ""
    echo "🔗 请输入GitHub仓库地址"
    echo "格式: https://github.com/用户名/仓库名.git"
    read -p "仓库地址: " repo_url
    git remote add origin "$repo_url"
    echo "✅ 远程仓库已添加"
fi

# 推送
echo "🚀 推送到GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✨ 部署完成！"
echo "📱 访问你的GitHub仓库查看"
echo "🌐 如需部署到网站，请查看 DEPLOY.md"
