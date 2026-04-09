// 详情页面组件
export class DetailPage {
    constructor(onBack, onToggleReaction) {
        this.onBack = onBack;
        this.onToggleReaction = onToggleReaction;
        this.currentPost = null;
    }

    render(post, userReaction) {
        this.currentPost = post;
        const reactions = post.reactions || {};
        const availableReactions = ['❤️', '👍', '😊', '🔥', '💯', '👏'];
        
        const reactionsHtml = availableReactions.map(emoji => {
            const count = reactions[emoji] || 0;
            const isActive = userReaction === emoji;
            return `
                <div class="reaction-container">
                    <span class="reaction-btn ${isActive ? 'active' : ''}" 
                          data-emoji="${emoji}"
                          data-post-id="${post.id}">
                        ${emoji}
                    </span>
                    ${count > 0 ? `<span class="reaction-count">${count}</span>` : ''}
                </div>
            `;
        }).join('');

        return `
            <section id="detail">
                <div class="max-w-2xl mx-auto">
                    <button id="back-btn" class="text-[10px] opacity-40 uppercase tracking-widest mb-12 hover:opacity-100">← Back</button>
                    <div class="flex items-center gap-3 mb-4">
                        <h1 class="text-5xl font-bold serif">${post.title}</h1>
                        ${post.mood ? `<span class="text-4xl">${post.mood}</span>` : ''}
                    </div>
                    <div class="text-[10px] opacity-30 tracking-widest mb-8 uppercase">
                        ${post.date || '未知日期'} ${post.author_name ? '· ' + post.author_name : ''}
                    </div>
                    <div class="prose dark:prose-invert max-w-none text-xl leading-relaxed serif space-y-4">
                        ${marked.parse(post.content || '')}
                    </div>
                    <div class="flex gap-4 flex-wrap mt-12 pt-8 border-t border-current opacity-20">
                        ${reactionsHtml}
                    </div>
                </div>
            </section>
        `;
    }

    updateContent(post, userReaction) {
        const detailSection = document.getElementById('detail');
        if (detailSection) {
            detailSection.innerHTML = this.render(post, userReaction).replace(/<section[^>]*>|<\/section>/g, '');
            this.bindEvents();
        }
    }

    bindEvents() {
        document.getElementById('back-btn')?.addEventListener('click', () => {
            this.onBack();
        });

        document.querySelectorAll('.reaction-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const postId = parseInt(btn.dataset.postId);
                const emoji = btn.dataset.emoji;
                this.onToggleReaction(postId, emoji);
            });
        });
    }
}
