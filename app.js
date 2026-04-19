// 主应用入口
import { Navigation } from './components/Navigation.js';
import { SpaceNav } from './components/SpaceNav.js';
import { HomePage } from './components/HomePage.js';
import { WritePage } from './components/WritePage.js';
import { DetailPage } from './components/DetailPage.js';
import { Loader } from './components/Loader.js';
import { SpacePoemOverlay } from './components/SpacePoemOverlay.js';
import { SupabaseService } from './services/SupabaseService.js';
import { ThemeService } from './services/ThemeService.js';
import { ErrorMonitorService } from './services/ErrorMonitorService.js';

export class App {
    constructor() {
        // 初始化错误监控 (最先初始化)
        this.errorMonitor = new ErrorMonitorService();
        this.errorMonitor.setupGlobalErrorHandlers();
        
        // Sentry 错误监控
        this.errorMonitor.initSentry('https://42aa60a27615496b571824fe6e2a6db9@o4511189294514176.ingest.de.sentry.io/4511189313257552');
        
        // 初始化服务
        this.supabaseService = new SupabaseService();
        this.themeService = new ThemeService();
        
        // 连接错误监控和 Supabase
        this.errorMonitor.setSupabaseService(this.supabaseService);
        // 初始化组件
        this.loader = new Loader();
        this.navigation = new Navigation(
            (page) => this.navigate(page),
            (e) => this.themeService.toggleTheme(e),
            () => this.navigateHome()
        );
        this.spaceNav = new SpaceNav((space) => this.switchSpace(space));
        this.homePage = new HomePage((postId) => this.showDetail(postId));
        this.writePage = new WritePage(
            () => this.publish(),
            (e) => this.handleImageUpload(e)
        );
        this.detailPage = new DetailPage(
            () => this.navigate('home')
        );
        this.spacePoemOverlay = new SpacePoemOverlay();
        
        // 状态
        this.posts = [];
        this.currentSpace = '此间';
        this.currentPage = 'home';
        this.switchingSpace = false;
        this.homeScrollY = 0; // 记住首页滚动位置
        
        // 生成用户ID用于追踪
        this.userId = this.getUserId();
        this.errorMonitor.setUser(this.userId);
    }
    
    getUserId() {
        let userId = localStorage.getItem('libra_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('libra_user_id', userId);
        }
        return userId;
    }

    async init() {
        this.bindEvents();
        this.themeService.loadTheme();
        setTimeout(() => this.loader.dismiss("Timeout Entry"), 8000);
        
        try {
            // 加载数据
            const data = await this.supabaseService.fetchPosts();
            
            if (!data) {
                this.posts = [];
                this.homePage.updatePosts([]);
                this.loader.dismiss("No Data");
                return;
            }

            this.posts = data.map(p => ({
                ...p,
                space: p.space || '此间'
            }));
            
            this.filterPostsBySpace();
            this.loader.dismiss("Cloud Synced");
            
            // 启动诗句轮播
            setTimeout(() => {
                this.homePage.startPoemCarousel();
            }, 2000);
            
        } catch(e) {
            console.error('Init error:', e);
            this.errorMonitor.captureError(e, {
                context: 'app_initialization',
                postsCount: this.posts.length
            });
            this.posts = [];
            this.homePage.updatePosts([]);
            this.loader.dismiss("Error");
        }
    }

    bindEvents() {
        this.loader.bindEvents();
        this.navigation.bindEvents();
        this.spaceNav.bindEvents();
        this.homePage.bindEvents();
        this.writePage.bindEvents();
    }

    navigateHome() {
        this.homeScrollY = 0;
        this.navigate('home');
        if (this.currentSpace !== '此间') {
            this.switchSpace('此间');
        }
    }

