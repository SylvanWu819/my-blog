// 主题管理服务
export class ThemeService {
    constructor() {
        this.modes = ['light', 'dim', 'dark']; // 三档位：亮、中、暗
        this.currentModeIndex = 0;
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const body = document.body;
        const icon = document.getElementById('theme-icon');
        
        // 确定当前档位
        if (this.modes.includes(savedTheme)) {
            this.currentModeIndex = this.modes.indexOf(savedTheme);
        }
        
        // 应用主题
        body.classList.remove('light', 'dim', 'dark');
        if (savedTheme !== 'light') {
            body.classList.add(savedTheme);
        }
        
        // 更新图标
        this.updateIcon(savedTheme);
    }

    updateIcon(mode) {
        const icon = document.getElementById('theme-icon');
        if (!icon) return;
        
        if (mode === 'dark') {
            icon.className = 'fas fa-sun opacity-50';
        } else if (mode === 'dim') {
            icon.className = 'fas fa-adjust opacity-50';
        } else {
            icon.className = 'fas fa-moon opacity-50';
        }
    }

    toggleTheme(clickEvent) {
        const body = document.body;
        const overlay = document.getElementById('theme-transition');
        
        // 切换到下一档
        const oldModeIndex = this.currentModeIndex;
        this.currentModeIndex = (this.currentModeIndex + 1) % this.modes.length;
        const newMode = this.modes[this.currentModeIndex];
        const oldMode = this.modes[oldModeIndex];
        
        // 判断是否需要光束动画（亮暗直接切换）
        const needBurstAnimation = (oldMode === 'light' && newMode === 'dark') || 
                                   (oldMode === 'dark' && newMode === 'light');
        
        if (needBurstAnimation && overlay) {
            // 获取点击位置
            let burstX = 50;
            let burstY = 50;
            
            if (clickEvent && clickEvent.target) {
                const rect = clickEvent.target.getBoundingClientRect();
                burstX = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
                burstY = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
            }
            
            // 设置光束起始位置
            overlay.style.setProperty('--burst-x', `${burstX}%`);
            overlay.style.setProperty('--burst-y', `${burstY}%`);
            
            // 移除之前的动画类
            overlay.classList.remove('light-burst', 'dark-fade');
            
            // 触发光束动画
            requestAnimationFrame(() => {
                if (newMode === 'dark') {
                    overlay.classList.add('dark-fade');
                } else {
                    overlay.classList.add('light-burst');
                }
                
                // 在动画中途切换主题
                setTimeout(() => {
                    this.applyTheme(newMode);
                }, 300);
                
                // 清理动画类
                setTimeout(() => {
                    overlay.classList.remove('light-burst', 'dark-fade');
                }, newMode === 'dark' ? 1000 : 1000);
            });
        } else {
            // 简单渐变切换（中间态）
            this.applyTheme(newMode);
        }
    }

    applyTheme(mode) {
        const body = document.body;
        
        // 移除所有主题类
        body.classList.remove('light', 'dim', 'dark');
        
        // 应用新主题
        if (mode !== 'light') {
            body.classList.add(mode);
        }
        
        // 更新图标
        this.updateIcon(mode);
        
        // 保存设置
        localStorage.setItem('theme', mode);
    }
}
