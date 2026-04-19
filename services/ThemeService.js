// 主题管理服务
export class ThemeService {
    constructor() {
        this.modes = ['light', 'dark'];
        this.currentModeIndex = 0;
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const validTheme = savedTheme === 'dark' ? 'dark' : 'light';
        this.currentModeIndex = this.modes.indexOf(validTheme);
        this.applyTheme(validTheme);
    }

    updateIcon(mode) {
        const icon = document.getElementById('theme-icon');
        if (!icon) return;
        icon.className = mode === 'dark' ? 'fas fa-sun opacity-50' : 'fas fa-moon opacity-50';
        // 旋转动画
        icon.style.transition = 'transform 0.4s ease';
        icon.style.transform = 'rotate(180deg)';
        setTimeout(() => { icon.style.transform = 'rotate(0deg)'; }, 400);
    }

    toggleTheme(clickEvent) {
        this.currentModeIndex = (this.currentModeIndex + 1) % this.modes.length;
        const newMode = this.modes[this.currentModeIndex];
        this.applyTheme(newMode);
    }

    applyTheme(mode) {
        document.body.classList.remove('light', 'dim', 'dark');
        if (mode !== 'light') document.body.classList.add(mode);
        this.updateIcon(mode);
        localStorage.setItem('theme', mode);
    }
}
