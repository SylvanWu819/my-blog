// 首页组件
export class HomePage {
    constructor(onShowDetail) {
        this.onShowDetail = onShowDetail;
        this.posts = [];
        this.currentSpace = '此间';
        this.poems = [
            '心远地自偏', '行到水穷处', '坐看云起时', '此中有真意', 
            '悠然见南山', '山气日夕佳', '飞鸟相与还', '采菊东篱下',
            '明月松间照', '清泉石上流', '人闲桂花落', '夜静春山空',
            '空山不见人', '但闻人语响'
        ];
        this.poemInterval = null;
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

    renderPostList() {
        if (this.posts.length === 0) {
            return '<p class="text-gray-400 text-sm opacity-60">暂无内容</p>';
        }

        return this.posts.map((p, index) => {
            const imageMatch = (p.content || '').match(/!\[.*?\]\((.*?)\)/);
            const imageUrl = imageMatch ? imageMatch[1] : null;
            const animationDelay = index * 0.8;
            
            return `
                <div class="post-card cursor-pointer" data-post-id="${p.id}">
                    <div class="post-card-inner p-8" style="animation-delay: ${animationDelay}s">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${p.title}" class="post-preview-image" loading="lazy" onload="this.classList.add('loaded')" onerror="this.style.display='none'">` : ''}
                        <div class="flex items-center gap-2 mb-4">
                            <div class="text-[9px] opacity-30 tracking-widest uppercase">${p.date || '未知日期'}</div>
                            ${p.mood ? `<span class="text-lg">${p.mood}</span>` : ''}
                        </div>
                        <h3 class="text-xl font-bold serif mb-3">${p.title}</h3>
                        <p class="text-gray-400 text-sm line-clamp-3 leading-relaxed serif italic opacity-80">${(p.content || '').replace(/!\[.*?\]\(.*?\)/g, '').replace(/\n/g, ' ')}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    updatePosts(posts) {
        this.posts = posts;
        const container = document.getElementById('list-container');
        if (!container) return;
        
        // 如果没有文章,立即显示空状态
        if (posts.length === 0) {
            container.innerHTML = '<p class="text-gray-400 text-sm opacity-60">暂无内容</p>';
            return;
        }
        
        // 先清空容器,避免旧内容闪烁
        container.style.opacity = '0';
        
        // 使用 requestAnimationFrame 优化渲染
        requestAnimationFrame(() => {
            // 使用 DocumentFragment 批量更新 DOM
            const fragment = document.createDocumentFragment();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.renderPostList();
            
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
            
            container.innerHTML = '';
            container.appendChild(fragment);
            this.bindPostClickEvents();
            
            // 内容加载完成后淡入
            requestAnimationFrame(() => {
                container.style.opacity = '1';
            });
        });
    }

    updateSpace(spaceName) {
        this.currentSpace = spaceName;
        const title = document.getElementById('space-title');
        if (title) {
            title.textContent = `${spaceName}。`;
        }
    }

    startPoemCarousel() {
        const display = document.getElementById('poem-display');
        if (!display) return;
        
        let idx = 0;
        this.poemInterval = setInterval(() => {
            display.classList.add('poem-fade');
            setTimeout(() => {
                idx = (idx + 1) % this.poems.length;
                display.innerText = `"${this.poems[idx]}"`;
                setTimeout(() => {
                    display.classList.remove('poem-fade');
                }, 50);
            }, 1000);
        }, 5000);
    }

    stopPoemCarousel() {
        if (this.poemInterval) {
            clearInterval(this.poemInterval);
            this.poemInterval = null;
        }
    }

    bindPostClickEvents() {
        document.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', () => {
                const postId = parseInt(card.dataset.postId);
                this.onShowDetail(postId);
            });
        });
    }

    bindEvents() {
        this.bindPostClickEvents();
    }
}
