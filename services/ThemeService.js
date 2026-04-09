// 主题管理服务
export class ThemeService {
    constructor() {
        this.isDark = false;
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        const body = document.body;
        const icon = document.getElementById('theme-icon');
        
        if (savedTheme === 'dark') {
            body.classList.add('dark');
            this.isDark = true;
            if (icon) icon.className = 'fas fa-sun opacity-50';
        } else {
            if (icon) icon.className = 'fas fa-moon opacity-50';
        }
    }

    toggleTheme() {
        const body = document.body;
        const icon = document.getElementById('theme-icon');
        
        body.classList.toggle('dark');
        this.isDark = body.classList.contains('dark');
        
        if (this.isDark) {
            if (icon) icon.className = 'fas fa-sun opacity-50';
            localStorage.setItem('theme', 'dark');
        } else {
            if (icon) icon.className = 'fas fa-moon opacity-50';
            localStorage.setItem('theme', 'light');
        }
    }
}
