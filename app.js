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
import { RouterService } from './services/RouterService.js';
import { FxService } from './services/FxService.js';
import { TimerManager } from './services/Utils.js';

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
        this.timerManager = new TimerManager();
        
        // 连接错误监控和 Supabase
        this.errorMonitor.setSupabaseService(this.supabaseService);

        // 初始化路由
        this.router = new RouterService((route) => this.handleRouteChange(route));

        // 初始化组件
        this.loader = new Loader();
        this.navigation = new Navigation(
            (page) => this.navigate(page),
            (e) => this.themeService.toggleTheme(e),
            () => this.navigateHome()
        );
        this.spaceNav = new SpaceNav((space) => this.switchSpace(space));
        this.homePage = new HomePage(
            (postId) => this.showDetail(postId),
            () => this.loadMorePosts()
        );
        this.writePage = new WritePage(
            () => this.publish(),
            (e) => this.handleImageUpload(e)
        );
        this.detailPage = new DetailPage(
            () => this.navigate('home'),
            this.supabaseService
        );
        this.spacePoemOverlay = new SpacePoemOverlay();
        this.fx = new FxService();
        
        // 状态
        this.posts = [];
        this.currentSpace = '此间';
        this.currentPage = 'home';
        this.switchingSpace = false;
        this.homeScrollY = 0;
        
        // 分页
        this.pageSize = 12;
        this.currentPageNum = 1;
        this.hasMore = false;

        // 搜索
        this.searchQuery = '';
        
        // 离线状态
        this.isOffline = !navigator.onLine;
        
        // 发布密码 (简单 token 验证)
        this.publishToken = 'libra2024';
        
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
        this.setupOfflineDetection();
        this.fx.init();
        
        // 缩短超时时间到 5 秒
        const timeoutId = this.timerManager.setTimeout(() => {
            this.loader.dismiss("Timeout Entry");
        }, 5000);
        
        try {
            // 加载数据
            const data = await this.supabaseService.fetchPosts();
            
            if (!data) {
                this.posts = [];
                this.homePage.updatePosts([], false);
                this.loader.dismiss("No Data");
                return;
            }

            this.posts = data.map(p => ({
                ...p,
                space: p.space || '此间'
            }));
            
            // 根据路由初始化状态
            this.initFromRoute();
            
            this.loader.dismiss("Cloud Synced");
            
            // 启动诗句轮播
            this.timerManager.setTimeout(() => {
                if (this.currentPage === 'home') {
                    this.homePage.startPoemCarousel();
                }
            }, 2000);
            
        } catch(e) {
            console.error('Init error:', e);
            this.errorMonitor.captureError(e, {
                context: 'app_initialization',
                postsCount: this.posts.length
            });
            this.posts = [];
            this.homePage.updatePosts([], false);
            this.loader.dismiss("Error");
        }
    }

    initFromRoute() {
        const route = this.router.getCurrentRoute();
        
        if (route.space) {
            this.currentSpace = route.space;
            this.spaceNav.updateActive(route.space);
            this.navigation.updateSpaceIndicator(route.space);
            this.homePage.updateSpace(route.space);
        }

        this.filterPostsBySpace();

        if (route.page === 'detail' && route.postId) {
            const post = this.posts.find(p => p.id === route.postId);
            if (post) {
                this.currentPage = 'home'; // set to home first so navigate works
                this.navigate('detail');
                this.detailPage.updateContent(post);
            }
        } else if (route.page === 'write') {
            this.currentPage = 'home';
            this.navigate('write');
        }
    }

    handleRouteChange(route) {
        if (route.page === 'home') {
            if (route.space && route.space !== this.currentSpace) {
                this.switchSpace(route.space);
            } else if (!route.space && this.currentSpace !== '此间') {
                this.switchSpace('此间');
            } else {
                this.navigate('home');
            }
        } else if (route.page === 'detail' && route.postId) {
            const post = this.posts.find(p => p.id === route.postId);
            if (post) {
                this.showDetail(post.id);
            } else {
                this.navigate('home');
            }
        } else if (route.page === 'write') {
            this.navigate('write');
        }
    }

    setupOfflineDetection() {
        const banner = document.getElementById('offline-banner');
        
        window.addEventListener('online', () => {
            this.isOffline = false;
            banner?.classList.add('hidden');
            this.errorMonitor.captureMessage('User back online', 'info');
        });
        
        window.addEventListener('offline', () => {
            this.isOffline = true;
            banner?.classList.remove('hidden');
            this.errorMonitor.captureMessage('User went offline', 'warning');
        });

        // 初始状态
        if (this.isOffline) {
            banner?.classList.remove('hidden');
        }
    }

    bindEvents() {
        this.loader.bindEvents();
        this.navigation.bindEvents();
        this.spaceNav.bindEvents();
        this.homePage.bindEvents();
        this.writePage.bindEvents();

        // 搜索事件
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.trim();
                searchClear?.classList.toggle('hidden', !this.searchQuery);
                this.filterPostsBySpace();
            });
        }
        
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                this.searchQuery = '';
                searchClear.classList.add('hidden');
                this.filterPostsBySpace();
            });
        }
    }

    navigateHome() {
        this.homeScrollY = 0;
        this.navigate('home');
        if (this.currentSpace !== '此间') {
            this.switchSpace('此间');
        }
        this.router.navigate('home', {});
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

        // 清理当前页面的资源
        if (this.currentPage === 'home') {
            this.homePage.destroy();
        } else if (this.currentPage === 'detail') {
            this.detailPage.destroy();
        } else if (this.currentPage === 'write') {
            this.writePage.destroy();
        }

        // 先淡出当前页面
        if (currentSection) {
            currentSection.classList.add('page-leaving');
        }

        this.timerManager.setTimeout(() => {
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
                        this.writePage.bindEvents();
                        this.router.navigate('write', {});
                    }

                    if (page === 'home') {
                        this.homePage.startPoemCarousel();
                        this.router.navigate('home', { space: this.currentSpace });
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
        if (spaceName === this.currentSpace && this.currentPage !== 'detail') return;
        if (this.switchingSpace) return;
        this.switchingSpace = true;

        // 如果在详情页，先导航回首页
        if (this.currentPage === 'detail') {
            this.navigate('home');
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // 立即更新导航状态
        this.spaceNav.updateActive(spaceName);
        this.navigation.updateSpaceIndicator(spaceName);
        this.homePage.updateSpace(spaceName);
        
        // 更新当前空间
        this.currentSpace = spaceName;
        
        // 更新路由
        this.router.replaceRoute('home', { space: spaceName });

        // 重置分页
        this.currentPageNum = 1;
        
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
        let filteredPosts = this.posts.filter(p => p.space === this.currentSpace);
        
        // 搜索过滤
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredPosts = filteredPosts.filter(p => 
                (p.title || '').toLowerCase().includes(query) ||
                (p.content || '').toLowerCase().includes(query) ||
                (p.author_name || '').toLowerCase().includes(query)
            );
        }

        // 分页
        const totalPosts = filteredPosts.length;
        const displayPosts = filteredPosts.slice(0, this.currentPageNum * this.pageSize);
        this.hasMore = displayPosts.length < totalPosts;
        
        requestAnimationFrame(() => {
            this.homePage.updatePosts(displayPosts, this.hasMore);
            // 卡片渲染后重绑特效 (updatePosts 内部再隔一帧渲染, 故延后)
            requestAnimationFrame(() => requestAnimationFrame(() => this.fx.refresh()));
        });
    }

    loadMorePosts() {
        this.currentPageNum++;
        this.filterPostsBySpace();
    }

    async showDetail(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        this.navigate('detail');
        this.detailPage.updateContent(post);
        this.router.navigate('detail', { postId: post.id });
        requestAnimationFrame(() => this.fx.refresh());
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (this.isOffline) {
            this.showToast('离线状态无法上传图片 ✗');
            return;
        }

        const statusEl = document.getElementById('upload-status');
        statusEl.textContent = 'Uploading...';
        statusEl.style.opacity = '1';
        
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
            this.timerManager.setTimeout(() => {
                statusEl.textContent = '';
                statusEl.style.opacity = '0';
            }, 3000);
            
            event.target.value = '';
            
        } catch(e) {
            console.error('Image upload error:', e);
            this.errorMonitor.captureError(e, {
                context: 'image_upload',
                fileSize: file.size,
                fileType: file.type
            });
            statusEl.textContent = 'Upload failed: ' + e.message;
            statusEl.style.color = 'var(--text)';
            statusEl.style.opacity = '0.6';
        }
    }

    async publish() {
        const formData = this.writePage.getFormData();
        
        if (!formData.title || !formData.content) {
            this.showToast('请填写标题和内容 ✗');
            return;
        }

        // 密码验证
        const passwordInput = document.getElementById('in-password');
        const password = passwordInput?.value?.trim();
        if (password !== this.publishToken) {
            this.showToast('发布密码错误 ✗');
            passwordInput?.focus();
            return;
        }

        if (this.isOffline) {
            this.showToast('离线状态无法发布 ✗');
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
            if (passwordInput) passwordInput.value = '';
            
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
            this.showToast('发布失败: ' + e.message);
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
