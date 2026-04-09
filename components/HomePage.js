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
                    <h2 id="space-title" class="text-6xl font-light serif mb-4">${this.currentSpace}。</h2>
                    <p id="poem-display" class="text-gray-400 text-sm serif italic opacity-60">"${this.poems[0]}"</p>
                </div>
                <div id="list-container" class="grid grid-cols-1 md:grid-cols-2 gap-10">
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
            const animationDelay = (index * 0.5) % 6;
            
            return `
                <div class="post-card cursor-pointer" data-post-id="${p.id}">
                    <div class="post-card-inner p-8" style="animation-delay: ${animationDelay}s">
                        ${imageUrl ? `<img src="${imageUrl}" alt="${p.title}" class="post-preview-image" loading="lazy" onerror="this.style.display='none'">` : ''}
                        <div class="flex items-center gap-2 mb-4">
                            <div class="text-[9px] opacity-30 tracking-widest uppercase">${p.date || '未知日期'}</div>
                            ${p.mood ? `<span class="text-lg">${p.mood}</span>` : ''}
                        </div>
                        <h3 class="text-xl font-bold serif mb-3">${p.title}</h3>
                        <p class="text-gray-400 text-xs line-clamp-3 leading-relaxed serif italic opacity-80">${(p.content || '').replace(/!\[.*?\]\(.*?\)/g, '').replace(/\n/g, ' ')}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    updatePosts(posts) {
        this.posts = posts;
        const container = document.getElementById('list-container');
        if (container) {
            container.innerHTML = this.renderPostList();
            this.bindPostClickEvents();
        }
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
