// 详情页面组件
import { Utils, EventManager, TimerManager } from '../services/Utils.js';
import { ReactionService } from '../services/ReactionService.js';

export class DetailPage {
    constructor(onBack, supabaseService) {
        this.onBack = onBack;
        this.currentPost = null;
        this.eventManager = new EventManager();
        this.timerManager = new TimerManager();
        this.scrollHandler = null;
        this.reactionService = new ReactionService(supabaseService);
    }

    formatDate(dateStr) {
        return Utils.formatDate(dateStr);
    }

    // 安全渲染 Markdown（使用 DOMPurify 防 XSS）
    safeMarkdown(content) {
        const raw = marked.parse(content || '');
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(raw, {
                ADD_TAGS: ['iframe'],
                ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target'],
                FORBID_TAGS: ['script', 'style'],
                FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover']
            });
        }
        return raw;
    }

    renderReactions(post) {
        const reactions = post.reactions || {};
        const userReaction = this.reactionService.getUserReaction(post.id);
        const emojis = ['❤️', '👍', '🔥', '💡', '😢'];
        
        return `
            <div class="reactions-bar">
                ${emojis.map(emoji => {
                    const count = reactions[emoji] || 0;
                    const isActive = userReaction === emoji;
                    return `
                        <button class="reaction-btn ${isActive ? 'active' : ''}" 
                                data-emoji="${emoji}" 
                                aria-label="反应 ${emoji}"
                                aria-pressed="${isActive}">
                            <span class="reaction-emoji">${emoji}</span>
                            ${count > 0 ? `<span class="reaction-count">${count}</span>` : ''}
                        </button>
                    `;
                }).join('')}
            </div>
        `;
    }

    render(post) {
        this.currentPost = post;

        return `
            <section id="detail">
                <div id="read-progress-bar" role="progressbar" aria-label="阅读进度" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                <div class="max-w-3xl mx-auto px-8">
                    <button id="back-btn" class="group flex items-center gap-2 text-[10px] opacity-40 uppercase tracking-widest mb-12 hover:opacity-100 transition-opacity" aria-label="返回">
                        <span class="inline-block transition-transform group-hover:-translate-x-1">←</span> Back
                    </button>
                    <div class="flex items-center gap-3 mb-4">
                        <h1 class="text-3xl md:text-5xl font-bold serif">${Utils.escapeHtml(post.title)}</h1>
                        ${post.mood ? `<span class="text-3xl" aria-label="心情: ${post.mood}">${post.mood}</span>` : ''}
                    </div>
                    <div class="text-[10px] opacity-30 tracking-widest uppercase pb-8 mb-8 border-b border-current" style="border-opacity: 0.1;">
                        ${this.formatDate(post.date)} ${post.author_name ? '· ' + Utils.escapeHtml(post.author_name) : ''}
                    </div>
                    <div class="article-content">
                        ${this.safeMarkdown(post.content)}
                    </div>
                    <div class="mt-12 pt-8 border-t border-current" style="border-opacity: 0.1;">
                        ${this.renderReactions(post)}
                    </div>
                </div>
            </section>
        `;
    }

    updateContent(post) {
        // 清理旧的事件监听器
        this.destroy();

        const detailSection = document.getElementById('detail');
        if (detailSection) {
            detailSection.innerHTML = this.render(post).replace(/<section[^>]*>|<\/section>/g, '');
            this.bindEvents();
        }
    }

    bindEvents() {
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
            this.eventManager.on(backBtn, 'click', () => this.onBack());
        }

        // 反应按钮事件
        document.querySelectorAll('.reaction-btn').forEach(btn => {
            this.eventManager.on(btn, 'click', async () => {
                if (!this.currentPost) return;
                const emoji = btn.dataset.emoji;
                
                try {
                    const newReactions = await this.reactionService.toggleReaction(this.currentPost, emoji);
                    this.currentPost.reactions = newReactions;
                    
                    // 更新 UI
                    const reactionsBar = document.querySelector('.reactions-bar');
                    if (reactionsBar) {
                        reactionsBar.outerHTML = this.renderReactions(this.currentPost);
                        // 重新绑定反应按钮事件
                        document.querySelectorAll('.reaction-btn').forEach(newBtn => {
                            this.eventManager.on(newBtn, 'click', async () => {
                                if (!this.currentPost) return;
                                const e = newBtn.dataset.emoji;
                                const r = await this.reactionService.toggleReaction(this.currentPost, e);
                                this.currentPost.reactions = r;
                                this.refreshReactions();
                            });
                        });
                    }
                } catch (e) {
                    console.error('Reaction error:', e);
                }
            });
        });

        // 阅读进度条 - 使用节流优化性能
        this.scrollHandler = Utils.throttle(() => {
            const bar = document.getElementById('read-progress-bar');
            if (!bar) return;
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight * 100) : 0;
            bar.style.width = progress + '%';
            bar.setAttribute('aria-valuenow', Math.round(progress));
        }, 100);

        this.eventManager.on(window, 'scroll', this.scrollHandler, { passive: true });
    }

    refreshReactions() {
        const reactionsBar = document.querySelector('.reactions-bar');
        if (reactionsBar && this.currentPost) {
            reactionsBar.outerHTML = this.renderReactions(this.currentPost);
            // 重新绑定
            document.querySelectorAll('.reaction-btn').forEach(btn => {
                this.eventManager.on(btn, 'click', async () => {
                    if (!this.currentPost) return;
                    const emoji = btn.dataset.emoji;
                    const r = await this.reactionService.toggleReaction(this.currentPost, emoji);
                    this.currentPost.reactions = r;
                    this.refreshReactions();
                });
            });
        }
    }

    destroy() {
        this.eventManager.clear();
        this.timerManager.clearAll();
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
            this.scrollHandler = null;
        }
    }
}
