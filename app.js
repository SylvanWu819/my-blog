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
import { ReactionService } from './services/ReactionService.js';

export class App {
    constructor() {
        // 初始化服务
        this.supabaseService = new SupabaseService();
        this.themeService = new ThemeService();
        this.reactionService = new ReactionService(this.supabaseService);
        
        // 初始化组件
        this.loader = new Loader();
        this.navigation = new Navigation(
            (page) => this.navigate(page),
            () => this.themeService.toggleTheme()
        );
        this.spaceNav = new SpaceNav((space) => this.switchSpace(space));
        this.homePage = new HomePage((postId) => this.showDetail(postId));
        this.writePage = new WritePage(
            () => this.publish(),
            (e) => this.handleImageUpload(e)
        );
        this.detailPage = new DetailPage(
            () => this.navigate('home'),
            (postId, emoji) => this.toggleReaction(postId, emoji)
        );
        this.spacePoemOverlay = new SpacePoemOverlay();
        
        // 状态
        this.posts = [];
        this.currentSpace = '此间';
        this.currentPage = 'home';
    }

    async init() {
        console.log('=== App Init ===');
        
        // 绑定事件
        this.bindEvents();
        
        // 加载主题
        this.themeService.loadTheme();
        
        // 设置超时
        setTimeout(() => this.loader.dismiss("Timeout Entry"), 8000);
        
        try {
            // 加载数据
            const data = await this.supabaseService.fetchPosts();
            
            if (!data) {
                console.warn('Failed to load posts');
                this.posts = [];
                this.homePage.updatePosts([]);
                this.loader.dismiss("No Data");
                return;
            }
            
            console.log('Posts loaded:', data.length);
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
            this.posts = [];
            this.homePage.updatePosts([]);
            this.loader.dismiss("Error");
        }
    }

    bindEvents() {
        // 绑定加载器事件
        this.loader.bindEvents();
        
        // 绑定导航事件
        this.navigation.bindEvents();
        
        // 绑定空间导航事件
        this.spaceNav.bindEvents();
        
        // 绑定首页事件
        this.homePage.bindEvents();
        
        // 绑定写作页面事件
        this.writePage.bindEvents();
        
        // 渲染心情选择器
        this.renderMoodSelector();
    }

    renderMoodSelector() {
        const moods = [
            '😊', '😢', '😌', '🤔', '😴', '🔥',
            '😄', '🥲', '😐', '😶', '🙃', '😮', '😤', '😞',
            '🫠', '🌙', '☁️', '🌧️', '🌿', '🍂', '🕯️', '📖',
            '🎧', '🍺', '🚶', '🧭', '⛰️', '🌊', '🌌'
        ];
        
        const container = document.getElementById('mood-selector');
        if (container) {
            container.innerHTML = moods.map(mood => 
                `<span class="mood-option" data-mood="${mood}">${mood}</span>`
            ).join('');
            
            // 绑定心情选择事件
            container.querySelectorAll('.mood-option').forEach(option => {
                option.addEventListener('click', () => {
                    this.writePage.selectMood(option.dataset.mood);
                });
            });
        }
    }

    navigate(page) {
        this.currentPage = page;
        document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
        document.getElementById(page)?.classList.remove('hidden');
        
        if (page === 'write') {
            this.writePage.setSpace(this.currentSpace);
        }
        
        if (page === 'home') {
            this.homePage.startPoemCarousel();
        } else {
            this.homePage.stopPoemCarousel();
        }
        
        window.scrollTo(0, 0);
    }

    async switchSpace(spaceName) {
        if (spaceName === this.currentSpace) return;
        
        this.spaceNav.updateActive(spaceName);
        this.navigation.updateSpaceIndicator(spaceName);
        this.homePage.updateSpace(spaceName);
        
        await this.spacePoemOverlay.show(spaceName);
        
        this.currentSpace = spaceName;
        this.filterPostsBySpace();
    }

    filterPostsBySpace() {
        const filteredPosts = this.posts.filter(p => p.space === this.currentSpace);
        this.homePage.updatePosts(filteredPosts);
    }

    async showDetail(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        const userReaction = this.reactionService.getUserReaction(postId);
        this.navigate('detail');
        this.detailPage.updateContent(post, userReaction);
    }

    async toggleReaction(postId, emoji) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;
        
        const newReactions = await this.reactionService.toggleReaction(post, emoji);
        post.reactions = newReactions;
        
        const userReaction = this.reactionService.getUserReaction(postId);
        this.detailPage.updateContent(post, userReaction);
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
            
            console.log('Publishing post:', newPost);
            const result = await this.supabaseService.insertPost(newPost);
            console.log('Insert result:', result);
            
            if (!result) {
                throw new Error('Failed to insert post');
            }
            
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
            
            this.navigate('home');
            
        } catch(e) {
            console.error('Publish error:', e);
            alert('发布失败: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.innerText = "PUBLISH";
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
