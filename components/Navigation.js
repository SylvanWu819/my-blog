// 顶部导航组件
export class Navigation {
    constructor(onNavigate, onToggleDarkMode) {
        this.onNavigate = onNavigate;
        this.onToggleDarkMode = onToggleDarkMode;
        this.currentSpace = '此间';
    }

    render() {
        return `
            <nav class="glass fixed top-0 w-full z-50">
                <div class="max-w-5xl mx-auto px-8 py-6 flex justify-between items-center">
                    <div class="flex items-center space-x-3 cursor-pointer" id="nav-home">
                        <h1 class="font-bold text-xl tracking-[0.3em] uppercase">Libra</h1>
                        <span class="text-xs opacity-40 serif" id="current-space-indicator">· ${this.currentSpace}</span>
                    </div>
                    <div class="flex gap-8 text-[11px] font-bold uppercase tracking-widest items-center">
                        <button id="nav-archives" class="hover:opacity-50">Archives</button>
                        <button id="nav-write" class="border border-current px-5 py-2">Write</button>
                        <button id="nav-theme"><i id="theme-icon" class="fas fa-moon opacity-50"></i></button>
                    </div>
                </div>
            </nav>
        `;
    }

    updateSpaceIndicator(spaceName) {
        this.currentSpace = spaceName;
        const indicator = document.getElementById('current-space-indicator');
        if (indicator) {
            indicator.textContent = `· ${spaceName}`;
        }
    }

    bindEvents() {
        document.getElementById('nav-home')?.addEventListener('click', () => this.onNavigate('home'));
        document.getElementById('nav-archives')?.addEventListener('click', () => this.onNavigate('home'));
        document.getElementById('nav-write')?.addEventListener('click', () => this.onNavigate('write'));
        document.getElementById('nav-theme')?.addEventListener('click', (e) => this.onToggleDarkMode(e));
    }
}