    navigate(page) {
        if (this.currentPage === page) return;
        
        const currentSection = document.getElementById(this.currentPage);
        const nextSection = document.getElementById(page);
        
        if (!nextSection) return;

        // 离开首页时记住滚动位置
        if (this.currentPage === 'home') {
            this.homeScrollY = window.scrollY;
        }

        // 先淡出当前页面
        if (currentSection) {
            currentSection.classList.add('page-leaving');
        }

        setTimeout(() => {
            if (currentSection) {
                currentSection.classList.add('hidden');
                currentSection.classList.remove('page-leaving');
            }

            // 先设为透明再显示，下一帧触发淡入
            nextSection.style.opacity = '0';
            nextSection.style.transform = 'translateY(8px)';
            nextSection.classList.remove('hidden');

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    nextSection.style.opacity = '';
                    nextSection.style.transform = '';
                    this.currentPage = page;

                    if (page === 'write') {
                        this.writePage.setSpace(this.currentSpace);
                    }

                    if (page === 'home') {
                        this.homePage.startPoemCarousel();
                        requestAnimationFrame(() => {
                            window.scrollTo({ top: this.homeScrollY, behavior: 'instant' });
                        });
                    } else {
                        this.homePage.stopPoemCarousel();
                        window.scrollTo({ top: 0, behavior: 'instant' });
                    }
                });
            });
        }, 250);
    }

    async switchSpace(spaceName) {
        if (spaceName === this.currentSpace) return;
        
        // 使用防抖避免快速切换
        if (this.switchingSpace) return;
        this.switchingSpace = true;
        
        // 立即更新导航状态
        this.spaceNav.updateActive(spaceName);
        this.navigation.updateSpaceIndicator(spaceName);
        this.homePage.updateSpace(spaceName);
        
        // 更新当前空间
        this.currentSpace = spaceName;
        
        // 同时执行：显示诗句动画 + 加载内容
        await Promise.all([
            this.spacePoemOverlay.show(spaceName),
            new Promise(resolve => {
                requestAnimationFrame(() => {
                    this.filterPostsBySpace();
                    resolve();
                });
            })
        ]);

        // 切换空间后滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.switchingSpace = false;
    }

    filterPostsBySpace() {
        const filteredPosts = this.posts.filter(p => p.space === this.currentSpace);
        
        // 立即开始渲染,不等待
        requestAnimationFrame(() => {
            this.homePage.updatePosts(filteredPosts);
        });
    }

    async showDetail(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        this.navigate('detail');
        this.detailPage.updateContent(post);
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const statusEl = document.getElementById('upload-status');
        statusEl.textContent = 'Uploading...';
        
        try {
            const imageUrl = await this.supabaseService.uploadImage(file);
            
            const textarea = document.getElementById('in-content');
            const cursorPos = textarea.selectionStart;
            const textBefore = textarea.value.substring(0, cursorPos);
            const textAfter = textarea.value.substring(cursorPos);
            const imageMarkdown = `\n![image](${imageUrl})\n`;
            
            textarea.value = textBefore + imageMarkdown + textAfter;
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = cursorPos + imageMarkdown.length;
            
            statusEl.textContent = 'Image uploaded!';
            setTimeout(() => {
                statusEl.textContent = '';
            }, 3000);
            
            event.target.value = '';
            
        } catch(e) {
            console.error('Image upload error:', e);
            this.errorMonitor.captureError(e, {
                context: 'image_upload',
                fileSize: file.size,
                fileType: file.type
            });
            statusEl.textContent = 'Upload failed';
            alert('图片上传失败: ' + e.message);
        }
    }

    async publish() {
        const formData = this.writePage.getFormData();
        
        if (!formData.title || !formData.content) {
            alert('请填写标题和内容');
            return;
        }
        
        const btn = document.getElementById('pub-btn');
        btn.disabled = true;
        btn.innerText = "SYNCING...";
        
        try {
            const newPost = {
                title: formData.title,
                content: formData.content,
                date: new Date().toLocaleDateString('zh-CN'),
                author_name: formData.author,
                space: formData.space,
                timestamp: Date.now()
            };
            
            if (formData.mood) {
                newPost.mood = formData.mood;
            }
            
            const result = await this.supabaseService.insertPost(newPost);
            if (!result) throw new Error('Failed to insert post');
            
            this.writePage.clearForm();
            
            // 重新加载数据
            const data = await this.supabaseService.fetchPosts();
            if (data) {
                this.posts = data.map(p => ({
                    ...p,
                    space: p.space || '此间'
                }));
                this.filterPostsBySpace();
            }

            // 成功提示
            this.showToast('已发布 ✦');
            this.navigate('home');
            
        } catch(e) {
            console.error('Publish error:', e);
            this.errorMonitor.captureError(e, {
                context: 'publish_post',
                title: formData.title,
                space: formData.space,
                contentLength: formData.content?.length
            });
            alert('发布失败: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.innerText = "PUBLISH";
        }
    }
    showToast(msg) {
        const toast = document.createElement('div');
        toast.className = 'libra-toast';
        toast.textContent = msg;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 2000);
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
