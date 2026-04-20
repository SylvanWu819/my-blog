// 详情页面组件
import { Utils, EventManager, TimerManager } from '../services/Utils.js';

export class DetailPage {
    constructor(onBack) {
        this.onBack = onBack;
        this.currentPost = null;
        this.eventManager = new EventManager();
        this.timerManager = new TimerManager();
        this.scrollHandler = null;
    }

    formatDate(dateStr) {
        return Utils.formatDate(dateStr);
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
                        <h1 class="text-3xl md:text-5xl font-bold serif">${post.title}</h1>
                        ${post.mood ? `<span class="text-3xl" aria-label="心情: ${post.mood}">${post.mood}</span>` : ''}
                    </div>
                    <div class="text-[10px] opacity-30 tracking-widest uppercase pb-8 mb-8 border-b border-current" style="border-opacity: 0.1;">
                        ${this.formatDate(post.date)} ${post.author_name ? '· ' + post.author_name : ''}
                    </div>
                    <div class="article-content">
                        ${marked.parse(post.content || '')}
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

    destroy() {
        this.eventManager.clear();
        this.timerManager.clearAll();
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
            this.scrollHandler = null;
        }
    }
}
