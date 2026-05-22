// 首页组件
import { Utils, EventManager, TimerManager } from '../services/Utils.js';

export class HomePage {
    constructor(onShowDetail, onLoadMore) {
        this.onShowDetail = onShowDetail;
        this.onLoadMore = onLoadMore;
        this.posts = [];
        this.currentSpace = '此间';
        this.poems = [
            '心远地自偏', '行到水穷处', '坐看云起时', '此中有真意', 
            '悠然见南山', '山气日夕佳', '飞鸟相与还', '采菊东篱下',
            '明月松间照', '清泉石上流', '人闲桂花落', '夜静春山空',
            '空山不见人', '但闻人语响'
        ];
        this.poemInterval = null;
        this.eventManager = new EventManager();
        this.timerManager = new TimerManager();
    }

    render() {
        return `
            <section id="home">
                <div class="mb-20">
                    <h2 id="space-title" class="text-4xl md:text-6xl font-light serif mb-4">${this.currentSpace}。</h2>
                    <p id="poem-display" class="text-gray-400 text-sm serif italic opacity-60">"${this.poems[0]}"</p>
                </div>
                <div id="list-container" class="masonry-grid">
                    ${this.renderPostList()}
                </div>
            </section>
        `;
    }

    formatDate(dateStr) {
        return Utils.formatDate(dateStr);
    }

    renderPostList() {
        if (this.posts.length === 0) {
            return `
                <div class="empty-state">
                    <p class="text-gray-400 text-sm opacity-60 mb-4">这里还没有内容</p>
                    <p class="text-gray-400 text-xs opacity-40">点击右上角 Write 开始记录你的第一篇文章</p>
                </div>
            `;
        }

        return this.posts.map((p, index) => {
            const imageUrl = Utils.extractImageUrl(p.content);
            const animationDelay = index * 0.08;
            const contentPreview = (p.content || '')
                .replace(/!\[.*?\]\(.*?\)/g, '')
                .replace(/\n/g, ' ')
                .substring(0, 150);
            
            return `
                <div class="post-card cursor-pointer" data-post-id="${p.id}" role="article" tabindex="0" aria-label="文章: ${Utils.escapeHtml(p.title)}">
                    <div class="post-card-inner p-8" style="animation-delay: ${animationDelay}s">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${Utils.escapeHtml(p.title)}" class="post-preview-image" loading="lazy" decoding="async" data-src="${imageUrl}">` : ''}
                        <div class="flex items-center gap-2 mb-4">
                            <div class="text-[9px] opacity-30 tracking-widest uppercase">${this.formatDate(p.date)}</div>
                            ${p.mood ? `<span class="text-lg" aria-label="心情: ${p.mood}">${p.mood}</span>` : ''}
                        </div>
                        <h3 class="text-xl font-bold serif mb-3">${Utils.escapeHtml(p.title)}</h3>
                        <p class="text-gray-400 text-sm line-clamp-3 leading-relaxed serif italic opacity-80">${Utils.escapeHtml(contentPreview)}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    updatePosts(posts, hasMore = false) {
        this.posts = posts;
        const container = document.getElementById('list-container');
        if (!container) return;
        
        container.style.opacity = '0';
        
        requestAnimationFrame(() => {
            const fragment = document.createDocumentFragment();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.renderPostList();
            
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
            
            container.innerHTML = '';
            container.appendChild(fragment);
            this.bindPostClickEvents();
            this.setupImageLoading();
            
            requestAnimationFrame(() => {
                container.style.opacity = '1';
            });
        });

        // 更新 Load More 按钮
        const loadMoreWrap = document.getElementById('load-more-wrap');
        if (loadMoreWrap) {
            loadMoreWrap.classList.toggle('hidden', !hasMore);
        }
    }

    setupImageLoading() {
        if (!('IntersectionObserver' in window)) {
            this.loadAllImages();
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (src) {
                        img.src = src;
                        img.addEventListener('load', () => img.classList.add('loaded'));
                        img.addEventListener('error', () => img.style.display = 'none');
                        observer.unobserve(img);
                    }
                }
            });
        }, { rootMargin: '50px' });

        document.querySelectorAll('.post-preview-image').forEach(img => {
            imageObserver.observe(img);
        });
    }

    loadAllImages() {
        document.querySelectorAll('.post-preview-image').forEach(img => {
            const src = img.dataset.src;
            if (src) {
                img.src = src;
                img.addEventListener('load', () => img.classList.add('loaded'));
                img.addEventListener('error', () => img.style.display = 'none');
            }
        });
    }

    updateSpace(spaceName) {
        this.currentSpace = spaceName;
        const title = document.getElementById('space-title');
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(6px)';
            setTimeout(() => {
                title.textContent = `${spaceName}。`;
                title.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 200);
        }
    }

    startPoemCarousel() {
        const display = document.getElementById('poem-display');
        if (!display) return;
        
        let idx = 0;
        this.poemInterval = this.timerManager.setInterval(() => {
            display.classList.add('poem-fade');
            this.timerManager.setTimeout(() => {
                idx = (idx + 1) % this.poems.length;
                display.innerText = `"${this.poems[idx]}"`;
                this.timerManager.setTimeout(() => {
                    display.classList.remove('poem-fade');
                }, 50);
            }, 1000);
        }, 5000);
    }

    stopPoemCarousel() {
        if (this.poemInterval) {
            this.timerManager.clear(this.poemInterval);
            this.poemInterval = null;
        }
    }

    bindPostClickEvents() {
        document.querySelectorAll('.post-card').forEach(card => {
            const handler = (e) => {
                if (e.key && e.key !== 'Enter' && e.key !== ' ') return;
                const postId = parseInt(card.dataset.postId);
                this.onShowDetail(postId);
            };
            
            this.eventManager.on(card, 'click', handler);
            this.eventManager.on(card, 'keydown', handler);
        });
    }

    bindEvents() {
        this.bindPostClickEvents();

        // Load More 按钮
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            this.eventManager.on(loadMoreBtn, 'click', () => {
                if (this.onLoadMore) this.onLoadMore();
            });
        }
    }

    destroy() {
        this.stopPoemCarousel();
        this.eventManager.clear();
        this.timerManager.clearAll();
    }
}
