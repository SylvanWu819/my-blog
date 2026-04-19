// 顶部导航组件
export class Navigation {
    constructor(onNavigate, onToggleDarkMode, onNavigateHome) {
        this.onNavigate = onNavigate;
        this.onToggleDarkMode = onToggleDarkMode;
        this.onNavigateHome = onNavigateHome;
        this.currentSpace = '此间';
    }

    moonSvg() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }

    sunSvg() {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
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
                        <button id="nav-write" class="border border-current px-5 py-2 rounded-full">Write</button>
                        <button id="nav-theme"><span id="theme-icon" class="opacity-50 inline-flex">${this.moonSvg()}</span></button>
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
        document.getElementById('nav-home')?.addEventListener('click', () => this.onNavigateHome());
        document.getElementById('nav-archives')?.addEventListener('click', () => this.onNavigate('home'));
        document.getElementById('nav-write')?.addEventListener('click', () => this.onNavigate('write'));
        document.getElementById('nav-theme')?.addEventListener('click', (e) => this.onToggleDarkMode(e));
    }
}
