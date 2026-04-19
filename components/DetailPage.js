// 详情页面组件
export class DetailPage {
    constructor(onBack) {
        this.onBack = onBack;
        this.currentPost = null;
    }

    formatDate(dateStr) {
        if (!dateStr) return '未知日期';
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, '0')}`;
    }

    render(post) {
        this.currentPost = post;

        return `
            <section id="detail">
                <div id="read-progress-bar"></div>
                <div class="max-w-3xl mx-auto px-8">
                    <button id="back-btn" class="group flex items-center gap-2 text-[10px] opacity-40 uppercase tracking-widest mb-12 hover:opacity-100 transition-opacity">
                        <span class="inline-block transition-transform group-hover:-translate-x-1">←</span> Back
                    </button>
                    <div class="flex items-center gap-3 mb-4">
                        <h1 class="text-5xl font-bold serif">${post.title}</h1>
                        ${post.mood ? `<span class="text-4xl">${post.mood}</span>` : ''}
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
        const detailSection = document.getElementById('detail');
        if (detailSection) {
            detailSection.innerHTML = this.render(post).replace(/<section[^>]*>|<\/section>/g, '');
            this.bindEvents();
        }
    }

    bindEvents() {
        document.getElementById('back-btn')?.addEventListener('click', () => {
            this.onBack();
        });

        // 阅读进度条
        const onScroll = () => {
            const bar = document.getElementById('read-progress-bar');
            if (!bar) { window.removeEventListener('scroll', onScroll); return; }
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = docHeight > 0 ? (scrollTop / docHeight * 100) + '%' : '0%';
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }
}
