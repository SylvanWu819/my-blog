// 左侧空间导航组件
export class SpaceNav {
    constructor(onSwitchSpace) {
        this.onSwitchSpace = onSwitchSpace;
        this.spaces = ['此间', '观市', '碎语', '札记', '长文', '途中', '一隅'];
        this.currentSpace = '此间';
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

    bindEvents() {
        const trigger = document.querySelector('.space-trigger');
        const nav = document.getElementById('space-nav');
        
        trigger?.addEventListener('mouseenter', () => {
            nav.classList.add('show');
        });
        
        nav?.addEventListener('mouseleave', () => {
            nav.classList.remove('show');
        });

        document.querySelectorAll('.space-item').forEach(item => {
            item.addEventListener('click', () => {
                const space = item.dataset.space;
                this.onSwitchSpace(space);
            });
        });
    }
}
