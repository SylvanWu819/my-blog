// 左侧空间导航组件
export class SpaceNav {
    constructor(onSwitchSpace) {
        this.onSwitchSpace = onSwitchSpace;
        this.spaces = ['此间', '观市', '碎语', '札记', '长文', '途中', '一隅'];
        this.currentSpace = '此间';
        
        // 触摸手势相关
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchStartTime = 0;
        this.isScrolling = false;
    }

    render() {
        return `
            <div class="space-trigger"></div>
            <nav id="space-nav">
                ${this.spaces.map((space, index) => `
                    <div class="space-item ${index === 0 ? 'active' : ''} serif" 
                         data-space="${space}">
                        ${space}
                    </div>
                `).join('')}
            </nav>
        `;
    }

    updateActive(spaceName) {
        this.currentSpace = spaceName;
        document.querySelectorAll('.space-item').forEach(el => {
            el.classList.remove('active');
            if (el.dataset.space === spaceName) {
                el.classList.add('active');
            }
        });
    }

    // 处理触摸开始
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.touchStartTime = Date.now();
        this.isScrolling = false;
    }

    // 处理触摸移动
    handleTouchMove(e) {
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const diffX = Math.abs(touchX - this.touchStartX);
        const diffY = Math.abs(touchY - this.touchStartY);

        // 如果垂直移动大于水平移动，认为是滚动
        if (diffY > diffX) {
            this.isScrolling = true;
        }
    }

    // 处理触摸结束
    handleTouchEnd(e) {
        if (this.isScrolling) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - this.touchStartX;
        const diffY = Math.abs(touchEndY - this.touchStartY);
        const timeDiff = Date.now() - this.touchStartTime;

        // 最小滑动距离：50px，最大时间：500ms
        const minDistance = 50;
        const maxTime = 500;

        // 忽略垂直移动过大的情况
        if (diffY > 50) return;

        // 检查是否是有效的滑动
        if (Math.abs(diffX) > minDistance && timeDiff < maxTime) {
            const nav = document.getElementById('space-nav');
            
            if (diffX > 0) {
                // 右滑：打开导航
                nav?.classList.add('show');
            } else {
                // 左滑：关闭导航
                nav?.classList.remove('show');
            }
        }
    }

    bindEvents() {
        const trigger = document.querySelector('.space-trigger');
        const nav = document.getElementById('space-nav');

        // 桌面端 hover
        trigger?.addEventListener('mouseenter', () => nav.classList.add('show'));
        nav?.addEventListener('mouseleave', () => nav.classList.remove('show'));

        // 移动端：点击 trigger 区域切换显示
        trigger?.addEventListener('click', () => nav.classList.toggle('show'));

        // 移动端：左滑右滑手势
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);

        // 点击导航外部关闭
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !trigger.contains(e.target)) {
                nav.classList.remove('show');
            }
        });

        document.querySelectorAll('.space-item').forEach(item => {
            item.addEventListener('click', () => {
                const space = item.dataset.space;
                nav.classList.remove('show');
                this.onSwitchSpace(space);
            });
        });
    }
}
